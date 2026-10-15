# RBXfun — website

Landing page for **RBXfun**, the memecoin-trading experience on Roblox.
Play: https://www.roblox.com/games/121901103139963/RBXfun

Plain static site — no build step. Deploy the repo root as-is (Vercel, Netlify, GitHub Pages).

```
index.html        page markup
css/style.css     all styles (light + dark theme)
js/art.js         every Roblox-style graphic (avatars, cafe, bricks, coins) drawn as SVG
js/main.js        hero → monitor scroll scene, playable terminal, Pulse board, leaderboard
img/              in-game screenshots, OG image, icons
game/             in-game Luau scripts
```

Preview locally with any static server, e.g. `npx serve .`
