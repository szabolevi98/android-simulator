"""The dimension resources of an APK that a phone-width configuration (sw360dp-sw411dp, or an h6xx height) sets to
something other than the default: which dp / sp value the image's phone really uses.
    python docs/tools/dimens.py _aosp/<device>/system/app/<App>/<App>.apk"""
import re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
UNITS = {0: 'px', 1: 'dp', 2: 'sp', 3: 'pt', 4: 'in', 5: 'mm'}
def val(entry):
    m = re.search(r"type='dimension' data='0x([0-9a-f]+)'", str(entry))
    if not m: return None
    d = int(m.group(1), 16); unit = d & 0xf; radix = (d >> 4) & 0x3; mant = d >> 8
    if mant & 0x800000: mant -= 0x1000000
    return f'{mant * [1, 1/128, 1/32768, 1/8388608][radix]:g}{UNITS.get(unit, "?")}'
apk = sys.argv[1]
r = APK(apk).get_android_resources(); pkg = r.get_packages_names()[0]
xml = r.get_public_resources(pkg)
xml = xml.decode() if isinstance(xml, bytes) else xml
names = sorted(set(re.findall(r'type="dimen" name="([^"]+)"', xml)))
print(len(names), 'dimens', file=sys.stderr)
for n in names:
    rid = r.get_res_id_by_key(pkg, 'dimen', n)
    cfgs = {(c.get_qualifier() or 'default'): val(v) for c, v in r.get_res_configs(rid)}
    keys = [k for k in cfgs if re.match(r'(sw3[6-9]\d|sw40\d|sw41\d|h6\d\d|w4\d\d)', k)]
    sel = None
    for k in sorted(keys, key=lambda k: int(re.findall(r'\d+', k)[0]), reverse=True):
        if k.startswith('sw') and int(re.findall(r'\d+', k)[0]) <= 411: sel = (k, cfgs[k]); break
    if sel and sel[1] != cfgs.get('default'): print(f"{n}: default={cfgs.get('default')} -> {sel[0]}={sel[1]}")
    elif any(k.startswith('h6') for k in keys): print(f"{n}: default={cfgs.get('default')} " + ' '.join(f'{k}={cfgs[k]}' for k in keys if k.startswith('h')))
