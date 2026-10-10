'use strict';
/* Japan House Crew – animated onboarding intro ("How it works").
   Original art: "Mori" the forest spirit + a little akiya in the countryside. Inline SVG + CSS animations only
   (no video, no images, no external requests). Shown once per device (localStorage), replayable from the menu. */
(() => {
const LS = 'crew_intro_v1';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const SC = [
  { t: 'Welcome to Japan House Crew', s: "We're finding our cabin in Japan together. I'm Mori, the forest spirit – let me show you how it works.", d: 4400 },
  { t: 'Swipe right = Yes', s: 'Like it? Send it right. Really love it? Tap the red ❤️ Love button.', d: 4000 },
  { t: 'Swipe left = No', s: 'Not for us? Let it drift away like a leaf. Unsure? Tap ? Maybe.', d: 4000 },
  { t: 'A house only disappears when EVERYONE says No', s: 'One single Yes, Love or Maybe and it stays in play for the whole crew.', d: 5000 },
  { t: "If everyone says Yes… It's a match!", s: 'Yes or Love from all of us = lanterns up! Love counts double in Matches.', d: 4800 },
  { t: 'Matches = we go visit and maybe buy it together', s: 'Road trip to the countryside, keys in hand.', d: 4400 },
  { t: "What's your name?", s: 'So the crew knows who voted what. No password, no email.', d: 0 },
];
const N = SC.length;
// ------------------------------------------------------------------ art helpers
let cid = 0;
const FUR = { a: 'url(#iFur)', b: 'url(#iFur2)', c: 'url(#iFur3)', d: 'url(#iFur4)' };
const at = (x, y, s, inner, r = 0) => `<g transform="translate(${x} ${y})${r ? ` rotate(${r})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;
function spirit(f = 'a', cls = '', face = '') {
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
  <ellipse cx="-14" cy="47" rx="8" ry="4.5" fill="#efeadf"/><ellipse cx="14" cy="47" rx="8" ry="4.5" fill="#efeadf"/></g>`;
}
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
const FG = `${CLOUDS}${SV('in-steam')}<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9">${[46, 64, 82].map((x, i) => `<path class="steam" style="animation-delay:${i * 1}s" d="M${x} 446q-6 -8 0 -16t0 -16"/>`).join('')}</g></svg>
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
 ${A(92, 392, 1, 'push', spirit('a', '', 'o'), AB.sp)}</div>
<div class="sc sc3">${A(200, 214, 1.12, 'nx', card('¥980k', '4K · 88 m² · surf 25 min', '', 61), AB.card)}${A(200, 206, 1.18, 'go', card('¥4.2M', '3DK · 70 m² · no road access', 't', 38), AB.card)}
 ${[[150, 150, '#e0873a'], [260, 120, '#d9603f'], [300, 200, '#e8a63c']].map(([x, y, c], i) => A(x, y, 1.2, 'lf', maple(c), AB.leaf, dl(.9 + i * .25))).join('')}
 ${A(310, 392, 1, 'pushl', spirit('a', '', 'n'), AB.sp)}</div>
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
</div>`;
// ------------------------------------------------------------------ styles
const CSS = `
#intro{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;background:#e9e3d2;font-family:"Hiragino Maru Gothic ProN","Zen Maru Gothic","Nunito","Quicksand",ui-rounded,system-ui,sans-serif;color:#3b3330;-webkit-user-select:none;user-select:none;opacity:1;transition:opacity .35s}
#intro[hidden],#intro [hidden]{display:none!important}#intro.out{opacity:0}
#intro .in-wrap{position:relative;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#f6efdf}
#intro .in-art{position:relative;flex:1;min-height:0;overflow:hidden;cursor:pointer}
#intro .in-art>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
#intro .in-cap{position:relative;z-index:2;margin-top:-18px;background:#fbf6ea;border-radius:26px 26px 0 0;padding:16px 22px calc(16px + env(safe-area-inset-bottom,0px));min-height:178px;box-shadow:0 -6px 22px #5a4a2a1f;cursor:pointer;display:flex;flex-direction:column}
#intro .in-dots{display:flex;gap:6px;justify-content:center;margin:0 0 10px}
#intro .in-dots button{width:8px;height:8px;padding:0;border:0;border-radius:6px;background:#d9cdb5;overflow:hidden;position:relative;transition:width .3s,background .3s;cursor:pointer}
#intro .in-dots button.done{background:#b79b6e}
#intro .in-dots button.on{width:30px;background:#e4d8c0}
#intro .in-dots button.on i{position:absolute;inset:0;background:#c2763f;transform-origin:left;transform:scaleX(0);animation:inProg var(--d,4s) linear forwards}
#intro .in-dots button.on.static i{animation:none;transform:none}
#intro h2{margin:0 0 6px;font-size:23px;line-height:1.2;font-weight:800;color:#3b3330}
#intro h2 em{font-style:normal;color:#c2763f}
#intro p{margin:0;font-size:15.5px;line-height:1.4;color:#6b5d4f}
#intro .txt{flex:1;animation:inText .45s ease both}
#intro .in-hint{font-size:13px;color:#a08c70;text-align:center;margin-top:8px}
#intro .in-hint kbd{font:inherit;font-size:11px;border:1px solid #d6c8ad;border-radius:4px;padding:0 4px;background:#fff}
#intro .ib2{position:absolute;z-index:5;top:calc(12px + env(safe-area-inset-top,0px));border:0;border-radius:20px;padding:8px 14px;font:inherit;font-size:14px;font-weight:800;background:#fffaf0d9;color:#5a4a3a;box-shadow:0 2px 8px #0002;cursor:pointer;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
#introSkip{right:14px}#introSound{left:14px}
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
#intro .in-art svg.sc{display:none}#intro .in-art svg.sc.on{display:block;animation:inFade .5s ease both}
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
#intro.rm *,#intro.rm *::before{animation:none!important;transition:none!important}
#intro.rm .pt{display:none}
#intro.rm .stamp,#intro.rm .hp,#intro.rm .tx,#intro.rm .lan,#intro.rm .fwb,#intro.rm .bub,#intro.rm .still{opacity:1}
#intro.rm .sc2 .go{transform:translate(70px,-10px) rotate(12deg)}#intro.rm .sc3 .go{transform:translate(-70px,20px) rotate(-14deg)}
#intro.rm .lan{transform:translateY(-120px)}#intro.rm .walk{transform:none}
#intro.rm .in-dots button.on i{animation:none;transform:none}
`;
// ------------------------------------------------------------------ behaviour
let el, cur = 0, timer, opts = {}, audio, soundOn = false, built = false;
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
   <button id="introSound" class="ib2" type="button" aria-pressed="false" title="Gentle sound (off by default)">🔇 Sound</button><button id="introSkip" class="ib2" type="button">Skip ›</button></div>`;
  document.body.appendChild(el);
  const pet = $('.in-petals');
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span'); p.className = 'pt' + (i % 4 === 3 ? ' sn' : '');
    p.style.left = (Math.random() * 100).toFixed(1) + '%'; p.style.setProperty('--x', ((Math.random() - .3) * 120).toFixed(0) + 'px');
    p.style.animationDuration = (9 + Math.random() * 8).toFixed(1) + 's'; p.style.animationDelay = (-Math.random() * 16).toFixed(1) + 's'; pet.appendChild(p);
  }
  $('#introSkip').onclick = e => { e.stopPropagation(); close('skip') };
  $('#introSound').onclick = e => { e.stopPropagation(); soundOn = !soundOn; e.currentTarget.textContent = soundOn ? '🔈 Sound' : '🔇 Sound'; e.currentTarget.setAttribute('aria-pressed', soundOn); if (soundOn) chime(cur) };
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
function arm() {
  clearTimeout(timer); const d = SC[cur].d; if (!d) return;
  timer = setTimeout(() => go(cur + 1), RM.matches ? d + 2500 : d);
}
function go(i) {
  if (i < 0) i = 0; if (i >= N) i = N - 1;
  cur = i; const s = SC[i]; el.dataset.s = i + 1;
  el.querySelectorAll('.sc').forEach(g => g.classList.toggle('on', g.classList.contains('sc' + (i + 1))));
  el.querySelectorAll('.in-dots button').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); b.classList.toggle('static', !s.d); b.style.setProperty('--d', (RM.matches ? s.d + 2500 : s.d) + 'ms'); b.setAttribute('aria-current', k === i ? 'step' : 'false'); const ii = b.querySelector('i'); ii.style.animation = 'none'; void ii.offsetWidth; ii.style.animation = '' });
  const txt = $('.txt'); txt.style.animation = 'none'; void txt.offsetWidth; txt.style.animation = '';
  $('#inT').innerHTML = i === 4 ? 'If everyone says Yes… <em>It\'s a match!</em>' : i === 3 ? 'A house only disappears when <em>EVERYONE</em> says No' : s.t.replace(/= (Yes|No)/, '= <em>$1</em>');
  $('#inS').textContent = s.s;
  const last = i === N - 1, signed = !!opts.signedIn;
  $('#inForm').hidden = !last || signed; $('#inDone').hidden = !last || !signed; $('#inPick').hidden = !last || signed || !opts.hasMembers;
  if (last && signed) { $('#inT').textContent = 'That\'s it – happy swiping!'; $('#inS').textContent = 'You can replay this any time from the ⋯ menu → How it works.' }
  const desk = matchMedia('(min-width:900px)').matches;
  $('#inHint').innerHTML = last ? '' : desk ? 'Click or press <kbd>→</kbd> / <kbd>Space</kbd> for next · <kbd>←</kbd> back · <kbd>Esc</kbd> skip' : 'Tap to continue ›';
  $('#introSkip').hidden = last;
  if (last && !signed && desk) setTimeout(() => $('#inName').focus(), 350);
  if (soundOn) chime(i);
  arm();
}
function chime(i) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume();
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5], notes = i === 4 ? [0, 2, 3, 5] : i === 1 ? [2, 4] : i === 2 ? [3, 1] : i === 3 ? [1, 0] : [i % 6];
    notes.forEach((n, k) => {
      const t = audio.currentTime + k * .14, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = scale[n]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 1.2);
    });
  } catch (e) { }
}
function close(why, name) {
  clearTimeout(timer); localStorage.setItem(LS, '1'); Intro.open = false;
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
