# Trench County: website

The site for **Trench County**, the Roblox open-world memecoin game. Deployed on Vercel from `main` at
https://rbxfun.vercel.app. Static HTML, CSS and JS: no build step, no libraries.

Remade on 2026-10-21 to match the game as it stands (the first site described the old "RBXfun" cafe game and its
Lego-studs look). RBXfun remains the name of the trading platform inside the game.

## Files

| Path | What |
|---|---|
| `index.html` | The page: hero, coin ticker, story (the intro's five lines), intro video, TrenchOS with a playable terminal, town map, the Ledger (prices), life cards, the coin, FAQ, CTA, footer with credits |
| `css/style.css` | All styles. Tokens on `:root` |
| `js/heads.js` | `TC.coinHead(seed, size)`: the Roblox-head coin icons, the same tables as the game's `ReplicatedStorage.CoinHead` |
| `js/main.js` | Header, mobile menu, scroll reveals, ticker, live ROL price, the playable terminal, the town map |
| `img/shots/*.webp` | In-game captures (Studio, ThumbStage golden lighting) and stills from the intro video |
| `img/og.jpg` | 1200 x 630 share card (VELLANO forecourt + Rye title) |
| `video/intro.mp4` | The in-game intro story, 60 s, 720p, with our welcome theme. `intro-poster.webp` is its last frame |
| `game/` | An old in-game script kept for reference (not used by the site) |

## Look

The game's own design language, not a generic crypto landing page:

- **Dark, natural, gloomy:** charcoal `#0c0d10`, hairline borders (`rgba(255,255,255,.08)`), smoked-glass chips like the in-game HUD cards.
- **Type:** Rye for the title (as on the thumbnails and the welcome screen), Cinzel for small caps and the motto "Trade memes · Live life", Inter for UI, EB Garamond for the ledger and the quiet italic lines (the intro's second line), JetBrains Mono for numbers.
- **Gold** `#d6b26e` only for eyebrows, the motto and the CA pill.
- **The Ledger** is the in-game printed card: cream stock, double ink rule, dotted leaders, a red "Paid in full" stamp.
- **The terminal** uses the TC Terminal palette: navy `#0b1220`, panel `#0e1728`, line `#1e2a44`, up `#4ed8be`, down `#f26d7e`.
- No emoji. No flashy glows or gradients.

## Behaviour

- **ROL price:** fetched from Coinbase SOL-USD spot and clamped to $90–$150 (the game's rule); falls back to $110.
- **Terminal:** pump.fun constants (30 virtual SOL, 1.073B virtual tokens, graduates at 85), play wallet of 10 ROL, 2.5 s candles, simulated traders. It only starts when scrolled into view.
- **Map:** `img/shots/town-map.webp` is the in-game map (`rbxfun-assets/ui/out/map3/map_full.png`) cropped to X −400..640, Z −640..260 studs. Pins are placed from in-game coordinates (`PLACES` in `main.js`, the same list as MapHUD).
- **CA:** `#caText` says "soon". When the token launches, put the address there, enable `#caCopy`, and update the header pill.

## Updating images

Stage shots in Studio with `ServerStorage.ThumbStage` (`stage("golden")`, `car(id, cf)`, `hero(cf, look)`, then
`restore()`), capture at FOV ~34, and convert to WebP (quality ~82). Avoid the dusk look: the user found it too blue.

## Deploy

Push to `main`; Vercel deploys automatically. Check https://rbxfun.vercel.app afterwards.
