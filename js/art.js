/* RBXfun — hand-built Roblox-style graphics, drawn as SVG strings.
   Every avatar, brick, coin and building on the site comes from here. */
(function () {
  let uidN = 0
  const uid = () => 'a' + (++uidN).toString(36)

  const rgb = (h) => {
    h = h.replace('#', '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const n = parseInt(h, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  // amt > 0 lightens towards white, amt < 0 darkens towards black
  const shade = (h, amt) => {
    const [r, g, b] = rgb(h)
    const t = amt < 0 ? 0 : 255
    const p = Math.abs(amt)
    const f = (c) => Math.round((t - c) * p + c)
    return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')
  }

  // A block seen from the front-right: front face, right side, top.
  function box(x, y, w, h, c, o = {}) {
    const dx = o.dx ?? 8
    const dy = o.dy ?? -4
    let s = ''
    if (o.side !== false) s += `<path d="M${x + w} ${y}l${dx} ${dy}v${h}l${-dx} ${-dy}Z" fill="${shade(c, -0.24)}"/>`
    if (o.top !== false) s += `<path d="M${x} ${y}l${dx} ${dy}h${w}l${-dx} ${-dy}Z" fill="${shade(c, 0.18)}"/>`
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
    return s
  }

  /* ---------------- faces & hair ---------------- */
  function face(kind, x = 38, y = 8) {
    const ink = '#1b1e27'
    const e = (dx, dy, w = 4, h = 6) => `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" rx="1.5" fill="${ink}"/>`
    switch (kind) {
      case 'shades':
        return `<rect x="${x + 3}" y="${y + 9}" width="23" height="7" rx="2" fill="#111522"/><rect x="${x + 5}" y="${y + 10}" width="6" height="2" rx="1" fill="#fff" opacity=".55"/><path d="M${x + 8.5} ${y + 21}q6 4 12 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
      case 'grin':
        return e(7, 10) + e(18, 10) + `<path d="M${x + 7} ${y + 19}h15q-1 7-7.5 7t-7.5-7Z" fill="${ink}"/><path d="M${x + 9} ${y + 19.5}h11v2h-11Z" fill="#fff"/>`
      case 'oof':
        return `<path d="M${x + 6} ${y + 9}l5 5m0-5l-5 5M${x + 18} ${y + 9}l5 5m0-5l-5 5" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><ellipse cx="${x + 14.5}" cy="${y + 22}" rx="3.5" ry="3" fill="${ink}"/>`
      case 'smug':
        return `<rect x="${x + 6}" y="${y + 12}" width="6" height="2.6" rx="1.2" fill="${ink}"/><rect x="${x + 17}" y="${y + 12}" width="6" height="2.6" rx="1.2" fill="${ink}"/><path d="M${x + 10} ${y + 21}q6 2 10-2" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
      case 'wow':
        return e(7, 9, 4, 7) + e(18, 9, 4, 7) + `<ellipse cx="${x + 14.5}" cy="${y + 21.5}" rx="3" ry="3.6" fill="${ink}"/>`
      case 'money':
        return `<text x="${x + 9}" y="${y + 17}" font-family="Fredoka,Arial" font-weight="700" font-size="10" fill="#159c45" text-anchor="middle">$</text><text x="${x + 20}" y="${y + 17}" font-family="Fredoka,Arial" font-weight="700" font-size="10" fill="#159c45" text-anchor="middle">$</text><path d="M${x + 8.5} ${y + 21}q6 4 12 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
      default:
        return e(7, 11) + e(18, 11) + `<path d="M${x + 8.5} ${y + 21}q6 4 12 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`
    }
  }

  function hairArt(style, c, x = 38, y = 8) {
    if (!style || style === 'none') return ''
    const side = shade(c, -0.25)
    const top = shade(c, 0.12)
    if (style === 'spiky') {
      // the messy executive hair from the game icon
      return `<path d="M${x - 2} ${y + 12}V${y - 1}l4-6 3 3 3-6 4 4 4-6 3 5 4-4 2 5 5-3 2 6v7h-6l-1 3-5-4-7 3-6-3-5 4-3-3Z" fill="${c}"/>
        <path d="M${x + 30} ${y - 1}l8-4v10l-8 4Z" fill="${side}"/><path d="M${x + 2} ${y - 4}l3 -2 3 1 4-3 3 2 5-3 4 2" fill="none" stroke="${top}" stroke-width="1.6" stroke-linecap="round"/>`
    }
    if (style === 'cap') {
      return `<path d="M${x} ${y}l8-4h28l-8 4Z" fill="${top}"/><rect x="${x}" y="${y}" width="28" height="7" fill="${c}"/><path d="M${x + 28} ${y}l8-4v7l-8 4Z" fill="${side}"/><path d="M${x - 8} ${y + 7}h22l2 3H${x - 6}Z" fill="${shade(c, -0.12)}"/>`
    }
    if (style === 'bacon') {
      return `<path d="M${x - 1} ${y + 9}q-1-12 9-12q2-4 8-1q6-3 9 2q6 1 4 11l-3-2-3 3-3-4-4 3-4-3-4 3-3-3-3 4Z" fill="${c}"/><path d="M${x + 4} ${y - 1}q5 3 9 0q5 3 9 0" fill="none" stroke="${top}" stroke-width="1.8" stroke-linecap="round"/><path d="M${x + 29} ${y}l7-4v9l-7 3Z" fill="${side}"/>`
    }
    if (style === 'tophat') {
      return `<path d="M${x - 5} ${y + 1}h38l6-3H${x + 1}Z" fill="${top}"/><rect x="${x - 5}" y="${y + 1}" width="38" height="4" fill="${c}"/><path d="M${x + 4} ${y - 15}l6-3h18l-6 3Z" fill="${top}"/><rect x="${x + 4}" y="${y - 15}" width="18" height="16" fill="${c}"/><path d="M${x + 22} ${y - 15}l6-3v16l-6 3Z" fill="${side}"/><rect x="${x + 4}" y="${y - 4}" width="18" height="3" fill="#c0392b"/>`
    }
    if (style === 'crown') {
      return `<path d="M${x + 1} ${y + 1}l2-11 6 6 5-9 5 9 6-6 2 11Z" fill="#ffcd35" stroke="#c99300" stroke-width="1.2" stroke-linejoin="round"/><circle cx="${x + 14}" cy="${y - 3}" r="1.8" fill="#ff5a52"/>`
    }
    return ''
  }

  /* ---------------- avatar ---------------- */
  function avatar(o = {}) {
    const {
      skin = '#ffd9b8', shirt = '#3fcf4a', pants = '#2a2f3a', shoes = '#1b1e27',
      hair = 'spiky', hairColor = '#1b1e27', suit = false, jacket = '#4b505e', tie = '#c0392b',
      faceKind = 'smile', wave = false, briefcase = false, bob = true, width = 70, cls = '', phone = false,
    } = o
    const torso = suit ? jacket : shirt
    let g = ''
    g += `<g>${box(30, 82, 22, 44, pants)}</g><g>${box(52, 82, 22, 44, pants)}</g>`
    g += `<rect x="30" y="118" width="44" height="8" fill="${shoes}"/><path d="M74 118l8-4v8l-8 4Z" fill="${shade(shoes, -0.2)}"/>`
    g += `<g>${box(30, 38, 44, 44, torso)}</g>`
    if (suit) {
      g += `<path d="M43 38h18l-9 22Z" fill="#f4f6fb"/>`
      g += `<path d="M50.3 39.5h3.4l1.4 4-1.3 15-1.8 2.4-1.8-2.4-1.3-15Z" fill="${tie}"/>`
      g += `<path d="M37 38h6l9 22-4 7Z" fill="${shade(jacket, -0.14)}"/><path d="M67 38h-6l-9 22 4 7Z" fill="${shade(jacket, -0.14)}"/>`
      g += `<rect x="51" y="70" width="2.4" height="2.4" rx="1.2" fill="${shade(jacket, -0.4)}"/><rect x="51" y="76" width="2.4" height="2.4" rx="1.2" fill="${shade(jacket, -0.4)}"/>`
      g += `<rect x="60" y="46" width="7" height="2" fill="${shade(jacket, -0.3)}"/>`
    }
    // left arm
    g += `<g>${box(8, 38, 22, 44, torso)}<rect x="8" y="74" width="22" height="8" fill="${skin}"/>${suit ? `<rect x="8" y="71" width="22" height="3" fill="#f4f6fb"/>` : ''}</g>`
    // right arm
    let arm = `${box(74, 38, 22, 44, torso)}<rect x="74" y="74" width="22" height="8" fill="${skin}"/>${suit ? `<rect x="74" y="71" width="22" height="3" fill="#f4f6fb"/>` : ''}`
    if (phone) arm += `<rect x="78" y="62" width="14" height="22" rx="2.5" fill="#151a28"/><rect x="80" y="64" width="10" height="16" rx="1.4" fill="#4ed8be"/><path d="M81 76l3-4 2 2 3-5" stroke="#06231c" stroke-width="1.4" fill="none"/>`
    g += wave ? `<g class="av-wave">${arm}</g>` : `<g>${arm}</g>`
    if (briefcase) {
      g += `<path d="M80 84v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" fill="none" stroke="#3b2414" stroke-width="2.4"/>`
      g += box(70, 84, 32, 22, '#7a3e22', { dx: 6, dy: -3 })
      g += `<rect x="70" y="92" width="32" height="2.4" fill="#5a2c17"/><rect x="76" y="89" width="5" height="6" rx="1" fill="#e8b84a"/><rect x="91" y="89" width="5" height="6" rx="1" fill="#e8b84a"/>`
      g += `<rect x="73" y="101" width="7" height="3" rx="1" fill="#1c8a43" transform="rotate(-8 76 102)"/>`
    }
    // head
    g += `<g>${box(38, 8, 28, 28, skin)}${face(faceKind)}${hairArt(hair, hairColor)}</g>`
    const h = (width * 152) / 112
    return `<svg viewBox="0 -18 112 152" width="${width}" height="${h}" class="avatar ${cls}" aria-hidden="true"><g class="${bob ? 'av-bob' : ''}">${g}</g></svg>`
  }

  // just the head — used for coin icons, leaderboard, chat
  function head(o = {}) {
    const { skin = '#ffd9b8', hair = 'none', hairColor = '#1b1e27', faceKind = 'smile', size = 40, bg = null } = o
    const inner = box(38, 8, 28, 28, skin) + face(faceKind) + hairArt(hair, hairColor)
    const bgRect = bg ? `<rect x="22" y="-14" width="60" height="60" rx="14" fill="${bg}"/>` : ''
    return `<svg viewBox="22 -14 60 60" width="${size}" height="${size}" aria-hidden="true">${bgRect}<g transform="translate(-2 4)">${inner}</g></svg>`
  }

  /* ---------------- isometric brick ---------------- */
  function brick(o = {}) {
    const { cols = 2, rows = 2, color = '#ffcd35', h = 16.8, width = 60, studs = true, label = '' } = o
    const cx = 12.1
    const cy = 7
    const T = [0, 0]
    const A = [cols * cx, cols * cy]
    const B = [-rows * cx, rows * cy]
    const C = [A[0] + B[0], A[1] + B[1]]
    const p = (pt, dy = 0) => `${pt[0].toFixed(2)},${(pt[1] + dy).toFixed(2)}`
    const top = color
    const left = shade(color, -0.12)
    const right = shade(color, -0.26)
    let s = ''
    s += `<polygon points="${p(B)} ${p(C)} ${p(C, h)} ${p(B, h)}" fill="${left}" stroke="${left}" stroke-width="1" stroke-linejoin="round"/>`
    s += `<polygon points="${p(C)} ${p(A)} ${p(A, h)} ${p(C, h)}" fill="${right}" stroke="${right}" stroke-width="1" stroke-linejoin="round"/>`
    s += `<polygon points="${p(T)} ${p(A)} ${p(C)} ${p(B)}" fill="${top}" stroke="${top}" stroke-width="1" stroke-linejoin="round"/>`
    if (studs) {
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = (i + 0.5) * cx - (j + 0.5) * cx
          const y = (i + 0.5) * cy + (j + 0.5) * cy
          s += `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="2.4" fill="${shade(color, -0.18)}"/><rect x="${x - 4.2}" y="${y - 2.6}" width="8.4" height="2.6" fill="${shade(color, -0.08)}"/><ellipse cx="${x}" cy="${y - 2.6}" rx="4.2" ry="2.4" fill="${shade(color, 0.2)}"/>`
        }
    }
    if (label) {
      // text painted on the right face
      const m = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2 + h / 2 + 3]
      s += `<text x="${m[0]}" y="${m[1]}" transform="skewY(-30) translate(0 ${m[0] * Math.tan(Math.PI / 6)})" font-family="Fredoka,Arial" font-weight="700" font-size="9" fill="#fff" text-anchor="middle" opacity=".9">${label}</text>`
    }
    const minX = B[0] - 2
    const maxX = A[0] + 2
    const minY = -8
    const maxY = C[1] + h + 2
    const vw = maxX - minX
    const vh = maxY - minY
    return `<svg viewBox="${minX} ${minY} ${vw} ${vh}" width="${width}" height="${(width * vh) / vw}" aria-hidden="true" class="brick">${s}</svg>`
  }

  /* ---------------- coin ---------------- */
  function coin(o = {}) {
    const { size = 56, tilt = 0.62, rotate = -16, faceKind = 'smile', tone = 'gold' } = o
    const id = uid()
    const tones = {
      gold: ['#fff1b0', '#ffcd35', '#e9a400', '#d49300', '#9c6a00'],
      green: ['#b8ffc9', '#3fdc6a', '#16a34a', '#12863c', '#0a5f28'],
    }
    const [f1, f2, f3, r1, r2] = tones[tone] || tones.gold
    const ink = tone === 'gold' ? '#4a3200' : '#06311a'
    let fc = ''
    if (faceKind === 'dollar') fc = `<text x="0" y="13" font-family="Fredoka,Arial" font-weight="700" font-size="40" text-anchor="middle" fill="${ink}" opacity=".85">$</text>`
    else if (faceKind === 'shades') fc = `<rect x="-22" y="-12" width="44" height="12" rx="4" fill="${ink}"/><rect x="-18" y="-10" width="9" height="3" rx="1.5" fill="#fff" opacity=".6"/><path d="M-11 11q11 8 22 0" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`
    else fc = `<rect x="-14" y="-14" width="8" height="13" rx="4" fill="${ink}"/><rect x="6" y="-14" width="8" height="13" rx="4" fill="${ink}"/><path d="M-12 8q12 9 24 0" fill="none" stroke="${ink}" stroke-width="4.4" stroke-linecap="round"/>`
    return `<svg viewBox="-52 -52 104 112" width="${size}" height="${size * 1.077}" class="coin-svg" aria-hidden="true">
      <defs><linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f1}"/><stop offset=".5" stop-color="${f2}"/><stop offset="1" stop-color="${f3}"/></linearGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r1}"/><stop offset="1" stop-color="${r2}"/></linearGradient></defs>
      <g transform="rotate(${rotate})"><g transform="scale(1 ${tilt})">
        <circle cy="14" r="46" fill="url(#${id}r)"/><rect x="-46" y="0" width="92" height="14" fill="url(#${id}r)"/>
        <circle r="46" fill="url(#${id}f)"/><circle r="38" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4"/>
        <path d="M-30 -26a40 40 0 0 1 22 -12" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round" fill="none"/>
        <g>${fc}</g>
      </g></g></svg>`
  }

  function bill(o = {}) {
    const { width = 54, rotate = -12 } = o
    return `<svg viewBox="0 0 90 46" width="${width}" height="${(width * 46) / 90}" aria-hidden="true" style="transform:rotate(${rotate}deg)">
      <rect x="1" y="1" width="88" height="44" rx="4" fill="#5fc96e" stroke="#2f8f3c" stroke-width="2"/>
      <rect x="7" y="7" width="76" height="32" rx="3" fill="none" stroke="#2f8f3c" stroke-width="1.6" stroke-dasharray="3 2"/>
      <ellipse cx="45" cy="23" rx="12" ry="12" fill="#bff0c4" stroke="#2f8f3c" stroke-width="1.6"/>
      <text x="45" y="29" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="17" fill="#1f7a2e">$</text>
      <circle cx="16" cy="23" r="4" fill="#2f8f3c" opacity=".5"/><circle cx="74" cy="23" r="4" fill="#2f8f3c" opacity=".5"/></svg>`
  }

  /* ---------------- props ---------------- */
  function atm() {
    const id = uid()
    return `<svg viewBox="0 -8 74 128" class="atm" aria-hidden="true">
      <defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cd3ff"/><stop offset="1" stop-color="#1e7bff"/></linearGradient></defs>
      ${box(8, 14, 50, 104, '#c9d1de', { dx: 12, dy: -6 })}
      <rect x="8" y="14" width="50" height="16" fill="#1f9d4a"/><text x="33" y="26" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="11" fill="#fff">ATM</text>
      <rect x="14" y="36" width="38" height="26" rx="2" fill="#0d1526"/><rect x="16" y="38" width="34" height="22" rx="1.5" fill="url(#${id}s)" class="atm-screen"/>
      <text x="33" y="47" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="6.5" fill="#fff">CASH OUT</text>
      <rect x="21" y="51" width="24" height="5" rx="2" fill="#fff" opacity=".85"/>
      <g fill="#8e98aa">${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${17 + c * 8}" y="${68 + r * 7}" width="6" height="5" rx="1"/>`).join('')).join('')}</g>
      <rect x="44" y="68" width="8" height="19" rx="1.5" fill="#ff5a52"/><rect x="18" y="94" width="30" height="4" rx="2" fill="#2a3142"/>
      <rect x="18" y="104" width="30" height="3" rx="1.5" fill="#2a3142" opacity=".6"/></svg>`
  }

  function plant() {
    return `<svg viewBox="-4 -20 70 74" class="plant" aria-hidden="true">
      ${box(6, 6, 22, 18, '#2f9e44')}${box(20, -6, 22, 26, '#37b24d')}${box(34, 4, 20, 20, '#2b8a3e')}
      ${box(2, 26, 54, 22, '#6d4a33', { dx: 8, dy: -4 })}<rect x="2" y="26" width="54" height="4" fill="#5a3b28"/></svg>`
  }

  function lamp() {
    return `<svg viewBox="0 0 40 180" class="lamp" aria-hidden="true">
      <ellipse cx="20" cy="22" rx="20" ry="20" fill="var(--lamp-glow)"/>
      ${box(12, 12, 14, 16, '#2a3142', { dx: 4, dy: -2 })}<rect x="14" y="16" width="10" height="9" fill="#ffe8a3" class="lamp-bulb"/>
      <rect x="17" y="28" width="5" height="146" fill="#2a3142"/><rect x="11" y="170" width="17" height="10" fill="#1d2230"/></svg>`
  }

  function monitorMini(o = {}) {
    const { width = 120, chart = true } = o
    return `<svg viewBox="0 0 120 100" width="${width}" height="${(width * 100) / 120}" aria-hidden="true">
      ${box(6, 6, 100, 66, '#1a1f2e', { dx: 8, dy: -4 })}<rect x="11" y="11" width="90" height="56" rx="2" fill="#0b1220"/>
      ${chart ? `<g class="mini-chart"><path d="M16 56l12-6 10 4 12-14 10 6 14-18 10 8 12-16" fill="none" stroke="#4ed8be" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M16 56l12-6 10 4 12-14 10 6 14-18 10 8 12-16V64H16Z" fill="#4ed8be" opacity=".14"/></g>` : ''}
      <rect x="48" y="72" width="16" height="14" fill="#2a3142"/>${box(30, 86, 52, 6, '#2a3142', { dx: 8, dy: -4 })}</svg>`
  }

  /* ---------------- the cafe ---------------- */
  function cafe() {
    const id = uid()
    const monitors = [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const x = 70 + i * 47
        const d = ['M3 17l5-3 4 2 5-7 5 3 6-8', 'M3 15l6 2 5-6 4 3 6-7 5 1', 'M3 18l4-5 6 2 4-6 6 4 4-9'][i % 3]
        return `<g><rect x="${x}" y="312" width="38" height="25" rx="2" fill="#0a1222"/><rect x="${x + 2}" y="314" width="34" height="21" rx="1" fill="url(#${id}scr)"/>
        <path d="${d}" transform="translate(${x + 2} 314)" fill="none" stroke="#7dffb2" stroke-width="1.6" stroke-linejoin="round" class="cafe-chart" style="animation-delay:${-i * 0.7}s"/>
        <rect x="${x + 16}" y="337" width="6" height="5" fill="#1a1f2e"/></g>`
      })
      .join('')
    const patrons = [0, 1, 2, 3, 4]
      .map((i) => {
        const x = 86 + i * 58
        return `<g class="patron" style="animation-delay:${-i * 0.9}s"><rect x="${x}" y="354" width="22" height="20" fill="#141a28"/><rect x="${x - 6}" y="374" width="34" height="34" fill="#1a2132"/></g>`
      })
      .join('')
    return `<svg viewBox="0 0 640 450" class="cafe" aria-hidden="true">
    <defs>
      <pattern id="${id}b" width="28" height="14" patternUnits="userSpaceOnUse"><rect width="28" height="14" fill="var(--brick-wall)"/><path d="M0 .7H28M0 7.7H28M7 0V7M21 7V14" stroke="var(--brick-mortar)" stroke-width="1.4"/></pattern>
      <pattern id="${id}bs" width="20" height="14" patternUnits="userSpaceOnUse" patternTransform="skewY(-26.57)"><rect width="20" height="14" fill="var(--brick-side)"/><path d="M0 .7H20M0 7.7H20M5 0V7M15 7V14" stroke="var(--brick-mortar)" stroke-width="1.2"/></pattern>
      <pattern id="${id}aw" width="44" height="40" patternUnits="userSpaceOnUse"><rect width="22" height="40" fill="#1f9d4a"/><rect x="22" width="22" height="40" fill="#f4f6fb"/></pattern>
      <linearGradient id="${id}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".55" stop-color="#ffcd35"/><stop offset="1" stop-color="#c98d00"/></linearGradient>
      <linearGradient id="${id}scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a7bff"/><stop offset="1" stop-color="#173f9e"/></linearGradient>
      <linearGradient id="${id}in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c33"/><stop offset="1" stop-color="#0d1426"/></linearGradient>
      <linearGradient id="${id}door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd58a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9f43" stop-opacity=".15"/></linearGradient>
      <linearGradient id="${id}cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".75"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
      <filter id="${id}glow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- side wall + roof -->
    <path d="M540 70L600 40V410L540 440Z" fill="url(#${id}bs)"/><path d="M540 70L600 40V410L540 440Z" fill="#000" opacity=".22"/>
    <path d="M16 60L76 30H608L548 60Z" fill="var(--roof)"/>
    <!-- front wall -->
    <rect x="24" y="70" width="516" height="370" fill="url(#${id}b)"/>
    <rect x="16" y="58" width="532" height="16" fill="var(--cornice)"/><rect x="16" y="58" width="532" height="3" fill="#fff" opacity=".18"/>
    <path d="M548 58l60-30v16l-60 30Z" fill="var(--cornice)"/><path d="M548 58l60-30v16l-60 30Z" fill="#000" opacity=".25"/>
    <!-- blade sign on the side -->
    <g transform="translate(556 112) skewY(-26.57)">
      <rect x="0" y="16" width="30" height="132" rx="5" fill="#1a1020"/>
      <g filter="url(#${id}glow)" class="neon neon-b" font-family="Fredoka,Arial" font-weight="700" font-size="22" fill="#5ef0ff" text-anchor="middle">
        <text x="15" y="44">$</text><text x="15" y="70">F</text><text x="15" y="96">U</text><text x="15" y="122">N</text></g>
    </g>
    <!-- spotlights -->
    <path d="M150 86L118 200H190Z" fill="url(#${id}cone)" class="spot"/><path d="M414 86L382 200H452Z" fill="url(#${id}cone)" class="spot"/>
    <!-- main sign -->
    <path d="M444 92l10-5v88l-10 5Z" fill="#1a0f09"/>
    <rect x="120" y="92" width="324" height="88" rx="8" fill="#2e1c12" stroke="url(#${id}gold)" stroke-width="5"/>
    <rect x="130" y="101" width="304" height="70" rx="5" fill="none" stroke="#e8c27a" stroke-opacity=".45" stroke-width="1.5"/>
    <text x="282" y="148" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="50" fill="url(#${id}gold)" letter-spacing="1">RBXfun</text>
    <text x="282" y="166" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="11.5" fill="#e8c27a" letter-spacing="3.4">EXECUTIVE INTERNET CAFE</text>
    <rect x="140" y="78" width="20" height="10" fill="#22252e"/><rect x="404" y="78" width="20" height="10" fill="#22252e"/>
    <!-- awning -->
    <path d="M40 206H524L544 240H20Z" fill="url(#${id}aw)"/><path d="M40 206H524L544 240H20Z" fill="#000" opacity=".06"/>
    <path d="M20 240H544V250H20Z" fill="#17803b"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${42 + i * 44}" cy="250" r="11" fill="${i % 2 ? '#f4f6fb' : '#1f9d4a'}"/>`).join('')}
    <rect x="20" y="250" width="524" height="10" fill="#000" opacity=".12"/>
    <!-- window -->
    <rect x="48" y="266" width="320" height="156" fill="#24150e"/>
    <rect x="56" y="274" width="304" height="140" fill="url(#${id}in)"/>
    <rect x="56" y="274" width="304" height="140" fill="var(--interior-light)"/>
    <g filter="url(#${id}glow)" class="neon neon-a"><text x="208" y="300" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="20" fill="#ffd166" letter-spacing="2">NET CAFE</text></g>
    <g class="pendants">${[110, 208, 306].map((x) => `<rect x="${x - 1}" y="274" width="2" height="8" fill="#000"/><path d="M${x - 9} 290h18l-4-8h-10Z" fill="#111"/><ellipse cx="${x}" cy="292" rx="10" ry="4" fill="#ffe7a1" opacity=".6"/>`).join('')}</g>
    ${monitors}
    <rect x="58" y="342" width="300" height="7" fill="#3a2a20"/>
    <g class="kbd">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${74 + i * 47}" y="343" width="30" height="3" rx="1" fill="url(#${id}rgb)"/>`).join('')}</g>
    <linearGradient id="${id}rgb"><stop offset="0" stop-color="#ff5a52"/><stop offset=".33" stop-color="#ffd166"/><stop offset=".66" stop-color="#4ed8be"/><stop offset="1" stop-color="#8e67ff"/></linearGradient>
    ${patrons}
    <path d="M56 274H150L56 380Z" fill="#fff" opacity=".07"/><path d="M190 274H232L120 414H78Z" fill="#fff" opacity=".05"/>
    <rect x="48" y="414" width="320" height="10" fill="#1b100a"/>
    <!-- door -->
    <rect x="392" y="270" width="112" height="170" fill="#24150e"/>
    <rect x="400" y="278" width="96" height="162" fill="#13203a"/><rect x="400" y="278" width="96" height="162" fill="url(#${id}door)" class="door-light"/>
    <rect x="447" y="278" width="2" height="162" fill="#24150e"/>
    <rect x="436" y="350" width="4" height="30" rx="2" fill="#e8b84a"/><rect x="456" y="350" width="4" height="30" rx="2" fill="#e8b84a"/>
    <g filter="url(#${id}glow)" class="neon neon-c"><rect x="418" y="290" width="60" height="20" rx="5" fill="none" stroke="#3fdc6a" stroke-width="2"/><text x="448" y="304.5" text-anchor="middle" font-family="Inter,Arial" font-weight="800" font-size="9.5" fill="#3fdc6a">OPEN 24/7</text></g>
    <path d="M400 278H440L400 330Z" fill="#fff" opacity=".08"/>
    <!-- base -->
    <rect x="16" y="436" width="532" height="14" fill="var(--curb)"/><path d="M548 436l60-30v14l-60 30Z" fill="var(--curb)"/><path d="M548 436l60-30v14l-60 30Z" fill="#000" opacity=".2"/>
    <rect x="16" y="436" width="532" height="3" fill="#fff" opacity=".25"/>
    </svg>`
  }

  /* ---------------- skyline ---------------- */
  function skyline() {
    // deterministic little city
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    let x = 0
    let s = ''
    while (x < 1600) {
      const w = 60 + Math.floor(rnd() * 90)
      const h = 90 + Math.floor(rnd() * 210)
      const y = 320 - h
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--city)"/>`
      if (rnd() > 0.6) s += `<rect x="${x + w / 2 - 2}" y="${y - 26}" width="4" height="26" fill="var(--city)"/><circle cx="${x + w / 2}" cy="${y - 28}" r="3" class="beacon"/>`
      for (let wy = y + 14; wy < 300; wy += 22)
        for (let wx = x + 10; wx < x + w - 14; wx += 18) if (rnd() > 0.45) s += `<rect x="${wx}" y="${wy}" width="8" height="10" fill="var(--city-win)" class="${rnd() > 0.85 ? 'win-blink' : ''}"/>`
      x += w + 6 + Math.floor(rnd() * 30)
    }
    return `<svg viewBox="0 0 1600 320" preserveAspectRatio="xMidYMax slice" class="skyline" aria-hidden="true">${s}</svg>`
  }

  function cloud(variant = 0) {
    const shapes = [
      '<rect x="20" y="40" width="180" height="34" rx="17"/><rect x="52" y="20" width="76" height="44" rx="22"/><rect x="110" y="8" width="70" height="56" rx="28"/>',
      '<rect x="0" y="36" width="150" height="30" rx="15"/><rect x="26" y="14" width="62" height="40" rx="20"/><rect x="70" y="24" width="56" height="30" rx="15"/>',
      '<rect x="10" y="30" width="120" height="26" rx="13"/><rect x="40" y="12" width="54" height="36" rx="18"/>',
    ]
    const vb = ['0 0 220 80', '0 0 160 70', '0 0 140 60'][variant % 3]
    return `<svg viewBox="${vb}" aria-hidden="true"><g fill="currentColor">${shapes[variant % 3]}</g></svg>`
  }

  function logoMark(size = 34) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" class="logo-mark">
      <rect x="15" y="2" width="12" height="7" rx="2" fill="#1fb653"/><rect x="15" y="2" width="12" height="3" rx="1.5" fill="#7cf0a0"/>
      <rect x="37" y="2" width="12" height="7" rx="2" fill="#1fb653"/><rect x="37" y="2" width="12" height="3" rx="1.5" fill="#7cf0a0"/>
      <rect x="4" y="8" width="56" height="52" rx="12" fill="#0d7a34"/>
      <rect x="4" y="6" width="56" height="48" rx="12" fill="#22c25a"/>
      <rect x="8" y="9" width="48" height="6" rx="3" fill="#fff" opacity=".28"/>
      <rect x="13" y="22" width="38" height="11" rx="4" fill="#101522"/><rect x="16" y="24" width="9" height="3" rx="1.5" fill="#fff" opacity=".7"/>
      <path d="M21 41q11 8 22 0" fill="none" stroke="#101522" stroke-width="4.4" stroke-linecap="round"/></svg>`
  }

  window.Art = { avatar, head, brick, coin, bill, atm, plant, lamp, cafe, skyline, cloud, logoMark, monitorMini, shade, box }
})()
