"""Nexus 5 KTU84P Google Now Launcher search plate and all-apps geometry.

GoogleHome 1.0.10.1069658 is the stub; GEL, Launcher3 and SearchPlate live in
Velvet 3.3.11.1069658.arm. Read its own resources and DynamicGrid's Nexus 5
profile, not a screenshot. The arithmetic below ports DeviceProfile.layout /
updateIconSize and ShortcutAndWidgetContainer.measureChild from that APK.
    python docs/kitkat-launcher.py
Writes gel-factory.css, the original xxhdpi PNGs and a source manifest.
"""
import hashlib, io, json, math, re, struct
from pathlib import Path
import ext4
from fontTools.ttLib import TTFont
from PIL import Image
from androguard.core.apk import APK
from androguard.core.dex import DEX
from image_res import ROOT, ImageRes

root = Path(ROOT)
out = root / 'versions/4.4.4'
apk_path = root / '_aosp/hammerhead/system/priv-app/Velvet.apk'
apk = APK(str(apk_path))
assert apk.get_androidversion_name() == '3.3.11.1069658.arm'
assert APK(str(root / '_aosp/hammerhead/system/app/GoogleHome.apk')).get_androidversion_name() == '1.0.10.1069658'
ar, pkg, _ = ImageRes('hammerhead')._apk('Velvet')

def resource(kind, name):
    rid = ar.get_res_id_by_key(pkg, kind, name)
    return next(e for cfg, e in ar.get_res_configs(rid) if not cfg.get_qualifier())

def dimen(name):
    value = resource('dimen', name).key.data
    mantissa = value & 0xffffff00
    if mantissa & 0x80000000:
        mantissa -= 0x100000000
    return mantissa * [1/256, 1/32768, 1/8388608, 1/2147483648][(value >> 4) & 3]

assets = {}
def drawable(name):
    rid = ar.get_res_id_by_key(pkg, 'drawable', name)
    cfg = next(c for c, _ in ar.get_res_configs(rid) if c.get_qualifier() == 'xxhdpi-v4')
    path = ar.get_resolved_res_configs(rid, cfg)[0][1]
    raw = apk.get_file(path)
    target = 'gel-' + name + '.png'
    (out / 'assets' / target).write_bytes(raw)
    size = Image.open(io.BytesIO(raw)).size
    assets[name] = {'apkPath': path, 'target': target, 'size': size, 'sha256': hashlib.sha256(raw).hexdigest()}
    return raw, size

_, logo_size = drawable('ic_google_small_light')
drawable('ic_google_small_light_pressed')
_, mic_size = drawable('ic_mic_light')
plate, plate_size = drawable('search_bg_transparent')
# Compiled PNG npTc fields are big-endian; the original image has no 1px guide border.
pos = 8
while pos < len(plate):
    length = struct.unpack_from('>I', plate, pos)[0]
    chunk = plate[pos+8:pos+8+length]
    if plate[pos+4:pos+8] == b'npTc':
        left, right, top, bottom = struct.unpack_from('>4I', chunk, 12)
        x0, x1, y0, y1 = struct.unpack_from('>4I', chunk, 32)
        break
    pos += length + 12
else:
    raise ValueError('search_bg_transparent has no nine-patch chunk')

# Decode the actual DynamicGrid constants (float bits, not decompiler integer literals).
dex = DEX(apk.get_dex())
grid = next(c for c in dex.get_classes() if c.get_name() == 'Lcom/android/launcher3/DynamicGrid;')
clinit = next(m for m in grid.get_methods() if m.get_name() == '<clinit>')
first = next(i.get_output() for i in clinit.get_instructions() if i.get_name().startswith('const'))
icon_dp = struct.unpack('<f', struct.pack('<I', int(first.split(', ')[1])))[0]
init = next(m for m in grid.get_methods() if m.get_name() == '<init>')
instructions = list(init.get_instructions())
start = next(i for i, ins in enumerate(instructions) if ins.get_name() == 'const-string' and '"Nexus 5"' in ins.get_output())
values = {}
for ins in instructions[start+1:start+10]:
    match = re.fullmatch(r'v([34568]), (\d+)', ins.get_output())
    if match and ins.get_name().startswith('const'):
        values[int(match[1])] = struct.unpack('<f', struct.pack('<I', int(match[2])))[0]
