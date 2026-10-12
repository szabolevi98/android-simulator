"""Lists the launcher entries of a device image: every enabled LAUNCHER activity / alias with its label in English and
Hungarian (labels are resolved from the APK; enabled="@bool/..." is resolved with the default config).
    python docs/tools/launcher-apps.py _aosp/<device>   (also writes _aosp/<device>/launcher-apps.json)"""
import glob, json, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
NS = '{http://schemas.android.com/apk/res/android}'
DEV = sys.argv[1].rstrip('/')
paths = sorted(glob.glob(f'{DEV}/system/app/*.apk') + glob.glob(f'{DEV}/system/app/*/*.apk') + glob.glob(f'{DEV}/system/priv-app/*.apk') + glob.glob(f'{DEV}/system/priv-app/*/*.apk'))
rows = []
for path in paths:
    try:
        a = APK(path); x = a.get_android_manifest_xml(); r = a.get_android_resources()
        names = r.get_packages_names(); pkg = next((p for p in names if p != 'android'), names[0])
    except Exception:
        continue
    def resolve(value, lang=None):
        if not value or not value.startswith('@'): return value
        try:
            rid = int(value[1:], 16)
            for cfg, v in r.get_resolved_res_configs(rid):
                q = cfg.get_qualifier() or ''
                if (lang is None and q == '') or (lang and q == lang): return v
            return r.get_resolved_res_configs(rid)[0][1]
        except Exception:
            return value
    app_label = x.find('application').get(NS + 'label')
    for tag in ('activity', 'activity-alias'):
        for act in x.iter(tag):
            enabled = act.get(NS + 'enabled')
            if enabled and enabled.startswith('@'):
                try:
                    rid = int(enabled[1:], 16)
                    enabled = str(next((v for c, v in r.get_res_configs(rid) if not c.get_qualifier()), 'true'))
                    enabled = 'false' if "data='0x0'" in enabled or enabled.endswith("0x0'>>") else 'true'
                except Exception:
                    enabled = 'true'
            if enabled == 'false': continue
            for f in act.iter('intent-filter'):
                if 'android.intent.category.LAUNCHER' in [c.get(NS + 'name') for c in f.iter('category')]:
                    label = act.get(NS + 'label') or app_label
                    rows.append({'apk': path.split('/')[-1].split('\\')[-1], 'activity': act.get(NS + 'name'), 'en': resolve(label), 'hu': resolve(label, 'hu'), 'version': a.get_androidversion_name()})
for row in sorted(rows, key=lambda r: str(r['en']).lower()):
    print(f"{str(row['en']):28} {str(row['hu']):28} {row['apk']:32} {row['version']}")
json.dump(rows, open(f'{DEV}/launcher-apps.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
