"""Draws the site's two data pictures from the app's own swap data:

- assets/trade-graph.svg: every coin on a wheel, a line for every pair Kalda can swap, coloured by
  the exchange or bridge that does it (data/swap-graph.json).
- assets/trade-roads.svg: every road the app weighs for one swap, fanning out from the coin you
  have and meeting at the coin you want (data/swap-roads.json).

Both data files come from the app's swapGraph.ts (hopRoutes / candidatePaths). Run:
    python3 tools/make-graphics.py
"""
import json
import math

COLORS = {
    "BTC": "#F7931A", "ETH": "#8C9EFF", "USDC": "#2775CA", "USDT": "#26A17B", "RLUSD": "#3D7BFF",
    "XRP": "#23B5E8", "ZEC": "#F4B728", "SOL": "#9945FF", "BNB": "#F3BA2F", "DOGE": "#C2A633",
    "LTC": "#A6B9E0", "BCH": "#8DC351", "AVAX": "#E84142", "TRX": "#FF3B48", "XMR": "#FF6600",
    "ADA": "#4F7DF0", "ATOM": "#9FA4DD", "RUNE": "#33FF99", "XLM": "#7DD3FC", "POL": "#8247E5",
    "NEAR": "#00EC97", "SUI": "#4DA2FF", "LINK": "#4A7BFF", "UNI": "#FF007A", "PEPE": "#4C9540",
    "XAUT": "#E2B04A", "EURC": "#5B8DEF", "AUSD": "#9AD1C4", "ARB": "#28A0F0", "EIGEN": "#B9A3FF",
    "MANA": "#FF2D55", "VIRTUAL": "#6EE7F9", "CAKE": "#D1884F", "ICP": "#F15A24",
}
ROUTES = {  # exchange or bridge: colour, how far its curves bow into the wheel
    "near": ("#8E7CFF", 0.12),
    "thorchain": ("#33FF99", 0.38),
    "relay": ("#FFB84D", 0.6),
    "uniswap": ("#FF5FA2", 0.8),
    "cctp": ("#7DD3FC", 0.92),
    "xrpl": ("#7DD3FC", 0.92),
    "stellar": ("#7DD3FC", 0.92),
}
NETWORKS = {"base": "Base", "stellar": "Stellar", "polygon": "Polygon", "bsc": "BNB", "solana": "Solana", "tron": "TRON"}
GROUPS = [
    ["BTC", "LTC", "BCH", "DOGE", "ZEC", "XMR"],
    ["ETH", "ETH@base", "BNB", "SOL", "AVAX", "POL", "TRX", "SUI", "NEAR", "ADA", "ATOM", "RUNE", "XRP", "XLM"],
    ["UNI", "LINK", "PEPE", "ARB", "EIGEN", "MANA", "VIRTUAL", "CAKE", "ICP", "XAUT"],
]


def color(sym):
    return COLORS.get(sym.split("@")[0], "#8892A6")


def label(sym):
    base, _, net = sym.partition("@")
    return (base, NETWORKS.get(net, net)) if net else (base, "")


def group_of(sym):
    for i, g in enumerate(GROUPS):
        if sym in g:
            return i, g.index(sym)
    return len(GROUPS), 0  # dollars and stablecoins last


