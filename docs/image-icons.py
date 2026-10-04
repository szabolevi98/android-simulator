"""Copies launcher icons out of a factory image's APKs: the activity's (or the application's) android:icon at the density
of the phone, saved as versions/<version>/assets/<id>.png.
    python docs/image-icons.py <device dir> <density> <version> <id>=<apk>[:<activity>] ...
e.g. python docs/image-icons.py _aosp/mako xhdpi 4.3 chrome=Chrome play-music=Music2
The device folder holds the image's /system (see docs/image-index.py)."""
import glob, os, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK

DEV, DENSITY, VERSION = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
NS = '{http://schemas.android.com/apk/res/android}'
ORDER = [DENSITY, 'xhdpi', 'hdpi', 'mdpi', 'nodpi', '']
for spec in sys.argv[4:]:
    out, src = spec.split('=', 1)
    apk_name, _, activity = src.partition(':')
    path = next(iter(glob.glob(f'{DEV}/system/app/{apk_name}.apk') + glob.glob(f'{DEV}/system/*app/{apk_name}/{apk_name}.apk') + glob.glob(f'{DEV}/system/priv-app/{apk_name}.apk')), None)
    if not path: sys.exit(f'no {apk_name}')
    a = APK(path); x = a.get_android_manifest_xml(); r = a.get_android_resources()
    icon = x.find('application').get(NS + 'icon')
    for tag in ('activity', 'activity-alias'):
        for act in x.iter(tag):
            if activity and act.get(NS + 'name', '').endswith(activity) and act.get(NS + 'icon'): icon = act.get(NS + 'icon')
    rid = int(icon[1:], 16)
    files = {}
    for cfg, entry in r.get_res_configs(rid):
        q = cfg.get_qualifier() or ''
        value = r.get_resolved_res_configs(rid, cfg)[0][1]
        dens = next((d for d in ORDER[:-1] if d and d in q.split('-')), '')
        if value.endswith('.png') and ('v' not in q or True): files.setdefault(dens, value)
    pick = next(files[d] for d in ORDER if d in files)
    target = f'versions/{VERSION}/assets/{out}.png'
    open(target, 'wb').write(a.get_file(pick)); print(out, '<-', apk_name, pick)
