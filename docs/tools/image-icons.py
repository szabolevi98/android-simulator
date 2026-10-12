"""Copies launcher icons out of a factory image's APKs: the activity's (or the application's) android:icon at the density
of the phone, saved as versions/<version>/assets/<id>.png.
    python docs/tools/image-icons.py <device dir> <density> <version> <id>=<apk>[:<activity>] ...
e.g. python docs/tools/image-icons.py _aosp/mako xhdpi 4.3 chrome=Chrome play-music=Music2
The device folder holds the image's /system (see docs/tools/image-index.py)."""
import glob, os, re, sys
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
            if activity and act.get(NS + 'name', '').split('.')[-1] == activity and act.get(NS + 'icon'): icon = act.get(NS + 'icon')
    rid = int(icon[1:], 16)
    # The launcher's configuration: a density, optionally an API level; a locale, orientation, layout direction or screen
    # size variant is not what the home screen shows. Within a density the highest API level wins (the image is newer
    # than every -vNN folder of its own APKs).
    files = {}
    for cfg, entry in r.get_res_configs(rid):
        parts = [p for p in (cfg.get_qualifier() or '').split('-') if p]
        value = r.get_resolved_res_configs(rid, cfg)[0][1]
        dens = next((p for p in parts if p in ORDER[:-1]), '')
        if not value.endswith('.png') or any(p != dens and not re.fullmatch(r'v\d+', p) for p in parts): continue
        api = max([int(p[1:]) for p in parts if re.fullmatch(r'v\d+', p)] or [0])
        files.setdefault(dens, []).append((api, value))
    density = next(d for d in ORDER if d in files)
    candidates = sorted(set(files[density]), reverse=True)
    if len({v for _, v in candidates}) > 1: print(f'note: {out}: {len(candidates)} {density or "default"} files, took {candidates[0][1]}', file=sys.stderr)
    pick = candidates[0][1]
    target = f'versions/{VERSION}/assets/{out}.png'
    open(target, 'wb').write(a.get_file(pick)); print(out, '<-', apk_name, pick)
