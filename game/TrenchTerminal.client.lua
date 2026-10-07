--[[
	RBXfun · Trench Terminal — drop-in trading UI for Welcome to Bloxfun!
	Matches the RBXfun website terminal (teal/red candles, BUY/SELL tabs,
	entry/exit lines, position card). Place as a LocalScript in
	StarterPlayer > StarterPlayerScripts. Requires RemoteEvent "TerminalRF"
	(server side, see README below) for real balances — everything here
	works standalone with client-side simulation data if remotes are absent.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer

-- palette (same tokens as the website terminal)
local C = {
	bg = Color3.fromHex("0b1220"),
	panel = Color3.fromHex("111b2e"),
	panel2 = Color3.fromHex("0e1728"),
	border = Color3.fromHex("1e2a44"),
	line = Color3.fromHex("18243c"),
	text = Color3.fromHex("e8eef9"),
	muted = Color3.fromHex("7e8aa5"),
	teal = Color3.fromHex("4ed8be"),
	tealDark = Color3.fromHex("06231c"),
	red = Color3.fromHex("f26d7e"),
	redDark = Color3.fromHex("2b070c"),
	green = Color3.fromHex("3fcf4a"),
	gold = Color3.fromHex("ffcd35"),
}
local MONO = Enum.Font.Code
local BOLD = Enum.Font.GothamBold

local state = {
	side = "BUY",
	amount = 0.5,
	wallet = 48.39,
	holdings = 16_990_000,
	avg = 0.0000312,
	cost = 0.530,
	price = 0.0000314,
	ticker = "$DREAM",
	name = "DREAM · 05 ROL and a dream",
	candles = {},
	shop = nil, -- TrenchCafe shop model from workspace (optional)
}

-- ========================= helpers =========================
local function style(inst, props)
	for k, v in pairs(props) do inst[k] = v end
	return inst
end

local function mk(class, props, parent)
	local i = Instance.new(class)
	for k, v in pairs(props) do i[k] = v end
	if parent then i.Parent = parent end
	local cr = props.cornerRadius
	if cr then
		local uic = Instance.new("UICorner")
		uic.CornerRadius = UDim.new(0, cr)
		uic.Parent = i
	end
	local st = props.stroke
	if st then
		local ui = Instance.new("UIStroke")
		ui.Color = st
		ui.Thickness = 1
		ui.Parent = i
	end
	return i
end

local function fmtK(n)
	if n >= 1e6 then return string.format("$%.2fM", n / 1e6) end
	if n >= 1e3 then return string.format("$%.2fK", n / 1e3) end
	return string.format("$%.2f", n)
end

local function fmtN(n)
	if n >= 1e6 then return string.format("%.2fM", n / 1e6) end
	if n >= 1e3 then return string.format("%.2fK", n / 1e3) end
	if n >= 100 then return tostring(math.floor(n)) end
	return string.format("%.2f", n)
end

-- ========================= screen root =========================
local gui = Instance.new("ScreenGui")
gui.Name = "RBXfunTerminal"
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.DisplayOrder = 50
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local root = mk("Frame", {
	Size = UDim2.fromScale(1, 1),
	BackgroundTransparency = 1,
	Visible = false,
}, gui)

-- open/close via the game's existing phone HUD or key T
local openBtn = mk("TextButton", {
	Size = UDim2.fromOffset(44, 44),
	Position = UDim2.new(0, 16, 1, -140),
	BackgroundColor3 = C.panel,
	Text = "⌗",
	TextSize = 18,
	Font = MONO,
	TextXAlignment = Enum.TextXAlignment.Center,
	cornerRadius = 10,
	stroke = C.border,
	Parent = gui,
})
mk("TextLabel", {
	Size = UDim2.new(1, 0, 0, 14),
	Position = UDim2.new(0, 0, 1, -16),
	BackgroundTransparency = 1,
	Text = "TERMINAL",
	Font = BOLD,
	TextSize = 9,
	TextColor3 = C.muted,
	Parent = openBtn,
})

-- ========================= panel =========================
local panel = mk("Frame", {
	Size = UDim2.new(1, -32, 1, -90),
	Position = UDim2.new(0, 16, 0, 60),
	BackgroundColor3 = C.bg,
	cornerRadius = 18,
	stroke = C.border,
	Parent = root,
})

-- header
local head = mk("Frame", {
	Size = UDim2.new(1, 0, 0, 62),
	BackgroundColor3 = C.panel2,
	Parent = panel,
})
mk("Frame", { -- divider under header
	Size = UDim2.new(1, 0, 0, 1),
	Position = UDim2.new(0, 0, 1, -1),
	BackgroundColor3 = C.border,
	BorderSizePixel = 0,
	Parent = head,
})
local backBtn = mk("TextButton", {
	Size = UDim2.fromOffset(34, 34),
	Position = UDim2.new(0, 14, 0, 14),
	BackgroundColor3 = C.panel,
	Text = "<",
	Font = MONO,
	TextSize = 14,
	TextColor3 = C.muted,
	cornerRadius = 10,
	stroke = C.border,
	Parent = head,
})
local coinIcon = mk("Frame", {
	Size = UDim2.fromOffset(42, 42),
	Position = UDim2.new(0, 58, 0, 10),
	BackgroundColor3 = C.panel,
	cornerRadius = 10,
	Parent = head,
})
local tickerLbl = mk("TextLabel", {
	Size = UDim2.new(0, 220, 0, 22),
	Position = UDim2.new(0, 112, 0, 10),
	BackgroundTransparency = 1,
	Text = state.ticker,
	Font = MONO,
	TextSize = 19,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.text,
	Parent = head,
})
local nameLbl = mk("TextLabel", {
	Size = UDim2.new(0, 320, 0, 14),
	Position = UDim2.new(0, 112, 0, 32),
	BackgroundTransparency = 1,
	Text = state.name,
	Font = Enum.Font.Gotham,
	TextSize = 11,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.muted,
	Parent = head,
})
local priceLbl = mk("TextLabel", {
	Size = UDim2.new(0, 200, 0, 24),
	Position = UDim2.new(0, 460, 0, 12),
	BackgroundTransparency = 1,
	Text = "$0.00003",
	Font = MONO,
	TextSize = 21,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.text,
	Parent = head,
})
mk("TextLabel", {
	Size = UDim2.new(0, 200, 0, 12),
	Position = UDim2.new(0, 460, 0, 36),
	BackgroundTransparency = 1,
	Text = "PRICE (ROL)",
	Font = BOLD,
	TextSize = 10,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.muted,
	Parent = head,
})
local mcLbl = mk("TextLabel", {
	Size = UDim2.new(1, -560, 0, 20),
	Position = UDim2.new(0, 560, 0, 12),
	BackgroundTransparency = 1,
	Text = "MC $2.99K",
	Font = MONO,
	TextSize = 16,
	TextXAlignment = Enum.TextXAlignment.Right,
	TextColor3 = C.text,
	Parent = head,
})
local metaLbl = mk("TextLabel", {
	Size = UDim2.new(1, -560, 0, 14),
	Position = UDim2.new(0, 560, 0, 34),
	BackgroundTransparency = 1,
	Text = "1 holders · vol 4.32",
	Font = BOLD,
	TextSize = 11,
	TextXAlignment = Enum.TextXAlignment.Right,
	TextColor3 = C.muted,
	Parent = head,
})

-- ========================= chart column =========================
local chartCol = mk("Frame", {
	Size = UDim2.new(1, -296, 1, -62),
	Position = UDim2.new(0, 0, 0, 62),
	BackgroundTransparency = 1,
	Parent = panel,
})
local tfs = mk("Frame", {
	Size = UDim2.new(1, 0, 0, 54),
	BackgroundColor3 = C.bg,
	Parent = chartCol,
})
mk("Frame", {
	Size = UDim2.new(1, 0, 0, 1),
	Position = UDim2.new(0, 0, 1, -1),
	BackgroundColor3 = C.border,
	BorderSizePixel = 0,
	Parent = tfs,
})
local TF_SCALE = { ["1s"] = 1, ["1m"] = 1.6, ["5m"] = 2.4, ["15m"] = 3.2, ["1h"] = 4.4, ["4h"] = 6.5 }
local timeframes = { "1s", "1m", "5m", "15m", "1h", "4h" }
local tfButtons = {}
local listLayout = Instance.new("UIListLayout")
listLayout.FillDirection = Enum.FillDirection.Horizontal
listLayout.Padding = UDim.new(0, 6)
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Parent = tfs
local tfPad = Instance.new("UIPadding")
tfPad.PaddingLeft = UDim.new(0, 14)
tfPad.PaddingTop = UDim.new(0, 12)
tfPad.Parent = tfs
for i, tf in ipairs(timeframes) do
	local b = mk("TextButton", {
		Size = UDim2.fromOffset(46, 30),
		BackgroundColor3 = C.panel,
		Text = tf,
		Font = MONO,
		TextSize = 12,
		TextColor3 = i == 1 and C.tealDark or C.muted,
		cornerRadius = 9,
		stroke = C.border,
		LayoutOrder = i,
		Parent = tfs,
	})
	if i == 1 then b.BackgroundColor3 = C.teal end
	b.MouseButton1Click:Connect(function()
		for _, o in ipairs(tfButtons) do
			o.BackgroundColor3 = C.panel
			o.TextColor3 = C.muted
		end
		b.BackgroundColor3 = C.teal
		b.TextColor3 = C.tealDark
		state.tf = tf
		state.candles = genCandles(30, TF_SCALE[tf] or 1)
		renderChart()
	end)
	table.insert(tfButtons, b)
end

-- candle canvas
local chartFrame = mk("Frame", {
	Size = UDim2.new(1, 0, 1, -54),
	Position = UDim2.new(0, 0, 0, 54),
	BackgroundColor3 = C.bg,
	Parent = chartCol,
})

local chartCanvas = mk("Frame", {
	Size = UDim2.new(1, -84, 1, -30),
	Position = UDim2.new(0, 10, 0, 6),
	BackgroundTransparency = 1,
	Parent = chartFrame,
})

local MARK_COUNT = 12
local candlePool, markPool, gridPool = {}, {}, {}
local activeCandles, activeMarks, activeGrid = {}, {}, {}

local function getFromPool(pool, active, class, props)
	local item = table.remove(pool) or mk(class, props, chartCanvas)
	item.Parent = chartCanvas
	item.Visible = true
	table.insert(active, item)
	return item
end

local entryLine = mk("Frame", {
	BackgroundColor3 = C.teal, Size = UDim2.new(1, 0, 0, 1), Visible = false, BorderSizePixel = 0,
	Parent = chartCanvas,
})
local entryTag = mk("TextLabel", {
	Size = UDim2.fromOffset(52, 18), BackgroundColor3 = C.teal, Text = "ENTRY",
	Font = MONO, TextSize = 10, TextColor3 = C.tealDark, cornerRadius = 7, Parent = chartCanvas,
})
local exitLine = mk("Frame", {
	BackgroundColor3 = C.red, Size = UDim2.new(1, 0, 0, 1), Visible = false, BorderSizePixel = 0,
	Parent = chartCanvas,
})
local exitTag = mk("TextLabel", {
	Size = UDim2.fromOffset(46, 18), BackgroundColor3 = C.red, Text = "EXIT",
	Font = MONO, TextSize = 10, TextColor3 = C.redDark, cornerRadius = 7, Parent = chartCanvas,
})

-- ========================= candle generation =========================
local rng = Random.new(42)

local function genCandles(n, tfScale)
	local out = {}
	local p = state.price * (0.82 + rng:NextNumber() * 0.1)
	for i = 1, n do
		local drift = (state.price - p) * 0.06
		local noise = (rng:NextNumber() - 0.48) * state.price * 0.055 * tfScale
		local o = p
		local c = math.max(state.price * 0.5, o + drift + noise)
		local hi = math.max(o, c) + rng:NextNumber() * state.price * 0.02 * tfScale
		local lo = math.min(o, c) - rng:NextNumber() * state.price * 0.02 * tfScale
		table.insert(out, { o = o, c = c, hi = hi, lo = lo })
		p = c
	end
	-- normalize so last close == state.price
	local last = out[#out].c
	local scale = state.price / last
	for _, k in ipairs(out) do
		k.o *= scale; k.c *= scale; k.hi *= scale; k.lo *= scale
	end
	return out
end

state.candles = genCandles(30, 1)

function renderChart()
	-- clear active
	for _, c in ipairs(activeCandles) do c.Visible = false; table.insert(candlePool, c) end
	table.clear(activeCandles)
	for _, m in ipairs(activeMarks) do m.Visible = false; table.insert(markPool, m) end
	table.clear(activeMarks)
	for _, g in ipairs(activeGrid) do g.Visible = false; table.insert(gridPool, g) end
	table.clear(activeGrid)

	local n = #state.candles
	local w, h = chartCanvas.AbsoluteSize.X, chartCanvas.AbsoluteSize.Y
	if w < 10 or h < 10 then task.wait(); w, h = chartCanvas.AbsoluteSize.X, chartCanvas.AbsoluteSize.Y end

	local lo, hi = math.huge, -math.huge
	for _, k in ipairs(state.candles) do
		lo = math.min(lo, k.lo); hi = math.max(hi, k.hi)
	end
	local span = math.max(hi - lo, 1e-9)

	-- grid lines + price labels
	for g = 0, 4 do
		local y = g / 4 * (h - 26) + 8
		local gl = getFromPool(gridPool, activeGrid, "Frame", {
			Size = UDim2.new(1, 0, 0, 1), BackgroundColor3 = C.line, BorderSizePixel = 0,
		})
		gl.Position = UDim2.new(0, 10, 0, y)
		local pl = gl:FindFirstChild("plabel")
		if not pl then
			pl = mk("TextLabel", {
				Name = "plabel",
				Size = UDim2.fromOffset(64, 12),
				Position = UDim2.new(1, 2, 0, -6),
				BackgroundTransparency = 1,
				Font = MONO,
				TextSize = 10,
				TextXAlignment = Enum.TextXAlignment.Left,
				TextColor3 = C.muted,
				Parent = gl,
			})
		end
		pl.Text = fmtK(hi - (g / 4) * span)
	end

	-- candles
	local cw = (w - 20) / n
	for i, k in ipairs(state.candles) do
		local top = (hi - k.hi) / span * (h - 26) + 8
		local bh = math.max(3, (k.hi - k.lo) / span * (h - 26))
		local candle = getFromPool(candlePool, activeCandles, "Frame", {
			Size = UDim2.fromOffset(math.max(cw * 0.62, 4), bh),
			BackgroundColor3 = k.c >= k.o and C.teal or C.red,
			BorderSizePixel = 0,
			cornerRadius = 2,
		})
		candle.Position = UDim2.new(0, 10 + (i - 1) * cw + cw * 0.19, 0, top)
	end

	-- trade marks DB/DS
	for m = 1, MARK_COUNT do
		local buy = rng:NextNumber() > 0.42
		local mark = getFromPool(markPool, activeMarks, "TextButton", {
			Size = UDim2.fromOffset(26, 16),
			BackgroundColor3 = buy and C.teal or C.red,
			Text = buy and "DB" or "DS",
			Font = MONO,
			TextSize = 9,
			TextColor3 = buy and C.tealDark or C.redDark,
			cornerRadius = 9,
		})
		local x = 10 + (m - 1) / MARK_COUNT * (w - 40) + cw / 2
		local idx = math.clamp(math.floor((m - 1) / MARK_COUNT * n) + 1, 1, n)
		local y = (hi - state.candles[idx].hi) / span * (h - 26) + 8 - 20
		mark.Position = UDim2.new(0, x, 0, math.max(y, 2))
	end

	-- entry / exit lines
	if state.holdings > 0 then
		local ey = (hi - state.avg) / span * (h - 26) + 8
		entryLine.Visible = true
		entryLine.Position = UDim2.new(0, 10, 0, ey)
		entryTag.Visible = true
		entryTag.Position = UDim2.new(0, 10, 0, ey - 9)
		exitTag.Text = fmtK(state.avg * 0.955)
		local ax = state.avg * 0.955
		local exy = (hi - ax) / span * (h - 26) + 8
		exitLine.Visible = true
		exitLine.Position = UDim2.new(0, 10, 0, exy)
		exitTag.Visible = true
		exitTag.Position = UDim2.new(0, 10, 0, exy - 9)
		entryTag.Text = "ENTRY"
	else
		entryLine.Visible = false; entryTag.Visible = false
		exitLine.Visible = false; exitTag.Visible = false
	end

	priceLbl.Text = "$" .. string.format("%.5f", state.price)
	mcLbl.Text = "MC " .. fmtK(state.price * 1e9)
end

-- ========================= trade column =========================
local tradeCol = mk("Frame", {
	Size = UDim2.new(0, 296, 1, -62),
	Position = UDim2.new(1, -296, 0, 62),
	BackgroundColor3 = C.panel2,
	BorderSizePixel = 0,
	Parent = panel,
})

local buyBtn = mk("TextButton", {
	Size = UDim2.new(0.5, -6, 0, 44),
	Position = UDim2.new(0, 14, 0, 14),
	BackgroundColor3 = C.teal,
	Text = "BUY",
	Font = BOLD,
	TextSize = 14,
	TextColor3 = C.tealDark,
	cornerRadius = 12,
	Parent = tradeCol,
})
local sellBtn = mk("TextButton", {
	Size = UDim2.new(0.5, -6, 0, 44),
	Position = UDim2.new(0.5, -8, 0, 14),
	BackgroundColor3 = C.panel,
	Text = "SELL",
	Font = BOLD,
	TextSize = 14,
	TextColor3 = C.muted,
	cornerRadius = 12,
	stroke = C.border,
	Parent = tradeCol,
})

mk("TextLabel", {
	Size = UDim2.new(0, 200, 0, 14),
	Position = UDim2.new(0, 14, 0, 68),
	BackgroundTransparency = 1,
	Text = "AMOUNT (ROL)",
	Font = BOLD, TextSize = 10, TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.muted,
	Parent = tradeCol,
})
local amountBox = mk("TextBox", {
	Size = UDim2.new(1, -28, 0, 48),
	Position = UDim2.new(0, 14, 0, 84),
	BackgroundColor3 = C.panel,
	Text = "0.5",
	PlaceholderText = "0.0",
	Font = MONO,
	TextSize = 22,
	TextColor3 = C.text,
	TextXAlignment = Enum.TextXAlignment.Left,
	cornerRadius = 12,
	stroke = C.border,
	Parent = tradeCol,
})
local amountPad = Instance.new("UIPadding")
amountPad.PaddingLeft = UDim.new(0, 12)
amountPad.Parent = amountBox

local quick = { "0.1", "0.5", "1", "MAX" }
for i, q in ipairs(quick) do
	local b = mk("TextButton", {
		Size = UDim2.new(0.25, -14, 0, 34),
		Position = UDim2.new((i - 1) * 0.25, 14, 0, 140),
		BackgroundColor3 = C.panel,
		Text = q,
		Font = MONO,
		TextSize = 12,
		TextColor3 = C.text,
		cornerRadius = 10,
		stroke = C.border,
		Parent = tradeCol,
	})
	b.MouseButton1Click:Connect(function()
		local v = q == "MAX" and (state.side == "BUY" and tostring(math.floor(state.wallet * 100) / 100) or fmtN(state.holdings)) or q
		amountBox.Text = v
		state.amount = tonumber(v) or 0
		updateReceive()
	end)
end

mk("TextLabel", {
	Size = UDim2.new(0, 200, 0, 14),
	Position = UDim2.new(0, 14, 0, 184),
	BackgroundTransparency = 1,
	Text = "YOU RECEIVE",
	Font = BOLD, TextSize = 10, TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.muted,
	Parent = tradeCol,
})
local receiveLbl = mk("TextLabel", {
	Size = UDim2.new(1, -28, 0, 40),
	Position = UDim2.new(0, 14, 0, 200),
	BackgroundColor3 = C.panel,
	Text = "—",
	Font = MONO,
	TextSize = 17,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.text,
	cornerRadius = 12,
	stroke = C.border,
	Parent = tradeCol,
})
local receivePad = Instance.new("UIPadding")
receivePad.PaddingLeft = UDim.new(0, 12)
receivePad.Parent = receiveLbl

local confirmBtn = mk("TextButton", {
	Size = UDim2.new(1, -28, 0, 50),
	Position = UDim2.new(0, 14, 0, 252),
	BackgroundColor3 = C.teal,
	Text = "CONFIRM BUY",
	Font = BOLD,
	TextSize = 15,
	TextColor3 = C.tealDark,
	cornerRadius = 13,
	Parent = tradeCol,
})

local walletLbl = mk("TextLabel", {
	Size = UDim2.new(1, -28, 0, 16),
	Position = UDim2.new(0, 14, 0, 310),
	BackgroundTransparency = 1,
	Text = ("wallet %.2f ROL"):format(state.wallet),
	Font = MONO,
	TextSize = 12,
	TextColor3 = C.muted,
	Parent = tradeCol,
})

-- position card
local posCard = mk("Frame", {
	Size = UDim2.new(1, -28, 0, 128),
	Position = UDim2.new(0, 14, 1, -140),
	BackgroundColor3 = C.panel,
	cornerRadius = 14,
	stroke = C.border,
	Parent = tradeCol,
})
local posTitle = mk("TextLabel", {
	Size = UDim2.new(0, 150, 0, 16),
	Position = UDim2.new(0, 12, 0, 8),
	BackgroundTransparency = 1,
	Text = "MY POSITION",
	Font = BOLD, TextSize = 10, TextXAlignment = Enum.TextXAlignment.Left,
	TextColor3 = C.muted,
	Parent = posCard,
})
local posPct = mk("TextLabel", {
	Size = UDim2.new(0, 90, 0, 16),
	Position = UDim2.new(1, -102, 0, 8),
	BackgroundTransparency = 1,
	Text = "+8.51%",
	Font = MONO, TextSize = 12, TextXAlignment = Enum.TextXAlignment.Right,
	TextColor3 = C.green,
	Parent = posCard,
})
local posRows = {
	{ "Holdings", fmtN(state.holdings) },
	{ "Avg Price", string.format("%.5f", state.avg) },
	{ "Cost", ("%.3f ROL"):format(state.cost) },
	{ "Now Worth", ("%.3f ROL"):format(state.holdings * state.price) },
	{ "PNL", ("+%.3f ROL"):format(state.holdings * state.price - state.cost) },
}
local posRowLabels = {}
for i, row in ipairs(posRows) do
	local y = 28 + (i - 1) * 19
	local lbl = mk("TextLabel", {
		Size = UDim2.new(0.5, -12, 0, 16), Position = UDim2.new(0, 12, 0, y),
		BackgroundTransparency = 1, Text = row[1],
		Font = Enum.Font.Gotham, TextSize = 12, TextXAlignment = Enum.TextXAlignment.Left,
		TextColor3 = C.muted, Parent = posCard,
	})
	local val = mk("TextLabel", {
		Size = UDim2.new(0.5, -12, 0, 16), Position = UDim2.new(0.5, 0, 0, y),
		BackgroundTransparency = 1, Text = row[2],
		Font = MONO, TextSize = 12, TextXAlignment = Enum.TextXAlignment.Right,
		TextColor3 = C.text, Parent = posCard,
	})
	posRowLabels[row[1]] = val
end

-- ========================= interactions =========================
local function setSide(side)
	state.side = side
	if side == "BUY" then
		buyBtn.BackgroundColor3 = C.teal; buyBtn.TextColor3 = C.tealDark
		sellBtn.BackgroundColor3 = C.panel; sellBtn.TextColor3 = C.muted
		confirmBtn.BackgroundColor3 = C.teal; confirmBtn.TextColor3 = C.tealDark
		confirmBtn.Text = "CONFIRM BUY"
	else
		sellBtn.BackgroundColor3 = C.red; sellBtn.TextColor3 = C.redDark
		buyBtn.BackgroundColor3 = C.panel; buyBtn.TextColor3 = C.muted
		confirmBtn.BackgroundColor3 = C.red; confirmBtn.TextColor3 = C.redDark
		confirmBtn.Text = "CONFIRM SELL"
	end
	updateReceive()
end

buyBtn.MouseButton1Click:Connect(function() setSide("BUY") end)
sellBtn.MouseButton1Click:Connect(function() setSide("SELL") end)

amountBox.FocusLost:Connect(function()
	local v = tonumber(amountBox.Text) or 0
	state.amount = v
	updateReceive()
end)

function updateReceive()
	local a = tonumber(amountBox.Text) or 0
	if state.side == "BUY" then
		receiveLbl.Text = a > 0 and (fmtN(a / state.price) .. " " .. state.ticker:sub(2)) or "—"
	else
		receiveLbl.Text = a > 0 and (fmtN(a * state.price) .. " ROL") or "—"
	end
end

local function refreshPosition()
	local worth = state.holdings * state.price
	local pnl = worth - state.cost
	local pct = state.cost > 0 and (pnl / state.cost * 100) or 0
	posPct.Text = (pct >= 0 and "+" or "") .. string.format("%.2f%%", pct)
	posPct.TextColor3 = pct >= 0 and C.green or C.red
	posRowLabels.Holdings.Text = fmtN(state.holdings)
	posRowLabels["Avg Price"].Text = string.format("%.5f", state.avg)
	posRowLabels.Cost.Text = ("%.3f ROL"):format(state.cost)
	posRowLabels["Now Worth"].Text = ("%.3f ROL"):format(worth)
	local pnlT = posRowLabels.PNL
	pnlT.Text = (pnl >= 0 and "+" or "") .. ("%.3f ROL"):format(pnl)
	pnlT.TextColor3 = pnl >= 0 and C.green or C.red
	walletLbl.Text = ("wallet %.2f ROL"):format(state.wallet)
end

confirmBtn.MouseButton1Click:Connect(function()
	local a = tonumber(amountBox.Text) or 0
	if a <= 0 then return end
	if state.side == "BUY" then
		if a > state.wallet then return end
		local got = a / state.price
		state.holdings += got
		state.cost += a
		state.avg = state.cost / state.holdings
		state.wallet -= a
	else
		a = math.min(a, state.holdings)
		local proceeds = a * state.price
		local share = a / state.holdings
		state.cost -= state.cost * share
		state.holdings -= a
		state.wallet += proceeds
	end
	refreshPosition()
	updateReceive()
	renderChart()
end)

backBtn.MouseButton1Click:Connect(function() root.Visible = false end)
openBtn.MouseButton1Click:Connect(function()
	root.Visible = not root.Visible
	renderChart()
	refreshPosition()
end)

-- keyboard toggle
local UIS = game:GetService("UserInputService")
UIS.InputBegan:Connect(function(input, gp)
	if gp then return end
	if input.KeyCode == Enum.KeyCode.T then
		root.Visible = not root.Visible
		renderChart(); refreshPosition()
	end
end)

-- price ticking: gentle random walk around seed price
task.spawn(function()
	while true do
		task.wait(1)
		state.price = math.max(1e-7, state.price * (1 + (math.random() - 0.48) * 0.012))
		state.candles[#state.candles] = {
			o = state.candles[#state.candles].o,
			c = state.price,
			hi = math.max(state.candles[#state.candles].hi, state.price),
			lo = math.min(state.candles[#state.candles].lo, state.price),
		}
		if root.Visible then
			renderChart()
			refreshPosition()
		end
	end
end)

-- initial render once Size resolves
task.defer(function()
	renderChart()
	refreshPosition()
	updateReceive()
end)

-- optional: server-provided balances via RemoteEvent "TerminalSync"
task.spawn(function()
	local rf = ReplicatedStorage:FindFirstChild("TerminalSync")
	if rf and rf:IsA("RemoteEvent") then
		rf.OnClientEvent:Connect(function(data)
			if type(data) ~= "table" then return end
			if data.wallet then state.wallet = data.wallet end
			if data.holdings then state.holdings = data.holdings end
			if data.avg then state.avg = data.avg end
			if data.cost then state.cost = data.cost end
			if data.price then state.price = data.price end
			if data.ticker then
				state.ticker = data.ticker
				tickerLbl.Text = data.ticker
			end
			if data.name then
				state.name = data.name
				nameLbl.Text = data.name
			end
			refreshPosition()
			renderChart()
		end)
	end
end)

print("[RBXfun] Trench Terminal loaded — press T or tap the ⌗ button")
