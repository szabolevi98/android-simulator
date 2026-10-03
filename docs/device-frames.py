"""Device frames as original SVG drawings. Only the outline geometry is measured from reference renders (alpha mask);
all shading is drawn here. Output coordinates are CSS px, scaled so the display matches the simulator screen."""
from PIL import Image
import math, json, os

def outline(path, body_x, body_y, scale, origin, cut_side_buttons=True, thr=110, mirror=False):
    im = Image.open(path).convert('RGBA'); W, H = im.size; px = im.load()
    x0, x1 = body_x; y0, y1 = body_y
    left, right = {}, {}
    for y in range(y0, y1 + 1):
        xs = [x for x in range(W) if px[x, y][3] > thr]
        if not xs: continue
        l, r = xs[0], xs[-1]
        if cut_side_buttons: l, r = max(l, x0), min(r, x1)
        left[y], right[y] = l, r
    # A symmetric front whose render is slightly skewed (Nexus S): take the left edge as the mirror of the right one,
    # so the side buttons and the render's shading cannot make it wavy...
    if mirror:
        for y in right: left[y] = x0 + x1 - right[y]
    # top / bottom profile per column for the curved edges
    top, bot = {}, {}
    for x in range(x0, x1 + 1):
        ys = [y for y in range(y0, y1 + 1) if px[x, y][3] > thr]
        if ys: top[x], bot[x] = ys[0], ys[-1]
    if mirror:
        # ...and the left half of the top and bottom edges (the rounded corners) as the mirror of the right half.
        for x in list(top):
            if x < (x0 + x1) / 2 and (x0 + x1 - x) in top: top[x], bot[x] = top[x0 + x1 - x], bot[x0 + x1 - x]
    ox, oy = origin
    pts = []
    # walk: top edge left->right, right side top->bottom, bottom edge right->left, left side bottom->top
    for x in range(x0, x1 + 1, 4):
        if x in top: pts.append((x, top[x]))
    for y in range(min(right), max(right) + 1, 6): pts.append((right[y], y))
    for x in range(x1, x0 - 1, -4):
        if x in bot: pts.append((x, bot[x]))
    for y in range(max(left), min(left) - 1, -6): pts.append((left[y], y))
    # keep only the outer hull ordering: drop points that fall inside (corners are covered by both walks)
    sc = [((x - ox) * scale, (y - oy) * scale) for x, y in pts]
    return sc

def smooth_path(pts):
    # Catmull-Rom to cubic Bezier, closed.
    n = len(pts); d = f'M{pts[0][0]:.2f} {pts[0][1]:.2f}'
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}'
    return d + 'Z'