text_dp = values[8]
assert (icon_dp, text_dp, values[5], values[6]) == (60, 13, 4, 4)

dimensions = {name: dimen(name) for name in ['dynamic_grid_edge_margin', 'dynamic_grid_icon_drawable_padding',
    'dynamic_grid_all_apps_cell_padding', 'dynamic_grid_page_indicator_height', 'search_bar_text_size',
    'recognizer_view_padding', 'search_plate_end_gap']}
integers = {name: resource('integer', name).key.data for name in ['config_dynamic_grid_max_long_edge_cell_count',
    'config_dynamic_grid_max_short_edge_cell_count', 'config_dynamic_grid_min_edge_cell_count', 'config_appsCustomizeSpringLoadedBgAlpha']}
# Nexus 5: 1080x1920, density 3; status/nav insets 24/48dp. Match Android's native-pixel rounding.
density = 3
width, height = 1080, 1704
icon = round(icon_dp * density)
text = round(text_dp * density)
gap = round(dimensions['dynamic_grid_icon_drawable_padding'] * density)
cell_padding = round(dimensions['dynamic_grid_all_apps_cell_padding'] * density)
indicator = round(dimensions['dynamic_grid_page_indicator_height'] * density)
rows = max(integers['config_dynamic_grid_min_edge_cell_count'], min(integers['config_dynamic_grid_max_long_edge_cell_count'], (height-indicator)//(icon+gap+text+cell_padding)))
cols = max(integers['config_dynamic_grid_min_edge_cell_count'], min(integers['config_dynamic_grid_max_short_edge_cell_count'], width//(icon+cell_padding)))
a = (width-icon*cols)//(2*(cols+1))
b = (height-(icon+gap+text)*rows)//(2*(rows+1))
a = min(a, int((a+b)*.75))
b = min(b, int((a+b)*.75))
page_bottom = max(0, indicator-b)
with open(root / '_aosp/hammerhead/system.raw.img', 'rb') as system:
    font_raw = ext4.Volume(system).inode_at('/fonts/Roboto-Regular.ttf').open().read()
font = TTFont(io.BytesIO(font_raw))
font_height = math.ceil((font['head'].yMax-font['head'].yMin)*text/font['head'].unitsPerEm)
content_height = icon+gap+font_height
native_cell = (height-page_bottom)//rows
first_icon = (native_cell-content_height)//2
# SearchPlate: 6dp logo top padding; RecognizerView has 4dp padding on all sides,
# 4dp end margin (end_gap - padding). GelSearchPlateContainer uses search_bg's padding.
mic_padding = dimensions['recognizer_view_padding'] * density
end_margin = (dimensions['search_plate_end_gap']-dimensions['recognizer_view_padding']) * density
inner_height = max(logo_size[1]+6*density, mic_size[1]+2*mic_padding)
scale = .906 / density
def px(native): return f'{native*scale:.2f}px'
alpha = int(255*integers['config_appsCustomizeSpringLoadedBgAlpha']/100)
css = f'''/* Generated by docs/kitkat-launcher.py from KTU84P's GoogleHome 1.0.10 / Velvet 3.3.11.
   GEL.getQsbBar -> SearchOverlayImpl -> GelSearchPlateContainer + search_plate.xml (mode 11).
   Original xxhdpi assets, npTc slices/padding; SearchPlateHotwordHint, LauncherSearchButton,
   RecognizerView and SearchPlate.onFinishInflate. No screenshot-derived offsets.
   DeviceProfile / CellLayout / ShortcutAndWidgetContainer: {cols}x{rows} apps, {icon_dp:g}dp icons,
   {text_dp:g}sp labels; page bottom {page_bottom}px and first icon {first_icon}px in native pixels. */
.kk-home.gel-home .home-search{{left:0;right:0;top:var(--sb);height:{px(top+inner_height+bottom)};margin:0;border:0;border-image:none;padding:{px(top)} {px(right)} {px(bottom)} {px(left)};background:none}}
.kk-home.gel-home .home-search::before{{content:'';position:absolute;inset:0;pointer-events:none;border-style:solid;border-color:transparent;border-width:{px(y0)} {px(x0)} {px(plate_size[1]-y1)} {px(plate_size[0]-x1)};border-image:url('assets/gel-search_bg_transparent.png') {y0} {plate_size[0]-x1} {plate_size[1]-y1} {x0} fill / {px(y0)} {px(plate_size[0]-x1)} {px(plate_size[1]-y1)} {px(x0)} stretch}}
.kk-home.gel-home .home-search>button{{position:relative;z-index:1;height:{px(inner_height)}}}
.kk-home.gel-home .home-search>button:first-child{{padding-left:{px(10*density)};gap:0;min-width:0}}
.kk-home.gel-home .home-search .kk-qsb-logo{{width:{px(logo_size[0])};height:{px(logo_size[1])};margin-top:{px(6*density)};flex:none}}
.kk-home.gel-home .gel-hint{{margin-left:auto;font:400 {px(dimensions['search_bar_text_size']*density)}/1.25 RobotoCondensed,'Roboto Condensed',sans-serif;color:#fff;white-space:nowrap;text-shadow:0 {px(density)} {px(2*density)} #0000008c}}
.kk-home.gel-home .home-search .voice-search{{flex:0 0 {px(mic_size[0]+2*mic_padding)};padding:0 {px(mic_padding)};margin-right:{px(end_margin)};justify-content:center}}
.kk-home.gel-home .home-search .search-microphone{{width:{px(mic_size[0])};height:{px(mic_size[1])};flex:none;object-fit:contain}}
.kk-home.gel-home .home-search>button:active img{{filter:none}}
.kk-home.gel-home .home-search>button:first-child:active .kk-qsb-logo{{content:url('assets/gel-ic_google_small_light_pressed.png')}}
#viewport>.drawer-view.kk-drawer{{background:#000000{alpha:02x}}}
.kk-drawer .drawer-page.drawer-apps{{top:var(--sb);bottom:calc(var(--nb) + {px(page_bottom)});grid-template-columns:repeat({cols},minmax(0,1fr));grid-template-rows:repeat({rows},minmax(0,1fr))}}
.kk-drawer .drawer-apps .launcher-icon{{height:100%;align-self:stretch;justify-content:center;gap:{px(gap)};padding:0 {px(dimensions['dynamic_grid_edge_margin']*density//2)}}}
.kk-drawer .drawer-apps .launcher-icon .app-icon{{width:{px(icon)};height:{px(icon)}}}
.kk-drawer .drawer-apps .launcher-icon>span:last-child{{font-size:{px(text)};line-height:{px(font_height)};max-width:100%}}
'''
(out / 'gel-factory.css').write_text(css, encoding='utf-8', newline='\n')
manifest = {'source': 'Nexus 5 KTU84P', 'googleHome': '1.0.10.1069658', 'velvet': apk.get_androidversion_name(),
    'apkSha256': hashlib.sha256(apk_path.read_bytes()).hexdigest(), 'assets': assets, 'dimensionsDp': dimensions,
    'integers': integers, 'nexus5Profile': {'minWidthDp': values[3], 'minHeightDp': values[4], 'iconDp': icon_dp, 'textSp': text_dp},
    'drawerNativePixels': {'width': width, 'height': height, 'rows': rows, 'columns': cols, 'pageBottom': page_bottom,
        'fontHeight': font_height, 'contentHeight': content_height, 'firstIconTop': first_icon},
    'fontSha256': hashlib.sha256(font_raw).hexdigest()}
(root / 'docs/kitkat-launcher-source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('KTU84P GEL:', cols, 'columns,', rows, 'rows; first icon', first_icon, 'native px; copied', len(assets), 'original PNGs')
