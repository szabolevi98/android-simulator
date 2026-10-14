"""The screen's CSS in dp, as docs/tools/px-to-dp.mjs writes it, for the generators that write a version's stylesheet:
every px length outside comments, strings and url() becomes calc(N * var(--dp)) with N = px / scale (4 decimals, away
from zero, whole when exact), exactly one dp becomes var(--dp), and a rule's own --dp goes (the page sets it).
    from dp_css import to_dp; css = to_dp(css, 0.85)"""
import math
import re

PX = re.compile(r'(^|[^\w.#-])(-?)(\d+\.?\d*|\.\d+)px(?![\w-])')
CHUNK = re.compile(r'/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|url\([^)]*\)|[^"\'/u]+|.')


def fmt(n):
    r = round(n)
    if abs(n - r) < 1e-6:
        return str(r)
    v = math.copysign(math.ceil(abs(n) * 1e4 - 1e-6) / 1e4, n)
    t = ('%.4f' % v).rstrip('0')
    return re.sub(r'^(-?)0\.', r'\1.', t)


def to_dp(css, scale):
    scale = float(scale)
    css = re.sub(r'(^|;|\{)\s*--dp\s*:[^;}]*(;|(?=\}))', lambda m: m.group(1) if m.group(1) != ';' or not m.group(2) else ';', css)

    def one(m):
        px = float(m.group(2) + m.group(3))
        if not px:
            return m.group(0)
        if abs(px - scale) < 1e-9:
            return m.group(1) + 'var(--dp)'
        return f'{m.group(1)}calc({fmt(px / scale)} * var(--dp))'

    return ''.join(c if re.match(r'/\*|"|\'|url\(', c) else PX.sub(one, c) for c in CHUNK.findall(css))
