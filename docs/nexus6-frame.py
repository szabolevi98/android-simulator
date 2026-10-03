"""Nexus 6 (Midnight Blue) front as an original SVG drawing, in CSS px. The body is the real 82.98 x 159.26 mm and the
5.96" 16:9 display is 74.22 x 131.95 mm; the scale makes the display 411.43 x 731.43 dp at 1 dp = 0.906 px, the
density of the other versions. Run from the repository root: python3 docs/nexus6-frame.py"""
DP = 0.906
SW, SH = 411.4286 * DP, 731.4286 * DP          # display window in CSS px
MM = SW / 74.22                                 # CSS px per mm
W, H = 82.98 * MM, 159.26 * MM
SX, SY = (W - SW) / 2, (H - SH) / 2
R = 10.2 * MM                                   # corner radius of the aluminium frame
f = lambda v: f'{v:.2f}'
def slot(cy, w, h):
    x = (W - w) / 2
    holes = ''.join(f'<rect x="{f(x + 3 + i * 3.1)}" y="{f(cy - h / 2 + 1.2)}" width="1.5" height="{f(h - 2.4)}" rx=".75" fill="#04070b"/>' for i in range(int((w - 6) / 3.1) + 1))
    return (f'<rect x="{f(x)}" y="{f(cy - h / 2)}" width="{f(w)}" height="{f(h)}" rx="{f(h / 2)}" fill="#0b1119" stroke="#24303d" stroke-width=".8"/>'
            f'<clipPath id="s{int(cy)}"><rect x="{f(x)}" y="{f(cy - h / 2)}" width="{f(w)}" height="{f(h)}" rx="{f(h / 2)}"/></clipPath><g clip-path="url(#s{int(cy)})">{holes}</g>')
top, bot = SY / 2 + 1, H - SY / 2 - 1
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(W)} {f(H)}" width="{f(W)}" height="{f(H)}">
<defs>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa7b6"/><stop offset=".3" stop-color="#4c5866"/><stop offset=".62" stop-color="#8794a3"/><stop offset="1" stop-color="#3c4652"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2431"/><stop offset=".5" stop-color="#0d131b"/><stop offset="1" stop-color="#161e29"/></linearGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2=".7"><stop offset="0" stop-color="#fff" stop-opacity=".11"/><stop offset=".3" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect x="0" y="0" width="{f(W)}" height="{f(H)}" rx="{f(R)}" fill="url(#rim)"/>
<rect x="3.2" y="3.2" width="{f(W - 6.4)}" height="{f(H - 6.4)}" rx="{f(R - 3)}" fill="url(#body)"/>
<rect x="{f(SX - 1)}" y="{f(SY - 1)}" width="{f(SW + 2)}" height="{f(SH + 2)}" rx="2" fill="#000"/>
{slot(top, 36 * MM, 2.7 * MM)}
{slot(bot, 36 * MM, 2.7 * MM)}
<circle cx="{f(W / 2 - 24 * MM)}" cy="{f(top)}" r="{f(1.9 * MM)}" fill="#05080c" stroke="#1f2a36" stroke-width="1.2"/>
<circle cx="{f(W / 2 - 24 * MM - .5)}" cy="{f(top - .6)}" r="{f(.75 * MM)}" fill="#14233a"/>
<circle cx="{f(W / 2 + 22 * MM)}" cy="{f(top)}" r="{f(.9 * MM)}" fill="#070a0f"/>
<circle cx="{f(W / 2 + 25.5 * MM)}" cy="{f(top)}" r="{f(.9 * MM)}" fill="#070a0f"/>
<path d="M{f(R)} 3.2H{f(W - R)}A{f(R - 3)} {f(R - 3)} 0 0 1 {f(W - 3.2)} {f(R)}V{f(H * .45)}L3.2 {f(H * .2)}V{f(R)}A{f(R - 3)} {f(R - 3)} 0 0 1 {f(R)} 3.2Z" fill="url(#glare)"/>
</svg>
'''
open('versions/5.1.1/assets/device-nexus-6.svg', 'w').write(svg)
print(f'device {W:.2f} x {H:.2f}, screen {SW:.2f} x {SH:.2f} at {SX:.2f},{SY:.2f}; led {W/2:.2f},{top:.2f}; mm {MM:.4f}')
