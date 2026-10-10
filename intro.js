'use strict';
/* Japan House Crew – animated onboarding intro ("How it works").
   Original art: "Mori" the forest spirit + a little akiya in the countryside. Inline SVG + CSS animations only
   (no video, no images, no external requests). Shown once per device (localStorage), replayable from the menu. */
(() => {
const LS = 'crew_intro_v1';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const SC = [
  { k: 1, t: 'Welcome to Japan House Crew', s: "We're finding our cabin in Japan together. I'm Mori, the forest spirit – let me show you how it works.", d: 4400 },
  { k: 2, t: 'Swipe right = Yes', s: 'Like it? Send it right – whoosh, like a ski run.', d: 4000 },
  { k: 3, t: 'Swipe left = No', s: 'Not for us? Let it drift away like an autumn leaf.', d: 4000 },
  { k: 8, t: 'Maybe ? and Love ❤️ buttons', s: 'Unsure? Tap ? Maybe. Dream house? Tap the red ❤️ Love – it counts double in Matches.', d: 4600 },
  { k: 4, t: 'A house only disappears when EVERYONE says No', s: 'One single Yes, Love or Maybe and it stays in play for the whole crew.', d: 5000 },
  { k: 5, t: "If everyone says Yes… It's a match!", s: 'Yes or Love from all of us = lanterns up!', d: 4800 },
  { k: 6, t: 'Matches = we go visit and maybe buy it together', s: 'Road trip to the countryside, keys in hand.', d: 4400 },
  { k: 7, t: "What's your name?", s: 'So the crew knows who voted what. No password, no email.', d: 0 },
];
const N = SC.length;
// ------------------------------------------------------------------ art helpers
let cid = 0;
const FUR = { a: 'url(#iFur)', b: 'url(#iFur2)', c: 'url(#iFur3)', d: 'url(#iFur4)' };
const at = (x, y, s, inner, r = 0) => `<g transform="translate(${x} ${y})${r ? ` rotate(${r})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;
function spirit(f = 'a', cls = '', face = '', acc = '') {
  const fill = FUR[f];
  return `<g class="sp ${cls}">
  <ellipse cx="0" cy="50" rx="34" ry="6" fill="#3d4a3a" opacity=".16"/>
  <g class="sp-leaf"><path d="M0 -36C0 -44 2 -50 4 -54" stroke="#5c8a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
   <path d="M4 -54C10 -67 27 -67 33 -60C25 -50 12 -48 4 -54Z" fill="#82ba6c"/><path d="M7 -55C15 -59 22 -60 30 -60" stroke="#5c8a4a" stroke-width="1.2" fill="none"/></g>
  <ellipse class="sp-al" cx="-39" cy="16" rx="9" ry="7" fill="${fill}"/><ellipse class="sp-ar" cx="39" cy="16" rx="9" ry="7" fill="${fill}"/>
  <path d="M0 -38C26 -38 43 -14 43 12C43 38 25 48 0 48C-25 48 -43 38 -43 12C-43 -14 -26 -38 0 -38Z" fill="${fill}" stroke="#8f8a80" stroke-opacity=".35" stroke-width="1.5"/>
  <path d="M-12 -36q4 -7 8 -1q4 -7 8 -1q4 -7 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/>
  <ellipse cx="0" cy="24" rx="25" ry="20" fill="#fffaf0" opacity=".9"/>
  <g class="sp-eyes"><ellipse cx="-14" cy="-4" rx="7.5" ry="9.5" fill="#2c2a33"/><ellipse cx="14" cy="-4" rx="7.5" ry="9.5" fill="#2c2a33"/>
   <circle cx="-11" cy="-8" r="3" fill="#fff"/><circle cx="17" cy="-8" r="3" fill="#fff"/><circle cx="-16" cy="-1" r="1.4" fill="#fff"/><circle cx="12" cy="-1" r="1.4" fill="#fff"/></g>
  <ellipse cx="-25" cy="8" rx="6" ry="3.5" fill="#f2a0a0" opacity=".7"/><ellipse cx="25" cy="8" rx="6" ry="3.5" fill="#f2a0a0" opacity=".7"/>
  ${face === 'o' ? '<ellipse cx="0" cy="11" rx="3.5" ry="4.5" fill="#6b4a46"/>' : face === 'n' ? '<path d="M-4 11h8" stroke="#5a4a46" stroke-width="1.8" stroke-linecap="round"/>' : '<path d="M-5 8Q0 14 5 8" stroke="#5a4a46" stroke-width="1.9" fill="none" stroke-linecap="round"/>'}
  <ellipse cx="-14" cy="47" rx="8" ry="4.5" fill="#efeadf"/><ellipse cx="14" cy="47" rx="8" ry="4.5" fill="#efeadf"/>${ACC[acc] || ''}</g>`;
}
const ACC = {   // Mori's little outfits per activity
  ski: `<path d="M-30 28Q0 40 30 28L31 37Q0 50 -31 37Z" fill="#e8584a"/><path d="M16 36l5 22l8 -2l-4 -21z" fill="#d6453d"/><path d="M-30 31Q0 43 30 31" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>
   <path d="M-58 57H48Q60 57 62 47" stroke="#3c5a80" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M-41 18L-56 58M41 18L52 58" stroke="#7a5a3c" stroke-width="2.6" stroke-linecap="round"/><circle cx="-54" cy="54" r="3" fill="none" stroke="#7a5a3c" stroke-width="1.5"/><circle cx="50" cy="54" r="3" fill="none" stroke="#7a5a3c" stroke-width="1.5"/>`,
  hike: `<rect x="31" y="-8" width="20" height="32" rx="7" fill="#c2763f"/><rect x="34" y="4" width="14" height="8" rx="3" fill="#a85f2e"/><path d="M28 -6Q36 -14 44 -8" stroke="#7a4a26" stroke-width="2.5" fill="none"/>
   <path d="M-48 -14L-58 54" stroke="#7a5a3c" stroke-width="3.6" stroke-linecap="round"/><circle cx="-48" cy="-15" r="3.4" fill="#9a7048"/>`,
  towel: `<rect x="-18" y="-47" width="36" height="11" rx="5" fill="#fff" stroke="#d8ccb2" stroke-width="1.2"/><path d="M-10 -47v11M0 -47v11M10 -47v11" stroke="#9fc8d6" stroke-width="1.4"/>`,
};
function house(cls = '') {
  return `<g class="hs ${cls}"><ellipse cx="0" cy="2" rx="72" ry="7" fill="#4f7d43" opacity=".3"/>
  <circle cx="-62" cy="-8" r="12" fill="#6e9f58"/><circle cx="-52" cy="-4" r="9" fill="#82b46a"/><circle cx="60" cy="-7" r="11" fill="#6e9f58"/>
  <rect x="-50" y="-42" width="100" height="42" fill="#f1e5c8"/>
  <g fill="#7a5a3c"><rect x="-50" y="-42" width="100" height="4"/><rect x="-50" y="-42" width="4" height="42"/><rect x="46" y="-42" width="4" height="42"/><rect x="6" y="-42" width="4" height="42"/></g>
  <rect class="win" x="-42" y="-33" width="42" height="20" fill="#fbf6e6" stroke="#8b6b4a" stroke-width="1.3"/>
  <path d="M-31.5 -33v20M-21 -33v20M-10.5 -33v20M-42 -23h42" stroke="#8b6b4a" stroke-width=".9"/>
  <rect class="win" x="16" y="-30" width="22" height="30" fill="#f6edd6" stroke="#8b6b4a" stroke-width="1.3"/><path d="M27 -30v30" stroke="#8b6b4a" stroke-width=".9"/>
  <path d="M15 -31h24v9l-4 -2-4 2-4 -2-4 2-4 -2-4 2z" fill="#3c5a80"/>
  <rect x="-58" y="-4" width="116" height="5" rx="1" fill="#8b6b4a"/>
  <path d="M-72 -40Q-61 -43 -53 -52L-30 -78H30L53 -52Q61 -43 72 -40Q0 -35 -72 -40Z" fill="url(#iRoof)"/>
  <path d="M-58 -46Q0 -42 58 -46M-46 -58Q0 -55 46 -58M-36 -70Q0 -68 36 -70" stroke="#7d8692" stroke-width="1.1" fill="none" opacity=".55"/>
  <path d="M-12 -78L0 -90L12 -78Z" fill="#4a525d"/><path d="M-36 -79H36" stroke="#2c323a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="-22" cy="-60" r="5" fill="#7fae5f" opacity=".75"/><circle cx="-16" cy="-62" r="3.5" fill="#94c172" opacity=".75"/><circle cx="30" cy="-52" r="4" fill="#7fae5f" opacity=".7"/></g>`;
}
function card(price = '¥1.5M', spec = '6DK · 119 m² · onsen 9 min', stamp = '', vibe = 75) {
  const id = 'iCl' + (++cid);
  const st = stamp === 'k' ? `<g transform="translate(-26 -46) rotate(-16)"><g class="stamp"><rect x="-30" y="-14" width="60" height="28" rx="6" fill="#fff" fill-opacity=".85" stroke="#1a9e4b" stroke-width="3.5"/><text x="0" y="7.5" text-anchor="middle" font-size="19" font-weight="900" fill="#1a9e4b" letter-spacing="2">YES</text></g></g>`
    : stamp === 't' ? `<g transform="translate(26 -46) rotate(16)"><g class="stamp"><rect x="-30" y="-14" width="60" height="28" rx="6" fill="#fff" fill-opacity=".85" stroke="#d6453d" stroke-width="3.5"/><text x="0" y="7.5" text-anchor="middle" font-size="19" font-weight="900" fill="#d6453d" letter-spacing="2">NO</text></g></g>` : '';
  return `<g class="cd"><rect x="-62" y="-82" width="124" height="166" rx="15" fill="#2f2a22" opacity=".14" transform="translate(4 6)"/>
  <rect x="-62" y="-82" width="124" height="166" rx="15" fill="#fffdf7" stroke="#e5dac2" stroke-width="1.5"/>
  <clipPath id="${id}"><rect x="-55" y="-75" width="110" height="104" rx="10"/></clipPath>
  <g clip-path="url(#${id})"><rect x="-55" y="-75" width="110" height="104" fill="url(#iSky)"/><circle cx="34" cy="-52" r="12" fill="#fff3cf"/>
   <path d="M-60 2Q-30 -26 0 -12T60 -18V30H-60Z" fill="#9cc47f"/><path d="M-60 16Q-10 0 60 12V30H-60Z" fill="#78a963"/>
   ${at(-40, 4, .38, '<use href="#iCedar"/>')}${at(44, 2, .32, '<use href="#iCedar"/>')}${at(2, 20, .62, house())}</g>
  <circle cx="38" cy="-58" r="12" fill="#fff" stroke="#3aa356" stroke-width="2.5"/><text x="38" y="-54" text-anchor="middle" font-size="11" font-weight="900" fill="#2b3a2e">${vibe}</text>
  <text x="-52" y="50" font-size="17" font-weight="900" fill="#2a3440">${price}</text>
  <text x="-52" y="66" font-size="8.6" fill="#6b6255">${spec}</text>${st}</g>`;
}
const heart = (c = '#ef5a6f') => `<path d="M0 7C-13 -3 -15 -14 -7.5 -17.5C-3.5 -19.5 0 -16.5 0 -13C0 -16.5 3.5 -19.5 7.5 -17.5C15 -14 13 -3 0 7Z" fill="${c}"/>`;
const xb = `<g><circle r="11" fill="#fff" stroke="#d6453d" stroke-width="2.5"/><path d="M-4.5 -4.5L4.5 4.5M4.5 -4.5L-4.5 4.5" stroke="#d6453d" stroke-width="3" stroke-linecap="round"/></g>`;
const lantern = `<g class="lw"><circle r="20" fill="url(#iGlow)" opacity=".8"/><path d="M0 -17v-6" stroke="#5a3a2a" stroke-width="1.5"/>
  <rect x="-9" y="-14" width="18" height="25" rx="8" fill="#f2884b"/><path d="M-8 -6h16M-9 1h18M-8 7h16" stroke="#d0603a" stroke-width="1" opacity=".7"/>
  <rect x="-5" y="-16" width="10" height="3" rx="1" fill="#5a3a2a"/><rect x="-5" y="10" width="10" height="3" rx="1" fill="#5a3a2a"/><ellipse cx="-3" cy="-4" rx="2.5" ry="5" fill="#ffd9a0" opacity=".7"/></g>`;
const burst = c => `<g class="fw">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, x1 = Math.cos(a) * 7, y1 = Math.sin(a) * 7, x2 = Math.cos(a) * 26, y2 = Math.sin(a) * 26; return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${(x2 * 1.15).toFixed(1)}" cy="${(y2 * 1.15).toFixed(1)}" r="1.8" fill="${c}"/>` }).join('')}</g>`;
const maple = c => `<path d="M0 -8L2 -3L7 -5L5 0L9 2L4 3L5 8L0 5L-5 8L-4 3L-9 2L-5 0L-7 -5L-2 -3Z" fill="${c}"/>`;
const sparkle = `<path d="M0 -7L1.6 -1.6L7 0L1.6 1.6L0 7L-1.6 1.6L-7 0L-1.6 -1.6Z" fill="#fff6c9"/>`;
const key = `<g><circle cx="-8" cy="0" r="6.5" fill="none" stroke="#e7b53c" stroke-width="3.5"/><path d="M-2 0H14M9 0V5M13 0V4" stroke="#e7b53c" stroke-width="3.5" stroke-linecap="round"/></g>`;
// ------------------------------------------------------------------ static background (watercolour hills, cedars, onsen)
const BG = `<svg class="in-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs>
 <linearGradient id="iSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9cfd9"/><stop offset=".55" stop-color="#e5eedf"/><stop offset="1" stop-color="#f6e4c4"/></linearGradient>
 <radialGradient id="iSun"><stop offset="0" stop-color="#fff6dc"/><stop offset=".45" stop-color="#fff0c8" stop-opacity=".8"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></radialGradient>
 <radialGradient id="iFur" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#fdfaf2"/><stop offset=".55" stop-color="#e2ddd1"/><stop offset="1" stop-color="#aaa69d"/></radialGradient>
 <radialGradient id="iFur2" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#fff3ee"/><stop offset=".55" stop-color="#f3d3c9"/><stop offset="1" stop-color="#cf9f95"/></radialGradient>
 <radialGradient id="iFur3" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#f4faee"/><stop offset=".55" stop-color="#d3e5c8"/><stop offset="1" stop-color="#97b78b"/></radialGradient>
 <radialGradient id="iFur4" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#fff7e6"/><stop offset=".55" stop-color="#f1dcb5"/><stop offset="1" stop-color="#cba274"/></radialGradient>
 <linearGradient id="iRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f6874"/><stop offset="1" stop-color="#394049"/></linearGradient>
 <radialGradient id="iGlow"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>
 <symbol id="iCedar" overflow="visible"><rect x="-2.5" y="-14" width="5" height="14" fill="#6b4a33"/><path d="M0 -80C7 -63 15 -50 19 -34C21 -23 16 -12 0 -10C-16 -12 -21 -23 -19 -34C-15 -50 -7 -63 0 -80Z" fill="#3f6b4f"/><path d="M0 -80C4 -66 9 -55 12 -42C4 -46 -2 -52 0 -80Z" fill="#6a9a70" opacity=".55"/></symbol>
 <filter id="iWc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="8"/></filter>
 <filter id="iPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .28  .5 0 0 0 -.18"/></filter>
