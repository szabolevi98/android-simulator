"""Android 6.0.1: draws the image's VectorDrawables as SVG files for versions/6.0.1/assets (status bar signal and Wi-Fi
levels, quick settings icons …). docs/data/mm-vectors.tsv lists them: <output file> TAB <APK under system/> TAB <drawable>
TAB <theme style or -> (the style that resolves ?attr colours, e.g. SystemUI's DualToneLightTheme for the status bar).
    python docs/tools/mm-vectors.py
Reads the compiled XML with aapt2 (xmltree) and the colours and styles with aapt2 (dump resources); framework colours
(@0x01…) come from framework-res.apk. VectorDrawable 6.0 semantics: a group is translate(tx + px, ty + py) rotate(r)
scale(sx, sy) translate(-px, -py); a clip-path clips the siblings drawn after it in its group; fillAlpha / strokeAlpha
multiply the colour's own alpha; the root alpha applies to the whole drawing."""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + '_aosp/bullhead/system/'
AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
OUT = ROOT + 'versions/6.0.1/assets/'
FRAMEWORK = 'framework/framework-res.apk'
_tables = {}

def table(apk):
    """Colours {id: value} and styles {id: {attr id: value}} of an APK, from aapt2 dump resources."""
    if apk in _tables: return _tables[apk]
    text = subprocess.run([AAPT, 'dump', 'resources', SYSTEM + apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    colors, styles, names, current = {}, {}, {}, None
    for line in text.splitlines():
        m = re.match(r'\s+resource (0x[0-9a-f]{8}) (\w+)/(\S+)', line)
        if m:
            current = (m.group(1), m.group(2)); names[m.group(2) + '/' + m.group(3)] = m.group(1)
            if current[1] == 'style': styles[current[0]] = {}
            continue
        if not current: continue
        if current[1] == 'color':
            v = re.match(r'\s+\(\) (#[0-9a-f]+|@\S+)', line)
            if v and current[0] not in colors: colors[current[0]] = v.group(1)
        elif current[1] == 'style':
            v = re.match(r'\s+(\w+)?\((0x[0-9a-f]{8})\)=(\S+)', line) or re.match(r'\s+(0x[0-9a-f]{8})=(\S+)', line)
            if v and len(v.groups()) == 3: styles[current[0]][v.group(2)] = v.group(3)
    _tables[apk] = (colors, styles, names)
    return _tables[apk]

def color(value, apk, theme):
    """#aarrggbb (or a reference to one) -> (#rrggbb, alpha)."""
    for _ in range(8):
        if value.startswith('?'):
            colors, styles, names = table(apk)
            value = styles[names['style/' + theme]][value[1:]]
            continue
        if value.startswith('@'):
            ref = value[1:]
            src = FRAMEWORK if ref.startswith('0x01') or ref.startswith('android:') else apk
            colors, styles, names = table(src)
            rid = ref if ref.startswith('0x') else names.get(ref.split(':')[-1])
            value = colors[rid]
            continue
        break
    v = value.lstrip('#')
    if len(v) == 8: return '#' + v[2:], int(v[:2], 16) / 255
    if len(v) == 6: return '#' + v, 1.0
    if len(v) == 4: return '#' + ''.join(ch * 2 for ch in v[1:]), int(v[0] * 2, 16) / 255
    return '#' + ''.join(ch * 2 for ch in v), 1.0

def tree(apk, name):
    """The drawable's XML as nested [tag, {attr: value}, children]."""
    text = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + apk, '--file', f'res/drawable/{name}.xml'], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    root, stack = None, []
    for line in text.splitlines():
        indent = len(line) - len(line.lstrip())
        s = line.strip()
        if s.startswith('E: '):
            node = [s[3:].split(' ')[0], {}, [], indent]
            while stack and stack[-1][3] >= indent: stack.pop()
            if stack: stack[-1][2].append(node)
            else: root = node
            stack.append(node)
        elif s.startswith('A: ') and stack:
            m = re.match(r'A: (?:[\w:/.]+:)?(\w+)\(0x[0-9a-f]+\)=(.*)', s)
            if not m: continue
            key, value = m.group(1), m.group(2)
            q = re.match(r'"(.*)" \(Raw: ', value)
            if q: value = q.group(1)
            stack[-1][1][key] = value
    return root

num = lambda v, d=0.0: float(re.sub(r'(dp|dip|px)$', '', v)) if v is not None else d
fmt = lambda x: ('%.4f' % (x + 0.0)).rstrip('0').rstrip('.')

def paint(attrs, apk, theme):
    out = []
    if 'fillColor' in attrs:
        c, a = color(attrs['fillColor'], apk, theme); a *= num(attrs.get('fillAlpha'), 1)
        out.append(f'fill="{c}"' + (f' fill-opacity="{fmt(a)}"' if a < 1 else ''))
    else: out.append('fill="none"')
    if 'strokeColor' in attrs:
        c, a = color(attrs['strokeColor'], apk, theme); a *= num(attrs.get('strokeAlpha'), 1)
        out.append(f'stroke="{c}" stroke-width="{fmt(num(attrs.get("strokeWidth"), 0))}"' + (f' stroke-opacity="{fmt(a)}"' if a < 1 else ''))
        cap = {'0': 'butt', '1': 'round', '2': 'square'}.get(attrs.get('strokeLineCap'))
        if cap: out.append(f'stroke-linecap="{cap}"')
        join = {'0': 'miter', '1': 'round', '2': 'bevel'}.get(attrs.get('strokeLineJoin'))
        if join: out.append(f'stroke-linejoin="{join}"')
    return ' '.join(out)

def body(children, apk, theme, ids):
    parts, clip = [], None
    for tag, attrs, kids, _ in children:
        wrap = f' clip-path="url(#{clip})"' if clip else ''
        if tag == 'clip-path':
            ids[0] += 1; clip = f'c{ids[0]}'
            parts.append(f'<clipPath id="{clip}"><path d="{attrs.get("pathData", "")}"/></clipPath>')
        elif tag == 'path':
            parts.append(f'<path d="{attrs.get("pathData", "")}" {paint(attrs, apk, theme)}{wrap}/>')
        elif tag == 'group':
            px, py = num(attrs.get('pivotX')), num(attrs.get('pivotY'))
            tx, ty = num(attrs.get('translateX')), num(attrs.get('translateY'))
            r, sx, sy = num(attrs.get('rotation')), num(attrs.get('scaleX'), 1), num(attrs.get('scaleY'), 1)
            t = f'translate({fmt(tx + px)} {fmt(ty + py)}) rotate({fmt(r)}) scale({fmt(sx)} {fmt(sy)}) translate({fmt(-px)} {fmt(-py)})'
            parts.append(f'<g transform="{t}"{wrap}>{body(kids, apk, theme, ids)}</g>')
    return ''.join(parts)

def svg(apk, name, theme):
    tag, attrs, kids, _ = tree(apk, name)
    # An <inset> around an inline vector (stat_sys_alarm): the insets (dp) widen the box in viewport units.
    inset = {k: 0.0 for k in ('Left', 'Top', 'Right', 'Bottom')}
    if tag == 'inset':
        inset = {k: num(attrs.get('inset' + k)) for k in inset}
        assert kids and kids[0][0] == 'vector', f'{name}: inset without an inline vector'
        tag, attrs, kids, _ = kids[0]
    assert tag == 'vector', f'{name} is a {tag}'
    vw, vh = num(attrs.get('viewportWidth')), num(attrs.get('viewportHeight'))
    w, h = num(attrs.get('width')), num(attrs.get('height'))
    ux, uy = vw / w, vh / h
    x0, y0 = -inset['Left'] * ux, -inset['Top'] * uy
    vw += (inset['Left'] + inset['Right']) * ux; vh += (inset['Top'] + inset['Bottom']) * uy
    w += inset['Left'] + inset['Right']; h += inset['Top'] + inset['Bottom']
    alpha = num(attrs.get('alpha'), 1)
    inner = body(kids, apk, theme, [0])
    if alpha < 1: inner = f'<g opacity="{fmt(alpha)}">{inner}</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{fmt(w)}" height="{fmt(h)}" viewBox="{fmt(x0)} {fmt(y0)} {fmt(vw)} {fmt(vh)}">'
            f'<!-- {apk} res/drawable/{name}.xml (VectorDrawable), drawn by docs/tools/mm-vectors.py -->{inner}</svg>\n')

if __name__ == '__main__':
    rows = [l.rstrip('\n').split('\t') for l in open(ROOT + 'docs/data/mm-vectors.tsv', encoding='utf-8') if l.strip() and not l.startswith('#')]
    for out, apk, name, theme in rows:
        open(OUT + out, 'w', encoding='utf-8', newline='\n').write(svg(apk, name, None if theme == '-' else theme))
    print(len(rows), 'vectors')
