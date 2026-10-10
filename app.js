'use strict';
/* Japan House Crew – group Keep/Toss. Votes live on the server (Netlify Function + Blobs); this device remembers who you are.
   Elimination rule: a house disappears for everyone only when EVERY member has tossed it. */
const V = 'dd7af4bb63';
const $ = s => document.querySelector(s);
const fmt = n => n == null ? '–' : Math.round(n).toLocaleString('en-US');
const esc = s => (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hm = m => m == null ? '?' : m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`;
const qs = new URLSearchParams(location.search);
const G = (qs.get('g') || localStorage.getItem('crew_g') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
if (qs.get('g')) localStorage.setItem('crew_g', G);
const LS_ME = 'crew_me_' + G, LS_TIP = 'crew_tip_v1', LS_PEND = 'crew_pending_' + G;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
let D, byId = {}, ACTIVE = [], MPOOL = [], me = load(LS_ME, null), S = { members: [], decisions: {} }, pending = load(LS_PEND, []), undoStack = [], lastSync = 0, syncing = false;
const POLL_MS = 20000;

function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 1400) }
// ---------------------------------------------------------------- API
// Static site can live on GitHub Pages; the vote backend stays a Netlify Function (stable 'api--' deploy alias, CORS-allowed).
const API = /(^|\.)github\.io$/.test(location.hostname) ? 'https://api--japan-house-crew-e29a34.netlify.app/api/' : '/api/';
async function api(path, body) {
  const opt = body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, g: G }) } : { cache: 'no-store' };
  const r = await fetch(API + path + (body ? '' : '?g=' + encodeURIComponent(G)), opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || ('HTTP ' + r.status)); e.status = r.status; throw e }
  return j;
}
const myDec = () => (me && S.decisions[me.id]) || {};
function setLocal(lid, d) {               // optimistic local state
  if (!me) return; const m = S.decisions[me.id] = S.decisions[me.id] || {};
  if (d) m[lid] = { d, t: new Date().toISOString() }; else delete m[lid];
}
function queueWrite(lid, d) {
  pending = pending.filter(p => p.listing !== lid); pending.push({ member: me.id, listing: lid, d }); localStorage.setItem(LS_PEND, JSON.stringify(pending)); flush();
}
let flushing = false;
async function flush() {
  if (flushing || !pending.length) return; flushing = true;
  try {
    while (pending.length) {
      const p = pending[0];
      try { await api('decide', p) } catch (e) { if (e.status && e.status < 500 && e.status !== 429) { console.warn('dropped write', p, e) } else throw e }
      pending = pending.filter(x => x !== p); localStorage.setItem(LS_PEND, JSON.stringify(pending));   // remove exactly the sent write (a newer one for the same house may have replaced it meanwhile, e.g. Undo)
    }
  } catch (e) { setTimeout(() => { flushing = false; flush() }, 5000); updSync(); return }
  flushing = false; updSync();
}
async function sync(force) {
  if (!G || syncing || (!force && Date.now() - lastSync < 3000)) return; syncing = true;
  try {
    const s = await api('state'); lastSync = Date.now();
    if (me && !s.members.find(m => m.id === me.id)) { me = null; localStorage.removeItem(LS_ME); showSignin(s.members); }
    // keep my optimistic, not-yet-sent writes on top of the server state
    for (const p of pending) { const m = s.decisions[p.member] = s.decisions[p.member] || {}; if (p.d) m[p.listing] = { d: p.d, t: new Date().toISOString() }; else delete m[p.listing] }
    const before = JSON.stringify([S.members, S.decisions]); S = s;
    if (JSON.stringify([S.members, S.decisions]) !== before) refreshViews();
    checkMatch();
  } catch (e) { if (e.status === 403) return showNoCode(); console.warn(e) }
  finally { syncing = false; updSync() }
}
function updSync() { $('#about') && ($('#about').dataset.sync = pending.length ? `${pending.length} vote(s) waiting to sync` : 'all votes synced') ; aboutText() }

// ---------------------------------------------------------------- desktop / phone layout
// Phone UI = default. Desktop layout (html.desk) when the screen is wide (>=1000px) with a mouse, or forced from the menu.
const LS_VIEW = 'crew_view', DESK_MQ = matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)');
let DESK = false, curTab = 'swipe';
const viewPref = () => localStorage.getItem(LS_VIEW) || 'auto';
function applyLayout() {
  const pref = viewPref(), want = pref === 'desktop' || (pref === 'auto' && DESK_MQ.matches);
  const b = $('#mView'); if (b) b.textContent = want ? '📱 Switch to phone view' : '🖥️ Switch to desktop view';
  const a = $('#mViewAuto'); if (a) a.hidden = pref === 'auto';
  if (want === DESK && document.documentElement.classList.contains('desk') === want) return;
  DESK = want; document.documentElement.classList.toggle('desk', DESK);
  if (!D) return;
  if (DESK) showTab(['matches', 'group'].includes(curTab) ? curTab : 'matches'); else showTab(['matches', 'group'].includes(curTab) ? curTab : 'swipe');
  render(); if (map) setTimeout(() => { map.invalidateSize(); drawMap(DESK) }, 60);
}
let sideT = null;
function sideRefresh() {   // desktop: Matches/Group list + map are always on screen, redraw them after every vote
  if (!DESK) return; clearTimeout(sideT);
  sideT = setTimeout(() => { counts(); if (vis('matches')) drawMatches(); if (vis('group')) drawGroup(); if (mapReady) mapReady.then(() => drawMap(false)) }, 60);
}
const vis = v => DESK ? (v === 'swipe' || v === 'map' || $('#v-' + v).classList.contains('on')) : $('#v-' + v).classList.contains('on');

// ---------------------------------------------------------------- group logic
const members = () => S.members;
// votes: yes / no / maybe / love. Legacy 'keep' = yes, 'toss' = no (mapped on read; stored votes are never rewritten or lost).
const ND = d => d === 'keep' ? 'yes' : d === 'toss' ? 'no' : d;
const POS = d => d === 'yes' || d === 'love' || d === 'maybe';
function votes(lid) {
  const y = [], lv = [], mb = [], t = [], p = [];
  for (const m of S.members) { const d = ND(S.decisions[m.id]?.[lid]?.d); (d === 'yes' ? y : d === 'love' ? lv : d === 'maybe' ? mb : d === 'no' ? t : p).push(m) }
  return { k: [...lv, ...y, ...mb], ok: [...lv, ...y], y, lv, mb, t, p, score: 2 * lv.length + y.length };   // k = in Matches; ok = counts toward a match
}
const eliminated = lid => S.members.length > 0 && S.members.every(m => ND(S.decisions[m.id]?.[lid]?.d) === 'no');
const isMatch = (v, n) => n > 1 && v.ok.length === n;
let front = [];   // undone cards come back on top
function queue() {
  const md = myDec(), open = l => !md[l.id] && !eliminated(l.id);
  let q = ACTIVE.filter(l => open(l) && passF(l)); if (F.sort !== 'vibe' && SORTS[F.sort]) q = q.slice().sort(SORTS[F.sort]);
  const f = front.map(id => byId[id]).filter(l => l && open(l));   // undone cards come back on top even if filtered out
  const out = f.length ? [...f, ...q.filter(l => !front.includes(l.id))] : q;
  if (!SKIPPED.length) return out;   // skipped cards (SKIP_BUTTON build) go to the back, in skip order; no vote is recorded
  const sk = new Set(SKIPPED); return [...out.filter(l => !sk.has(l.id)), ...SKIPPED.map(id => out.find(l => l.id === id)).filter(Boolean)];
}
const LS_SKIP = 'crew_skipped_' + G; let SKIPPED = load(LS_SKIP, []);
function skipCard() {
  const q = queue(); if (q.length < 2) return toast('Last card – nothing to skip to');
  const id = q[0].id; front = front.filter(x => x !== id); SKIPPED = [...SKIPPED.filter(x => x !== id), id]; localStorage.setItem(LS_SKIP, JSON.stringify(SKIPPED));
  const c = deck.lastElementChild; if (c) { c.style.transition = 'transform .25s ease-in, opacity .25s'; c.style.transform = 'translateY(40px) scale(.9)'; c.style.opacity = '0' }
  toast('⤵ Skipped – back of your deck'); setTimeout(render, c ? 180 : 0);
}
// ---------------------------------------------------------------- filters / sort (per device, Zillow-style)
const LS_F = 'crew_filters', FDEF = { sort: 'vibe', max: 0, regions: [], onsen: 0, ski: 0, surf: 0, hideBad: false };
let F = { ...FDEF, ...load(LS_F, {}) };
const minOf = (l, re) => { for (const c of l.chips) { const m = c.match(re); if (m) return +m[1] } return 9999 };
const SORTS = { price: (a, b) => a.jpy - b.jpy || b.vibe - a.vibe, onsen: (a, b) => a.onsenMin - b.onsenMin || b.vibe - a.vibe, ski: (a, b) => a.skiMin - b.skiMin || b.vibe - a.vibe,
  surf: (a, b) => a.surfMin - b.surfMin || b.vibe - a.vibe, newest: (a, b) => b.first_seen.localeCompare(a.first_seen) || b.vibe - a.vibe };
const filtersOn = () => !!(F.max || F.regions.length || F.onsen || F.ski || F.surf || F.hideBad || F.sort !== 'vibe');
const passF = l => (!F.max || l.usd <= F.max) && (!F.regions.length || F.regions.includes(l.region)) && (!F.onsen || l.onsenMin <= F.onsen) && (!F.ski || l.skiMin <= F.ski) && (!F.surf || l.surfMin <= F.surf) && (!F.hideBad || !l.flags.some(f => SERIOUS.test(f)));
function saveF() { localStorage.setItem(LS_F, JSON.stringify(F)); $('#fBtn').classList.toggle('on', filtersOn()); front = []; render(); counts() }
function resetFilters() { F = { ...FDEF }; saveF(); drawFilters() }
function drawFilters() {
  const fs = $('#fBody'), regs = [...new Set(ACTIVE.slice().sort((a, b) => (a.arank || 9) - (b.arank || 9)).map(l => l.region))];
  const opt = (id, cur, list) => `<select id="${id}">${list.map(([v, t]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  fs.innerHTML = `<label>Sort by ${opt('fSort', F.sort, [['vibe', 'Best vibe score'], ['price', 'Lowest price'], ['onsen', 'Closest onsen'], ['ski', 'Closest ski'], ['surf', 'Closest surf'], ['newest', 'Newest listings']])}</label>
   <label>Max price ${opt('fMax', F.max, [[0, 'Any (≤ $100k)'], [25000, '≤ $25k'], [50000, '≤ $50k'], [75000, '≤ $75k']])}</label>
   <div class="flab">Area</div><div class="fchips">${regs.map(r => `<button data-r="${r}" class="${F.regions.includes(r) ? 'on' : ''}">${r} <span>${ACTIVE.filter(l => l.region === r).length}</span></button>`).join('')}</div>
   <div class="flab">Must be close to</div>
   <label>♨️ Onsen ${opt('fOnsen', F.onsen, [[0, 'any'], [10, '≤ 10 min'], [20, '≤ 20 min'], [30, '≤ 30 min']])}</label>
   <label>⛷️ Ski ${opt('fSki', F.ski, [[0, 'any'], [20, '≤ 20 min'], [30, '≤ 30 min'], [45, '≤ 45 min']])}</label>
   <label>🏄 Surf ${opt('fSurf', F.surf, [[0, 'any'], [30, '≤ 30 min'], [60, '≤ 60 min'], [90, '≤ 90 min']])}</label>
   <label class="chk"><input type="checkbox" id="fBad" ${F.hideBad ? 'checked' : ''}><span>Hide deal-breakers <span class="nb">(leasehold, rebuild ban, farmland permit, needs renovation, pit toilet, under negotiation)</span></span></label>`;
  const upd = () => { $('#fCount').textContent = `${queue().length} houses to swipe`; };
  fs.querySelector('#fSort').onchange = e => { F.sort = e.target.value; saveF(); upd() };
  fs.querySelector('#fMax').onchange = e => { F.max = +e.target.value; saveF(); upd() };
  fs.querySelector('#fOnsen').onchange = e => { F.onsen = +e.target.value; saveF(); upd() };
  fs.querySelector('#fSki').onchange = e => { F.ski = +e.target.value; saveF(); upd() };
  fs.querySelector('#fSurf').onchange = e => { F.surf = +e.target.value; saveF(); upd() };
  fs.querySelector('#fBad').onchange = e => { F.hideBad = e.target.checked; saveF(); upd() };
  fs.querySelectorAll('.fchips button').forEach(b => b.onclick = () => { const r = b.dataset.r; F.regions = F.regions.includes(r) ? F.regions.filter(x => x !== r) : [...F.regions, r]; b.classList.toggle('on'); saveF(); upd() });
  upd();
}
$('#fBtn').onclick = () => { drawFilters(); $('#filters').hidden = false };
$('#fDone').onclick = () => $('#filters').hidden = true; $('#fReset').onclick = resetFilters;
$('#filters').onclick = e => { if (e.target.id === 'filters') $('#filters').hidden = true };
// ---------------------------------------------------------------- "It's a match!" (everyone kept a house)
const LS_SEEN = 'crew_seen_' + G; let seenArr = load(LS_SEEN, null), seenInit = seenArr !== null; const seen = new Set(seenArr || []);
function checkMatch() {
  if (!me || !D) return; const n = S.members.length; const fm = n > 1 ? ACTIVE.filter(l => votes(l.id).ok.length === n) : [];
  const key = l => l.id + ':' + n;   // a new member keeping it too is a new match moment
  const fresh = fm.filter(l => !seen.has(key(l))); fm.forEach(l => seen.add(key(l))); localStorage.setItem(LS_SEEN, JSON.stringify([...seen]));
  if (!seenInit) { seenInit = true; return }   // first run on this device: don't pop old matches
  if (fresh.length) showMatch(fresh[0], fresh.length - 1);
}
function showMatch(l, more) {
  const m = $('#match'), n = S.members.length; m.hidden = false; m.dataset.id = l.id;
  m.innerHTML = `<div class="mbox"><div class="mimg" style="background-image:url('${l.photos[0] || ''}')"></div><h2>It's a match!</h2>
   <p>All ${n} of you said yes${more ? ` <span class="nb">(+${more} more)</span>` : ''}</p><div class="mav">${votes(l.id).ok.map(x => av(x, votes(l.id).lv.includes(x) ? 'lv' : '')).join('')}</div>
   <div class="mp">¥${fmt(l.jpy)} <small>≈ US$${fmt(l.usd)}</small></div><div>${esc(l.town)}, ${esc(l.pref)} · vibe ${l.vibe}</div>
   <button id="mSee">See matches</button><button id="mGo" class="sec">Keep swiping</button></div>`;
  $('#mSee').onclick = () => { m.hidden = true; matchMode = 'crew'; showTab('matches') }; $('#mGo').onclick = () => m.hidden = true;
}
$('#match').onclick = e => { if (e.target.id === 'match') $('#match').hidden = true };
const av = (m, cls = '') => `<span class="av ${cls}" style="background:${m.color}" title="${esc(m.name)}">${esc(m.name)}</span>`;
function refreshViews() {
  counts();
  const top = deck.lastElementChild?.dataset.id, q = queue();
  if (!dragging && (q[0]?.id !== top || !deck.children.length)) render(); else updVotesOnCard();
  if (vis('matches')) drawMatches();
  if (vis('group')) drawGroup();
  if (vis('map') && mapReady) mapReady.then(() => drawMap(false)); else mapDirty = true;
}
function counts() {
  $('#leftN').textContent = D ? queue().length : '–';
  const n = MPOOL.filter(l => votes(l.id).k.length).length; const e = $('#matchN'); e.textContent = n || ''; n ? e.removeAttribute('data-z') : e.setAttribute('data-z', '');
  if (me) { const b = $('#meBtn'); b.textContent = me.name; b.style.background = me.color }
}

// ---------------------------------------------------------------- card (Tinder-style: full-bleed photo, minimal overlay; full details in a sheet / desktop side column)
const specs = l => [l.year ? 'Built ' + l.year : 'Year unknown', l.layout, l.bldg && 'House ' + fmt(l.bldg) + ' m²', l.land && 'Land ' + fmt(l.land) + ' m²'].filter(Boolean);
const chipCls = c => /^Onsen/.test(c) ? 'c-onsen' : /^Ski/.test(c) ? 'c-ski' : /^Surf/.test(c) ? 'c-surf' : '';
const vcol = v => v >= 70 ? '#1a9e4b' : v >= 55 ? '#6aa84f' : v >= 40 ? '#e0a800' : '#c77';
const usdK = u => u >= 9500 ? '$' + Math.round(u / 1000) + 'k' : '$' + (u / 1000).toFixed(1) + 'k';
const shortChip = c => c.replace(/^Hiking: /, '🥾 ').replace(/ · .*$/, '').replace(/ \(big area\)/, '').replace(/^(Ski \d+ min) \(.*\)$/, '$1 ★ big resort').replace(/^Small town \(([\d,]+)\)$/, 'Small town').replace(/^Onsen/, '♨️ Onsen').replace(/^Ski/, '⛷️ Ski').replace(/^Surf/, '🏄 Surf').replace(/^Climbing/, '🧗 Climbing');
// key facts row (Zillow-style): price first, then year · m² · layout · land
function factsHTML(l) {
  const f = [[l.year || '?', 'built'], [l.bldg ? fmt(l.bldg) + ' m²' : '?', 'house'], [l.layout || '–', 'layout'], [l.land ? fmt(l.land) + ' m²' : '–', 'land']];
  return `<div class="kf">${f.map(([v, k]) => `<div><b>${esc(String(v))}</b><span>${k}</span></div>`).join('')}</div>`;
}
function accessHTML(l) {
  const r = l.reach || {}, out = [];
  if (r.shinkansen) out.push(`🚄 <b>${esc(r.shinkansen.ja)}</b> (Shinkansen) ~${hm(r.shinkansen.min)}`);
  if (r.airport) out.push(`✈️ <b>${esc(r.airport.name)}</b> ${r.airport.iata ? '(' + esc(r.airport.iata) + ') ' : ''}~${hm(r.airport.min)}`);
  if (r.station && (!r.shinkansen || r.station.ja !== r.shinkansen.ja)) out.push(`🚉 nearest station ${esc(r.station.ja)} ~${hm(r.station.min)}`);
  const ft = r.from_tokyo ? `From Tokyo ≈ ${hm(r.from_tokyo)}` : '', fo = r.from_osaka ? `Osaka ≈ ${hm(r.from_osaka)}` : '';
  return out.map(x => `<div class="acc">${x}</div>`).join('') + (ft || fo ? `<div class="acc">🗾 ${[ft, fo].filter(Boolean).join(' · ')} <span class="nb">(est.)</span></div>` : '');
}
function votesHTML(l) {
  const v = votes(l.id), o = a => a.filter(m => m.id !== me?.id);
  if (!o([...v.k, ...v.t]).length) return '';
  const grp = (a, cls, lbl) => o(a).length ? `<span class="vg">${o(a).map(m => av(m, cls)).join('')} ${lbl}</span>` : '';
  return `<div class="votes">${grp(v.lv, 'lv', '❤️ love')}${grp(v.y, '', 'yes')}${grp(v.mb, 'my', 'maybe')}${grp(v.t, 't', 'no')}</div>`;
}
const SERIOUS = /Leasehold|Rebuild|Unregistered|negotiation|Farmland|Needs renovation|Pit toilet/i;
function detailsHTML(l) {   // full details: desktop right column + phone details sheet
  return `<div class="price">¥${fmt(l.jpy)} <small>≈ US$${fmt(l.usd)}</small></div>
  <div class="ttl">${esc(l.title)}</div>
  <div class="loc">📍 ${esc(l.town)}, ${esc(l.pref)} <span class="nb">${esc(l.pref_ja)}${esc(l.muni_ja || '')}</span>${l.prec === 'city' ? ' <i class="nb">(town-level location)</i>' : ''}</div>
  ${factsHTML(l)}
  <div class="vchips">${l.chips.map(c => `<span class="vchip ${chipCls(c)}">${esc(c)}</span>`).join('')}</div>
  ${accessHTML(l)}
  ${l.flags.length ? `<div class="chips">${l.flags.map(f => `<span class="chip ${SERIOUS.test(f) ? 'bad' : ''}">${SERIOUS.test(f) ? '⚠️ ' : ''}${esc(f)}</span>`).join('')}</div>` : ''}
  <div class="vslot">${votesHTML(l)}</div>
  ${l.desc ? `<div class="desc">${esc(l.desc)}</div>` : ''}
  <a class="lnk" href="${esc(l.url)}" target="_blank" rel="noopener">Open listing ↗</a>${l.agg ? ` · <a class="lnk" href="${esc(l.agg)}" target="_blank" rel="noopener">AkiyaJapan copy</a>` : ''}
  <div class="small">${esc(l.source)} · ${esc(l.verified || '')} · first seen ${l.first_seen} · times are estimates (straight-line × road factor)</div>`;
}
function cardHTML(l, top) {
  const n = l.photos.length;
  const imgs = n ? l.photos.map((p, i) => `<img ${i === 0 || (top && i === 1) ? 'src' : 'data-src'}="${p}" alt="" draggable="false" decoding="async">`).join('') : `<div class="small" style="color:#ccc;padding:40px 20px;text-align:center">No photos – see listing</div>`;
  const vs = votes(l.id), others = vs.ok.filter(m => m.id !== me?.id);
  return `<div class="ph"><div class="car">${top ? imgs : (n ? `<img src="${l.photos[0]}" alt="">` : '')}</div>
  ${n > 1 ? `<div class="dots">${l.photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button class="pa l" aria-label="Previous photo">‹</button><button class="pa r" aria-label="Next photo">›</button>` : ''}
  ${n ? `<span class="pc">1 / ${n}</span><button class="pz" aria-label="Full screen">⤢</button>` : ''}
  ${top && n > 1 ? `<div class="thumbs">${l.photos.map((p, i) => `<img src="${p}" data-i="${i}" class="${i ? '' : 'on'}" alt="" loading="lazy" draggable="false">`).join('')}</div>` : ''}
  <div class="vibe" style="--vc:${vcol(l.vibe)}"><b>${l.vibe}</b><small>VIBE</small></div>${l.fresh ? '<span class="badge">NEW</span>' : ''}
  <div class="stamp k">YES</div><div class="stamp t">NO</div><div class="stamp my">MAYBE</div><div class="stamp lv">LOVE</div>
  <div class="ov"><div class="ovp">¥${fmt(l.jpy)} <small>≈ US$${fmt(l.usd)}</small></div>
    <div class="ovt">${esc(l.town)}, ${esc(l.pref)}</div>
    <div class="ovf">${[l.year ? 'Built ' + l.year : 'Year ?', l.bldg ? fmt(l.bldg) + ' m²' : '', l.layout, l.land ? 'land ' + fmt(l.land) + ' m²' : ''].filter(Boolean).map(esc).join(' · ')}</div>
    <div class="ovc">${l.chips.slice(0, 3).map(c => `<span>${esc(shortChip(c))}</span>`).join('')}</div>
    <div class="ovv">${others.length ? others.map(m => av(m, vs.lv.includes(m) ? 'lv' : '')).join('') + ' said yes' : ''}</div>
    <button class="more" aria-label="Details">i</button></div></div>
  <div class="info">${detailsHTML(l)}</div>`;
}
const deck = $('#deck'); let cur = null, dragging = false;
function render() {
  if (!D) return; deck.innerHTML = ''; const q = queue();
  $('#empty').hidden = !!q.length; $('#actions').hidden = !q.length || !vis('swipe');
  if (!q.length) $('#empty').innerHTML = filtersOn() ? `No houses left with your filters.<br><br><button class="pill2" onclick="resetFilters()">Clear filters</button>` : `🎉 You've voted on every house still in play.<br><br>Check <b>Matches</b> to see what the crew kept.`;
  q.slice(0, 2).reverse().forEach((l, i, a) => {
    const top = i === a.length - 1, c = document.createElement('div');
    c.className = 'card' + (top ? '' : ' back'); c.dataset.id = l.id; c.innerHTML = cardHTML(l, top); deck.appendChild(c);
    if (top) wire(c, l);
  });
  counts();
}
function updVotesOnCard() {
  const c = deck.lastElementChild, l = c && byId[c.dataset.id]; if (!l) return;
  const s = c.querySelector('.vslot'); if (s) s.innerHTML = votesHTML(l);
  const o = c.querySelector('.ovv'), ks = votes(l.id).k.filter(m => m.id !== me?.id); if (o) o.innerHTML = ks.length ? ks.map(m => av(m)).join('') + ' kept' : '';
}
function wire(c, l) {
  const car = c.querySelector('.car'), imgs = [...car.querySelectorAll('img')], dots = c.querySelectorAll('.dots i'), pc = c.querySelector('.pc'), n = l.photos.length;
  let idx = 0;
  const ensure = i => { const im = imgs[i]; if (im && im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src') } };
  const thumbs = c.querySelectorAll('.thumbs img');
  const setIdx = i => { idx = i; dots.forEach((d, k) => d.classList.toggle('on', k === i)); thumbs.forEach((t, k) => t.classList.toggle('on', k === i)); if (pc) pc.textContent = `${i + 1} / ${n}`; ensure(i + 1); ensure(i - 1); ensure(i) };
  const go = i => { i = (i + n) % n; ensure(i); car.scrollTo({ left: i * car.clientWidth, behavior: 'auto' }); setIdx(i) };
  c.querySelectorAll('.pa').forEach(b => b.onclick = e => { e.stopPropagation(); go(idx + (b.classList.contains('r') ? 1 : -1)) });
  const pz = c.querySelector('.pz'); if (pz) pz.onclick = e => { e.stopPropagation(); viewer(l.photos, idx) };
  thumbs.forEach(t => t.onclick = e => { e.stopPropagation(); go(+t.dataset.i) });
  c.querySelector('.more').onclick = e => { e.stopPropagation(); details(l) };
  cur = { go: d => n > 1 && go(idx + d), idx: () => idx, l, snap: () => car.scrollTo({ left: idx * car.clientWidth }) };
  // one gesture handler for the whole card: horizontal drag = keep/toss (tilt + stamp); tap on photo halves = prev/next photo; tap on the overlay = details
  const sk = c.querySelector('.stamp.k'), st = c.querySelector('.stamp.t');
  let sx = 0, sy = 0, dx = 0, dy = 0, state = 0, pid = null;
  c.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button,.thumbs') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    sx = e.clientX; sy = e.clientY; dx = dy = 0; state = 1; pid = e.pointerId;
  });
  c.addEventListener('pointermove', e => {
    if (!state || e.pointerId !== pid) return; dx = e.clientX - sx; dy = e.clientY - sy;
    if (state === 1) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1) { state = 2; dragging = true; try { c.setPointerCapture(pid) } catch (_) { } c.style.transition = 'none' }
      else if (Math.abs(dy) > 14) { state = 3; return } else return;   // vertical: let the details column scroll (desktop)
    }
    if (state !== 2) return;
    e.preventDefault();
    c.style.transform = `translate(${dx}px,${dy * 0.2}px) rotate(${dx / 14}deg)`; sk.style.opacity = Math.min(1, Math.max(0, dx / 80)); st.style.opacity = Math.min(1, Math.max(0, -dx / 80));
  });
  const end = e => {
    if (e.pointerId !== pid) return; const was = state; state = 0; dragging = false;
    if (was === 1 && e.type === 'pointerup' && Math.abs(dx) < 8 && Math.abs(dy) < 8) {   // a tap
      if (e.target.closest('.ov')) return details(l);
      if (e.target.closest('.car,.ph') && !e.target.closest('.info')) { if (n < 2) return; const r = car.getBoundingClientRect(); return go(idx + (e.clientX - r.left < r.width / 2 ? -1 : 1)) }
      return;
    }
    if (was !== 2) return;
    if (Math.abs(dx) > 90 && e.type === 'pointerup') return decide(dx > 0 ? 'yes' : 'no', c);
    c.style.transition = 'transform .25s'; c.style.transform = ''; sk.style.opacity = st.style.opacity = 0;
  };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
}
// details sheet (phone: tap the card info / ⓘ). Zillow-like: facts, photo grid, full-screen gallery, then Keep/Toss.
function details(l) {
  const s = $('#det'); s.hidden = false; s.dataset.id = l.id;
  $('#detBody').innerHTML = `<div class="grid">${l.photos.map((p, i) => `<img src="${p}" data-i="${i}" loading="lazy" alt="">`).join('')}</div>${detailsHTML(l)}`;
  $('#detBody').scrollTop = 0;
  $('#detBody').querySelectorAll('.grid img').forEach(im => im.onclick = () => viewer(l.photos, +im.dataset.i));
  const onTop = queue()[0]?.id === l.id; $('#detActs').hidden = !onTop;
}
addEventListener('resize', () => cur?.snap && cur.snap());
$('#detClose').onclick = () => $('#det').hidden = true;
$('#det').onclick = e => { if (e.target.id === 'det') $('#det').hidden = true };
$('#detKeep').onclick = () => { $('#det').hidden = true; decide('yes') };
$('#detToss').onclick = () => { $('#det').hidden = true; decide('no') };
$('#detMaybe').onclick = () => { $('#det').hidden = true; decide('maybe') };
$('#detLove').onclick = () => { $('#det').hidden = true; decide('love') };
const VLBL = { yes: '✓ Yes', no: '✕ No', maybe: '? Maybe', love: '❤️ Love' };
const STK = { yes: 'k', no: 't', maybe: 'mb', love: 'lv' };
function decide(d, c) {
  if (!me) return showSignin(S.members);
  const q = queue(); if (!q.length) return; const l = q[0]; c = c || deck.lastElementChild;
  setLocal(l.id, d); queueWrite(l.id, d); undoStack.push(l.id); mapDirty = true; sideRefresh(); if (d === 'yes' || d === 'love') checkMatch();
  toast(VLBL[d]);
  if (c) {
    c.style.transition = 'transform .28s ease-in';
    c.style.transform = d === 'maybe' ? 'translate(0,-120vh) rotate(-4deg)' : `translate(${d === 'no' ? -130 : 130}vw,${d === 'love' ? -30 : 40}px) rotate(${d === 'no' ? -28 : 28}deg)`;
    const st = c.querySelector('.stamp.' + STK[d]); if (st) st.style.opacity = 1;
  }
  setTimeout(render, c ? 200 : 0);
}
function revote(lid, d) { if (!d) front = [lid, ...front.filter(x => x !== lid)]; setLocal(lid, d); queueWrite(lid, d); mapDirty = true; render(); counts(); sideRefresh() }
function undo() {
  const id = undoStack.pop(); if (!id) return toast('Nothing to undo');
  revote(id, null); toast('↶ Undone');
}
$('#bKeep').onclick = () => decide('yes'); $('#bToss').onclick = () => decide('no'); $('#bMaybe').onclick = () => decide('maybe'); $('#bLove').onclick = () => decide('love'); $('#bUndo').onclick = undo;
document.addEventListener('keydown', e => {
  if (window.Intro?.open) return;
  if (!$('#viewer').hidden) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); $('#viewer').hidden = true }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); viewerGo(1) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); viewerGo(-1) }
    return;
  }
  if (!vis('swipe') || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
  const modal = ['#det', '#filters', '#match'].find(x => !$(x).hidden);
  if (modal) { if (e.key === 'Escape') { e.preventDefault(); $(modal).hidden = true } return }
  if (!$('#menu').hidden || !$('#signin').hidden) return;
  if (e.key === 'i' || e.key === ' ') { if (cur?.l) { e.preventDefault(); details(cur.l) } return }
  if (e.key === 'Enter') { if (cur?.l?.photos.length && (e.target === document.body || e.target.closest('#actions,#deck,#kbd'))) { e.preventDefault(); viewer(cur.l.photos, cur.idx()) } return }
  if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'ArrowLeft')) { e.preventDefault(); cur?.go(-1) }
  else if (e.key === 'ArrowDown' || (e.shiftKey && e.key === 'ArrowRight')) { e.preventDefault(); cur?.go(1) }
  else if (e.key === 'ArrowRight') decide('yes'); else if (e.key === 'ArrowLeft') decide('no');
  else if (e.key === 'm' || e.key === 'M') decide('maybe'); else if (e.key === 'l' || e.key === 'L') decide('love');
  else if (e.key === 'Backspace' || e.key === 'z') { e.preventDefault(); undo() }
});
function viewer(photos, start) {
  const v = $('#viewer'), car = $('#vcar'); v.hidden = false;
  car.innerHTML = photos.map((p, i) => `<img ${Math.abs(i - start) <= 1 ? 'src' : 'data-src'}="${p}" alt="" draggable="false">`).join('');
  const imgs = [...car.querySelectorAll('img')], upd = () => {
    const i = Math.round(car.scrollLeft / Math.max(1, car.clientWidth)); $('#vcount').textContent = `${i + 1} / ${photos.length} · swipe for more`;
    [i - 1, i, i + 1].forEach(k => { const im = imgs[k]; if (im && im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src') } });
  };
  car.onscroll = upd; requestAnimationFrame(() => { car.scrollLeft = start * car.clientWidth; upd() });
}
function viewerGo(d) { const car = $('#vcar'), n = car.children.length, i = Math.round(car.scrollLeft / Math.max(1, car.clientWidth)); if (n) car.scrollTo({ left: ((i + d + n) % n) * car.clientWidth }) }
$('#vprev').onclick = () => viewerGo(-1); $('#vnext').onclick = () => viewerGo(1);
$('#vclose').onclick = () => $('#viewer').hidden = true;

// ---------------------------------------------------------------- tabs
let mapDirty = true, map = null, layer = null, mapReady = null;
document.querySelectorAll('.tab').forEach(b => b.onclick = () => showTab(b.dataset.v));
function showTab(v) {
  if (DESK && (v === 'swipe' || v === 'map')) {   // both always visible on desktop
    if (v === 'map') initMap().then(() => { map.invalidateSize(); if (mapDirty) drawMap(true) });
    $('#actions').hidden = !queue().length; return sync();
  }
  curTab = v;
  if (DESK) initMap().then(() => { map.invalidateSize(); if (mapDirty) drawMap(true) });
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x.dataset.v === v));
  document.querySelectorAll('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $('#actions').hidden = !vis('swipe') || !queue().length; if (!DESK) $('#sheet').hidden = true;
  if (v === 'map' && !DESK) initMap().then(() => { map.invalidateSize(); if (mapDirty) drawMap(true) });
  if (v === 'matches') drawMatches();
  if (v === 'group') drawGroup();
  sync();
}
function matchList() {
  return MPOOL.map(l => ({ l, v: votes(l.id) })).filter(x => x.v.k.length)
    .sort((a, b) => b.v.score - a.v.score || b.v.mb.length - a.v.mb.length || a.v.t.length - b.v.t.length || b.l.vibe - a.l.vibe);   // Love = 2, Yes = 1; Maybe only breaks ties
}
function segHTML(l) {
  const d = ND(myDec()[l.id]?.d), b = (v, cls, t) => `<button class="${cls} ${d === v ? 'on' : ''}" data-d="${v}">${t}</button>`;
  return `<div class="seg" data-id="${l.id}">${b('no', 't', '✕ No')}${b('maybe', 'my', '? Maybe')}${b('love', 'lv', '❤️ Love')}${b('yes', 'k', '✓ Yes')}${d ? '<button data-d="" title="Undecide">↺</button>' : ''}</div>`;
}
function wireSeg(root, after) {
  root.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
    const lid = b.closest('.seg').dataset.id, d = b.dataset.d || null; if (!me) return showSignin(S.members);
    revote(lid, d); toast(d ? VLBL[d] : '↺ Back in your deck'); after();
  });
}
function voteRow(v) {
  return `<div class="votes">${v.lv.map(m => av(m, 'lv')).join('')}${v.y.map(m => av(m)).join('')}${v.mb.map(m => av(m, 'my')).join('')}${v.t.map(m => av(m, 't')).join('')}${v.p.map(m => av(m, 'p')).join('')}</div>`;
}
let matchMode = 'crew';
function savedList() {   // "saved homes": everything I kept, newest first
  const md = myDec(); return MPOOL.filter(l => POS(ND(md[l.id]?.d))).sort((a, b) => (md[b.id].t || '').localeCompare(md[a.id].t || '')).map(l => ({ l, v: votes(l.id) }));
}
function drawMatches() {
  const n = S.members.length, crew = matchList(), mine = savedList(), ms = matchMode === 'mine' ? mine : crew;
  $('#matches').innerHTML = `<div class="mseg"><button data-m="crew" class="${matchMode === 'crew' ? 'on' : ''}">💞 Crew matches <b>${crew.length}</b></button><button data-m="mine" class="${matchMode === 'mine' ? 'on' : ''}">♥ My saved <b>${mine.length}</b></button></div>` +
    `<div class="hdr">${matchMode === 'mine' ? `Houses you said Yes / Love / Maybe to, newest first.` : `${ms.length} house${ms.length === 1 ? '' : 's'} with a Yes, Love or Maybe · ranked Love = 2, Yes = 1.`} <span class="nb">Red ring = love, dashed = maybe, faded = no, grey = not voted yet.</span></div>` +
    (ms.length ? '' : '<p class="small" style="padding:20px;text-align:center">No yeses yet – swipe right (or ❤️ Love) on houses you like.</p>') +
    ms.map(({ l, v }) => `<div class="mc" data-id="${l.id}"><div class="row1"><img loading="lazy" src="${l.thumb || l.photos[0] || ''}" alt=""><div class="b">
      <div class="mprice">¥${fmt(l.jpy)} <span>≈ $${fmt(l.usd)}</span></div>
      <div class="mfacts">${[l.year ? 'Built ' + l.year : 'Year ?', l.bldg ? fmt(l.bldg) + ' m²' : '', l.layout, l.land ? 'land ' + fmt(l.land) + ' m²' : ''].filter(Boolean).map(esc).join(' · ')}</div>
      <div class="small">${esc(l.town)}, ${esc(l.pref)} · ${l.chips.slice(0, 2).map(c => esc(shortChip(c))).join(' · ')}</div>
      <div><span class="kc">✓ ${v.ok.length}/${n}${v.lv.length ? ` · ❤️ ${v.lv.length}` : ''}${v.mb.length ? ` · ? ${v.mb.length}` : ''}</span><b style="color:${vcol(l.vibe)}">vibe ${l.vibe}</b> ${isMatch(v, n) ? '<span class="all">🎉 Everyone matched!</span>' : ''}${l.status === 'out_of_area' ? ' <span class="ooa">outside new focus areas</span>' : ''}</div></div></div>
      ${voteRow(v)}${segHTML(l)}
      <div class="links"><a href="${esc(l.url)}" target="_blank" rel="noopener">Listing ↗</a><a href="#" class="onmap">Map</a><a href="#" class="pics">Photos (${l.photos.length})</a><a href="#" class="det">Details</a></div></div>`).join('');
  $('#matches').querySelectorAll('.mseg button').forEach(b => b.onclick = () => { matchMode = b.dataset.m; drawMatches() });
  $('#matches').querySelectorAll('.mc .det').forEach(a => a.onclick = ev => { ev.preventDefault(); details(byId[a.closest('.mc').dataset.id]) });
  wireSeg($('#matches'), drawMatches);
  $('#matches').querySelectorAll('.mc').forEach(e => {
    const l = byId[e.dataset.id];
    e.querySelector('.onmap').onclick = ev => { ev.preventDefault(); showTab('map'); mapReady.then(() => { map.setView([l.lat, l.lon], 10); sheet(l) }) };
    e.querySelector('.pics').onclick = ev => { ev.preventDefault(); if (l.photos.length) viewer(l.photos, 0) };
    e.querySelector('img').onclick = () => l.photos.length && viewer(l.photos, 0);
  });
}
function drawGroup() {
  const tot = ACTIVE.length, elim = ACTIVE.filter(l => eliminated(l.id)).length;
  $('#group').innerHTML = `<div class="hdr">${S.members.length} member${S.members.length === 1 ? '' : 's'} · ${tot} houses · ${elim} eliminated (everyone said no) · ${tot - elim} still in play</div>` +
    S.members.map(m => {
      const d = S.decisions[m.id] || {}, done = ACTIVE.filter(l => d[l.id]).length, k = ACTIVE.filter(l => ['yes', 'love'].includes(ND(d[l.id]?.d))).length, lv = ACTIVE.filter(l => ND(d[l.id]?.d) === 'love').length;
      const left = ACTIVE.filter(l => !d[l.id] && !eliminated(l.id)).length;
      return `<div class="gm"><span class="av big" style="background:${m.color}">${esc(m.name.slice(0, 1).toUpperCase())}</span><div class="b">
        <b>${esc(m.name)}</b>${m.id === me?.id ? ' <span class="nb">(you)</span>' : ''}<div class="small">voted ${done} · ✓ ${k} yes (❤️ ${lv} love) · ${left} left to swipe</div>
        <div class="bar"><i style="width:${Math.round(100 * done / Math.max(1, done + left))}%"></i></div></div></div>`;
    }).join('') + `<p class="small" style="padding:8px">Invite others by sharing the group link (⋯ → Share group link). Votes refresh every 20 s and when you come back to the app.</p>`;
}
// ---------------------------------------------------------------- map (bundled Leaflet + Japan outline, no tile servers)
function initMap() {
  if (mapReady) return mapReady;
  map = L.map('map', { zoomSnap: 0.5, tap: false }).setView([36.2, 137.8], 5.5);
  map.attributionControl.setPrefix(false); map.attributionControl.addAttribution('Base: dataofjapan/land (simplified, offline)');
  mapReady = fetch('japan.json?v=' + V).then(r => r.json()).then(Gj => {
    L.geoJSON(Gj, { style: { color: '#8a8a7a', weight: .8, fillColor: '#f3efe2', fillOpacity: 1 }, interactive: false }).addTo(map);
    const lg = L.control({ position: 'topright' }); lg.onAdd = () => { const d = L.DomUtil.create('div', 'legend'); d.id = 'legend'; return d }; lg.addTo(map);
    layer = L.layerGroup().addTo(map); map.on('click', () => $('#sheet').hidden = true);
  });
  return mapReady;
}
const kcol = (k, n) => n > 1 && k === n ? '#d99a00' : ['#58a873', '#1a9e4b', '#0d7a37', '#08572a', '#053d1d'][Math.min(4, k - 1)];
function drawMap(fit) {
  if (!map || !layer) { mapDirty = true; return }
  if (fit !== true) fit = false;
  mapDirty = false; layer.clearLayers(); const ms = matchList(), n = S.members.length;
  if (DESK && !fit && ms.length && !drawMap.fitted) fit = true;   // first keeps on desktop: zoom to them once
  if (fit && ms.length) drawMap.fitted = true;
  ms.slice().reverse().forEach(({ l, v }) => {
    L.marker([l.lat, l.lon], { icon: L.divIcon({ className: '', html: `<div class="mk" data-k="${Math.max(1, v.ok.length)}" style="background:${kcol(Math.max(1, v.ok.length), n)}">${usdK(l.usd)}<b>${v.lv.length ? '❤' : '✓'}${v.ok.length}</b></div>`, iconSize: [70, 44], iconAnchor: [35, 22] }), zIndexOffset: 1000 * v.k.length })   // more keeps = drawn on top (Leaflet otherwise stacks by latitude)
      .on('click', e => { L.DomEvent.stopPropagation(e); sheet(l) }).addTo(layer);
  });
  const lg = $('#legend'); if (lg) lg.innerHTML = '<b>Price pins · ✓ yes votes</b><br>' + [1, 2, 3, 4].filter(k => k < n || k === 1).map(k => `<span class="sw" style="background:${kcol(k, 99)}"></span>${k}`).join(' ') + (n > 1 ? `<br><span class="sw" style="background:#e0a800"></span>everyone (${n})` : '');
  if (fit && ms.length) map.fitBounds(L.latLngBounds(ms.map(x => [x.l.lat, x.l.lon])).pad(0.4), { maxZoom: 7 });
  else if (fit && !DESK) toast('No kept houses yet');
}
function sheet(l) {
  const s = $('#sheet'), v = votes(l.id), n = S.members.length; s.hidden = false;
  s.innerHTML = `<button class="x" aria-label="Close">✕</button><div class="price">¥${fmt(l.jpy)} <small>≈ US$${fmt(l.usd)} · vibe ${l.vibe}</small></div>
  ${isMatch(v, n) ? '<div class="all">🎉 Everyone matched!</div>' : ''}<div class="ttl">${esc(l.title)}</div>
  <div class="loc">📍 ${esc(l.town)}, ${esc(l.pref)} ${l.prec === 'city' ? '(town-level, approx)' : '(approx)'}</div>
  <div class="vchips">${l.chips.map(c => `<span class="vchip ${chipCls(c)}">${esc(c)}</span>`).join('')}</div>${accessHTML(l)}
  <div class="specs">${specs(l).map(x => `<span>${esc(x)}</span>`).join('')}</div>${l.flags.length ? `<div class="chips">${l.flags.map(f => `<span class="chip">${esc(f)}</span>`).join('')}</div>` : ''}
  ${voteRow(v)}<div class="gal">${l.photos.map((p, i) => `<img loading="lazy" src="${p}" data-i="${i}" alt="">`).join('')}</div>${segHTML(l)}
  <a class="lnk" href="${esc(l.url)}" target="_blank" rel="noopener">Open listing ↗</a>`;
  s.querySelector('.x').onclick = () => s.hidden = true;
  s.querySelectorAll('.gal img').forEach(im => im.onclick = () => viewer(l.photos, +im.dataset.i));
  wireSeg(s, () => { drawMap(false); if (votes(l.id).k.length) sheet(l); else s.hidden = true });
}
// ---------------------------------------------------------------- sign-in / switch user
function showSignin(list) {
  $('#signin').hidden = false; $('#signErr').hidden = true;
  const ms = list || S.members; $('#pickWrap').hidden = !ms.length;
  $('#pick').innerHTML = ms.map(m => `<button data-id="${m.id}" style="background:${m.color}">${esc(m.name)}</button>`).join('');
  $('#pick').querySelectorAll('button').forEach(b => b.onclick = () => { const m = ms.find(x => x.id === b.dataset.id); signedIn(m) });
  if (window.Intro && !Intro.seen() && !Intro.open) playIntro();
  setTimeout(() => { if (!window.Intro?.open) $('#nameIn').focus() }, 50);
}
// animated "How it works" intro (intro.js): automatic on a device's first sign-in screen, replayable from the menu
function playIntro() {
  if (!window.Intro) return;
  Intro.play({
    signedIn: !!me, hasMembers: S.members.length > 0, onClose: (why, name) => {
      if (me) return;
      if (why === 'join' && name) { $('#nameIn').value = name; const f = $('#joinForm'); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })) }
      else setTimeout(() => $('#nameIn').focus(), 380);
    }
  });
}
function signedIn(m) {
  me = m; localStorage.setItem(LS_ME, JSON.stringify(m)); $('#signin').hidden = true; undoStack = [];
  toast('Hi ' + m.name + '!'); sync(true).then(() => { render(); showTip(false) });
}
$('#joinForm').onsubmit = async e => {
  e.preventDefault(); const name = $('#nameIn').value.trim(); if (!name) return;
  $('#joinBtn').disabled = true;
  try { const j = await api('join', { name }); signedIn(j.member) }
  catch (err) { $('#signErr').hidden = false; $('#signErr').textContent = err.status === 403 ? 'This group link is not valid.' : 'Could not join: ' + err.message }
  finally { $('#joinBtn').disabled = false }
};
function showNoCode() { $('#nocode').hidden = false; $('#signin').hidden = true }
// ---------------------------------------------------------------- menu
const menu = $('#menu');
const openMenu = () => { $('#mHello').textContent = me ? `Signed in as ${me.name}` : 'Not signed in'; aboutText(); menu.hidden = false };
$('#menuBtn').onclick = openMenu; $('#meBtn').onclick = openMenu;
$('#mClose').onclick = () => menu.hidden = true; menu.onclick = e => { if (e.target === menu) menu.hidden = true };
$('#mSwitch').onclick = () => { menu.hidden = true; me = null; localStorage.removeItem(LS_ME); sync(true).finally(() => showSignin(S.members)) };
$('#mRefresh').onclick = () => { sync(true).then(() => toast('Votes refreshed')) };
const link = () => location.origin + location.pathname + '?g=' + G;
$('#mShareLink').onclick = () => { if (navigator.share) navigator.share({ title: 'Japan House Crew', text: 'Swipe Japanese houses with us', url: link() }).catch(() => { }); else { navigator.clipboard?.writeText(link()); toast('Link copied') } };
function aboutText() { if (!D || !$('#about')) return; $('#about').textContent = `Data ${D.generated.slice(0, 10)} · ${ACTIVE.length} houses · FX 1 USD = ${D.fx.toFixed(1)} JPY · ${D.drive_model}. ${$('#about').dataset.sync || ''}. App ${V}.` }
const standalone = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
function showTip(force) {
  if (!force && (localStorage.getItem(LS_TIP) || standalone() || DESK)) return;
  const t = $('#tip'); t.hidden = false;
  t.innerHTML = `<button id="tipOk">Got it</button><b>Add to Home Screen:</b> Share <span aria-hidden="true">⬆︎</span> → <b>Add to Home Screen</b>.<br>
  <span class="small">Swipe the <b>card</b> right = <b>Yes</b>, left = <b>No</b>, or tap ✕ No · ? Maybe · ❤️ Love · ✓ Yes. Tap the left/right side of the photo for more photos, tap the text for all details. <b>Filter</b> sorts by price, onsen, ski… A house disappears only when everyone says No; it's a match when everyone says Yes or Love.</span>`;
  $('#tipOk').onclick = () => { t.hidden = true; localStorage.setItem(LS_TIP, '1') };
}
$('#mTip').onclick = () => { menu.hidden = true; showTip(true) };
$('#mIntro').onclick = () => { menu.hidden = true; playIntro() }; $('#introAgain').onclick = playIntro;
$('#mView').onclick = () => { localStorage.setItem(LS_VIEW, DESK ? 'phone' : 'desktop'); menu.hidden = true; applyLayout() };
$('#mViewAuto').onclick = () => { localStorage.removeItem(LS_VIEW); menu.hidden = true; applyLayout() };
DESK_MQ.addEventListener?.('change', applyLayout); applyLayout();
// ---------------------------------------------------------------- boot
const rank = (a, b) => (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0) || b.vibe - a.vibe || a.jpy - b.jpy;
if (!G) showNoCode();
else fetch('data.json?v=' + V).then(r => r.json()).then(async data => {
  D = data; D.listings.forEach(l => { byId[l.id] = l; l.onsenMin = minOf(l, /^Onsen (\d+) min/); l.skiMin = minOf(l, /^Ski (\d+) min/); l.surfMin = minOf(l, /^Surf (\d+) min/) });
  $('#fBtn').classList.toggle('on', filtersOn());
  ACTIVE = D.listings.filter(l => l.status === 'active').sort(rank);
  MPOOL = ACTIVE.concat(D.listings.filter(l => l.status === 'out_of_area'));   // kept before the 2026-10-10 area change -> still in Matches
  render();
  if (DESK) showTab(curTab === 'swipe' ? 'matches' : curTab);
  await sync(true);
  if (!me) showSignin(S.members); else { render(); showTip(false) }
  flush();
}).catch(e => { $('#deck').innerHTML = `<p style="padding:20px">Could not load data (${esc(e)}).</p>` });
setInterval(() => { if (document.visibilityState === 'visible') { sync(); flush() } }, POLL_MS);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { sync(true); flush() } });
window.addEventListener('focus', () => sync(true)); window.addEventListener('online', () => { flush(); sync(true) });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });

// SKIP_BUTTON build flag: quiet Skip under the No | Maybe | Love | Yes row (desktop key S). Card goes to the back of MY deck, no vote.
(() => {
  const a = document.getElementById('actions'); if (!a || document.getElementById('bSkip')) return;
  const b = document.createElement('button'); b.id = 'bSkip'; b.type = 'button'; b.className = 'skipb mw-hover'; b.title = 'Skip for now (S)';
  b.setAttribute('aria-label', 'Skip for now'); b.textContent = 'Skip for now ⤵'; const br = document.createElement('i'); br.className = 'skbrk'; a.append(br, b); a.classList.add('hasskip'); document.documentElement.classList.add('skipon');
  b.onclick = () => { if (!me) return showSignin(S.members); skipCard() };
  document.addEventListener('keydown', e => {
    if ((e.key !== 's' && e.key !== 'S') || window.Intro?.open || !vis('swipe') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || ['#det', '#filters', '#match', '#viewer', '#menu', '#signin'].some(x => !$(x).hidden)) return;
    e.preventDefault(); skipCard();
  });
})();