</defs>
<rect width="400" height="500" fill="url(#iSky)"/><circle cx="300" cy="96" r="80" fill="url(#iSun)"/>
<g filter="url(#iWc)">
 <path d="M-20 270L40 222L82 240L150 176L205 230L250 206L300 236L350 196L420 248V320H-20Z" fill="#a9bfc4" opacity=".85"/>
 <path d="M134 190L150 176L166 190L158 188L150 194L142 188Z M336 206L350 196L362 206L354 205L349 209L343 205Z" fill="#fbfbf7"/>
 <path d="M-20 318Q70 262 180 300T420 282V520H-20Z" fill="#a8cb8b"/>
 <path d="M-20 372Q110 326 230 362T420 350V520H-20Z" fill="#88b770"/>
 <path d="M-20 436Q130 404 260 434T420 424V520H-20Z" fill="#70a05e"/>
</g>
<g opacity=".95">${at(36, 318, 1, '<use href="#iCedar"/>')}${at(58, 312, .78, '<use href="#iCedar"/>')}${at(18, 322, .66, '<use href="#iCedar"/>')}${at(342, 296, 1.08, '<use href="#iCedar"/>')}${at(366, 300, .82, '<use href="#iCedar"/>')}${at(320, 304, .66, '<use href="#iCedar"/>')}${at(386, 304, .6, '<use href="#iCedar"/>')}</g>
<g transform="translate(64 452)"><ellipse rx="34" ry="10" fill="#cfe9ee"/><ellipse rx="26" ry="6" cy="1" fill="#b4dbe3"/>
 <g fill="#9a9a90"><ellipse cx="-34" cy="2" rx="7" ry="5"/><ellipse cx="-24" cy="9" rx="8" ry="5"/><ellipse cx="0" cy="11" rx="9" ry="5"/><ellipse cx="24" cy="9" rx="8" ry="5"/><ellipse cx="34" cy="1" rx="7" ry="5"/><ellipse cx="18" cy="-8" rx="6" ry="4"/></g></g>
