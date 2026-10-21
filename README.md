# RBXfun — Website & Design Guide

Landing page for **RBXfun**, the memecoin-trading experience on Roblox.
Play: https://www.roblox.com/games/121901103139963/RBXfun · Live: https://rbxfun.vercel.app

> **2026-10-21: Trench County content update.** The game is now **Trench County** (RBXfun stays the name of its in-game
> trading platform). The design below is unchanged and is the site's look: only the copy, brand wordmark, cafe sign art
> ("Trench / CAFE · TRENCH COUNTY", "OPEN 24/7"), Roblox links and images changed. New: in-game shots in `img/shots/`
> (Studio captures with ThumbStage golden lighting), the intro video section (`video/intro.mp4`, `#intro`), a second
> town gallery row (`.bento-more`), FAQ on ROL / Robux / the token, car-model credits in the footer, `img/og.jpg`.
> A full redesign was tried the same day and rejected by the user: keep this style.

This README is both the project docs **and** a complete design spec. Hand it to any developer or AI agent and they should be able to rebuild (or extend) the site with the same look, materials and motion — no screenshots needed.

---

## Contents

1. [Project setup](#1-project-setup)
2. [Design language in one paragraph](#2-design-language-in-one-paragraph)
3. [Design tokens](#3-design-tokens)
4. [Typography](#4-typography)
5. [Core materials (studs, panels, 3D buttons)](#5-core-materials)
6. [The hero world — layer by layer](#6-the-hero-world)
7. [Intro loader](#7-intro-loader)
8. [Scroll scene: hero → cafe PC monitor](#8-scroll-scene-hero--cafe-pc-monitor)
9. [Graphics library (`js/art.js`)](#9-graphics-library-jsartjs)
10. [The playable terminal](#10-the-playable-terminal)
11. [Pulse board, ticker, leaderboard](#11-pulse-board-ticker-leaderboard)
12. [Page sections & copy](#12-page-sections--copy)
13. [Animation catalogue](#13-animation-catalogue)
14. [Responsive & accessibility rules](#14-responsive--accessibility-rules)
15. [Assets (OG image, icons)](#15-assets)
16. [Ready-to-paste brief for another agent](#16-ready-to-paste-brief-for-another-agent)

---

## 1. Project setup

Plain static site. **No framework, no build step.** Deploy the repo root as-is (Vercel, Netlify, GitHub Pages). Vercel auto-deploys `main`.

```
index.html        markup for every section (text lives here; graphics are injected)
css/style.css     all styles, light + dark theme, responsive rules
js/art.js         every Roblox-style graphic, drawn as SVG strings (window.Art)
js/main.js        art placement, scroll scene, terminal sim, Pulse sim, leaderboard
img/              in-game screenshots, og.png, apple-touch-icon.png, game icon
favicon.svg       logo mark
game/             in-game Luau scripts
```

Local preview: `npx serve .` (any static server; asset paths are root-absolute like `/css/style.css`).

Fonts (Google Fonts): **Fredoka** 500/600/700, **Inter** 400–800, **JetBrains Mono** 500/700.

Graphics are placed with `data-art` attributes, e.g. `<div data-art="cafe"></div>`, `<span data-art="avatar" data-preset="exec"></span>`, `<span data-art="coin" data-size="64" data-face="shades"></span>`. `main.js → paintArt()` fills them on load.

---

## 2. Design language in one paragraph

**"Roblox baseplate meets trading terminal."** Everything is chunky, toy-like and tactile: white cards with a solid 4px bottom ledge (no blur-only shadows), a row of Lego **studs** peeking over the top edge of cards, **3D push buttons** that physically press down 3px, rounded display type (Fredoka), and blocky isometric characters with flat-shaded faces (front = base color, top = lighter, right side = darker). The hero is a living Roblox world — blue sky, drifting rounded clouds, a city skyline, a perspective grey baseplate — with a hand-drawn internet cafe. Trading UI is the one exception to the toy look: it's always a dark, dense, monospace terminal (teal up / pink-red down), shown *inside* the toy world like a screen in-game. Money green is the brand color; gold is the accent for "rich/exec" moments.

---

## 3. Design tokens

All colors are CSS custom properties on `:root`, overridden under `html[data-theme='dark']`. Theme is set before paint by an inline script in `<head>` (localStorage `rbxfun:theme`, falling back to `prefers-color-scheme`).

### UI

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#eef2f8` | `#0b1122` | page background |
| `--bg-2` | `#e5ebf5` | `#0f1730` | tinted sections, chips |
| `--fg` | `#0f1530` | `#eef2ff` | headings |
| `--body` | `#3a4466` | `#c2c9e0` | nav, body |
| `--muted` | `#6b7593` | `#8a93b3` | secondary text |
| `--faint` | `#9aa3bd` | `#5b6487` | fine print |
| `--card` | `#ffffff` | `#141b31` | panels |
| `--line` / `--line-2` | `#dde4ef` / `#cdd6e5` | `#243050` / `#2d3860` | borders |
| `--edge` | `#d2dae8` | `#060a15` | **the solid bottom ledge under panels** |
| `--primary` | `#19a64b` | `#17a047` | brand green |
| `--primary-hi` | `#2bc760` | `#2bc760` | live dots, highlights |
| `--primary-shade` | `#0d7a34` | `#0a5f28` | button ledge, text-shadow on green text |
| `--gold` / `--gold-shade` | `#ffc933` / `#c48d00` | same | accent, gold buttons |
| `--red` `--blue` `--purple` | `#ff5a52` `#3d8bff` `#8e67ff` | same | brick colors |
| `--stud` / `--stud-line` | `#fff` / `#d5ddea` | `#141b31` / `#2a3558` | studs on card tops |
| `--glass` | `rgba(238,242,248,.74)` | `rgba(11,17,34,.72)` | scrolled header |
| `--ring` | `rgba(43,199,96,.35)` | same | focus ring |

### World (hero)

| Token | Light | Dark |
|---|---|---|
| `--sky-top` / `--sky-mid` / `--sky-low` | `#3a94ff` / `#86c3ff` / `#e0efff` | `#040a1d` / `#0e2155` / `#24427f` |
| `--plate` / `--plate-line` / `--plate-stud` | `#aab6ca` / `rgba(255,255,255,.55)` / `rgba(255,255,255,.28)` | `#283252` / `rgba(170,185,230,.16)` / `rgba(170,185,230,.08)` |
| `--cloud` / `--cloud-op` | `#fff` / `.95` | `#c9d6ff` / `.12` |
| `--city` / `--city-win` | `#a9c9f2` / `rgba(255,255,255,.45)` | `#13204a` / `#ffd36b` (lit windows) |
| `--brick-wall` / `--brick-side` / `--brick-mortar` | `#8b4a33` / `#6e3826` / `#6a3423` | `#5e3022` / `#46231a` / `#3f1d13` |
| `--roof` / `--cornice` / `--curb` | `#4a261a` / `#3a1d13` / `#b6bfcf` | `#2c160f` / `#22100a` / `#3a4566` |
| `--interior-light` | `rgba(255,210,140,.08)` | `rgba(255,190,110,.18)` |
| `--lamp-glow` | transparent | `rgba(255,220,130,.35)` |

SVG art uses `fill="var(--token)"` so the **same SVG re-themes itself** when `data-theme` flips — no re-render.

### Terminal (always dark)

`--t-bg #0b1220` · `--t-panel #111b2e` · `--t-panel2 #0e1728` · `--t-line #1e2a44` · `--t-text #e8eef9` · `--t-muted #7e8aa5` · `--t-up #4ed8be` (teal) · `--t-down #f26d7e` (pink-red).

### Other

`--ease: cubic-bezier(.2,.8,.2,1)` (used for nearly everything) · `--wrap: 1200px` · `--header-h: 68px` (62px mobile) · panel radius 18px · button radius 14px (12 small / 16 large).

---

## 4. Typography

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Hero H1 | Fredoka | `clamp(48px, 6.6vw, 92px)` / 700 | line-height .98, letter-spacing -0.025em |
| Section title | Fredoka | `clamp(36px, 4.6vw, 60px)` / 700 | -0.02em |
| Card title | Fredoka | 21–22px / 700 | |
| Buttons | Fredoka | 15 / 17 / 19px / 600 | |
| Body | Inter | 16–18px / 400–500 | line-height 1.55 |
| Eyebrow | JetBrains Mono | 12.5px / 700, uppercase, 0.14em | preceded by a 10px green rounded square with a 2px ledge |
| Numbers / tickers / terminal | JetBrains Mono | 11–15px / 700 | |

Emphasis tricks:
- **Green 3D word**: `color: var(--primary); text-shadow: 0 4px 0 var(--primary-shade)` (the "Cash it." line).
- **Gold marker highlight** (`.hl-gold`): `background: linear-gradient(180deg, transparent 58%, rgba(255,201,51,.55) 58% 92%, transparent 92%)`. In dark mode switch to plain `color: var(--gold)`.

---

## 5. Core materials

### Stud grid background (`.studs`)
Two offset radial gradients per 28px tile: a light stud and a faint shadow slightly lower, which reads as a raised bump.
```css
.studs{
  background-image:
    radial-gradient(circle at 50% 46%, rgba(255,255,255,.9) 0 7px, transparent 7.5px),
    radial-gradient(circle at 50% 54%, rgba(22,27,46,.09) 0 7px, transparent 7.5px);
  background-size: 28px 28px;
}
/* dark: rgba(255,255,255,.07) + rgba(0,0,0,.3) */
```
Used on the intro (masked with a radial fade), tinted sections (masked to fade in from top/bottom edges), and the CTA (bigger 34px studs, masked from the left).

### Studs on top of cards (`.studs-top`)
A 7px strip above the card made of half-ellipses repeating every 26px:
```css
.studs-top::before{
  content:''; position:absolute; left:16px; right:16px; top:-7px; height:7px;
  background: radial-gradient(ellipse 8px 7px at 50% 100%, var(--stud) 88%, transparent 96%) 0 0 / 26px 7px repeat-x;
  filter: drop-shadow(0 -1px 0 var(--stud-line));
}
```

### Panel (`.panel`)
White card + **solid ledge** + soft ambient shadow + top inner highlight:
```css
.panel{
  background:var(--card); border:1px solid var(--line); border-radius:18px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.04),
              0 4px 0 var(--edge), 0 10px 24px rgba(20,30,60,.06);
}
```

### 3D button (`.btn`, `.btn-primary`, `.btn-gold`, `.btn-ghost`)
The ledge is a hard `0 4px 0` shadow in a darker shade. Hover lifts 1px (ledge 5px). Active **presses down 3px** and the ledge shrinks to 1px.
```css
.btn{ box-shadow: inset 0 2px 0 rgba(255,255,255,.22), inset 0 -2px 0 rgba(0,0,0,.1), 0 4px 0 var(--b-shade); }
.btn:active{ transform: translateY(3px); box-shadow: inset 0 2px 0 rgba(255,255,255,.22), 0 1px 0 var(--b-shade); }
.btn-primary{ --b:var(--primary); --b-shade:var(--primary-shade); color:#fff; text-shadow:0 1px 0 rgba(0,0,0,.22); }
.btn-gold{ --b:var(--gold); --b-shade:var(--gold-shade); color:#3a2700; }
```
Icon buttons (`.icon-btn`) are 40×40, radius 12, `0 3px 0 var(--edge)` ledge, same press behaviour.

### Live dot
8px green circle with an expanding ring: `@keyframes ping { 0% {box-shadow:0 0 0 0 rgba(43,199,96,.55)} 80%,100% {box-shadow:0 0 0 8px transparent} }`, 1.8s infinite.

---

## 6. The hero world

The hero is one `.scene-card` (full viewport) containing stacked absolute layers. **Back to front:**

| # | Layer | How it's built |
|---|---|---|
| 1 | **Sky** `.world-sky` | `linear-gradient(180deg, --sky-top 0%, --sky-mid 44%, --sky-low 70%)` |
| 2 | **Stars** (dark only) | 12 tiny `radial-gradient` dots in the top 65%; opacity 0 → .85 in dark; `twinkle` 4s alternate (brightness .6) |
| 3 | **Sun / moon** | Sun = **rounded square** (110px, radius 28px — blocky Roblox sun), radial gradient `#fff8d0 → #ffd54a → #ffbf1f`, two halo rings via box-shadow (18px & 42px spreads) + 120px glow, rotates 360° every 40s. Moon = circle with a crescent cut via `radial-gradient(circle at 70% 30%, transparent 30px, #e9eeff 31px)`. Dark mode: sun fades and drops 40px, moon fades in. Position: top 12%, right 9%. |
| 4 | **Skyline** | Generated SVG (`Art.skyline()`), seeded random so it's always identical. 1600×320 viewBox, `preserveAspectRatio="xMidYMax slice"`, buildings `fill: var(--city)`, windows `var(--city-win)` (lit yellow at night, ~15% blink on a 5s step animation), occasional antenna with a red blinking beacon. Sits from `bottom:28%`, height 34%. **Masked** `linear-gradient(90deg, 18% opacity → full at 62%)` so it fades out behind the headline. |
| 5 | **Clouds** ×4 | Each is 2–3 overlapping fully-rounded rectangles (`rx = height/2`) — the classic Roblox cloud. `color: var(--cloud)`, `drop-shadow(0 6px 0 rgba(120,160,220,.25))` (flat underside). Drift ±5–6vw over 50–80s, `alternate`, some reversed. |
| 6 | **Baseplate** `.world-ground` → `.world-plate` | Container from `top:72%` to bottom with `perspective:560px; perspective-origin:50% 0`. Plate is 220% wide, 340% tall, `transform: rotateX(64deg)`, `transform-origin: 50% 0`. Background = grid lines (2px, 72px tiles) **plus a soft stud in each tile centre**. `plate-roll` animation slides the background 72px every 6s so the ground subtly scrolls toward you. |
| 7 | **Horizon haze** | 9%-tall band at `top:66%`, gradient transparent → `--sky-low` → transparent, opacity .75. Hides the seam between sky and plate. |
| 8 | **Props** `.hero-props` | Right side, `width:min(46vw,640px)`, `aspect-ratio:640/450`, bottom edge on the horizon (`bottom:28%`). Contains (positions in % of the props box): **cafe** (fills box, drop-shadow `0 24px 22px rgba(10,20,50,.25)`), **ATM** (w 10.5%, left −8%), **street lamp** (w 5%, left −16%; glows only at night), **two planters** (w 10%, left 2% & 49%), **3 avatars** standing *in front* on the plate (exec with briefcase left 61% w 15%; waving noob left 28% w 12%; phone guy with shades left 86% w 12%; bottoms −14…−17%). |
| 9 | **Chat bubbles** | Roblox-style white bubbles above two avatars (13px bold, radius 12, 3px ledge, CSS triangle tail). Text swaps every 2.4s (alternating avatars): fade/scale out 300ms → swap → in. |
| 10 | **Trade pop** | Dark pill (`rgba(11,18,32,.88)`, mono 12px) like `noob_42 bought $OOF 120`, appears every 2.6s at one of 5 preset spots over the cafe; `pop-up` 2.4s (rise in, hold, float up 30px & fade). |
| 11 | **Hero copy** | Left column, `left: max(24px, (100vw − 1200px)/2)`, `top: header + clamp(28px, 8vh, 96px)`, width `min(560px, 44vw)`. A large soft radial **scrim** behind it (`--hero-scrim`: light `rgba(225,240,255,.55)`, dark `rgba(4,10,29,.6)`) keeps text readable over the city. Contents: pill link (“Now open in BETA on Roblox →”), H1 in 3 lines, subtitle, two CTAs (green 3D “Play on Roblox”, ghost “Try the terminal ↓”), three fact chips (frosted `rgba(255,255,255,.6)` + blur). |
| 12 | **Coins & bills** | 5 coins + 2 dollar bills absolutely positioned via `--x/--y/--s` CSS vars. Each is wrapped twice: outer span runs `coin-drop` once (staggered 110ms each), inner span runs `coin-float` forever (6s, offset per coin). Each also has `data-fx/data-fy` (vw/vh) — the direction it **flies off-screen** during the scroll scene. |
| 13 | **Scroll hint** | Mouse outline (28×44, radius 14, 2.5px white border) with a dot running `wheel` 1.6s. |

**Header** is fixed and transparent over the sky; once `scrollY > 20` it gets `.scrolled` → `--glass` background + `backdrop-filter: blur(14px) saturate(1.4)` + 1px bottom line.

### Cafe micro-animations (all CSS on SVG elements)
- **Neon** signs (`NET CAFE`, `$FUN` blade sign, `OPEN 24/7`): SVG glow filter (gaussian blur 3.2 merged twice under the source) + `neon` flicker 4s (dips to .35 opacity at 20% and 63%), each sign offset.
- **Monitor charts** in the window: polylines with `stroke-dasharray:60` drawing in/out (`draw` 3.2s), staggered −0.7s each.
- **Patrons** (dark silhouettes at the desks): bob 1.5px every 3s.
- **Door light** & **ATM screen**: opacity breathing (6s / 2.4s).
- **Spotlight cones** above the main sign: only visible in dark mode.
- RGB keyboard strips: gradient `#ff5a52 → #ffd166 → #4ed8be → #8e67ff`.

---

## 7. Intro loader

Shown once per browser session (`sessionStorage 'rbxfun:intro'`; when set, `<html data-intro="off">` hides it and shortens all hero delays).

Timeline:
| t | Event |
|---|---|
| 0.10s | Logo pops in: `scale(.6)→1` with overshoot `cubic-bezier(.3,1.5,.6,1)` 0.7s |
| 0.25s | Logo does a half Y-spin `perspective(300px) rotateY(-180deg → 0)` 1.4s |
| 0.20s | Load bar fills 4% → 100% over 1.3s (190×12px track, 2px padding, green fill) |
| 0.50s | Wordmark “RBXfun” colors in from `--line-2` to `--fg` (0.6s) |
| 1.65s | Whole overlay fades out 0.55s (`opacity:0; visibility:hidden`) |
| 1.70–2.20s | Hero content enters: pill (1.7s), H1 lines rise from `translateY(105%)` inside overflow-hidden masks, 100ms apart (from 1.75s), subtitle (2.0s), CTAs (2.1s), chips (2.2s), coins drop from 1.9s |

Background of the overlay: page `--bg` + `.studs` masked with `radial-gradient(ellipse at center, #000 10%, transparent 65%)`.

---

## 8. Scroll scene: hero → cafe PC monitor

The signature effect. As you scroll, the hero world **shrinks into the screen of a PC monitor**, which then turns into a playable trading terminal. (Inspired by bloxpad's hero-into-phone, re-themed: you "sit down at a PC in the cafe".)

### Structure
```html
<section class="scene" id="top">             <!-- height: 290vh -->
  <div class="scene-sticky">                  <!-- position: sticky; top:0; height:100vh; overflow:hidden -->
    <div class="scene-stage" data-stage>
      <div class="scene-card"> …the whole hero world… </div>
      <div class="scene-after"> eyebrow + “Sit down. Pull up a chart.” + paragraph </div>
      <div class="monitor" id="terminal">
        <div class="bezel"> logo chin + green power LED </div>
        <div class="stand"> neck + foot </div>
        <div class="monitor-screen"> <div class="term" id="term">…960×560 terminal…</div> </div>
      </div>
```

Monitor geometry (desktop):
```css
--mon-top: calc(var(--header-h) + 2vh + clamp(150px, 19vh, 186px));
--mon-w:   min(66vw, calc((100vh - var(--mon-top) - 110px) * 1.714), 1060px);
.monitor-screen { aspect-ratio: 960 / 560; }
.bezel { inset: -16px -16px -44px; border-radius: 24px; background: linear-gradient(#1e2333, #141824);
         box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 6px 0 #0b0e16, 0 40px 80px -20px rgba(10,20,50,.45); }
```
The terminal is authored at a **fixed 960×560** and scaled with `transform: scale(screen.clientWidth / 960)` (origin top-left), so it looks identical at any size.

### Progress → animation mapping
```js
p  = clamp(-sceneRect.top / (sceneRect.height - innerHeight), 0, 1)
ease = e => e < .5 ? 4e³ : 1 − (−2e+2)³/2           // easeInOutCubic
seg(a,b) = ease(clamp((p − a)/(b − a), 0, 1))

t1 = seg(0,   .22)   // hero copy out, coins fly away
t2 = seg(.10, .46)   // card clips down to the monitor screen rect
t3 = seg(.42, .56)   // bezel + stand + terminal fade in
t4 = seg(.48, .64)   // "Sit down. Pull up a chart." rises in
// .64 → 1.0 = hold, so the user can play with the terminal before the section un-sticks
```
Applied each frame (scroll listener → `requestAnimationFrame`):
- Hero copy: `opacity = 1 − 1.4·t1`, `translateY(−70·t1 px)`. Scroll hint fades 4× faster.
- Each coin/bill: `translate(t1·fx·vw, t1·fy·vh) rotate(70·t1 deg)`, `opacity 1 − t1`.
- Props: `translateY(20·t2 px) scale(1 + .08·t2)` (slight push-in on the cafe).
- **Card clip**: `clip-path: inset(t2·top  t2·right  t2·bottom  t2·left  round 10·t2 px)` where top/right/bottom/left are the distances from the stage edges to the monitor screen (measured with `getBoundingClientRect` on load, resize and after fonts load). The world ends up exactly inside the screen hole.
- Screen/bezel/stand: `opacity = t3`; bezel `scale(1.03 − .03·t3)`.
- After-copy: `opacity = t4`, `translateY((1 − t4)·28 px)`.
- Pointer events on the terminal/after-copy only once they're > 50% visible.
- Links to `#terminal` are intercepted and scroll to `scene.offsetTop + 0.7 × (scene.offsetHeight − innerHeight)` so you land on the finished monitor.

### When it's disabled
`<html data-scene="static">` is set before paint unless the viewport is **≥ 900px wide, ≥ 600px tall, and reduced motion is off**. In static mode the scene is a normal hero, followed by the heading and the terminal in normal flow (no sticky, no clipping; on phones the terminal reflows to one column and the bezel/stand are hidden).

---

## 9. Graphics library (`js/art.js`)

Everything is code — no image files for art. Exposed as `window.Art`.

### Shared helpers
- `shade(hex, amt)` — mixes toward white (`amt > 0`) or black (`amt < 0`).
- **`box(x, y, w, h, color, {dx=8, dy=-4})`** — the core "Roblox block" primitive in **oblique projection**: a front `rect`, a right side parallelogram `M x+w y l dx dy v h l −dx −dy Z` filled `shade(c, −.24)`, and a top parallelogram `M x y l dx dy h w l −dx −dy Z` filled `shade(c, +.18)`. Everything blocky (avatars, ATM, planters, monitors, briefcase) is built from `box()`.

### `avatar(options)` — R6-style character
viewBox `0 -18 112 152`; returns an `<svg>` of the given `width`.

Body layout (units in viewBox):
| Part | box(x, y, w, h) |
|---|---|
| Left leg / right leg | (30,82,22,44) / (52,82,22,44) + shoes strip y 118–126 |
| Torso | (30,38,44,44) |
| Left arm / right arm | (8,38,22,44) / (74,38,22,44), hands = skin strip y 74–82 |
| Head | (38,8,28,28) |

Draw order: legs → torso → left arm → right arm → head → face → hair.
Options: `skin, shirt, pants, shoes, hair ('spiky'|'cap'|'bacon'|'tophat'|'crown'|'none'), hairColor, faceKind ('smile'|'grin'|'smug'|'wow'|'oof'|'shades'|'money'), suit (jacket+white shirt V+tie+lapels+buttons+cuffs), jacket, tie, briefcase (brown box with gold clasps and a peeking green bill), phone (teal screen with a chart), wave, bob, width`.
- `.av-bob`: whole body bobs −3px, 3.2s.
- `.av-wave`: right arm group, `transform-box: fill-box; transform-origin: 20% 8%`, rotates −150° ↔ −118° every 1.4s.

Presets used on the site (`main.js → PRESETS`):
- `exec` — grey 3-piece suit `#5b5f6b`, red tie, spiky black hair, briefcase (this is the game's mascot look).
- `waver` — classic noob: yellow `#f5cd30` skin, blue `#3d8bff` shirt, green `#5fbf3a` legs, waving.
- `phone` — purple shirt, bacon hair, shades, holding a phone.
- `king` — black suit, gold tie, crown, shades, waving (leaderboard #1).
- `green`, `red`, `tophat` — extras for the CTA crowd.

Faces are drawn with ink `#1b1e27`: two 4×6 rounded-rect eyes + a quadratic smile `q6 4 12 0`. Spiky hair is one jagged path + a darker side face + a lighter highlight stroke.

### `head(options)` — coin / player icons
Just the head + face + hair, in a 60×60 viewBox, optional rounded-square colored background (`bg`, radius 14). Used for every meme-coin icon, leaderboard rows, and trade feed.

### `brick({cols, rows, color, h, width, studs})` — isometric Lego brick
True isometric: one stud step = (12.1, 7) along columns and (−12.1, 7) along rows; height `h` (default 16.8). Faces: top = `color`, left = `shade(−.12)`, right = `shade(−.26)`. Each stud is a cylinder: bottom ellipse (rx 4.2, ry 2.4) + 2.6px rect + lighter top ellipse. Used for podium pedestals (4×4; gold `#ffc933`, silver `#d7deea`, bronze `#e0915a`) and decorative stacks.

### `coin({size, tilt=.62, rotate=-16, faceKind, tone})`
A tilted gold disc: `rotate(r) scale(1, tilt)` group with a rim (circle offset 14px down + rect) in a dark gradient, the face in a 3-stop gradient (`#fff1b0 → #ffcd35 → #e9a400`), an inner ring at 35% white, a white glint arc, and a face (`smile` blocky eyes, `shades`, or a `$`). `tone:'green'` swaps to a green palette.

### `bill({width, rotate})`
Green banknote: `#5fc96e` body, dashed inner border, central oval with `$`.

### `cafe()` — the building (viewBox 640×450)
Composed front-on with oblique depth (side wall offset 60,−30):
1. Side wall (`skewY(-26.57°)` brick pattern + 22% black overlay) and roof top.
2. Front wall: SVG `<pattern>` of 28×14 bricks with mortar lines (colors from CSS vars).
3. Cornice band with a white highlight line.
4. **Vertical blade sign** on the side wall (skewed), neon cyan `$ F U N`.
5. **Main sign**: dark wood `#2e1c12` board, 5px gold-gradient border, inner hairline, “RBXfun” in Fredoka 50px gold gradient, “EXECUTIVE INTERNET CAFE” 11.5px tracked 3.4.
6. Two spotlight fixtures + light cones (night only).
7. **Awning**: green/white 22px stripes, darker front band, 12 scalloped circles alternating colors, shadow strip.
8. **Window**: dark interior gradient + warm light overlay, neon “NET CAFE”, 3 pendant lamps, 6 blue monitors with animated green charts, desk, RGB keyboard strips, 5 seated patron silhouettes, two diagonal glass reflections.
9. **Door**: glass with warm light gradient, gold handles, neon “OPEN 24/7” box, reflection.
10. Curb along the base.

### Other props
`atm()` (grey box, green “ATM” header, glowing blue “CASH OUT” screen, keypad, red button, slots) · `plant()` (planter box + 3 green cubes) · `lamp()` (pole + head with bulb + night glow) · `monitorMini()` (PC with a teal area chart) · `skyline()` · `cloud(variant 0–2)` · `logoMark(size)`.

### Logo
A green rounded-square brick (`#22c25a` face on a `#0d7a34` ledge, radius 12) with two studs on top, a dark sunglasses bar with a white glint, and a smile. Wordmark: “RBX” in `--fg` + “fun” in `--primary`, Fredoka 700, −0.02em. Hover: small hop + tilt.

---

## 10. The playable terminal

Always dark. Fixed 960×560 layout (scaled on desktop; fluid single-column on phones).

```
┌ top bar 46px: ● RBXfun / Terminal │ coin tabs ($NOOB $OOF $BACON $SUIT + 24h %) │ ● 1,000.00 CASH ┐
├ chart column (flex 1)                                         ├ side panel 270px ─────────────┤
│  head: icon · $TICKER/name · PRICE · MARKET CAP · 24H · 1s/1m/5m │ Buy | Sell segmented tabs   │
│  candlestick SVG (56 candles) + dashed last-price line        │ Amount input (mono, right)  │
│    + price tag on the right edge (teal/red)                   │ chips 10/50/100/250 (or %)  │
│    + gold dashed “YOUR ENTRY” line when holding               │ big 3D Buy/Sell button      │
│    + floating “+18.8M $NOOB” text on trades                   │ Holding · Value · PnL       │
│  bonding curve bar (green→teal) · % · “Graduates at $69.0K”   │ Live trades feed (9 rows)   │
└───────────────────────────────────────────────────────────────┴─────────────────────────────┘
```

Simulation (`initTerminal`):
- Supply `1e9`, graduation market cap `$69,000`. Starting caps per tab: 5.2K / 12.8K / 31K / 47K, with 56 pre-generated candles.
- Tick every **280ms**: momentum `mom = mom·.92 + rand(−.0025, .0028) + pull` (pull pushes back near the extremes), price `*= 1 + mom + rand(±.006)`. A new candle every 7 ticks (~2s).
- Random bot trade on 35% of ticks (60% on the active coin, 56% buys, 4–140 cash).
- **Price impact** of a trade: `price *= exp(±amount / (mcap·0.35 + 2500))`.
- User starts with **1,000 cash**. Buy spends cash → tokens at the current price. Sell uses % chips (25/50/75/100%) of holdings. Wallet flashes teal on each trade.
- Feed rows drop in (`row-drop`), your own trades get a gold tint.

---

## 11. Pulse board, ticker, leaderboard

**Pulse** — three dark columns inside a dark rounded frame (`0 6px 0 #05080f` ledge): **Fresh launches** (blue bar), **Final stretch** (gold, > 60% bonded), **Graduated** (teal). Each row: 44px coin head icon · `$TICKER` + name · market cap (teal mono) · holders · bonding progress bar · % / `GRAD` badge · age. Every 1.6s curves move randomly; coins ≥ 60% move to Final stretch, ≥ 100% graduate; a new launch drops in every other tick. Rows are **keyed DOM nodes** (moved, not re-rendered) and only new/moved rows play `row-drop`.

**Ticker** — dark strip under the scene; each coin's icon, `$TICKER`, cap and ▲/▼ %; content duplicated and translated −50% over 50s (`marquee`), pauses on hover.

**Leaderboard** — podium of 3 avatars standing on isometric bricks of different heights (gold 46, silver 30, bronze 18) with rank badges; the avatar overlaps the brick top (`margin-top: -63px` on the brick, avatar `z-index: 2`). Below, a panel with rows 4–8 (rank, head icon, name + trade count, best coin, bag size in green mono).

Coin roster (fake, Roblox-flavoured): `$NOOB $OOF $BACON $SUIT $OBBY $TIX $GUEST $BRICK $CAFE $MOON $KING $SLIDE` + random launches (`$PIZZA $SWORD $TYCOON $LAVA $ADMIN $WIFI $LAG …`).

---

## 12. Page sections & copy

1. **Hero** — “Launch it. / Pump it. / Cash it.” · *RBXfun is the first memecoin-trading experience on Roblox. Suit up, grab a PC at the Executive Internet Cafe, launch a coin in seconds and ride the chart with your whole server.* · chips: Free to play · 13 traders per server · BETA live now.
2. **Terminal** (inside the scene) — “Sit down. Pull up a chart.”
3. **Ticker** strip.
4. **How it works** — “From noob to executive in four steps.” Cards with sky+baseplate mini-scenes: (1) Walk into the cafe — door + noob, (2) Launch a coin — PC with a coin popping out, (3) Ride the chart — animated candle bars + phone guy, (4) Graduate & flex — coin in a graduation cap on a gold brick.
5. **Pulse** — “The whole server's coins, live on one board.”
6. **The Cafe** — “Welcome to the trench.” Bento grid (4 cols): big in-game screenshot (2×2), 4 feature tiles (A PC for everyone · 13-player servers · Dress the part · Stack your cash), wide in-game screenshot + wide tile “Built like pump.fun. Played like Roblox.” Screenshot captions sit in a frosted dark bar with a gold `IN-GAME` tag; images zoom 1.05 on hover.
7. **Leaderboard** — “Top of the trench.”
8. **FAQ** — native `<details>` panels; the `+` badge rotates 45° when open.
9. **CTA** — green studded slab (`linear-gradient(135deg, #17a047, #0d7a34)`, `0 8px 0 #085a26` ledge, radius 32) with “Your PC is waiting.”, a gold 3D button, a crowd of 3 avatars and floating coins.
10. **Footer** — logo, links, disclaimer (independent experience, not affiliated with Roblox or pump.fun, numbers are simulated).

> ⚠️ Gameplay copy (no crypto wallet, in-game cash, launch flow, bonding curve/graduating) was written from the game description and thumbnails — update it to match the real game.

---

## 13. Animation catalogue

| Name | Duration / timing | What it does |
|---|---|---|
| `intro-logo` | .7s overshoot | logo scale-in |
| `block-spin` | 1.4s `--ease` | logo Y-axis half spin |
| `load-bar` | 1.3s | loader fill |
| `intro-word` / `intro-out` | .6s / .55s @1.65s | wordmark color-in / overlay fade |
| `rise` | .9s, 100ms stagger | H1 lines slide up from behind a mask |
| `fade-up` | .8s | 14px rise + fade for hero text, CTAs, chips |
| `coin-drop` | .9s `cubic-bezier(.3,1.45,.6,1)`, 110ms stagger | coins fall in from −110px, rotated −30°, scale .6 |
| `coin-float` | 6s ∞ (5s on CTA) | ±12px bob with −4°↔5° rotate |
| `cloud-drift` | 50–80s alternate | ±6vw horizontal drift |
| `sun-spin` | 40s linear ∞ | sun rotation |
| `twinkle` | 4s alternate | star brightness |
| `plate-roll` | 6s linear ∞ | baseplate grid scrolls toward camera |
| `beacon` / `win` | 1.6s / 5s steps(2) | blinking antenna lights / city windows |
| `neon` | 4–5.5s ∞ | sign flicker |
| `draw` | 3.2s ∞ | window monitor charts draw in/out |
| `av-bob` / `av-wave` | 3.2s / 1.4s | avatar idle bob / arm wave |
| `pop-up` | 2.4s | hero trade pop-ups |
| `ping` | 1.8s ∞ | live-dot ring |
| `wheel` | 1.6s ∞ | scroll-hint dot |
| `row-drop` | .4–.5s | new rows in trade feed / Pulse |
| `float-up` | 1.3s | “+N $TICKER” over the chart after a trade |
| `flash` | .5s | wallet highlight after a trade |
| `bar-grow` / `art-pop` | 2.4s / 2.8s | step-card illustrations |
| `marquee` | 50s linear ∞ | ticker |
| Reveal | .8s `--ease`, `--d` delay | `[data-reveal]` → `.shown` via IntersectionObserver (26px rise + fade) |
| Hover lift | .3s | step cards −6px; buttons −1px |

---

## 14. Responsive & accessibility rules

- **≤ 1100px**: tighter nav, hide the BETA pill, steps & bento go 2-column.
- **≤ 899px**: hamburger menu (dropdown panel with ledge), header always glass; hero stacks (copy on top, cafe scene below on a 130px plate strip); the first 3 hero coins, bills, haze and scroll hint are hidden; only one chat bubble shows; terminal goes fluid single-column; Pulse is one column; FAQ single column; CTA crowd moves under the copy.
- **≤ 600px**: steps & bento single column, smaller podium (bricks 96px), compact leaderboard rows.
- `prefers-reduced-motion`: animations/transitions ~0, intro hidden, reveals shown immediately, scroll scene off (static mode), hero chatter not started.
- Decorative SVGs have `aria-hidden="true"`; real screenshots have descriptive `alt`; visible focus ring `3px solid var(--ring)`.
- Simulations pause when the tab is hidden (`document.hidden`).

---

## 15. Assets

- `img/cafe-front.png`, `img/cafe-inside.png`, `img/game-icon.png` — official game thumbnails/icon from Roblox.
- `img/og.png` (1200×630) — rendered in headless Edge from the same art: light sky, skyline, cafe + exec + noob, coins, logo, “Launch it. Pump it. Cash it.”, tagline chip.
- `img/apple-touch-icon.png` (180×180) and `favicon.svg` — the logo mark.

To regenerate: build a throwaway HTML page that loads `/js/art.js`, compose the scene at a fixed size, and screenshot it with headless Chrome/Edge (wait for fonts).

---

## 16. Ready-to-paste brief for another agent

> Build a landing page for **RBXfun**, a Roblox memecoin-trading game set in the "RBXfun Executive Internet Cafe" (pump.fun-inspired). Follow the design spec in this repo's README exactly:
> - **Materials:** Roblox/Lego toy look. White cards with a solid 4px bottom ledge (`0 4px 0 var(--edge)`), a row of studs over card tops, 3D push buttons that press down 3px, stud-grid backgrounds, Fredoka headings + Inter body + JetBrains Mono numbers, money-green `#19a64b` brand with `#0d7a34` shade, gold `#ffc933` accent, light `#eef2f8` / dark `#0b1122` themes.
> - **Hero:** full-viewport Roblox world — sky gradient, blocky rotating sun (moon + stars in dark mode), seeded city skyline, rounded-rectangle clouds drifting, a perspective baseplate (`rotateX(64deg)`, 72px grid + studs, slowly rolling), and a hand-drawn SVG internet cafe on the right (brick wall, gold "RBXfun / EXECUTIVE INTERNET CAFE" sign, green-white striped awning, window with glowing PCs and patrons, neon "NET CAFE"/"OPEN 24/7"/"$FUN" signs with flicker, ATM, planters, street lamp). Blocky R6-style SVG avatars in front (suited exec with briefcase, waving noob, guy on phone) with Roblox chat bubbles and floating trade pop-ups. Headline "Launch it. Pump it. Cash it." with masked line-rise animation; coins drop in with overshoot and float.
> - **Intro:** studded loader with spinning logo, color-in wordmark and load bar, once per session.
> - **Scroll scene:** sticky 290vh section where the hero card clips (`clip-path: inset()`) down into a PC monitor's screen while coins fly off-screen; then the bezel, stand and a playable dark trading terminal fade in under the heading "Sit down. Pull up a chart." Use the progress segments in README §8.
> - **Terminal:** live candlestick chart, coin tabs, buy/sell with amount chips, position + PnL, live trades feed, bonding-curve bar to $69K "graduation" (simulation rules in §10).
> - **Then:** coin ticker marquee, 4-step "How it works" cards with mini illustrations, live Pulse board (Fresh / Final stretch / Graduated), bento gallery with in-game screenshots, leaderboard podium of avatars on isometric gold/silver/bronze Lego bricks, FAQ, green studded CTA slab, footer disclaimer.
> - All art must be generated as code (SVG), not stock images. Respect reduced motion and make it fully responsive (static hero + stacked terminal under 900px).

---

*RBXfun is an independent Roblox experience. Not affiliated with, sponsored or endorsed by Roblox Corporation or pump.fun.*
