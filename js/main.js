/* Trench County — site script. No libraries.
   header state, mobile menu, scroll reveals, the coin ticker, the live ROL price (SOL spot, kept between $90 and
   $150 like the game), a playable TC Terminal on a pump.fun curve with play money, and the town map. */
(function () {
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
  const head = (seed, size) => (window.TC && window.TC.coinHead ? window.TC.coinHead(seed, size) : '')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------- header + menu ---------- */
  const header = $('#header')
  const onScroll = () => header.classList.toggle('solid', scrollY > 40)
  addEventListener('scroll', onScroll, { passive: true }); onScroll()
  const menuBtn = $('#menuBtn'), mobileNav = $('#mobileNav')
  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open')
    menuBtn.setAttribute('aria-expanded', String(open))
  })
  $$('a', mobileNav).forEach((a) => a.addEventListener('click', () => { mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false') }))

  /* ---------- reveals ---------- */
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -4% 0px' })
    $$('[data-reveal]').forEach((el) => io.observe(el))
  } else $$('[data-reveal]').forEach((el) => el.classList.add('in'))

  /* ---------- intro video ---------- */
  $$('[data-play-intro]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault()
    const v = $('#introVideo')
    $('#intro').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    setTimeout(() => { v.play().catch(() => {}) }, reduced ? 0 : 700)
  }))

  /* ---------- formatting ---------- */
  const usd = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : '$' + n.toFixed(0)
  const num = (n, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  const tok = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : n.toFixed(0)

  /* ---------- live ROL price: SOL spot, clamped like the game ---------- */
  let rolUsd = 110
  const setRol = (v) => {
    rolUsd = Math.min(150, Math.max(90, v))
    $('#heroRol').textContent = '$' + rolUsd.toFixed(0)
  }
  fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot').then((r) => r.json())
    .then((d) => { const v = parseFloat(d && d.data && d.data.amount); if (v > 1) setRol(v) }).catch(() => {})

  /* ---------- the curve (pump.fun constants) ---------- */
  const VS0 = 30, VT0 = 1073000000, K = VS0 * VT0, SUPPLY = 1e9, GRAD = 85
  function Coin(t, name, seed, start) {
    this.t = t; this.name = name; this.seed = seed
    this.vs = VS0; this.vt = VT0; this.holders = 1 + Math.floor(Math.random() * 12)
    this.candles = []; this.trades = []
    this.buy(start, true)
    this.startMc = this.mcRol(); this.launchMc = (VS0 / VT0) * SUPPLY
  }
  Coin.prototype.price = function () { return this.vs / this.vt }
  Coin.prototype.mcRol = function () { return this.price() * SUPPLY }
  Coin.prototype.real = function () { return this.vs - VS0 }
  Coin.prototype.buy = function (sol, quiet) {
    if (this.real() + sol > GRAD) sol = Math.max(0, GRAD - this.real())
    const out = this.vt - K / (this.vs + sol)
    this.vs += sol; this.vt -= out
    if (!quiet) this.mark()
    return out
  }
  Coin.prototype.sell = function (tokens, quiet) {
    const out = this.vs - K / (this.vt + tokens)
    this.vt += tokens; this.vs -= out
    if (!quiet) this.mark()
    return out
  }
  const CANDLE_MS = 2500
  Coin.prototype.mark = function () {
    const mc = this.mcRol(), now = Date.now(), b = Math.floor(now / CANDLE_MS)
    const last = this.candles[this.candles.length - 1]
    if (last && last.b === b) { last.h = Math.max(last.h, mc); last.l = Math.min(last.l, mc); last.c = mc }
    else this.candles.push({ b, o: last ? last.c : mc, h: mc, l: mc, c: mc })
    if (this.candles.length > 80) this.candles.shift()
  }

  const NAMES = [['$NOOB', 'Noob Coin'], ['$TRENCH', 'Trench'], ['$BARISTA', 'Flat White'], ['$OOF', 'Oof'], ['$SUIT', 'Three Piece'], ['$GASMONEY', 'Gas Money'], ['$BACON', 'Bacon Hair'], ['$RUNNER', 'Runner']]
  const coins = NAMES.map((n, i) => new Coin(n[0], n[1], 7 + i * 131, 0.6 + Math.random() * 30))
  // a bit of history so the charts don't start empty
  coins.forEach((c) => {
    const t0 = Date.now() - 60 * CANDLE_MS
    for (let i = 0; i < 60; i++) {
      const b = Math.floor((t0 + i * CANDLE_MS) / CANDLE_MS)
      const o = c.mcRol()
      for (let j = 0; j < 3; j++) { const r = Math.random(); if (r < 0.54) c.buy(0.04 + Math.random() ** 2 * 1.1, true); else c.sell((VT0 - c.vt) * (0.01 + Math.random() * 0.05), true) }
      const cl = c.mcRol()
      c.candles.push({ b, o, h: Math.max(o, cl) * (1 + Math.random() * 0.01), l: Math.min(o, cl) * (1 - Math.random() * 0.01), c: cl })
    }
  })

  /* ---------- ticker ---------- */
  const ticker = $('#ticker')
  function paintTicker() {
    const items = coins.map((c) => {
      const ch = (c.mcRol() / c.launchMc - 1) * 100
      return `<span class="tk">${head(c.seed, 22)}<b>${c.t}</b>${usd(c.mcRol() * rolUsd)}<span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${ch.toFixed(0)}%</span></span>`
    }).join('')
    ticker.innerHTML = items + items
  }
  paintTicker()

  /* ---------- terminal ---------- */
  const wallet = { rol: 10, pos: new Map() }   // pos: coin -> { tokens, cost }
  let active = coins[0], side = 'buy', amount = 0.5
  const ui = {
    list: $('#tCoins'), icon: $('#tIcon'), tk: $('#tTicker'), full: $('#tFull'), mc: $('#tMc'), chg: $('#tChg'), hold: $('#tHold'),
    curve: $('#tCurve'), curvePct: $('#tCurvePct'), amt: $('#tAmt'), go: $('#tGo'), chips: $('#tChips'),
    wallet: $('#tWallet'), pos: $('#tPos'), pnl: $('#tPnl'), feed: $('#tFeed'), canvas: $('#tChart'),
  }

  function paintList() {
    ui.list.innerHTML = coins.map((c, i) => {
      const ch = (c.mcRol() / c.launchMc - 1) * 100
      return `<li><button class="t-coin${c === active ? ' on' : ''}" data-i="${i}">${head(c.seed, 34)}<span><b>${c.t}</b><small>${usd(c.mcRol() * rolUsd)}</small></span><span class="pct ${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${ch.toFixed(0)}%</span></button></li>`
    }).join('')
  }
  ui.list.addEventListener('click', (e) => {
    const b = e.target.closest('.t-coin'); if (!b) return
    active = coins[+b.dataset.i]; ui.feed.innerHTML = ''; paintAll()
  })

  function paintHead() {
    ui.icon.innerHTML = head(active.seed, 38)
    ui.tk.textContent = active.t; ui.full.textContent = active.name
    ui.mc.textContent = usd(active.mcRol() * rolUsd)
    const ch = (active.mcRol() / active.launchMc - 1) * 100
    ui.chg.textContent = (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%'
    ui.chg.className = ch >= 0 ? 'up' : 'down'
    ui.hold.textContent = active.holders
    const p = Math.min(100, (active.real() / GRAD) * 100)
    ui.curve.style.width = p.toFixed(1) + '%'; ui.curvePct.textContent = p.toFixed(0) + '%'
  }
  function paintSide() {
    ui.wallet.textContent = num(wallet.rol) + ' ROL'
    const p = wallet.pos.get(active)
    if (p && p.tokens > 1) {
      const worth = active.vs - K / (active.vt + p.tokens)
      const pnl = worth - p.cost
      ui.pos.textContent = tok(p.tokens)
      ui.pnl.textContent = (pnl >= 0 ? '+' : '') + num(pnl, 3)
      ui.pnl.className = pnl >= 0 ? 'up' : 'down'
    } else { ui.pos.textContent = '0'; ui.pnl.textContent = '0.00'; ui.pnl.className = '' }
    ui.go.textContent = (side === 'buy' ? 'Buy ' : 'Sell ') + active.t
    ui.go.className = 'go ' + side
  }
  function feed(kind, rol, who) {
    const li = document.createElement('li')
    li.innerHTML = `<b class="${kind}">${kind === 'buy' ? 'Buy' : 'Sell'}</b><span>${num(rol, 3)} ROL</span><span>${who}</span>`
    ui.feed.prepend(li)
    while (ui.feed.children.length > 9) ui.feed.lastChild.remove()
  }

  // chart
  const ctx = ui.canvas.getContext('2d')
  function niceStep(span) {
    const raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p
  }
  function drawChart() {
    const box = ui.canvas.getBoundingClientRect()
    if (!box.width) return
    const dpr = Math.min(2, devicePixelRatio || 1)
    if (ui.canvas.width !== Math.round(box.width * dpr) || ui.canvas.height !== Math.round(box.height * dpr)) {
      ui.canvas.width = Math.round(box.width * dpr); ui.canvas.height = Math.round(box.height * dpr)
    }
    const W = box.width, H = box.height
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const axis = 64, padT = 16, padB = 18, plotW = W - axis - 10, plotH = H - padT - padB
    const n = Math.max(20, Math.floor(plotW / 9))
    const cs = active.candles.slice(-n)
    if (!cs.length) return
    let lo = Infinity, hi = -Infinity
    cs.forEach((c) => { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h) })
    lo *= rolUsd; hi *= rolUsd
    const pad = (hi - lo) * 0.12 || hi * 0.05
    lo -= pad; hi += pad
    const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * plotH
    // grid + axis ticks
    const step = niceStep(hi - lo)
    ctx.font = '500 10px JetBrains Mono, monospace'; ctx.textBaseline = 'middle'
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      const yy = Math.round(y(v)) + 0.5
      ctx.strokeStyle = 'rgba(125,138,166,0.10)'; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W - axis, yy); ctx.stroke()
      ctx.fillStyle = '#5f6b86'; ctx.fillText(usd(v), W - axis + 8, yy)
    }
    const bw = plotW / n, body = Math.max(2, bw * 0.62)
    cs.forEach((c, i) => {
      const x = 6 + i * bw + bw / 2
      const up = c.c >= c.o, col = up ? '#4ed8be' : '#f26d7e'
      ctx.strokeStyle = col; ctx.fillStyle = col
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, y(c.h * rolUsd)); ctx.lineTo(Math.round(x) + 0.5, y(c.l * rolUsd)); ctx.stroke()
      const y1 = y(Math.max(c.o, c.c) * rolUsd), y2 = y(Math.min(c.o, c.c) * rolUsd)
      ctx.fillRect(Math.round(x - body / 2), y1, Math.round(body), Math.max(1, y2 - y1))
    })
    // last price tag
    const last = cs[cs.length - 1], ly = y(last.c * rolUsd), up = last.c >= last.o
    ctx.fillStyle = up ? '#4ed8be' : '#f26d7e'
    ctx.fillRect(W - axis + 2, ly - 9, axis - 6, 18)
    ctx.fillStyle = up ? '#062019' : '#2a0a10'; ctx.font = '600 10px JetBrains Mono, monospace'
    ctx.fillText(usd(last.c * rolUsd), W - axis + 7, ly)
  }

  function paintAll() { paintList(); paintHead(); paintSide(); drawChart() }

  // the side panel
  function setSide(s) {
    side = s
    $$('.seg button').forEach((b) => { const on = b.dataset.side === s; b.classList.toggle('on', on); b.setAttribute('aria-selected', on) })
    const labels = s === 'buy' ? ['0.1', '0.5', '1', 'Max'] : ['25%', '50%', '75%', '100%']
    $$('button', ui.chips).forEach((b, i) => { b.textContent = labels[i]; b.classList.toggle('on', i === 1) })
    ui.amt.value = s === 'buy' ? '0.5' : '50'
    ui.amt.nextElementSibling.textContent = s === 'buy' ? 'ROL' : '%'
    paintSide()
  }
  $$('.seg button').forEach((b) => b.addEventListener('click', () => setSide(b.dataset.side)))
  ui.chips.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return
    $$('button', ui.chips).forEach((x) => x.classList.toggle('on', x === b))
    const t = b.textContent
    if (side === 'buy') ui.amt.value = t === 'Max' ? num(wallet.rol, 2).replace(/,/g, '') : t
    else ui.amt.value = parseFloat(t)
  })
  ui.go.addEventListener('click', () => {
    const v = parseFloat(String(ui.amt.value).replace(/,/g, ''))
    if (!(v > 0)) return
    const p = wallet.pos.get(active) || { tokens: 0, cost: 0 }
    if (side === 'buy') {
      const sol = Math.min(v, wallet.rol); if (sol <= 0.0001) return
      const got = active.buy(sol)
      wallet.rol -= sol; p.tokens += got; p.cost += sol
      if (p.tokens === got) active.holders++
      wallet.pos.set(active, p); feed('buy', sol, 'you')
    } else {
      if (!p.tokens) return
      const amtTok = p.tokens * Math.min(1, v / 100)
      const got = active.sell(amtTok)
      p.cost *= 1 - amtTok / p.tokens; p.tokens -= amtTok
      wallet.rol += got; wallet.pos.set(active, p); feed('sell', got, 'you')
    }
    paintAll()
  })

  // the room: other traders on every coin, a little more on the one you're watching
  const WHO = ['dazzox', 'baconhair22', 'trenchrat', 'Builderman_Jr', 'flatwhite', 'gasmoney', 'xXsniperXx', 'ruggedagain', 'sweeper_dan', 'hillhouse']
  function tickRoom() {
    const c = Math.random() < 0.6 ? active : coins[Math.floor(Math.random() * coins.length)]
    const fill = c.real() / GRAD
    const buyBias = fill > 0.85 ? 0.32 : fill < 0.05 ? 0.8 : 0.53
    if (Math.random() < buyBias) {
      const sol = +(0.03 + Math.random() ** 2 * 1.4).toFixed(3)
      c.buy(sol); if (Math.random() < 0.15) c.holders++
      if (c === active) feed('buy', sol, WHO[Math.floor(Math.random() * WHO.length)])
    } else {
      const tokens = (VT0 - c.vt) * (0.01 + Math.random() ** 2 * 0.07)
      if (tokens > 0) { const got = c.sell(tokens); if (c === active) feed('sell', got, WHO[Math.floor(Math.random() * WHO.length)]) }
    }
    paintHead(); paintSide(); drawChart()
    setTimeout(tickRoom, 450 + Math.random() * 900)
  }
  setInterval(() => { coins.forEach((c) => c.mark()); paintList(); paintTicker(); drawChart() }, CANDLE_MS)
  addEventListener('resize', drawChart)
  paintAll(); setSide('buy')
  // only run the room while the terminal could be seen (keeps idle tabs quiet)
  let started = false
  const termEl = $('#term')
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; tickRoom() } }).observe(termEl)
  } else { started = true; tickRoom() }

  // os clock
  const osTime = $('#osTime')
  const clock = () => { osTime.textContent = new Date().toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  clock(); setInterval(clock, 20000)

  /* ---------- town map ---------- */
  // map image covers X -400..640, Z -640..260 studs (the in-game map, cropped to the town and the north shore)
  const X0 = -400, X1 = 640, Z0 = -640, Z1 = 260
  const PLACES = [
    { n: 'Trench Cafe', x: 6, z: -49, k: 'Main Street', img: 'cafe-evening', t: 'Where everyone spawns. Eight PCs running TrenchOS, an espresso machine you can work, a radio on the back counter and the market screen on the wall.' },
    { n: 'VELLANO', x: -205, z: 95, k: 'Main Street, west', img: 'vellano', t: 'A 1920s brick motor works turned dealership. The book of cars on the mahogany desk, forecourt bays out front: Goteborg 240 to Zuffen 992.' },
    { n: 'MONARCH', x: 420, z: 185, k: 'Market Row', img: 'monarch', t: 'Limestone hall, burgundy carpet, chandeliers. Baccarat, sic bo, blackjack, slots, red or black and a crash screen. Free chips daily at the cage.' },
    { n: 'Halloran Garage', x: 303, z: 185, k: 'NewTown Avenue', img: 'garage', t: 'An old working garage. Drive in, the car goes up on the two-post lift: repairs priced by the damage, resprays for body, wheels and calipers.' },
    { n: 'MERIDIAN', x: 494, z: -7, k: 'Main Street, east', img: 'meridian', t: 'The modern filling station: eight pumps, a shop with a window bar, a pergola lounge round a gas fire.' },
    { n: 'AUREUM', x: 472, z: 179, k: 'Market Row', img: null, t: 'Jeweller and leather goods. Rope, Cuban and tennis chains, a gold coin pendant, and three briefcases that hold your cash.' },
    { n: 'Liberty Arms', x: -140, z: 58, k: 'Main Street', img: null, t: 'A Victorian gunsmith. Glock 17 to M60, bandages and med kits. One gun carried at a time.' },
    { n: 'Greys', x: -105, z: -40, k: 'Main Street', img: null, t: 'The tailor. Real Roblox classic suits on twelve mannequins, full looks ten percent off, chains and cases fitted at the mirror.' },
    { n: 'RBX Savings & Trust', x: 74, z: -66, k: 'Main Street', img: null, t: 'The bank. Money in here is safe when you go down. ATMs on the street, $100,000 a transaction.' },
    { n: 'Filling Station', x: -203, z: -21, k: 'The Crescent', img: null, t: 'The old downtown station: a brick cottage, a gabled canopy and period pumps with globes.' },
    { n: 'Houses on the hill', x: -72, z: -199, k: 'The Crescent & Hill Road', img: 'glass-house', home: true, t: 'Five homes from a $15,000 cottage to the $1.5M Summit Estate. Owner-only doors, your own PC, coffee, a fire, and your car parked in the garage.' },
    { n: 'North Shore', x: -34, z: -552, k: 'Coast Road', img: 'north-shore', t: 'Hill Road runs north through a cut to the coast: three roundabouts, a beach car park, a lookout, and the highway west to West End.' },
  ]
  const HOMES = [[-142, -165], [49, -391], [90, -144], [-223, -111]]
  const pins = $('#pins')
  const pct = (x, z) => [((x - X0) / (X1 - X0)) * 100, ((z - Z0) / (Z1 - Z0)) * 100]
  let html = ''
  PLACES.forEach((p, i) => {
    const [l, t] = pct(p.x, p.z)
    html += `<button class="pin${p.home ? ' home' : ''}" style="left:${l}%;top:${t}%" data-i="${i}" aria-label="${p.n}"><span>${p.n}</span></button>`
  })
  HOMES.forEach(([x, z]) => { const [l, t] = pct(x, z); html += `<button class="pin home" style="left:${l}%;top:${t}%" data-i="10" aria-label="Houses on the hill"><span>House</span></button>` })
  html += `<button class="pin edge" style="left:1.5%;top:${pct(0, 110)[1]}%" data-edge="1" aria-label="West End"><span>&larr; West End</span></button>`
  pins.innerHTML = html
  const pImg = $('#placeImg'), pFig = pImg.parentElement
  function showPlace(i) {
    const p = PLACES[i]
    $$('.pin', pins).forEach((b) => b.classList.toggle('on', +b.dataset.i === i && !b.dataset.edge))
    $('#placeName').textContent = p.n; $('#placeKicker').textContent = p.k; $('#placeText').textContent = p.t
    if (p.img) { pFig.classList.remove('none'); pImg.src = '/img/shots/' + p.img + '.webp'; pImg.alt = p.n } else pFig.classList.add('none')
  }
  pins.addEventListener('click', (e) => {
    const b = e.target.closest('.pin'); if (!b) return
    if (b.dataset.edge) {
      $('#placeName').textContent = 'West End'; $('#placeKicker').textContent = 'End of the highway'
      $('#placeText').textContent = 'A second town at the end of the highway, by the sea. Streets, kerbs and lamps are down; the buildings come next.'
      pFig.classList.add('none'); $$('.pin', pins).forEach((x) => x.classList.toggle('on', x === b)); return
    }
    showPlace(+b.dataset.i)
  })
  showPlace(0)
})()