def hull_filter(pts, cx, cy):
    # order by angle around the centre and keep the farthest point per angular bin -> clean silhouette
    bins = {}
    for x, y in pts:
        a = round(math.degrees(math.atan2(y - cy, x - cx)) * 2) / 2
        r = math.hypot(x - cx, y - cy)
        if a not in bins or r > bins[a][2]: bins[a] = (x, y, r)
    out = [(x, y) for a, (x, y, r) in sorted(bins.items())]
    # thin to ~180 points
    step = max(1, len(out) // 180)
    return out[::step]

# Nexus S capacitive key glyphs in a 24-unit box: Back, Menu, Search, Home (left to right on the glass).
TOUCHKEYS = {
    'back': '<path d="M8.5 5.5 5 9l3.5 3.5M5.5 9H15a4.5 4.5 0 0 1 0 9H8"/>',
    'menu': '<path d="M9 6h11M4 10h16M4 14h16M4 18h16"/>',
    'search': '<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5.5 5.5"/>',
    'home': '<path d="M2.5 12.5 12 4.5l9.5 8M6 10.5V19h12v-8.5"/>',
}

def frame(name, ref, body_x, body_y, screen, css_screen, features, buttons, palette, thr=110, mirror=False):
    sx0, sy0, sx1, sy1 = screen
    scale = css_screen[0] / (sx1 - sx0)
    origin = (body_x[0], body_y[0])
    pts = outline(ref, body_x, body_y, scale, origin, thr=thr, mirror=mirror)
    w = (body_x[1] - body_x[0]) * scale; h = (body_y[1] - body_y[0]) * scale
    pts = hull_filter(pts, w / 2, h / 2)
    d = smooth_path(pts)
    pad = {'left': (sx0 - body_x[0]) * scale, 'top': (sy0 - body_y[0]) * scale, 'right': (body_x[1] - sx1) * scale, 'bottom': (body_y[1] - sy1) * scale}
    m = 6  # margin for side buttons and the rim stroke
    W, H = w + 2 * m, h + 2 * m
    S = lambda v: v * scale
    feat = []
    for f in features:
        kind = f[0]
        if kind == 'slot':
            _, cx, cy, fw, fh = f; x, y = S(cx - origin[0]) + m, S(cy - origin[1]) + m; ww, hh = S(fw), S(fh)
            feat.append(f'<rect x="{x - ww / 2:.2f}" y="{y - hh / 2:.2f}" width="{ww:.2f}" height="{hh:.2f}" rx="{hh / 2:.2f}" fill="url(#grille)" stroke="#3b3f42" stroke-width=".7"/>')
            dots = int(ww / 2.1)
            feat.append(''.join(f'<circle cx="{x - ww / 2 + hh / 2 + i * (ww - hh) / max(1, dots - 1):.2f}" cy="{y:.2f}" r=".45" fill="#2a2e31"/>' for i in range(dots)))
        elif kind == 'notch':
            _, cx, y0, w0, w1, depth = f; x = S(cx - origin[0]) + m; top = S(y0 - origin[1]) + m
            a, b, dd = S(w0) / 2, S(w1) / 2, S(depth)
            feat.append(f'<path d="M{x - a:.2f} {top:.2f}L{x - b:.2f} {top + dd:.2f}H{x + b:.2f}L{x + a:.2f} {top:.2f}Z" fill="#060707" stroke="#30353a" stroke-width=".5"/>')
            feat.append(f'<rect x="{x - b + 1:.2f}" y="{top + dd - 1.8:.2f}" width="{2 * b - 2:.2f}" height="1.2" rx=".6" fill="url(#grille)"/>')
        elif kind == 'lens':
            _, cx, cy, r = f; x, y = S(cx - origin[0]) + m, S(cy - origin[1]) + m
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(r):.2f}" fill="url(#lens)" stroke="#2c3236" stroke-width=".8"/>')
        elif kind == 'touchkey':
            _, glyph, cx, cy, size = f; x, y = S(cx - origin[0]) + m, S(cy - origin[1]) + m; k = S(size) / 24
            feat.append(f'<g transform="translate({x - 12 * k:.2f} {y - 12 * k:.2f}) scale({k:.4f})" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{TOUCHKEYS[glyph]}</g>')
        elif kind == 'roundgrille':
            # Nexus 5 earpiece: a round grille of small holes in a dark ring.
            _, cx, cy, r = f; x, y = S(cx - origin[0]) + m, S(cy - origin[1]) + m; rr = S(r)
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rr:.2f}" fill="#0b0c0d" stroke="#3a3d40" stroke-width=".6"/>')
            holes = []
            for ring, count in ((0, 1), (.33, 6), (.62, 12)):
                for i in range(count):
                    a = 2 * math.pi * i / count
                    holes.append(f'<circle cx="{x + math.cos(a) * rr * ring:.2f}" cy="{y + math.sin(a) * rr * ring:.2f}" r="{rr * .1:.2f}" fill="#262a2d"/>')
            feat.append(''.join(holes))
        elif kind == 'sensor':
            _, cx, cy, rx, ry = f; x, y = S(cx - origin[0]) + m, S(cy - origin[1]) + m
            feat.append(f'<ellipse cx="{x:.2f}" cy="{y:.2f}" rx="{S(rx):.2f}" ry="{S(ry):.2f}" fill="#16191b" stroke="#25292c" stroke-width=".5"/>')
    btn = []
    for side, y0, y1, out in buttons:
        yy0, yy1 = S(y0 - origin[1]) + m, S(y1 - origin[1]) + m; o = S(out) + 1.2
        x = m - o if side == 'left' else m + w - .5
        btn.append(f'<rect x="{x:.2f}" y="{yy0:.2f}" width="{o + .5:.2f}" height="{yy1 - yy0:.2f}" rx="1.2" fill="url(#key)"/>')
    p = palette
    # Optional glass panel edge (Nexus S): the curved glass sits inside the plastic bezel and catches a thin highlight.
    gi = p.get('glassInset', 0)
    glass = f'<path d="{d}" transform="translate({m + gi} {m + gi}) scale({(w - 2 * gi) / w:.4f} {(h - 2 * gi) / h:.4f})" fill="none" stroke="url(#glassEdge)" stroke-width="1.1"/>' if gi else ''
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.2f}" height="{H:.2f}">
<defs>
<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{p['body'][0]}"/><stop offset=".45" stop-color="{p['body'][1]}"/><stop offset="1" stop-color="{p['body'][2]}"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{p['rim'][0]}"/><stop offset=".5" stop-color="{p['rim'][1]}"/><stop offset="1" stop-color="{p['rim'][2]}"/></linearGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2=".55"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".38" stop-color="#fff" stop-opacity=".045"/><stop offset=".385" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="chin" x1="0" y1="0" x2="0" y2="1"><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset=".975" stop-color="#fff" stop-opacity="{p['chin']}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="grille" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020303"/><stop offset=".55" stop-color="#15181a"/><stop offset="1" stop-color="#050606"/></linearGradient>
<radialGradient id="lens" cx=".42" cy=".38" r=".6"><stop offset="0" stop-color="#25384a"/><stop offset=".45" stop-color="#0b1219"/><stop offset="1" stop-color="#040608"/></radialGradient>
<linearGradient id="key" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121416"/><stop offset=".55" stop-color="#55595c"/><stop offset="1" stop-color="#1b1e20"/></linearGradient>
<linearGradient id="glassEdge" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>
<clipPath id="clip"><path d="{d}" transform="translate({m} {m})"/></clipPath>
</defs>
{''.join(btn)}
<path d="{d}" transform="translate({m} {m})" fill="url(#body)" stroke="url(#rim)" stroke-width="{p['rimWidth']}"/>
<g clip-path="url(#clip)"><path d="{d}" transform="translate({m} {m}) scale({(w - 3) / w:.4f} {(h - 3) / h:.4f}) translate(1.5 1.5)" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="1.2"/>
{glass}<rect x="0" y="0" width="{W:.2f}" height="{H:.2f}" fill="url(#glare)"/><rect x="0" y="0" width="{W:.2f}" height="{H:.2f}" fill="url(#chin)"/></g>
{''.join(feat)}
</svg>'''
    return svg, {'width': round(W, 2), 'height': round(H, 2), 'margin': m, 'pad': {k: round(v + m, 2) for k, v in pad.items()}, 'scale': scale,
                 'buttons': [{'side': s, 'top': round(S(a - origin[1]) + m, 1), 'height': round(S(b - a), 1)} for s, a, b, o in buttons]}

out = {}
if os.path.exists('gn-render.png'):
  svg, info = frame('galaxy-nexus', 'gn-render.png', (23, 861), (22, 1691), (80, 231, 800, 1511), (306, 545),
    [('slot', 442, 105, 195, 17), ('sensor', 572, 105, 15, 9), ('sensor', 616, 105, 10, 10), ('lens', 708, 112, 14)],
    [('right', 395, 522, 5), ('left', 552, 815, 8)],
    {'body': ['#191b1d', '#050606', '#0c0d0e'], 'rim': ['#c3c8cb', '#6c7073', '#b2b7ba'], 'rimWidth': 4.6, 'chin': .16})
  open('device-galaxy-nexus.svg', 'w').write(svg); out['gn'] = info
if os.path.exists('n4-ref.png'):
  svg, info = frame('nexus-4', 'n4-ref.png', (47, 899), (38, 1706), (89, 225, 857, 1505), (327, 545),
    [('notch', 473, 58, 190, 160, 20), ('sensor', 145, 112, 9, 9), ('sensor', 172, 112, 9, 9), ('lens', 778, 116, 13)],
    [('right', 300, 400, 5), ('left', 330, 560, 5)],
    {'body': ['#18191b', '#060707', '#0d0e0f'], 'rim': ['#8e9396', '#3f4346', '#83888b'], 'rimWidth': 3.0, 'chin': .05}, thr=235)
  open('device-nexus-4.svg', 'w').write(svg); out['n4'] = info
# Nexus S (Samsung GT-I9020, crespo): glossy black Contour Display, no metal rim, four capacitive keys under the glass.
# The display window is 480 x 800 at 0.575 (276 x 460), sized to the 4.0" panel next to the 4.65" Galaxy Nexus.
if os.path.exists('ns-render.png'):
  svg, info = frame('nexus-s', 'ns-render.png', (40, 1012), (26, 2016), (112, 330, 940, 1710), (276, 460),
    [('slot', 521, 165, 238, 30), ('lens', 740, 155, 19),
     ('touchkey', 'back', 226, 1828, 84), ('touchkey', 'menu', 430, 1828, 84), ('touchkey', 'search', 621, 1828, 84), ('touchkey', 'home', 813, 1828, 84)],
    [('right', 396, 563, 7), ('left', 571, 873, 7)],
    {'body': ['#121314', '#020203', '#09090a'], 'rim': ['#3c4043', '#0a0b0c', '#34383b'], 'rimWidth': 2.2, 'chin': .1, 'glassInset': 4.5}, mirror=True)
  open('device-nexus-s.svg', 'w').write(svg); out['ns'] = info
# Nexus 5 (LG-D821, hammerhead): matte black body with a thin grey rim, front camera left, the round earpiece grille in the
# middle, proximity / light sensors right. Traced from Google's front render (Wikimedia Commons "Nexus 5 Front View.png",
# CC BY 2.5, Google Android), whose display is exactly 1080 x 1920 at (304, 436). The render has a soft drop shadow under the
# bottom edge, so the alpha threshold is 235 (as for the Nexus 4) to keep it out of the outline. The 4.95" panel next to the 4.65" Galaxy
# Nexus (545 px tall) is 580 px tall, so the window is 326.25 x 580 (1 dp = 0.906 px).
if os.path.exists('n5-render.png'):
  svg, info = frame('nexus-5', 'n5-render.png', (251, 1438), (243, 2614), (304, 436, 1384, 2356), (326.25, 580),
    [('lens', 447, 362, 14), ('roundgrille', 843, 358, 28), ('sensor', 1220, 357, 10, 10), ('sensor', 1262, 357, 6, 6)],
    [('right', 548, 696, 9), ('left', 704, 1076, 9)],
    {'body': ['#1d1d1e', '#0d0d0e', '#151516'], 'rim': ['#6a6b6d', '#2e2f30', '#5c5d5f'], 'rimWidth': 3.2, 'chin': .06}, thr=235)
  open('device-nexus-5.svg', 'w').write(svg); out['n5'] = info
print(json.dumps(out, indent=1))