<g fill="#5e8f4e" opacity=".7"><path d="M150 470q3 -10 6 0q3 -12 6 0"/><path d="M300 462q3 -9 6 0q3 -11 6 0"/><path d="M220 488q3 -9 6 0q3 -11 6 0"/></g>
<rect width="400" height="500" filter="url(#iPaper)" opacity=".55"/>
</svg>`;
// ------------------------------------------------------------------ animated foreground: clouds, steam, scenes
const cloud = `<g fill="#fff"><ellipse cx="0" cy="0" rx="34" ry="13"/><ellipse cx="-16" cy="-7" rx="16" ry="12"/><ellipse cx="10" cy="-11" rx="19" ry="15"/><ellipse cx="30" cy="-2" rx="14" ry="9"/></g>`;
const walkers = [['b', -36, 18], ['a', 0, 0], ['c', 36, 18]].map(([f, x, y], i) => at(x, y, .42, `<g class="hop" style="animation-delay:${i * .17}s">${spirit(f)}</g>`)).join('');
const SV = c => `<svg class="${c}" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">`;
const CLOUDS = [[8, 26, 70, -20], [20, 20, 90, -60], [2, 16, 80, -45]].map(([top, w, d, dl]) => `<div class="cl" style="top:${top}%;width:${w}%;animation-duration:${d}s;animation-delay:${dl}s"><svg viewBox="-52 -28 100 44" aria-hidden="true">${cloud}</svg></div>`).join('');
// Animated pieces are "actors": small SVGs in their own compositor layers inside a 400x500 stage that is CSS-scaled
// exactly like the slice-scaled background, so moving them never repaints the big scene (60 fps friendly).
const AB = { sp: [-50, -72, 100, 128], spH: [-50, -114, 100, 170], card: [-66, -86, 136, 178], heart: [-16, -20, 32, 28], leaf: [-10, -10, 20, 20],
  lan: [-21, -24, 42, 46], fw: [-32, -32, 64, 64], key: [-16, -9, 33, 18], bub: [-67, -27, 134, 64], xb: [-14, -14, 28, 28], glow: [-150, -110, 300, 220],
  puff: [-60, -60, 120, 120], walk: [-60, -40, 120, 72], house: [-75, -92, 150, 100] };