def wheel():
    data = json.load(open("data/swap-graph.json"))
    coins = sorted(data["coins"], key=lambda s: (group_of(s), s))
    n, cx, cy, r = len(coins), 600, 600, 430
    pos = {}
    for i, s in enumerate(coins):
        a = -math.pi / 2 + 2 * math.pi * i / n
        pos[s] = (a, cx + r * math.cos(a), cy + r * math.sin(a))

    edges = []
    for a, b, routes in data["edges"]:
        _, x1, y1 = pos[a]
        _, x2, y2 = pos[b]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        for route in routes:
            stroke, bow = ROUTES.get(route, ("#8892A6", 0.9))
            qx, qy = cx + (mx - cx) * bow, cy + (my - cy) * bow
            edges.append(f'<path d="M{x1:.1f} {y1:.1f}Q{qx:.1f} {qy:.1f} {x2:.1f} {y2:.1f}" stroke="{stroke}"/>')

    nodes, labels = [], []
    for s in coins:
        a, x, y = pos[s]
        nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{color(s)}" stroke="#0B0E14" stroke-width="3"/>')
        deg = math.degrees(a)
        flip = 90 < deg % 360 < 270
        lx, ly = cx + (r + 22) * math.cos(a), cy + (r + 22) * math.sin(a)
        rot = deg + 180 if flip else deg
        anchor = "end" if flip else "start"
        name, net = label(s)
        sub = f'<tspan class="net"> {net}</tspan>' if net else ""
        labels.append(
            f'<text x="{lx:.1f}" y="{ly:.1f}" transform="rotate({rot:.2f} {lx:.1f} {ly:.1f})" text-anchor="{anchor}" dominant-baseline="central">{name}{sub}</text>'
        )

    pairs = len(data["edges"])
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="Every coin pair Kalda can swap: {len(coins)} coins, {pairs} pairs">
<style>
  .edges path {{ fill: none; stroke-width: 1.1; stroke-opacity: 0.22; mix-blend-mode: screen; }}
  text {{ font: 600 17px Inter, system-ui, -apple-system, sans-serif; fill: #F2F4F8; }}
  .net {{ font-weight: 500; font-size: 13px; fill: #8892A6; }}
  .big {{ font-size: 76px; font-weight: 800; fill: #F2F4F8; }}
  .small {{ font-size: 20px; font-weight: 500; fill: #8892A6; }}
</style>
<defs><radialGradient id="glow"><stop offset="0" stop-color="#8E7CFF" stop-opacity="0.22"/><stop offset="1" stop-color="#8E7CFF" stop-opacity="0"/></radialGradient></defs>
<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#glow)"/>
<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#2A3142" stroke-width="1.5"/>
<g class="edges">{"".join(edges)}</g>
<circle cx="{cx}" cy="{cy}" r="96" fill="#0B0E14" fill-opacity="0.82"/>
<text class="big" x="{cx}" y="{cy - 6}" text-anchor="middle">{pairs}</text>
<text class="small" x="{cx}" y="{cy + 34}" text-anchor="middle">pairs you can swap</text>
<g>{"".join(nodes)}</g>
<g>{"".join(labels)}</g>
</svg>
"""
    open("assets/trade-graph.svg", "w").write(svg)
    print(f"trade-graph.svg: {len(coins)} coins, {pairs} pairs, {len(edges)} lines")


def roads():
    data = json.load(open("data/swap-roads.json"))
    paths = [[c for _, c in road] for road in data["roads"]]
    start, end = data["from"], data["to"]
    # The roads as a tree of their middles: a node per distinct start of a road.
    children = {(): []}
    for p in paths:
        mids = p[1:-1]
        for k in range(1, len(mids) + 1):
            key = tuple(mids[:k])
            if key not in children:
                children[key] = []
                children[key[:-1]].append(key)
    ends = {tuple(p[1:-1]) for p in paths}
    # Rows: one per road, in tree order; a node sits at the middle of its roads.
    order, rows = [], {}

    def walk(key):
        if key in ends:
            order.append(key)
        for c in children[key]:
            walk(c)

    walk(())
    gap, top = 23, 50
    for i, key in enumerate(order):
        rows.setdefault(key, []).append(top + i * gap)

    def ys(key):
        out = list(rows.get(key, []))
        for c in children[key]:
            out += ys(c)
        return out

    height = top * 2 + (len(order) - 1) * gap
    xs = [70, 330, 580, 830, 1130]
    mid_y = height / 2

    def y_of(key):
        v = ys(key)
        return mid_y if not key else sum(v) / len(v)

    lit = ("USDC@stellar", "USDC@base")
    lines, nodes = [], []

    def curve(x1, y1, x2, y2, stroke, cls=""):
        dx = (x2 - x1) * 0.5
        c = f' class="{cls}"' if cls else ""
        return f'<path{c} d="M{x1:.1f} {y1:.1f}C{x1 + dx:.1f} {y1:.1f} {x2 - dx:.1f} {y2:.1f} {x2:.1f} {y2:.1f}" stroke="{stroke}"/>'

    def pill(x, y, sym, depth_end=False):
        name, net = label(sym)
        text = f"{name} {net}".strip()
        w = 13 + len(text) * 8.2
        anchor_x = x - w / 2
        return (
            f'<g><rect x="{anchor_x:.1f}" y="{y - 11:.1f}" width="{w:.1f}" height="22" rx="11" fill="#151A24" stroke="{color(sym)}" stroke-opacity="0.7"/>'
            f'<text x="{x:.1f}" y="{y + 0.5:.1f}" text-anchor="middle" dominant-baseline="central">{name}'
            + (f'<tspan class="net"> {net}</tspan>' if net else "")
            + "</text></g>"
        )

    for key in children:
        x, y = xs[len(key)], y_of(key)
        for c in children[key]:
            on = lit[: len(c)] == c
            lines.append(curve(x, y, xs[len(c)], y_of(c), color(c[-1]), "lit" if on else ""))
        if key in ends:
            on = key == lit
            lines.append(curve(x, y, xs[-1], mid_y, color(end), "lit" if on else ""))
        if key:
            nodes.append(pill(x, y, key[-1]))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 {height:.0f}" role="img" aria-label="The {len(paths)} roads Kalda weighs to swap {start} for {end}">
<style>
  path {{ fill: none; stroke-width: 1.6; stroke-opacity: 0.45; }}
  path.lit {{ stroke: #FBE7A1; stroke-width: 4; stroke-opacity: 1; filter: drop-shadow(0 0 6px rgba(226,176,74,0.8)); }}
  text {{ font: 600 12.5px Inter, system-ui, -apple-system, sans-serif; fill: #F2F4F8; }}
  .net {{ font-weight: 500; font-size: 10.5px; fill: #8892A6; }}
  .end {{ font-size: 17px; font-weight: 800; }}
</style>
<g>{"".join(sorted(lines, key=lambda l: 'class="lit"' in l))}</g>
<g>{"".join(nodes)}</g>
<circle cx="{xs[0]}" cy="{mid_y:.1f}" r="34" fill="{color(start)}" stroke="#0B0E14" stroke-width="4"/>
<text class="end" x="{xs[0]}" y="{mid_y + 1:.1f}" text-anchor="middle" dominant-baseline="central" fill="#0B0E14" style="fill:#0B0E14">{start}</text>
<circle cx="{xs[-1]}" cy="{mid_y:.1f}" r="34" fill="{color(end)}" stroke="#0B0E14" stroke-width="4"/>
<text class="end" x="{xs[-1]}" y="{mid_y + 1:.1f}" text-anchor="middle" dominant-baseline="central" style="fill:#0B0E14">{end}</text>
</svg>
"""
    open("assets/trade-roads.svg", "w").write(svg)
    print(f"trade-roads.svg: {len(paths)} roads, {len(children) - 1} middle stops")


wheel()
roads()
