/* RBXfun — page behaviour: art placement, hero scene, terminal, pulse, leaderboard */
(function () {
  const A = window.Art
  const root = document.documentElement
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s))
  const rand = (a, b) => a + Math.random() * (b - a)
  const randi = (a, b) => Math.floor(rand(a, b + 1))
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ------------------------------------------------------------------ data */
  const COINS = [
    { t: 'NOOB', n: 'Noob Coin', head: { skin: '#f5cd30', faceKind: 'smile', bg: '#3d8bff' } },
    { t: 'OOF', n: 'Oof Token', head: { skin: '#ffd9b8', faceKind: 'oof', bg: '#ff5a52' } },
    { t: 'BACON', n: 'Bacon Hair', head: { skin: '#ffd9b8', hair: 'bacon', hairColor: '#8a4b2a', bg: '#ff9f43' } },
    { t: 'SUIT', n: 'Executive', head: { skin: '#ffd9b8', hair: 'spiky', faceKind: 'shades', bg: '#19a64b' } },
    { t: 'OBBY', n: 'Obby Inu', head: { skin: '#ffd9b8', hair: 'cap', hairColor: '#8e67ff', faceKind: 'grin', bg: '#6c45e0' } },
    { t: 'TIX', n: 'Retired Tix', head: { skin: '#ffcd35', faceKind: 'money', bg: '#c48d00' } },
    { t: 'GUEST', n: 'Guest 1337', head: { skin: '#e3e6ec', hair: 'cap', hairColor: '#2a2f3a', faceKind: 'smug', bg: '#4b505e' } },
    { t: 'BRICK', n: 'Brick by Brick', head: { skin: '#e8392f', faceKind: 'grin', bg: '#7a3e22' } },
    { t: 'CAFE', n: 'Cafe Coin', head: { skin: '#c68b59', hair: 'tophat', hairColor: '#1b1e27', faceKind: 'smug', bg: '#ffc933' } },
    { t: 'MOON', n: 'Moonblox', head: { skin: '#dbe4ff', faceKind: 'wow', bg: '#0e2155' } },
    { t: 'KING', n: 'Server King', head: { skin: '#ffd9b8', hair: 'crown', faceKind: 'smile', bg: '#ff5a52' } },
    { t: 'SLIDE', n: 'Slide Down', head: { skin: '#4ed8be', faceKind: 'wow', bg: '#0d7a34' } },
  ]
  const EXTRA = ['PIZZA', 'SWORD', 'TYCOON', 'RAINBOW', 'BLOXY', 'CHEESE', 'SPEED', 'FROGGY', 'GLITCH', 'LAVA', 'ADMIN', 'BANANA', 'NINJA', 'TOAST', 'CHAIR', 'WIFI', 'PCGAMER', 'LAG']
  const SKINS = ['#ffd9b8', '#f5cd30', '#c68b59', '#8a5a3c', '#e3e6ec', '#4ed8be', '#ffb3c7', '#9ad0ff']
  const BGS = ['#3d8bff', '#ff5a52', '#ff9f43', '#19a64b', '#8e67ff', '#ffc933', '#0e2155', '#4b505e', '#e8392f', '#13a8a8']
  const FACES = ['smile', 'grin', 'smug', 'wow', 'oof', 'shades', 'money']
  const HAIRS = ['none', 'spiky', 'cap', 'bacon', 'tophat', 'crown', 'none']
  const NAMES = ['noob_42', 'baconator', 'obbymaster', 'xX_trader_Xx', 'guest_1337', 'builder_bob', 'sir_pumps', 'dumpling', 'moonwalker', 'tixhoarder', 'rektangle', 'paperhands', 'diamondblox', 'cafe_regular', 'mr_exec', 'chartlord']

  const randomHead = () => ({ skin: pick(SKINS), faceKind: pick(FACES), hair: pick(HAIRS), hairColor: pick(['#1b1e27', '#8a4b2a', '#7a4cff', '#e8392f', '#3d8bff']), bg: pick(BGS) })
  const icon = (c, size = 40) => A.head({ ...c.head, size })

  const PRESETS = {
    exec: { suit: true, jacket: '#5b5f6b', tie: '#c0392b', hair: 'spiky', briefcase: true, pants: '#4f5360', faceKind: 'smile' },
    waver: { skin: '#f5cd30', shirt: '#3d8bff', pants: '#5fbf3a', shoes: '#4a9a2c', hair: 'none', wave: true, faceKind: 'grin' },
    phone: { skin: '#ffd9b8', shirt: '#8e67ff', pants: '#2a2f3a', hair: 'bacon', hairColor: '#8a4b2a', faceKind: 'shades', phone: true },
    king: { suit: true, jacket: '#1b1e27', tie: '#ffc933', hair: 'crown', faceKind: 'shades', pants: '#1b1e27', wave: true },
    green: { skin: '#ffd9b8', shirt: '#3fcf4a', pants: '#b98b5a', hair: 'cap', hairColor: '#7a4cff', faceKind: 'smile' },
    red: { skin: '#8a5a3c', shirt: '#e8392f', pants: '#2a2f3a', hair: 'cap', hairColor: '#1f6fff', faceKind: 'grin', wave: true },
    tophat: { suit: true, jacket: '#2c3550', tie: '#19a64b', hair: 'tophat', hairColor: '#1b1e27', faceKind: 'smug', skin: '#c68b59', briefcase: true },
  }

  const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : n.toFixed(0))
  const fmtMoney = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtPrice = (p) => {
    if (p >= 1) return p.toFixed(3)
    const z = Math.max(0, -Math.floor(Math.log10(p)) - 1)
    return p.toFixed(z + 3)
  }

  /* ------------------------------------------------------------------ art */
  function paintArt() {
    $$('[data-art]').forEach((el) => {
      const k = el.dataset.art
      if (k === 'logo') el.innerHTML = A.logoMark(+el.dataset.size || 34)
      else if (k === 'skyline') el.innerHTML = A.skyline()
      else if (k === 'cloud') el.innerHTML = A.cloud(+el.dataset.v || 0)
      else if (k === 'cafe') el.innerHTML = A.cafe()
      else if (k === 'atm') el.innerHTML = A.atm()
      else if (k === 'plant') el.innerHTML = A.plant()
      else if (k === 'lamp') el.innerHTML = A.lamp()
      else if (k === 'avatar') el.innerHTML = A.avatar({ ...PRESETS[el.dataset.preset], width: 112 })
      else if (k === 'coin') el.innerHTML = A.coin({ size: +el.dataset.size || 56, faceKind: el.dataset.face })
      else if (k === 'step') el.innerHTML = stepArt(+el.dataset.step)
      else if (k === 'feat') el.innerHTML = featArt(el.dataset.k)
    })
    $$('.scene-coin').forEach((el, i) => {
      el.innerHTML = `<span style="--i:${i}"><span style="animation-delay:${-i * 1.3}s">${A.coin({ size: 100, faceKind: el.dataset.face, tone: el.dataset.tone, rotate: -16 + i * 9 })}</span></span>`
    })
    $$('.scene-bill').forEach((el, i) => {
      el.innerHTML = `<span style="--i:${i + 5}"><span style="animation-delay:${-i * 2}s">${A.bill({ width: 64, rotate: +el.dataset.r })}</span></span>`
    })
  }

  function stepArt(n) {
    if (n === 1) {
      const door = `<svg viewBox="0 0 90 110" width="80" aria-hidden="true">
        <rect x="0" y="0" width="90" height="110" fill="var(--brick-wall)"/><path d="M0 14H90M0 28H90M0 42H90M0 56H90M0 70H90M0 84H90M0 98H90" stroke="var(--brick-mortar)" stroke-width="1.4"/>
        <rect x="18" y="26" width="56" height="84" fill="#24150e"/><rect x="23" y="31" width="46" height="79" fill="#13203a"/><rect x="23" y="31" width="46" height="79" fill="#ffc96b" opacity=".35"/>
        <rect x="58" y="66" width="3" height="16" rx="1.5" fill="#e8b84a"/><rect x="30" y="38" width="32" height="11" rx="3" fill="none" stroke="#3fdc6a" stroke-width="1.6"/>
        <text x="46" y="46.5" text-anchor="middle" font-family="Inter,Arial" font-weight="800" font-size="7" fill="#3fdc6a">OPEN</text></svg>`
      return `<div class="art-row">${door}${A.avatar({ ...PRESETS.waver, width: 56, wave: false })}</div>`
    }
    if (n === 2) return `<div class="art-row" style="position:relative">${A.monitorMini({ width: 130 })}<span class="art-pop" style="position:absolute;left:58%;top:-18px">${A.coin({ size: 48, faceKind: 'shades' })}</span></div>`
    if (n === 3) {
      const hs = [34, 46, 40, 58, 52, 70, 64, 86]
      return `<div class="art-row"><div class="art-bars">${hs.map((h, i) => `<i class="${i === 2 || i === 6 ? 'dn' : ''}" style="height:${h}px;animation-delay:${-i * 0.3}s"></i>`).join('')}</div>${A.avatar({ ...PRESETS.phone, width: 50 })}</div>`
    }
    const cap = `<svg viewBox="0 0 60 34" width="50" aria-hidden="true" style="margin-bottom:-14px;position:relative;z-index:2"><path d="M30 2 58 13 30 24 2 13Z" fill="#1b1e27"/><path d="M14 18v8q16 8 32 0v-8L30 24Z" fill="#2a2f3a"/><path d="M50 16v12" stroke="#ffc933" stroke-width="2"/><circle cx="50" cy="29" r="2.5" fill="#ffc933"/></svg>`
    return `<div class="art-row" style="flex-direction:column;align-items:center;gap:0;margin-bottom:8px"><span class="art-pop" style="display:flex;flex-direction:column;align-items:center;margin-bottom:-6px;position:relative;z-index:2">${cap.replace('width="50"', 'width="40"')}${A.coin({ size: 44, faceKind: 'smile' })}</span>${A.brick({ cols: 3, rows: 3, color: '#ffc933', h: 16, width: 84 })}</div>`
  }

  function featArt(k) {
    if (k === 'pcs') return [0, 1, 2].map(() => A.monitorMini({ width: 76 })).join('')
    if (k === 'server') return COINS.slice(0, 5).map((c) => A.head({ ...c.head, bg: null, size: 50 })).join('')
    if (k === 'suit') return `${A.avatar({ ...PRESETS.waver, wave: false, width: 46 })}<svg viewBox="0 0 30 20" width="30" style="margin-bottom:34px" aria-hidden="true"><path d="M2 10h22m-7-7 7 7-7 7" fill="none" stroke="var(--primary)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>${A.avatar({ ...PRESETS.exec, width: 52 })}`
    if (k === 'pump') return `${A.brick({ cols: 2, rows: 2, color: '#3d8bff', width: 54 })}${A.brick({ cols: 2, rows: 2, color: '#ff5a52', h: 30, width: 54 })}${A.brick({ cols: 2, rows: 2, color: '#ffc933', h: 46, width: 54 })}${A.brick({ cols: 2, rows: 2, color: '#19a64b', h: 64, width: 54 })}<span class="art-pop" style="margin-bottom:58px">${A.coin({ size: 50, faceKind: 'shades' })}</span>`
    if (k === 'atm') return `<span style="width:52px">${A.atm()}</span><span style="margin-bottom:6px">${A.bill({ width: 58, rotate: -10 })}</span><span style="margin-bottom:30px">${A.bill({ width: 50, rotate: 14 })}</span>`
    return ''
  }

  /* ------------------------------------------------------------------ chrome */
  function initChrome() {
    const header = $('#header')
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 20)
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    $('#themeToggle').addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      root.dataset.theme = next
      try { localStorage.setItem('rbxfun:theme', next) } catch (e) {}
      $('meta[name=theme-color]').setAttribute('content', next === 'dark' ? '#0b1122' : '#eef2f8')
    })

    const menuBtn = $('#menuBtn')
    const mnav = $('#mobileNav')
    menuBtn.addEventListener('click', () => {
      const open = mnav.classList.toggle('open')
      menuBtn.setAttribute('aria-expanded', String(open))
    })
    $$('a', mnav).forEach((a) => a.addEventListener('click', () => mnav.classList.remove('open')))

    // reveal on scroll
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    $$('[data-reveal]').forEach((el) => io.observe(el))

    $('#yr').textContent = new Date().getFullYear()
  }

  /* ------------------------------------------------------------------ hero scene */
  function initScene() {
    const term = $('#term')
    const screen = $('.monitor-screen')
    const fitTerm = () => {
      if (root.dataset.scene !== 'anim' || innerWidth < 900) { term.style.transform = ''; return }
      term.style.transform = `scale(${screen.clientWidth / 960})`
    }
    fitTerm()
    addEventListener('resize', fitTerm)
    if (root.dataset.scene !== 'anim') return

    const scene = $('#top')
    const stage = $('[data-stage]')
    const card = $('.scene-card')
    const copy = $('.hero-copy')
    const after = $('.scene-after')
    const bezel = $('.bezel')
    const stand = $('.stand')
    const hint = $('.scroll-hint')
    const props = $('.hero-props')
    const flyers = $$('.scene-coin, .scene-bill')
    let m = { t: 0, r: 0, b: 0, l: 0 }
    const clamp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
    const ease = (e) => (e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2)

    const measure = () => {
      const s = stage.getBoundingClientRect()
      const r = screen.getBoundingClientRect()
      m = { t: r.top - s.top, l: r.left - s.left, r: s.right - r.right, b: s.bottom - r.bottom }
      fitTerm()
    }
    const apply = (p) => {
      const t1 = ease(clamp(p, 0, 0.22))
      const t2 = ease(clamp(p, 0.1, 0.46))
      const t3 = ease(clamp(p, 0.42, 0.56))
      const t4 = ease(clamp(p, 0.48, 0.64))
      copy.style.opacity = Math.max(0, 1 - t1 * 1.4)
      copy.style.transform = `translate3d(0, ${-t1 * 70}px, 0)`
      hint.style.opacity = Math.max(0, 1 - t1 * 4)
      const vw = innerWidth / 100
      const vh = innerHeight / 100
      flyers.forEach((c) => {
        const fx = (+c.dataset.fx || 0) * vw
        const fy = (+c.dataset.fy || 0) * vh
        c.style.transform = `translate3d(${t1 * fx}px, ${t1 * fy}px, 0) rotate(${t1 * 70}deg)`
        c.style.opacity = 1 - t1
      })
      props.style.transform = `translate3d(0, ${t2 * 20}px, 0) scale(${1 + t2 * 0.08})`
      card.style.clipPath = t2 > 0.001 ? `inset(${t2 * m.t}px ${t2 * m.r}px ${t2 * m.b}px ${t2 * m.l}px round ${t2 * 10}px)` : 'none'
      screen.style.opacity = t3
      bezel.style.opacity = t3
      stand.style.opacity = t3
      bezel.style.transform = `scale(${1.03 - 0.03 * t3})`
      after.style.opacity = t4
      after.style.transform = `translate3d(0, ${(1 - t4) * 28}px, 0)`
      after.style.pointerEvents = t4 > 0.5 ? 'auto' : 'none'
      screen.style.pointerEvents = t3 > 0.5 ? 'auto' : 'none'
    }
    let raf = 0
    const tick = () => {
      raf = 0
      const r = scene.getBoundingClientRect()
      const p = clamp(-r.top, 0, Math.max(1, r.height - innerHeight))
      apply(p)
    }
    const req = () => { raf ||= requestAnimationFrame(tick) }
    measure()
    tick()
    addEventListener('scroll', req, { passive: true })
    addEventListener('resize', () => { measure(); req() })
    document.fonts && document.fonts.ready.then(() => { measure(); req() })

    // anchor links to the terminal land on the fully-formed monitor
    $$('a[href="#terminal"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        if (root.dataset.scene !== 'anim') return
        e.preventDefault()
        const top = scene.offsetTop + (scene.offsetHeight - innerHeight) * 0.7
        scrollTo({ top, behavior: 'smooth' })
      }),
    )
  }

  function initHeroLife() {
    const lines1 = ['gm traders', 'who launched $OOF?', 'buying the dip', 'suit check ✅', 'WAGMI', 'just graduated 🎓']
    const lines2 = ['$NOOB LFG', 'sell?? never', 'first PC is mine', 'LFG', 'oof', 'chart looks clean']
    const c1 = $('#chat1')
    const c2 = $('#chat2')
    let i = 0
    const swap = (el, txt) => {
      el.classList.add('swap')
      setTimeout(() => { el.textContent = txt; el.classList.remove('swap') }, 300)
    }
    setInterval(() => {
      i++
      if (i % 2) swap(c1, lines1[i % lines1.length])
      else swap(c2, lines2[i % lines2.length])
    }, 2400)

    const pop = $('#tradePop')
    const spots = [[44, 36], [18, 52], [70, 28], [36, 18], [62, 48]]
    setInterval(() => {
      if (document.hidden) return
      const c = pick(COINS)
      const buy = Math.random() > 0.3
      const [x, y] = pick(spots)
      pop.style.left = x + '%'
      pop.style.top = y + '%'
      pop.innerHTML = `${pick(NAMES)} <b class="${buy ? '' : 'sell'}">${buy ? 'bought' : 'sold'}</b> $${c.t} ${randi(5, 300)}`
      pop.classList.remove('go')
      void pop.offsetWidth
      pop.classList.add('go')
    }, 2600)
  }

  /* ------------------------------------------------------------------ ticker */
  function initTicker() {
    const items = COINS.map((c) => {
      const ch = rand(-35, 420)
      return `<span class="tk">${icon(c, 24)}<b>$${c.t}</b><span>${fmtK(rand(3000, 90000))}</span><span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</span></span>`
    }).join('')
    $('#ticker').innerHTML = items + items
  }

  /* ------------------------------------------------------------------ terminal */
  function initTerminal() {
    const SUPPLY = 1e9
    const GRAD = 69000
    const TABS = COINS.slice(0, 4)
    const markets = {}
    TABS.forEach((c, i) => {
      const startMcap = [5200, 12800, 31000, 47000][i]
      const candles = []
      let p = (startMcap * rand(0.5, 0.7)) / SUPPLY
      for (let k = 0; k < 56; k++) {
        const o = p
        const drift = 1 + rand(-0.035, 0.05)
        const c2 = o * drift
        candles.push({ o, c: c2, h: Math.max(o, c2) * (1 + rand(0, 0.02)), l: Math.min(o, c2) * (1 - rand(0, 0.02)) })
        p = c2
      }
      const target = startMcap / SUPPLY
      const k = target / p
      candles.forEach((cd) => { cd.o *= k; cd.c *= k; cd.h *= k; cd.l *= k })
      markets[c.t] = { coin: c, candles, price: target, open24: target * rand(0.4, 0.8), hold: 0, cost: 0, mom: 0 }
    })
    let active = TABS[0].t
    let cash = 1000
    let side = 'buy'
    const el = {
      tabs: $('#termTabs'), icon: $('#tcIcon'), ticker: $('#tcTicker'), name: $('#tcName'), price: $('#tcPrice'), mcap: $('#tcMcap'), change: $('#tcChange'),
      svg: $('#chartSvg'), chart: $('#chart'), last: $('#tcLast'), float: $('#tcFloat'), bar: $('#curveBar'), pct: $('#curvePct'), note: $('#gradNote'),
      wallet: $('#tWallet'), amount: $('#tAmount'), chips: $('#tChips'), go: $('#tGo'), hold: $('#pHold'), val: $('#pVal'), pnl: $('#pPnl'), feed: $('#tFeed'),
    }

    const renderTabs = () => {
      el.tabs.innerHTML = TABS.map((c) => {
        const mk = markets[c.t]
        const ch = (mk.price / mk.open24 - 1) * 100
        return `<button data-t="${c.t}" class="${c.t === active ? 'on' : ''}">${icon(c, 22)}$${c.t} <span class="chg ${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${ch.toFixed(0)}%</span></button>`
      }).join('')
    }
    el.tabs.addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (!b) return
      active = b.dataset.t
      renderTabs()
      renderHead()
      renderChart()
      renderPos()
      el.go.textContent = `${side === 'buy' ? 'Buy' : 'Sell'} $${active}`
    })

    const renderHead = () => {
      const mk = markets[active]
      el.icon.innerHTML = icon(mk.coin, 40)
      el.ticker.textContent = '$' + mk.coin.t
      el.name.textContent = mk.coin.n
      el.price.textContent = fmtPrice(mk.price)
      const mc = mk.price * SUPPLY
      el.mcap.textContent = '$' + fmtK(mc)
      const ch = (mk.price / mk.open24 - 1) * 100
      el.change.textContent = (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%'
      el.change.className = ch >= 0 ? 'up' : 'down'
      const pct = Math.min(100, (mc / GRAD) * 100)
      el.bar.style.width = pct + '%'
      el.pct.textContent = pct.toFixed(1) + '%'
      el.note.textContent = pct >= 100 ? 'Graduated 🎓' : `Graduates at $${fmtK(GRAD)}`
      el.note.classList.toggle('done', pct >= 100)
    }

    const renderChart = () => {
      const mk = markets[active]
      const W = el.chart.clientWidth
      const H = el.chart.clientHeight
      if (!W || !H) return
      const cs = mk.candles
      let lo = Infinity
      let hi = -Infinity
      cs.forEach((c) => { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h) })
      if (mk.hold > 0) { const avg = mk.cost / mk.hold; lo = Math.min(lo, avg); hi = Math.max(hi, avg) }
      const pad = (hi - lo) * 0.12 || hi * 0.05
      lo -= pad
      hi += pad
      const y = (v) => H - ((v - lo) / (hi - lo)) * H
      const step = W / cs.length
      const bw = Math.max(2, step * 0.62)
      let s = ''
      for (let g = 1; g < 5; g++) s += `<line x1="0" x2="${W}" y1="${(H * g) / 5}" y2="${(H * g) / 5}" stroke="#1a2540" stroke-dasharray="3 5"/>`
      cs.forEach((c, i) => {
        const up = c.c >= c.o
        const col = up ? 'var(--t-up)' : 'var(--t-down)'
        const x = i * step + (step - bw) / 2
        const yo = y(c.o)
        const yc = y(c.c)
        s += `<line x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${y(c.h)}" y2="${y(c.l)}" stroke="${col}" stroke-width="1.2"/>`
        s += `<rect x="${x}" y="${Math.min(yo, yc)}" width="${bw}" height="${Math.max(1.5, Math.abs(yc - yo))}" rx="1" fill="${col}"/>`
      })
      const lastY = y(mk.price)
      s += `<line x1="0" x2="${W}" y1="${lastY}" y2="${lastY}" stroke="${cs[cs.length - 1].c >= cs[cs.length - 1].o ? 'var(--t-up)' : 'var(--t-down)'}" stroke-dasharray="2 4" opacity=".7"/>`
      if (mk.hold > 0) {
        const ay = y(mk.cost / mk.hold)
        s += `<line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="#ffc933" stroke-dasharray="6 4"/><text x="6" y="${ay - 6}" fill="#ffc933" font-family="JetBrains Mono,monospace" font-size="11" font-weight="700">YOUR ENTRY</text>`
      }
      el.svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      el.svg.innerHTML = s
      el.last.style.top = lastY + 'px'
      el.last.textContent = fmtPrice(mk.price)
      const lc = cs[cs.length - 1]
      el.last.classList.toggle('dn', lc.c < lc.o)
    }

    const renderPos = () => {
      const mk = markets[active]
      el.wallet.textContent = fmtMoney(cash)
      el.hold.textContent = mk.hold > 0 ? fmtK(mk.hold) : '0'
      const val = mk.hold * mk.price
      el.val.textContent = fmtMoney(val)
      const pnl = val - mk.cost
      el.pnl.textContent = (pnl >= 0 ? '+' : '') + fmtMoney(pnl)
      el.pnl.className = mk.hold > 0 ? (pnl >= 0 ? 'up' : 'down') : ''
    }

    const impact = (mk, amt, buy) => {
      const mc = mk.price * SUPPLY
      const f = Math.exp((buy ? 1 : -1) * (amt / (mc * 0.35 + 2500)))
      mk.price *= f
      const c = mk.candles[mk.candles.length - 1]
      c.c = mk.price
      c.h = Math.max(c.h, mk.price)
      c.l = Math.min(c.l, mk.price)
      mk.mom += buy ? 0.002 : -0.002
    }

    const feed = (name, t, buy, amt, you = false) => {
      const li = document.createElement('li')
      if (you) li.className = 'you'
      const c = markets[t]?.coin || pick(COINS)
      li.innerHTML = `${A.head({ ...(you ? c.head : randomHead()), bg: null, size: 18 })}<span class="n">${name} · $${t}</span><b class="${buy ? 'up' : 'down'}">${buy ? '+' : '−'}${amt.toFixed(0)}</b><span class="tm">now</span>`
      el.feed.prepend(li)
      while (el.feed.children.length > 9) el.feed.lastChild.remove()
    }

    const floatTxt = (txt, cls) => {
      const s = document.createElement('span')
      s.className = cls
      s.textContent = txt
      s.style.left = el.chart.clientWidth * 0.82 + 'px'
      s.style.top = el.last.style.top
      el.float.appendChild(s)
      setTimeout(() => s.remove(), 1300)
    }

    const setSide = (sd) => {
      side = sd
      $$('.ts-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.side === sd))
      el.go.className = 'ts-go ' + sd
      el.go.textContent = `${sd === 'buy' ? 'Buy' : 'Sell'} $${active}`
      const vals = sd === 'buy' ? ['10', '50', '100', '250'] : ['25%', '50%', '75%', '100%']
      $$('button', el.chips).forEach((b, i) => { b.textContent = vals[i]; b.classList.toggle('on', i === 1) })
      el.amount.value = vals[1].replace('%', '')
      el.amount.nextElementSibling.textContent = sd === 'buy' ? 'CASH' : '%'
    }
    $$('.ts-tabs button').forEach((b) => b.addEventListener('click', () => setSide(b.dataset.side)))
    el.chips.addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (!b) return
      $$('button', el.chips).forEach((x) => x.classList.toggle('on', x === b))
      el.amount.value = b.textContent.replace('%', '')
    })
    el.go.addEventListener('click', () => {
      const mk = markets[active]
      const v = parseFloat(el.amount.value.replace(/[^0-9.]/g, '')) || 0
      if (v <= 0) return
      if (side === 'buy') {
        const amt = Math.min(v, cash)
        if (amt < 0.01) { floatTxt('Not enough cash', 'down'); return }
        const tokens = amt / mk.price
        cash -= amt
        mk.hold += tokens
        mk.cost += amt
        impact(mk, amt, true)
        feed('you', active, true, amt, true)
        floatTxt(`+${fmtK(tokens)} $${active}`, 'up')
      } else {
        if (mk.hold <= 0) { floatTxt('Nothing to sell', 'down'); return }
        const frac = Math.min(1, v / 100)
        const tokens = mk.hold * frac
        const got = tokens * mk.price
        mk.cost *= 1 - frac
        mk.hold -= tokens
        if (mk.hold < 1) { mk.hold = 0; mk.cost = 0 }
        cash += got
        impact(mk, got, false)
        feed('you', active, false, got, true)
        floatTxt(`+${fmtMoney(got)} cash`, 'up')
      }
      $('.term-wallet').classList.remove('flash')
      void $('.term-wallet').offsetWidth
      $('.term-wallet').classList.add('flash')
      renderHead()
      renderChart()
      renderPos()
      renderTabs()
    })

    // market simulation
    let ticks = 0
    setInterval(() => {
      if (document.hidden) return
      ticks++
      Object.values(markets).forEach((mk) => {
        const mc = mk.price * SUPPLY
        const pull = mc > GRAD * 0.92 ? -0.004 : mc < 3000 ? 0.004 : 0
        mk.mom = mk.mom * 0.92 + rand(-0.0025, 0.0028) + pull
        mk.price *= 1 + mk.mom + rand(-0.006, 0.006)
        const c = mk.candles[mk.candles.length - 1]
        c.c = mk.price
        c.h = Math.max(c.h, mk.price)
        c.l = Math.min(c.l, mk.price)
        if (ticks % 7 === 0) {
          mk.candles.push({ o: mk.price, c: mk.price, h: mk.price, l: mk.price })
          if (mk.candles.length > 56) mk.candles.shift()
        }
      })
      if (Math.random() < 0.35) {
        const t = Math.random() < 0.6 ? active : pick(TABS).t
        const buy = Math.random() < 0.56
        const amt = rand(4, 140)
        impact(markets[t], amt, buy)
        feed(pick(NAMES), t, buy, amt)
      }
      renderHead()
      renderChart()
      renderPos()
      if (ticks % 8 === 0) renderTabs()
    }, 280)

    for (let i = 0; i < 7; i++) feed(pick(NAMES), pick(TABS).t, Math.random() < 0.6, rand(4, 140))
    renderTabs()
    renderHead()
    renderPos()
    requestAnimationFrame(renderChart)
    addEventListener('resize', renderChart)
  }

  /* ------------------------------------------------------------------ pulse */
  function initPulse() {
    let id = 0
    const mkCoin = () => {
      const base = Math.random() < 0.45 ? pick(COINS) : null
      const t = base ? base.t : pick(EXTRA)
      return { id: ++id, t, n: base ? base.n : t.charAt(0) + t.slice(1).toLowerCase() + ' Coin', head: base ? base.head : randomHead(), curve: rand(1, 12), holders: randi(2, 9), age: 0, fresh: true }
    }
    const cols = { new: [], mid: [], grad: [] }
    for (let i = 0; i < 6; i++) { const c = mkCoin(); c.curve = rand(4, 55); c.age = randi(10, 300); cols.new.push(c) }
    for (let i = 0; i < 5; i++) { const c = mkCoin(); c.curve = rand(61, 96); c.age = randi(300, 1200); c.holders = randi(10, 13); cols.mid.push(c) }
    for (let i = 0; i < 6; i++) { const c = mkCoin(); c.curve = 100; c.age = randi(1200, 9000); c.holders = randi(11, 13); cols.grad.push(c) }
    Object.values(cols).flat().forEach((c) => { c.fresh = false })
    cols.new.sort((a, b) => a.age - b.age)

    const nodes = new Map()
    const ages = (s) => (s < 60 ? s + 's' : s < 3600 ? Math.floor(s / 60) + 'm' : Math.floor(s / 3600) + 'h')
    const node = (c, kind) => {
      let li = nodes.get(c.id)
      if (!li) {
        li = document.createElement('li')
        li.innerHTML = `<span class="ic">${icon(c, 44)}</span><div class="nm"><b>$${c.t}</b><small>${c.n}</small></div><div class="mc"></div><div class="meta"><span class="hd"></span><div class="curve"><i></i></div><span class="pc"></span></div><div class="age"></div>`
        nodes.set(c.id, li)
      }
      li.className = 'pr ' + kind + (c.fresh ? ' fresh' : '')
      if (c.fresh) {
        li.style.animation = 'row-drop .5s var(--ease)'
        c.fresh = false
        setTimeout(() => (li.style.animation = 'none'), 600)
      } else if (!li.style.animation) li.style.animation = 'none'
      $('.mc', li).textContent = '$' + fmtK(kind === 'grad' ? (c.mc ||= rand(70000, 240000)) : (c.curve / 100) * 66000 + 2500)
      $('.hd', li).textContent = '👤 ' + c.holders
      $('.curve i', li).style.width = c.curve + '%'
      $('.pc', li).innerHTML = kind === 'grad' ? '<span class="grad-badge">GRAD</span>' : c.curve.toFixed(0) + '%'
      $('.age', li).textContent = ages(c.age)
      return li
    }
    const place = (ul, list, kind) => {
      list.forEach((c, i) => {
        const li = node(c, kind)
        if (ul.children[i] !== li) ul.insertBefore(li, ul.children[i] || null)
      })
      while (ul.children.length > list.length) {
        const extra = ul.lastChild
        ul.removeChild(extra)
      }
    }
    const render = () => {
      place($('#colNew'), cols.new, 'new')
      place($('#colMid'), cols.mid, 'mid')
      place($('#colGrad'), cols.grad, 'grad')
      $('#cNew').textContent = cols.new.length
      $('#cMid').textContent = cols.mid.length
      $('#cGrad').textContent = cols.grad.length
      // forget nodes that dropped off every list
      const live = new Set(Object.values(cols).flat().map((c) => c.id))
      nodes.forEach((_, k) => { if (!live.has(k)) nodes.delete(k) })
    }
    render()

    let t = 0
    setInterval(() => {
      if (document.hidden) return
      t++
      Object.values(cols).flat().forEach((c) => (c.age += 2))
      ;[...cols.new, ...cols.mid].forEach((c) => {
        const d = rand(-3, 7) * (c.curve > 60 ? 0.8 : 1)
        c.curve = Math.max(1, Math.min(100, c.curve + d))
        if (d > 3 && c.holders < 13) c.holders++
      })
      // promotions
      cols.new.filter((c) => c.curve >= 60).forEach((c) => { cols.new.splice(cols.new.indexOf(c), 1); c.fresh = true; cols.mid.unshift(c) })
      cols.mid.filter((c) => c.curve >= 100).forEach((c) => { cols.mid.splice(cols.mid.indexOf(c), 1); c.fresh = true; c.curve = 100; cols.grad.unshift(c) })
      if (t % 2 === 0) cols.new.unshift(mkCoin())
      cols.new.length = Math.min(cols.new.length, 8)
      cols.mid.length = Math.min(cols.mid.length, 8)
      cols.grad.length = Math.min(cols.grad.length, 8)
      render()
    }, 1600)
  }

  /* ------------------------------------------------------------------ leaderboard + cta */
  function initLeaderboard() {
    const top = [
      { n: 'sir_pumps', bag: 1284500, best: '$KING +4,210%', av: PRESETS.king },
      { n: 'mr_exec', bag: 842300, best: '$SUIT +2,980%', av: PRESETS.exec },
      { n: 'baconator', bag: 512900, best: '$BACON +1,544%', av: PRESETS.phone },
    ]
    const ped = (color, h) => A.brick({ cols: 4, rows: 4, color, h, width: 160 })
    const order = [1, 0, 2]
    const colors = ['#ffc933', '#d7deea', '#e0915a']
    const heights = [46, 30, 18]
    $('#podium').innerHTML = order
      .map((i) => {
        const p = top[i]
        return `<div class="pod ${i === 0 ? 'first' : ''}"><span class="rank" style="background:${colors[i]}">${i + 1}</span><div class="av">${A.avatar({ ...p.av, width: 100 })}</div><div class="ped">${ped(colors[i], heights[i])}</div><div class="who">${p.n}</div><div class="bag">$${fmtK(p.bag)}</div></div>`
      })
      .join('')
    const rest = [
      { n: 'chartlord', bag: 301200, best: '$OOF +920%' },
      { n: 'diamondblox', bag: 244800, best: '$TIX +610%' },
      { n: 'cafe_regular', bag: 198050, best: '$CAFE +488%' },
      { n: 'noob_42', bag: 120400, best: '$NOOB +402%' },
      { n: 'moonwalker', bag: 96300, best: '$MOON +277%' },
    ]
    $('#lbList').innerHTML = rest
      .map((r, i) => `<div class="lb-row"><span class="r">${i + 4}</span>${A.head({ ...randomHead(), size: 38 })}<div class="nm">${r.n}<small>${randi(40, 400)} trades</small></div><span class="best">${r.best}</span><span class="pn">$${fmtK(r.bag)}</span></div>`)
      .join('')

    $('#ctaCrowd').innerHTML = [
      A.avatar({ ...PRESETS.green, width: 92 }),
      A.avatar({ ...PRESETS.exec, width: 124 }),
      A.avatar({ ...PRESETS.red, width: 100 }),
    ].join('')
  }

  /* ------------------------------------------------------------------ boot */
  paintArt()
  initChrome()
  initTicker()
  initScene()
  initTerminal()
  initPulse()
  initLeaderboard()
  if (!reduced) initHeroLife()
})()