const A = (x, y, s, cls, inner, b, style = '') => `<div class="ac ${cls}" style="left:${(x + b[0] * s).toFixed(1)}px;top:${(y + b[1] * s).toFixed(1)}px;width:${(b[2] * s).toFixed(1)}px;height:${(b[3] * s).toFixed(1)}px;${style}"><svg viewBox="${b.join(' ')}" overflow="visible">${inner}</svg></div>`;
const dl = d => `animation-delay:${d}s`;
const FG = `${SV('in-season')}
<g class="ss ss1 ss7"><g transform="translate(330 300)"><path d="M0 0V-40M0 -30L-14 -46M0 -36L12 -52" stroke="#7a5040" stroke-width="5" stroke-linecap="round" fill="none"/>${[[-16,-52,20],[8,-60,22],[-2,-74,18],[18,-44,14],[-28,-40,13]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#f6c1cc" opacity=".92"/>`).join('')}</g>
 <g transform="translate(60 330) scale(.8)"><path d="M0 0V-40M0 -30L-14 -46M0 -36L12 -52" stroke="#7a5040" stroke-width="5" stroke-linecap="round" fill="none"/>${[[-16,-52,20],[8,-60,22],[-2,-74,18],[18,-44,14]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#f9d3da" opacity=".95"/>`).join('')}</g></g>
<g class="ss ss2"><rect width="400" height="500" fill="#eef4f8" opacity=".35"/>
 <path d="M-20 270L40 222L82 240L150 176L205 230L250 206L300 236L350 196L420 248V262L350 214L300 250L250 220L205 244L150 192L82 254L40 236L-20 284Z" fill="#fff" opacity=".9"/>
 <path d="M-20 318Q70 262 180 300T420 282V520H-20Z" fill="#f7fafc"/><path d="M-20 372Q110 326 230 362T420 350V520H-20Z" fill="#eaf1f6"/><path d="M-20 436Q130 404 260 434T420 424V520H-20Z" fill="#dfe9f1"/>
 <path d="M10 330C90 360 120 400 200 420S330 470 400 470" stroke="#cfdde8" stroke-width="16" fill="none" stroke-linecap="round" opacity=".8"/>
 ${[[36,318,1],[58,312,.78],[342,296,1.08],[366,300,.82]].map(([x,y,k])=>`<g transform="translate(${x} ${y}) scale(${k})"><use href="#iCedar"/><path d="M-12 -56Q0 -62 12 -56M-16 -36Q0 -42 16 -36" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`).join('')}</g>
<g class="ss ss3"><rect width="400" height="500" fill="#f6d9b0" opacity=".28"/>
 <path d="M-20 372Q110 326 230 362T420 350V520H-20Z" fill="#c9a45a" opacity=".55"/><path d="M-20 436Q130 404 260 434T420 424V520H-20Z" fill="#b8873f" opacity=".5"/>
 <path d="M400 500C320 450 360 420 280 400S150 380 120 340" stroke="#e3c48e" stroke-width="22" fill="none" stroke-linecap="round" opacity=".95"/><path d="M400 500C320 450 360 420 280 400S150 380 120 340" stroke="#c9a46a" stroke-width="2" stroke-dasharray="5 9" fill="none"/>
 ${[[40,320,'#d9603f',1],[80,300,'#e8a63c',.8],[350,300,'#d9603f',1.1],[300,316,'#e0873a',.75],[380,330,'#f0b54a',.7]].map(([x,y,c,k])=>`<g transform="translate(${x} ${y}) scale(${k})"><rect x="-3" y="-16" width="6" height="16" fill="#6b4a33"/><circle cx="0" cy="-34" r="22" fill="${c}"/><circle cx="-12" cy="-26" r="13" fill="${c}" opacity=".85"/><circle cx="12" cy="-26" r="13" fill="${c}" opacity=".85"/></g>`).join('')}</g>
<g class="ss ss8 ss4"><rect width="400" height="500" fill="#f3e6cf" opacity=".25"/>
 <g transform="translate(200 432)"><ellipse rx="190" ry="54" fill="#9fd2dc"/><ellipse rx="170" ry="42" cy="4" fill="#b9e2ea"/><ellipse rx="120" ry="20" cy="8" fill="#d3eef2" opacity=".8"/>
  <g fill="#a8a59a">${[[-188,0,18,11],[-160,-34,16,10],[-110,-48,18,10],[-50,-56,16,9],[10,-58,18,10],[70,-54,17,10],[128,-44,18,10],[172,-24,16,10],[190,8,16,11]].map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g></g>
 <g stroke="#b99a62" stroke-width="5">${Array.from({length:14},(_,i)=>`<path d="M${i*30} 300V372"/>`).join('')}</g><path d="M0 312H400M0 350H400" stroke="#8f7446" stroke-width="3"/></g>
<g class="ss ss5"><rect width="400" height="500" fill="#f8b77a" opacity=".22"/>
 <path d="M-10 70Q100 110 200 76T410 80" stroke="#7a5a3c" stroke-width="1.5" fill="none"/>${[20,60,100,140,180,220,260,300,340,380].map((x,i)=>`<g transform="translate(${x} ${82+Math.sin(i)*10})"><rect x="-6" y="0" width="12" height="16" rx="5" fill="${i%2?'#f2884b':'#e8584a'}"/><rect x="-3" y="-2" width="6" height="2" fill="#5a3a2a"/></g>`).join('')}</g>
<g class="ss ss6"><rect width="400" height="500" fill="#fff6d8" opacity=".25"/></g>
</svg>
${CLOUDS}${SV('in-steam')}<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9">${[46, 64, 82].map((x, i) => `<path class="steam" style="animation-delay:${i * 1}s" d="M${x} 446q-6 -8 0 -16t0 -16"/>`).join('')}</g></svg>
${SV('in-night')}<rect width="400" height="500" fill="#1c2a4a" opacity=".58"/>
<g class="stars" fill="#fff">${[[40, 40], [90, 90], [150, 30], [230, 70], [330, 40], [370, 120], [280, 140], [60, 160], [190, 120]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * .5}" style="animation-delay:${(i * .37).toFixed(2)}s"/>`).join('')}</g></svg>
${SV('sc sc1')}${at(222, 336, 1.3, house())}
 ${at(306, 352, 1, '<rect x="-2" y="-30" width="4" height="30" fill="#7a5a3c"/><rect x="-17" y="-48" width="34" height="22" rx="3" fill="#f3e2bd" stroke="#7a5a3c" stroke-width="2"/><text x="0" y="-32" text-anchor="middle" font-size="11" font-weight="800" fill="#7a3a2a">売家</text>')}
 ${[[160, 220], [268, 214], [292, 280], [140, 300]].map(([x, y], i) => at(x, y, 1, `<g class="tw" style="animation-delay:${i * .4}s">${sparkle}</g>`)).join('')}</svg>
${SV('sc sc6')}<path d="M60 500C110 440 300 440 262 390S170 340 238 306" stroke="#ead9ad" stroke-width="30" fill="none" stroke-linecap="round" opacity=".95"/>
 <path d="M60 500C110 440 300 440 262 390S170 340 238 306" stroke="#d9c38c" stroke-width="2" stroke-dasharray="6 10" fill="none"/>
 ${at(262, 290, .9, house())}${at(234, 214, 1, `<g class="tw">${sparkle}</g>`)}${at(296, 206, 1, `<g class="tw" style="animation-delay:.5s">${sparkle}</g>`)}
 ${at(110, 300, 1, '<g><rect x="-30" y="-14" width="60" height="22" rx="4" fill="#fff8e8" stroke="#7a5a3c" stroke-width="1.5"/><text x="0" y="1.5" text-anchor="middle" font-size="10" font-weight="800" fill="#7a5a3c">VISIT DAY</text></g>')}</svg>
${SV('sc sc7')}${[[110, 230], [300, 300], [90, 330], [320, 400]].map(([x, y], i) => at(x, y, 1, `<g class="tw" style="animation-delay:${i * .35}s">${sparkle}</g>`)).join('')}</svg>
<div class="in-stage">
<div class="sc sc1">${A(126, 380, 1.05, 'wave', spirit('a'), AB.sp)}</div>
<div class="sc sc2">${A(200, 214, 1.12, 'nx', card('¥2.8M', '5LDK · 99 m² · ski 20 min', '', 74), AB.card)}${A(200, 206, 1.18, 'go', card('¥1.5M', '6DK · 119 m² · onsen 9 min', 'k'), AB.card)}
 ${A(268, 170, 1.4, 'hp', heart(), AB.heart)}${A(236, 142, .7, 'hp hp2', heart('#f58ea0'), AB.heart)}${A(300, 142, .6, 'hp hp3', heart('#f58ea0'), AB.heart)}
 ${A(96, 384, 1, 'mski', spirit('a', '', 'o', 'ski'), [-64, -72, 130, 136])}</div>
<div class="sc sc3">${A(200, 214, 1.12, 'nx', card('¥980k', '4K · 88 m² · surf 25 min', '', 61), AB.card)}${A(200, 206, 1.18, 'go', card('¥4.2M', '3DK · 70 m² · no road access', 't', 38), AB.card)}
 ${[[150, 150, '#e0873a'], [260, 120, '#d9603f'], [300, 200, '#e8a63c']].map(([x, y, c], i) => A(x, y, 1.2, 'lf', maple(c), AB.leaf, dl(.9 + i * .25))).join('')}
 ${A(304, 388, 1, 'mhike', spirit('a', '', 'n', 'hike'), [-62, -72, 116, 132])}</div>
<div class="sc sc4">${A(200, 160, 1, 'go', card('¥3.3M', '7DK · 158 m² · fixer-upper', '', 52), AB.card)}
 ${A(200, 160, 1, 'puff', [[-30, -10, 22], [20, -30, 26], [30, 20, 24], [-20, 30, 20], [0, 0, 30]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`).join(''), AB.puff)}
 ${A(200, 262, 1, 'tally', [0, 1, 2, 3].map(i => `<circle cx="${-33 + i * 22}" cy="0" r="7" fill="#fff" stroke="#c9bfae" stroke-width="2"/>${at(-33 + i * 22, 0, .55, `<g class="tx" style="animation-delay:${.6 + i * .8}s">${xb}</g>`)}`).join(''), [-50, -12, 100, 24])}
 ${A(200, 288, 1, 'still', '<rect x="-54" y="-12" width="108" height="24" rx="12" fill="#fff" stroke="#e5dac2"/><text x="0" y="4.5" text-anchor="middle" font-size="12" font-weight="800" fill="#7a5a3c">still in the deck!</text>', [-56, -14, 112, 28])}
 ${[['a', 66], ['b', 152], ['c', 248], ['d', 334]].map(([f, x], i) => A(x, 388, .66, 'shk', spirit(f, '', 'n'), AB.sp, dl(.6 + i * .8)) + A(x, 388 - 62 * .66, .66 * 1.4, 'tx', xb, AB.xb, dl(.6 + i * .8))).join('')}</div>
<div class="sc sc5">${A(200, 262, 1, 'glow', '<ellipse rx="150" ry="110" fill="url(#iGlow)"/>', AB.glow)}${A(200, 306, 1.35, 'still0', house('lit'), AB.house)}
 ${[[60, 0], [130, .8], [270, .4], [340, 1.2], [100, 2], [300, 2.4], [200, 1.6]].map(([x, d]) => A(x, 300, 1, 'lan', lantern, AB.lan, dl(d))).join('')}
 ${[[92, 96, '#ffd36b', 0], [310, 76, '#ff8fa3', .6], [205, 50, '#9fe3ff', 1.2], [330, 170, '#ffd36b', 1.8], [70, 190, '#c7a6ff', 2.3]].map(([x, y, c, d]) => A(x, y, 1, 'fwb', burst(c), AB.fw, dl(d))).join('')}
 ${[['a', 70], ['b', 150], ['c', 250], ['d', 330]].map(([f, x], i) => A(x, 394, .58, 'hop', spirit(f, '', 'o') + at(0, -84, 1.3, `<g class="hp" style="animation-delay:${.3 + i * .2}s">${heart()}</g>`), AB.spH, dl(i * .15))).join('')}</div>
<div class="sc sc6">${A(262, 196, 1.5, 'kf', key, AB.key)}${A(170, 394, 1, 'walk', walkers, AB.walk)}</div>
<div class="sc sc7">${A(200, 318, 1.7, 'bob', spirit('a', 'wave'), AB.sp)}
 ${A(272, 166, 1, 'bub', '<path d="M-58 -26H58Q66 -26 66 -18V14Q66 22 58 22H-14L-30 36L-26 22H-58Q-66 22 -66 14V-18Q-66 -26 -58 -26Z" fill="#fffdf6" stroke="#d8ccb2" stroke-width="1.5"/><text x="0" y="-4" text-anchor="middle" font-size="13" font-weight="800" fill="#3b3330">Hajimemashite!</text><text x="0" y="13" text-anchor="middle" font-size="10" fill="#7a6a5a">nice to meet you</text>', AB.bub)}</div>
<div class="sc sc8">${A(200, 400, 1.25, 'soak', spirit('a', '', '', 'towel') + '<ellipse cx="0" cy="40" rx="78" ry="22" fill="#b9e2ea" opacity=".95"/><path d="M-60 34q10 -5 20 0t20 0t20 0t20 0t20 0t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>', [-80, -72, 160, 136])}
 ${A(118, 250, 1, 'bubm', '<circle r="30" fill="#fff8e6" stroke="#f0a020" stroke-width="3"/><text y="12" text-anchor="middle" font-size="34" font-weight="900" fill="#f0a020">?</text><path d="M14 26L26 40L4 29Z" fill="#fff8e6" stroke="#f0a020" stroke-width="2"/>', [-34, -34, 68, 78])}
 ${A(282, 238, 1, 'bubl', '<circle r="32" fill="#fff0f2" stroke="#e8335f" stroke-width="3"/>' + at(0, 6, 1.5, heart('#e8335f')) + '<path d="M-14 28L-28 44L-4 31Z" fill="#fff0f2" stroke="#e8335f" stroke-width="2"/>', [-36, -36, 72, 84])}
 ${A(140, 168, 1, 'pill pl1', '<rect x="-46" y="-18" width="92" height="36" rx="18" fill="#fff" stroke="#f0a020" stroke-width="3"/><text y="6" text-anchor="middle" font-size="15" font-weight="800" fill="#c47a00">? Maybe</text>', [-48, -20, 96, 40])}
 ${A(262, 168, 1, 'pill pl2', '<rect x="-46" y="-18" width="92" height="36" rx="18" fill="#e8335f"/><text y="6" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">❤ Love</text>', [-48, -20, 96, 40])}
 ${[[150, 330], [250, 320], [200, 300]].map(([x, y], i) => A(x, y, 1, 'stm', '<path d="M0 0q-8 -10 0 -20t0 -20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>', [-10, -44, 20, 48], dl(i * .7))).join('')}</div>
</div>`;
// ------------------------------------------------------------------ styles
const CSS = `
#intro{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;background:#e9e3d2;font-family:"Hiragino Maru Gothic ProN","Zen Maru Gothic","Nunito","Quicksand",ui-rounded,system-ui,sans-serif;color:#3b3330;-webkit-user-select:none;user-select:none;opacity:1;transition:opacity .35s}
#intro[hidden],#intro [hidden]{display:none!important}#intro.out{opacity:0}
#intro .in-wrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#f6efdf}
#intro .in-art{position:relative;flex:1;min-height:0;overflow:hidden;cursor:pointer}
#intro .in-art>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
#intro .in-cap{position:relative;z-index:2;margin-top:-18px;background:#fbf6ea;border-radius:26px 26px 0 0;padding:16px 22px calc(16px + env(safe-area-inset-bottom,0px));min-height:178px;box-shadow:0 -6px 22px #5a4a2a1f;cursor:pointer;display:flex;flex-direction:column}
#intro .in-dots{display:flex;gap:0;justify-content:center;margin:-12px 0 -8px}
#intro .in-dots button{width:8px;height:8px;padding:0;border:18px solid transparent;background-clip:padding-box;box-sizing:content-box;border-radius:6px;background:#d9cdb5;background-clip:padding-box;overflow:hidden;position:relative;transition:width .3s,background .3s;cursor:pointer}
#intro .in-dots button.done{background:#b79b6e}
#intro .in-dots button.on{width:30px;background:#e4d8c0}
#intro .in-dots button.on i{position:absolute;inset:0;background:#c2763f;transform-origin:left;transform:scaleX(0);animation:inProg var(--d,4s) linear forwards}
#intro .in-dots button.on.static i{animation:none;transform:none}
#intro .in-dots button,#intro .in-dots button.on,#intro .in-dots button.done{background-clip:padding-box}
#intro h2{margin:0 0 6px;font-size:23px;line-height:1.2;font-weight:800;color:#3b3330}
#intro h2 em{font-style:normal;color:#c2763f}
#intro p{margin:0;font-size:15.5px;line-height:1.4;color:#6b5d4f}
#intro .txt{flex:1;animation:inText .45s ease both}
#intro .in-hint{font-size:13px;color:#a08c70;text-align:center;margin-top:8px}
#intro .in-hint kbd{font:inherit;font-size:11px;border:1px solid #d6c8ad;border-radius:4px;padding:0 4px;background:#fff}
#intro .ib2{position:absolute;z-index:5;top:calc(12px + env(safe-area-inset-top,0px));border:0;border-radius:20px;padding:8px 14px;font:inherit;font-size:14px;font-weight:800;background:#fffaf0d9;color:#5a4a3a;box-shadow:0 2px 8px #0002;cursor:pointer;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
#introSkip{right:14px}#introSound{left:14px}#intro .ib2{min-height:44px;min-width:44px}
#intro form{display:flex;gap:8px;margin-top:12px}
#intro input{flex:1;min-width:0;font:inherit;font-size:18px;padding:11px 14px;border:2px solid #d9c8a5;border-radius:14px;background:#fff;color:#3b3330;-webkit-user-select:text;user-select:text}
#intro input:focus{outline:none;border-color:#c2763f}
#intro .cta{font:inherit;font-size:17px;font-weight:800;padding:11px 18px;border:0;border-radius:14px;background:#1a9e4b;color:#fff;cursor:pointer;white-space:nowrap}
#intro .alt{background:none;border:0;font:inherit;font-size:14px;color:#8a6a4a;text-decoration:underline;margin-top:10px;cursor:pointer;padding:4px}
@media (min-width:900px) and (min-height:520px){
 #intro{background:radial-gradient(circle at 20% 20%,#cfe3e2,transparent 50%),radial-gradient(circle at 85% 80%,#f2dcc0,transparent 55%),#ece6d6}
 #intro .in-wrap{width:min(1060px,92vw);height:min(640px,88vh);flex-direction:row;border-radius:30px;box-shadow:0 20px 60px #3a2a1a40}
 #intro .in-art{flex:1.25}
 #intro .in-cap{flex:1;margin:0;border-radius:0;padding:56px 46px 34px;justify-content:center;min-height:0}
 #intro .in-dots{justify-content:flex-start;margin-bottom:22px}
 #intro h2{font-size:34px;margin-bottom:12px}#intro p{font-size:18px}
 #intro .txt{flex:0 0 auto;min-height:200px}
 #intro .in-hint{text-align:left;margin-top:24px}
 #intro .ib2{top:16px}
}
#intro .pt{position:absolute;top:-20px;width:10px;height:8px;background:#f6c1cc;border-radius:100% 0 100% 0;opacity:.9;animation:inFall linear infinite;will-change:transform}
#intro .pt.sn{width:5px;height:5px;border-radius:50%;background:#fff}
@keyframes inFall{from{transform:translate3d(0,0,0) rotate(0)}to{transform:translate3d(var(--x),110vh,0) rotate(600deg)}}
@keyframes inProg{to{transform:scaleX(1)}}
@keyframes inText{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
#intro :is(.cd,.go,.nx,.stamp,.hp,.push,.pushl,.lf,.tx,.shk,.puff,.glow,.lan,.lw,.fwb,.hop,.walk,.kf,.bob,.bub,.tw,.sp-leaf,.sp-eyes,.sp-ar,.steam,.stars circle){transform-box:fill-box}
#intro .in-art svg.in-season{position:absolute;inset:0;width:100%;height:100%}#intro .in-art svg.sc{display:none}#intro .in-art svg.sc.on{display:block;animation:inFade .5s ease both}
#intro .in-stage{position:absolute;left:0;top:0;width:400px;height:500px;transform-origin:0 0}
#intro .in-stage>.sc{display:none;position:absolute;inset:0}#intro .in-stage>.sc.on{display:block;animation:inFade .5s ease both}
#intro .ac{position:absolute;will-change:transform}#intro .ac>svg{display:block;width:100%;height:100%}
#intro .in-art>svg{will-change:transform}
@keyframes inFade{from{opacity:0}to{opacity:1}}
#intro .in-art svg.in-night{display:none}#intro[data-s="5"] .in-art svg.in-night{display:block;animation:inFade .9s ease both}
#intro[data-s="5"] .stars circle{animation:inTw 1.6s ease-in-out infinite alternate}
#intro .cl{position:absolute;left:0;opacity:.92;animation:inCloud 70s linear infinite;will-change:transform}#intro .cl svg{display:block;width:100%;height:auto}
@keyframes inCloud{from{transform:translateX(-100%)}to{transform:translateX(var(--aw,800px))}}
#intro .steam{opacity:0;animation:inSteam 3s ease-in-out infinite;transform-origin:50% 100%}
@keyframes inSteam{0%{opacity:0;transform:translateY(0) scaleX(1)}35%{opacity:.75}100%{opacity:0;transform:translateY(-34px) scaleX(1.4)}}
#intro .sc.on .sp-leaf{transform-origin:0% 100%;animation:inLeafW 1.8s ease-in-out infinite alternate}
@keyframes inLeafW{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}
#intro .sc.on .sp-eyes{transform-origin:center;animation:inBlink 3.8s infinite}
@keyframes inBlink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.12)}}
#intro .sc.on .wave .sp-ar{transform-origin:0% 50%;animation:inWave .5s ease-in-out infinite alternate}
@keyframes inWave{from{transform:translate(0,0) rotate(0)}to{transform:translate(2px,-14px) rotate(-40deg)}}
#intro .sc.on .tw{transform-origin:center;animation:inTw 1.4s ease-in-out infinite alternate}
@keyframes inTw{from{opacity:.2;transform:scale(.5)}to{opacity:1;transform:scale(1.15)}}
#intro .cd{transform-origin:50% 100%}
#intro .stamp{opacity:0}
#intro .sc2.on .go{transform-origin:50% 100%;animation:inSwR 3.6s .5s ease-in-out both}
@keyframes inSwR{0%{transform:translate(0,0) rotate(0)}20%{transform:translate(-12px,0) rotate(-3deg)}34%{transform:translate(8px,0) rotate(3deg)}72%,100%{transform:translate(330px,-20px) rotate(24deg)}}
#intro .sc2.on .stamp,#intro .sc3.on .stamp{transform-origin:center;animation:inStamp 3.6s .5s both}
@keyframes inStamp{0%,26%{opacity:0;transform:scale(1.6)}36%,100%{opacity:1;transform:scale(1)}}
#intro .sc2.on .nx,#intro .sc3.on .nx{transform-origin:center;animation:inNext 3.6s .5s ease both}
@keyframes inNext{0%,40%{transform:scale(.94);opacity:.55}75%,100%{transform:scale(1.04);opacity:1}}
#intro .hp{opacity:0}
#intro .sc2.on .hp{transform-origin:center;animation:inHeart 3.6s .5s ease-out both}
#intro .sc2.on .hp2{animation-delay:.75s}#intro .sc2.on .hp3{animation-delay:.95s}
@keyframes inHeart{0%,46%{opacity:0;transform:translate(0,0) scale(.2)}56%{opacity:1;transform:translate(0,0) scale(1.35)}64%{opacity:1;transform:translate(0,-4px) scale(1)}100%{opacity:0;transform:translate(0,-70px) scale(.9)}}
#intro .sc2.on .push{transform-origin:50% 100%;animation:inPush 3.6s .5s ease-in-out both}
@keyframes inPush{0%,22%{transform:translate(0,0) rotate(0)}38%{transform:translate(14px,-6px) rotate(10deg)}55%,100%{transform:translate(0,0) rotate(0)}}
#intro .sc3.on .go{transform-origin:50% 100%;animation:inLeaf 3.6s .5s ease-in-out both}
@keyframes inLeaf{0%{transform:translate(0,0) rotate(0) scale(1);opacity:1}24%{transform:translate(10px,0) rotate(3deg) scale(1);opacity:1}38%{transform:translate(-60px,24px) rotate(-18deg) scale(.95);opacity:1}52%{transform:translate(-120px,70px) rotate(10deg) scale(.88);opacity:1}66%{transform:translate(-190px,130px) rotate(-24deg) scale(.8);opacity:.9}82%{transform:translate(-250px,190px) rotate(8deg) scale(.7);opacity:.6}100%{transform:translate(-330px,260px) rotate(-32deg) scale(.6);opacity:0}}
#intro .lf{opacity:0}
#intro .sc3.on .lf{transform-origin:center;animation:inLf 3s ease-in-out both}
@keyframes inLf{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}50%{transform:translate(-80px,90px) rotate(200deg)}100%{opacity:0;transform:translate(-170px,220px) rotate(420deg)}}
#intro .sc3.on .pushl{transform-origin:50% 100%;animation:inPushL 3.6s .5s ease-in-out both}
@keyframes inPushL{0%,22%{transform:translate(0,0) rotate(0)}38%{transform:translate(-14px,-6px) rotate(-10deg)}55%,100%{transform:translate(0,0) rotate(0)}}
#intro .tx{opacity:0}
#intro .sc4.on .tx{transform-origin:center;animation:inPop .35s ease-out both}
@keyframes inPop{from{opacity:0;transform:scale(.2)}70%{opacity:1;transform:scale(1.25)}to{opacity:1;transform:scale(1)}}
#intro .sc4.on .shk{transform-origin:50% 90%;animation:inShake .5s ease-in-out 3}
@keyframes inShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-11deg)}75%{transform:rotate(11deg)}}
#intro .sc4.on .go{transform-origin:center;animation:inPoof 5s ease-in both}
@keyframes inPoof{0%,10%{transform:scale(1) rotate(0);opacity:1}14%{transform:scale(1) rotate(-3deg)}18%,26%{transform:scale(1) rotate(0)}30%{transform:scale(1) rotate(3deg)}34%,42%{transform:scale(1) rotate(0)}46%{transform:scale(1) rotate(-3deg)}50%,64%{transform:scale(1) rotate(0);opacity:1}69%{transform:scale(1.1) rotate(0);opacity:1}76%,100%{transform:scale(0) rotate(0);opacity:0}}
#intro .puff{opacity:0}
#intro .sc4.on .puff{transform-origin:center;animation:inPuff 5s ease-out both}
@keyframes inPuff{0%,68%{opacity:0;transform:scale(.3)}76%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}
#intro .still{opacity:0}
#intro .sc4.on .still,#intro .sc4.on .tally{animation:inStill 5s both}
@keyframes inStill{0%,20%{opacity:0}26%,64%{opacity:1}72%,100%{opacity:0}}
#intro .sc5.on .glow{transform-origin:center;animation:inGlow 1.5s ease-in-out infinite alternate}
@keyframes inGlow{from{opacity:.55;transform:scale(.9)}to{opacity:1;transform:scale(1.12)}}
#intro .lit .win{fill:#ffe6a0}
#intro .lan{opacity:0}
#intro .sc5.on .lan{animation:inRise 4.4s linear both}
@keyframes inRise{0%{opacity:0;transform:translateY(180px)}12%{opacity:1}100%{opacity:.95;transform:translateY(-230px)}}
#intro .sc5.on .lw{transform-origin:50% 0%;animation:inSway 1.6s ease-in-out infinite alternate}
@keyframes inSway{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
#intro .fwb{opacity:0}
#intro .sc5.on .fwb{transform-origin:center;animation:inBurst 2.2s ease-out infinite}
@keyframes inBurst{0%{opacity:1;transform:scale(.1)}55%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}
#intro .sc5.on .hop,#intro .sc6.on .hop{animation:inHop .42s ease-in-out infinite alternate}
@keyframes inHop{from{transform:translateY(0)}to{transform:translateY(-12px)}}
#intro .sc5.on .hp{transform-origin:center;animation:inPop .4s ease-out both}
#intro .sc6.on .walk{animation:inWalk 4.2s ease-out both}
@keyframes inWalk{from{transform:translate(-150px,70px)}to{transform:translate(0,0)}}
#intro .sc6.on .kf{transform-origin:center;animation:inKey 1.6s ease-in-out infinite alternate}
@keyframes inKey{from{transform:translateY(0) rotate(-10deg)}to{transform:translateY(-8px) rotate(10deg)}}
#intro .sc7.on .bob{animation:inBob 2.2s ease-in-out infinite alternate}
@keyframes inBob{from{transform:translateY(0)}to{transform:translateY(-8px)}}
#intro .bub{opacity:0}#intro .sc7.on .bub{transform-origin:20% 100%;animation:inPop .5s .3s ease-out both}
/* seasons: one overlay per scene, cross-faded; gentle parallax on the base landscape */
#intro .in-art svg.in-season .ss{opacity:0;transition:opacity .9s ease}
#intro[data-s="1"] .in-art svg.in-season .ss1,#intro[data-s="2"] .in-art svg.in-season .ss2,#intro[data-s="3"] .in-art svg.in-season .ss3,#intro[data-s="4"] .in-art svg.in-season .ss4,#intro[data-s="5"] .in-art svg.in-season .ss5,#intro[data-s="6"] .in-art svg.in-season .ss6,#intro[data-s="7"] .in-art svg.in-season .ss7,#intro[data-s="8"] .in-art svg.in-season .ss8{opacity:1}
#intro .in-art>svg.in-bg{transition:transform 1.4s cubic-bezier(.2,.8,.2,1);transform-origin:50% 60%}
#intro[data-s="2"] svg.in-bg{transform:translate3d(-6px,-4px,0) scale(1.03)}#intro[data-s="3"] svg.in-bg{transform:translate3d(6px,0,0) scale(1.03)}
#intro[data-s="8"] svg.in-bg,#intro[data-s="4"] svg.in-bg{transform:translate3d(0,-8px,0) scale(1.05)}#intro[data-s="5"] svg.in-bg{transform:translate3d(-4px,4px,0) scale(1.02)}#intro[data-s="6"] svg.in-bg{transform:translate3d(4px,-4px,0) scale(1.04)}
#intro .cl{transition:opacity .9s}#intro[data-s="8"] .cl,#intro[data-s="4"] .cl{opacity:.6}
#intro[data-s="2"] .pt{background:#fff;border-radius:50%;width:6px;height:6px}
#intro[data-s="3"] .pt{background:#e0873a;border-radius:100% 0 100% 0}#intro[data-s="3"] .pt:nth-child(2n){background:#d9603f}
#intro[data-s="5"] .pt,#intro[data-s="6"] .pt,#intro[data-s="8"] .pt,#intro[data-s="4"] .pt{opacity:0}
/* match scene = warm summer-festival dusk (light, not night) */
#intro .in-art svg.in-night rect{fill:#f7a868;opacity:.3}#intro .in-art svg.in-night .stars{display:none}
#intro .sc2.on .mski{animation:inSki 3.6s .3s ease-in-out both}
@keyframes inSki{0%{transform:translate(-60px,-70px) rotate(14deg)}55%{transform:translate(0,0) rotate(10deg)}70%{transform:translate(6px,4px) rotate(-4deg)}100%{transform:translate(0,0) rotate(0)}}
#intro .sc3.on .mhike{animation:inHike .55s ease-in-out infinite alternate}
@keyframes inHike{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-6px) rotate(3deg)}}
#intro .sc8.on .soak{animation:inSoak 2.4s ease-in-out infinite alternate}
@keyframes inSoak{from{transform:translateY(0)}to{transform:translateY(5px)}}
#intro .bubm,#intro .bubl,#intro .pill{opacity:0}
#intro .sc8.on .bubm{transform-origin:70% 100%;animation:inPop .45s .6s ease-out both}
#intro .sc8.on .bubl{transform-origin:30% 100%;animation:inPop .45s 1.6s ease-out both}
#intro .sc8.on .pl1{transform-origin:center;animation:inPop .4s .9s ease-out both,inTap .5s 1.3s ease-in-out 2 alternate}
#intro .sc8.on .pl2{transform-origin:center;animation:inPop .4s 1.9s ease-out both,inTap .5s 2.3s ease-in-out 3 alternate}
@keyframes inTap{to{transform:scale(1.14)}}
#intro .sc8.on .stm{transform-origin:50% 100%;animation:inSteam 2.6s ease-in-out infinite}
#intro.rm .bubm,#intro.rm .bubl,#intro.rm .pill{opacity:1}
#intro.rm *,#intro.rm *::before{animation:none!important;transition:none!important}
#intro.rm .pt{display:none}
#intro.rm .stamp,#intro.rm .hp,#intro.rm .tx,#intro.rm .lan,#intro.rm .fwb,#intro.rm .bub,#intro.rm .still{opacity:1}
#intro.rm .sc2 .go{transform:translate(70px,-10px) rotate(12deg)}#intro.rm .sc3 .go{transform:translate(-70px,20px) rotate(-14deg)}
#intro.rm .lan{transform:translateY(-120px)}#intro.rm .walk{transform:none}
#intro.rm .in-dots button.on i{animation:none;transform:none}
`;
// ------------------------------------------------------------------ behaviour
// ---- original intro jingle (Web Audio only, no files). C major pentatonic, music box + soft flute pad, 100 bpm, 12 bars ≈ 28.8 s loop.
const J = (() => {
  const BPM = 100, B = 60 / BPM, BARS = 12, LOOP = BARS * 4 * B;
  const NN = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, F3: 174.61, G3: 196, A3: 220, C3: 130.81, E3: 164.81, D3: 146.83 };
  // melody: [beat, note, beats]  (original tune, written for this app)
  const MEL = [[0,'E5',1],[1,'G5',1],[2,'A5',1.5],[3.5,'G5',.5],[4,'E5',1],[5,'D5',1],[6,'C5',2],
    [8,'D5',1],[9,'E5',1],[10,'G5',1],[11,'E5',1],[12,'D5',3],[15,'C5',1],
    [16,'A4',1],[17,'C5',1],[18,'D5',1.5],[19.5,'E5',.5],[20,'G5',2],[22,'E5',1],[23,'D5',1],
    [24,'C5',1],[25,'D5',.5],[25.5,'E5',.5],[26,'D5',1],[27,'A4',1],[28,'C5',4],
    [32,'G5',1],[33,'A5',1],[34,'C6',1.5],[35.5,'A5',.5],[36,'G5',1],[37,'E5',1],[38,'G5',2],
    [40,'A5',1],[41,'G5',1],[42,'E5',1],[43,'D5',1],[44,'C5',2],[46,'D5',1],[47,'E5',1]];
  const CH = [['C3','E4','G4'],['A3','C4','E4'],['F3','A4','C5'],['G3','D4','G4'],['C3','E4','G4'],['A3','C4','E4'],['D3','A4','C5'],['G3','D4','G4'],['C3','E4','A4'],['A3','C4','E4'],['F3','A4','C5'],['C3','E4','G4']];
  function box(ctx, out, f, t, dur, v = .2) {          // music box / celesta: sine + bright partials, fast decay
    [[1, 1], [2, .35], [4.02, .12], [6.1, .05]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + Math.min(2.4, .7 + dur * 1.2) / Math.sqrt(m));
      o.connect(g).connect(out); o.start(t); o.stop(t + 2.6);
    });
  }
  function pad(ctx, out, f, t, dur, v = .045) {         // soft flute pad: triangle, slow attack, gentle vibrato, low-passed
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), l = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 1400; l.frequency.value = 4.6; lg.gain.value = f * .004;
    l.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .6); g.gain.setValueAtTime(v, t + dur - .5); g.gain.linearRampToValueAtTime(0, t + dur + .3);
    o.connect(lp).connect(g).connect(out); o.start(t); l.start(t); o.stop(t + dur + .4); l.stop(t + dur + .4);
  }
  function loop(ctx, out, t0) {
    MEL.forEach(([b, n, d]) => box(ctx, out, NN[n], t0 + b * B, d * B));
    CH.forEach((c, i) => c.forEach((n, k) => pad(ctx, out, NN[n] * (k ? 1 : 1), t0 + i * 4 * B, 4 * B, k ? .03 : .045)));
    for (let i = 0; i < BARS; i++) [1, 3].forEach(bt => box(ctx, out, NN[CH[i][1]] * 2, t0 + (i * 4 + bt + .5) * B, .3, .05));   // soft off-beat sparkles
  }
  function noise(ctx, len) { const b = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b }
  function sting(ctx, out, kind, t) {
    if (kind === 'yes') {                                // heart pop: rising blip + two bells
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(1250, t + .12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(g).connect(out); o.start(t); o.stop(t + .3);
      box(ctx, out, NN.E5 * 2, t + .12, .4, .12); box(ctx, out, NN.G5 * 2, t + .24, .5, .1);
    } else if (kind === 'no') {                          // leaf whoosh: band-passed noise sweeping down
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise(ctx, 1);
      f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(380, t + .8);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + .9);
      s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + 1);
    } else if (kind === 'onsen') {                       // water bloop + two soft bells (Maybe / Love)
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(520, t + .14);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g).connect(out); o.start(t); o.stop(t + .3);
      box(ctx, out, NN.G5, t + .9, .5, .1); box(ctx, out, NN.C6, t + 1.6, .6, .12);
    } else if (kind === 'spring') {                      // birdsong chirps
      [0, .18, .9, 1.05].forEach((d, k) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(2400 + k * 200, t + d); o.frequency.exponentialRampToValueAtTime(3600, t + d + .08);
        g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.035, t + d + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + .1); o.connect(g).connect(out); o.start(t + d); o.stop(t + d + .12) });
    } else if (kind === 'match') {                       // lantern chime (bell) + sparkle run
      [NN.C5, NN.G5, NN.C6].forEach((f, k) => box(ctx, out, f, t + k * .05, 2, .14));
      [NN.E5, NN.G5, NN.A5, NN.C6, NN.D5 * 2, NN.E5 * 2].forEach((f, k) => box(ctx, out, f * 2, t + .35 + k * .07 + Math.random() * .02, .2, .05));
    }
  }
  function chain(ctx, dest, vol = .55) {
    const g = ctx.createGain(); g.gain.value = vol; const c = ctx.createDynamicsCompressor(); c.threshold.value = -20; c.ratio.value = 3;
    g.connect(c).connect(dest); return g;
  }
  return { LOOP, loop, sting, chain };
})();
window.IntroJingle = J; J.state = () => (jc ? jc.state : 'none') + (jplaying ? '+playing' : '');
const LSM = 'crew_intro_sound';     // '1' on, '0' muted (saved); unset = start on first tap
let jc, jout, jtimer, jnext = 0, jplaying = false;
function jStart() {
  try {
    jc = jc || new (window.AudioContext || window.webkitAudioContext)(); if (jc.state === 'suspended') jc.resume();
    if (jplaying) return; jplaying = true;
    jout = J.chain(jc, jc.destination, .0001); jout.gain.setValueAtTime(.0001, jc.currentTime); jout.gain.exponentialRampToValueAtTime(.5, jc.currentTime + 1.2);
    jnext = jc.currentTime + .1; const tick = () => { if (!jplaying) return; if (jnext - jc.currentTime < 2) { J.loop(jc, jout, jnext); jnext += J.LOOP } jtimer = setTimeout(tick, 500) }; tick();
  } catch (e) { }
}
function jStop(fade = .8) {
  if (!jplaying) return; jplaying = false; clearTimeout(jtimer);
  try { const o = jout, t = jc.currentTime; o.gain.cancelScheduledValues(t); o.gain.setValueAtTime(o.gain.value, t); o.gain.exponentialRampToValueAtTime(.0001, t + fade); setTimeout(() => { try { o.disconnect() } catch (e) { } }, fade * 1000 + 200) } catch (e) { }
}
function jSting(i) { if (!jplaying) return; const k = i === 2 ? 'yes' : i === 3 ? 'no' : i === 5 ? 'match' : i === 8 ? 'onsen' : i === 1 ? 'spring' : null; if (k) J.sting(jc, jout, k, jc.currentTime + .05) }
let el, cur = 0, timer, opts = {}, soundOn = false, built = false;
const $ = s => el.querySelector(s);
function build() {
  if (built) return; built = true;
  const st = document.createElement('style'); st.id = 'introCss'; st.textContent = CSS; document.head.appendChild(st);
  el = document.createElement('div'); el.id = 'intro'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'How Japan House Crew works');
  el.innerHTML = `<div class="in-wrap"><div class="in-art" id="inArt">${BG}${FG}<div class="in-petals" aria-hidden="true"></div></div>
   <div class="in-cap" id="inCap"><div class="in-dots" role="tablist">${SC.map((_, i) => `<button type="button" aria-label="Step ${i + 1} of ${N}" data-i="${i}"><i></i></button>`).join('')}</div>
   <div class="txt" aria-live="polite"><h2 id="inT"></h2><p id="inS"></p>
    <form id="inForm" hidden><input id="inName" maxlength="24" placeholder="e.g. Sam" autocapitalize="words" enterkeyhint="go" autocomplete="off" aria-label="Your name"><button class="cta" type="submit">Join the crew</button></form>
    <button id="inDone" class="cta" type="button" hidden>Back to swiping</button><button id="inPick" class="alt" type="button" hidden>Already in the crew? Pick your name</button></div>
   <div class="in-hint" id="inHint"></div></div>
   <button id="introSound" class="ib2" type="button" aria-pressed="false" title="Play the little tune">🔇 Sound</button><button id="introSkip" class="ib2" type="button">Skip ›</button></div>`;
  document.body.appendChild(el);
  const pet = $('.in-petals');
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span'); p.className = 'pt' + (i % 4 === 3 ? ' sn' : '');
    p.style.left = (Math.random() * 100).toFixed(1) + '%'; p.style.setProperty('--x', ((Math.random() - .3) * 120).toFixed(0) + 'px');
    p.style.animationDuration = (9 + Math.random() * 8).toFixed(1) + 's'; p.style.animationDelay = (-Math.random() * 16).toFixed(1) + 's'; pet.appendChild(p);
  }
  $('#introSkip').onclick = e => { e.stopPropagation(); close('skip') };
  $('#introSound').onclick = e => { e.stopPropagation(); setSound(!soundOn, true) };
  // iOS needs a gesture: the first tap anywhere in the intro (e.g. 'Tap to continue') starts the jingle unless the user muted it before
  el.addEventListener('pointerdown', e => { if (!soundOn && localStorage.getItem(LSM) !== '0' && !e.target.closest('#introSound,#introSkip')) setSound(true, false) }, true);
  el.addEventListener('keydown', e => { if (!soundOn && localStorage.getItem(LSM) !== '0' && (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter')) setSound(true, false) }, true);
  $('.in-dots').onclick = e => { const b = e.target.closest('button'); if (b) { e.stopPropagation(); go(+b.dataset.i) } };
  $('#inArt').onclick = e => { const r = el.getBoundingClientRect(); (e.clientX - r.left < r.width * .28) ? go(cur - 1) : go(cur + 1) };
  $('#inCap').onclick = e => { if (e.target.closest('form,button,input')) return; go(cur + 1) };
  $('#inForm').onsubmit = e => { e.preventDefault(); const n = $('#inName').value.trim(); if (!n) { $('#inName').focus(); return } close('join', n) };
  $('#inDone').onclick = e => { e.stopPropagation(); close('done') };
  $('#inPick').onclick = e => { e.stopPropagation(); close('pick') };
  window.addEventListener('keydown', e => {
    if (!Intro.open) return;
    const inInput = e.target === $('#inName');
    if (e.key === 'Escape') { e.preventDefault(); close('skip') }
    else if (inInput) return;
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { if (e.target.tagName === 'BUTTON' && e.key !== 'ArrowRight') return; e.preventDefault(); go(cur + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1) }
    else return;
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener('visibilitychange', () => { if (Intro.open) { if (document.hidden) clearTimeout(timer); else arm() } });
}
function setSound(on, save) {
  soundOn = on; const b = $('#introSound'); b.textContent = on ? '🔈 Sound' : '🔇 Sound'; b.setAttribute('aria-pressed', on); b.title = on ? 'Mute' : 'Play the little tune';
  if (save) localStorage.setItem(LSM, on ? '1' : '0');
  if (on) jStart(); else jStop(.4);
}
function arm() {
  clearTimeout(timer); const d = SC[cur].d; if (!d) return;
  timer = setTimeout(() => go(cur + 1), RM.matches ? d + 2500 : d);
}
function go(i) {
  if (i < 0) i = 0; if (i >= N) i = N - 1;
  cur = i; const s = SC[i]; el.dataset.s = s.k;
  el.querySelectorAll('.sc').forEach(g => g.classList.toggle('on', g.classList.contains('sc' + s.k)));
  el.querySelectorAll('.in-dots button').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); b.classList.toggle('static', !s.d); b.style.setProperty('--d', (RM.matches ? s.d + 2500 : s.d) + 'ms'); b.setAttribute('aria-current', k === i ? 'step' : 'false'); const ii = b.querySelector('i'); ii.style.animation = 'none'; void ii.offsetWidth; ii.style.animation = '' });
  const txt = $('.txt'); txt.style.animation = 'none'; void txt.offsetWidth; txt.style.animation = '';
  $('#inT').innerHTML = s.k === 5 ? 'If everyone says Yes… <em>It\'s a match!</em>' : s.k === 4 ? 'A house only disappears when <em>EVERYONE</em> says No' : s.t.replace(/= (Yes|No)/, '= <em>$1</em>');
  $('#inS').textContent = s.s;
  const last = i === N - 1, signed = !!opts.signedIn;
  $('#inForm').hidden = !last || signed; $('#inDone').hidden = !last || !signed; $('#inPick').hidden = !last || signed || !opts.hasMembers;
  if (last && signed) { $('#inT').textContent = 'That\'s it – happy swiping!'; $('#inS').textContent = 'You can replay this any time from the ⋯ menu → How it works.' }
  const desk = matchMedia('(min-width:900px)').matches;
  $('#inHint').innerHTML = last ? '' : desk ? 'Click or press <kbd>→</kbd> / <kbd>Space</kbd> for next · <kbd>←</kbd> back · <kbd>Esc</kbd> skip' : 'Tap to continue ›';
  $('#introSkip').hidden = last;
  if (last && !signed && desk) setTimeout(() => $('#inName').focus(), 350);
  if (soundOn) jSting(s.k);
  arm();
}
function close(why, name) {
  clearTimeout(timer); localStorage.setItem(LS, '1'); Intro.open = false; jStop(1.2); soundOn = false; const sb = $('#introSound'); if (sb) { sb.textContent = '🔇 Sound'; sb.setAttribute('aria-pressed', false) }
  el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('out'); el.querySelectorAll('.sc').forEach(g => g.classList.remove('on')) }, 350);
  opts.onClose?.(why, name);
}
const setW = () => {
  const a = el && el.querySelector('#inArt'); if (!a) return; const W = a.clientWidth, H = a.clientHeight, k = Math.max(W / 400, H / 500);
  a.style.setProperty('--aw', W + 'px'); a.querySelector('.in-stage').style.transform = `translate(${((W - 400 * k) / 2).toFixed(2)}px,${((H - 500 * k) / 2).toFixed(2)}px) scale(${k.toFixed(4)})`;
};
addEventListener('resize', setW);
const Intro = window.Intro = {
  open: false,
  seen: () => !!localStorage.getItem(LS),
  play(o = {}) {
    build(); opts = o; Intro.open = true; el.hidden = false; el.classList.toggle('rm', RM.matches);
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    $('#inName').value = ''; setW(); go(0);
  },
};
})();
