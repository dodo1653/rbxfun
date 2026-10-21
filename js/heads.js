/* Trench County — coin heads. The same Roblox-head icons the game draws for every coin
   (ported from the first site's art.js, which the in-game CoinHead module was built from). */
(function () {
  const rgb = (h) => {
    h = h.replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const n = parseInt(h, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const shade = (h, amt) => {
    const [r, g, b] = rgb(h)
    const t = amt < 0 ? 0 : 255
    const p = Math.abs(amt)
    const f = (c) => Math.round((t - c) * p + c)
    return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  function box(x, y, w, h, c) {
    return `<path d="M${x + w} ${y}l8 -4v${h}l-8 4Z" fill="${shade(c, -0.24)}"/>` +
      `<path d="M${x} ${y}l8 -4h${w}l-8 4Z" fill="${shade(c, 0.18)}"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
  }
  function face(kind, x = 38, y = 8) {
    const ink = '#1b1e27'
    const e = (dx, dy, w = 4, h = 6) => `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" rx="1.5" fill="${ink}"/>`
    const smile = `<path d="M${x + 8.5} ${y + 21}q6 4 12 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
    switch (kind) {
      case 'shades':
        return `<rect x="${x + 3}" y="${y + 9}" width="23" height="7" rx="2" fill="#111522"/><rect x="${x + 5}" y="${y + 10}" width="6" height="2" rx="1" fill="#fff" opacity=".55"/>` + smile
      case 'grin':
        return e(7, 10) + e(18, 10) + `<path d="M${x + 7} ${y + 19}h15q-1 7-7.5 7t-7.5-7Z" fill="${ink}"/><path d="M${x + 9} ${y + 19.5}h11v2h-11Z" fill="#fff"/>`
      case 'oof':
        return `<path d="M${x + 6} ${y + 9}l5 5m0-5l-5 5M${x + 18} ${y + 9}l5 5m0-5l-5 5" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><ellipse cx="${x + 14.5}" cy="${y + 22}" rx="3.5" ry="3" fill="${ink}"/>`
      case 'smug':
        return `<rect x="${x + 6}" y="${y + 12}" width="6" height="2.6" rx="1.2" fill="${ink}"/><rect x="${x + 17}" y="${y + 12}" width="6" height="2.6" rx="1.2" fill="${ink}"/><path d="M${x + 10} ${y + 21}q6 2 10-2" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
      case 'wow':
        return e(7, 9, 4, 7) + e(18, 9, 4, 7) + `<ellipse cx="${x + 14.5}" cy="${y + 21.5}" rx="3" ry="3.6" fill="${ink}"/>`
      case 'money':
        return `<text x="${x + 9}" y="${y + 17}" font-family="Inter,Arial" font-weight="700" font-size="10" fill="#159c45" text-anchor="middle">$</text><text x="${x + 20}" y="${y + 17}" font-family="Inter,Arial" font-weight="700" font-size="10" fill="#159c45" text-anchor="middle">$</text>` + smile
      default:
        return e(7, 11) + e(18, 11) + smile
    }
  }
  function hairArt(style, c, x = 38, y = 8) {
    if (!style || style === 'none') return ''
    const side = shade(c, -0.25)
    const top = shade(c, 0.12)
    if (style === 'spiky') return `<path d="M${x - 2} ${y + 12}V${y - 1}l4-6 3 3 3-6 4 4 4-6 3 5 4-4 2 5 5-3 2 6v7h-6l-1 3-5-4-7 3-6-3-5 4-3-3Z" fill="${c}"/><path d="M${x + 30} ${y - 1}l8-4v10l-8 4Z" fill="${side}"/>`
    if (style === 'cap') return `<path d="M${x} ${y}l8-4h28l-8 4Z" fill="${top}"/><rect x="${x}" y="${y}" width="28" height="7" fill="${c}"/><path d="M${x + 28} ${y}l8-4v7l-8 4Z" fill="${side}"/><path d="M${x - 8} ${y + 7}h22l2 3H${x - 6}Z" fill="${shade(c, -0.12)}"/>`
    if (style === 'bacon') return `<path d="M${x - 1} ${y + 9}q-1-12 9-12q2-4 8-1q6-3 9 2q6 1 4 11l-3-2-3 3-3-4-4 3-4-3-4 3-3-3-3 4Z" fill="${c}"/><path d="M${x + 29} ${y}l7-4v9l-7 3Z" fill="${side}"/>`
    if (style === 'tophat') return `<path d="M${x - 5} ${y + 1}h38l6-3H${x + 1}Z" fill="${top}"/><rect x="${x - 5}" y="${y + 1}" width="38" height="4" fill="${c}"/><path d="M${x + 4} ${y - 15}l6-3h18l-6 3Z" fill="${top}"/><rect x="${x + 4}" y="${y - 15}" width="18" height="16" fill="${c}"/><path d="M${x + 22} ${y - 15}l6-3v16l-6 3Z" fill="${side}"/><rect x="${x + 4}" y="${y - 4}" width="18" height="3" fill="#c0392b"/>`
    if (style === 'crown') return `<path d="M${x + 1} ${y + 1}l2-11 6 6 5-9 5 9 6-6 2 11Z" fill="#ffcd35" stroke="#c99300" stroke-width="1.2" stroke-linejoin="round"/>`
    return ''
  }

  // the game's own tables (ReplicatedStorage.CoinHead)
  const BGS = ['#3d8bff', '#ff5a52', '#ff9f43', '#19a64b', '#8e67ff', '#ffc933', '#0e2155', '#4b505e', '#e8392f', '#13a8a8']
  const SKINS = ['#ffd9b8', '#f5cd30', '#c68b59', '#8a5a3c', '#e3e6ec', '#4ed8be', '#ffb3c7', '#9ad0ff']
  const FACES = ['smile', 'grin', 'smug', 'wow', 'oof', 'shades', 'money', 'smile']
  const HAIRS = ['none', 'spiky', 'cap', 'bacon', 'tophat', 'none', 'spiky', 'cap', 'bacon', 'crown']
  const HAIR_COLS = ['#1b1e27', '#8a4b2a', '#7a4cff', '#e8392f', '#3d8bff']

  function rng(seed) {
    let s = seed >>> 0 || 1
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  }
  // coinHead(seed, size) -> svg string; a seed always draws the same head
  function coinHead(seed, size = 40) {
    const r = rng(seed)
    const pick = (a) => a[Math.floor(r() * a.length)]
    const bg = pick(BGS), skin = pick(SKINS), faceKind = pick(FACES), hair = pick(HAIRS), hairColor = pick(HAIR_COLS)
    const inner = box(38, 8, 28, 28, skin) + face(faceKind) + hairArt(hair, hairColor)
    return `<svg viewBox="22 -14 60 60" width="${size}" height="${size}" aria-hidden="true"><rect x="22" y="-14" width="60" height="60" rx="14" fill="${bg}"/><g transform="translate(-2 4)">${inner}</g></svg>`
  }
  window.TC = window.TC || {}
  window.TC.coinHead = coinHead
})()
