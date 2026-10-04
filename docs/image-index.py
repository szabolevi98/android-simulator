"""Index of every string resource in a device's system APKs: English text -> [(apk name, resource name, {hu, de, fr, es})].
    python docs/image-index.py _aosp/<device>   (writes _aosp/<device>/strings-index.json)
The device folder holds the /system of the factory image (app, priv-app, framework), unpacked from its system.img.
Handles both layouts: /system/app/X.apk (up to 4.3) and /system/app/X/X.apk with /system/priv-app (4.4+)."""
import glob, json, os, re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK

SKIP = {'PrebuiltGmsCore', 'WebViewGoogle', 'GoogleJapaneseInput', 'GooglePinyinIME', 'KoreanIME', 'GoogleHindiIME', 'ims', 'talkback'}
LANGS = ['hu', 'de', 'fr', 'es']
def clean(v):
    v = re.sub(r'\\(["\'])', r'\1', str(v)).replace('\\n', '\n')
    return v  # androguard escapes quotes but does not wrap the text in them
index = {}
DEV = sys.argv[1].rstrip('/')
apks = sorted(glob.glob(f'{DEV}/system/app/*.apk') + glob.glob(f'{DEV}/system/app/*/*.apk') + glob.glob(f'{DEV}/system/priv-app/*.apk') + glob.glob(f'{DEV}/system/priv-app/*/*.apk') + [f'{DEV}/system/framework/framework-res.apk'])
for path in apks:
    key = 'framework' if 'framework-res' in path else os.path.splitext(os.path.basename(path))[0]
    if key in SKIP: continue
    try:
        res = APK(path).get_android_resources()
        names_ = res.get_packages_names(); pkg = next((p for p in names_ if p != 'android'), names_[0])  # old APKs carry an empty 'android' package first
        names = res.get_resolved_strings()  # {pkg: {locale: {id: text}}}
    except Exception as error:
        print('skip', key, error, file=sys.stderr); continue
    table = names.get(pkg, {})
    default = table.get('DEFAULT', {})
    locales = {lang: table.get(lang, {}) for lang in LANGS}
    for rid, text in default.items():
        en = clean(text)
        if not en or len(en) > 400: continue
        try: name = res.get_resource_xml_name(rid).split('/')[-1]
        except Exception: name = hex(rid)
        tr = {lang: clean(locales[lang][rid]) for lang in LANGS if rid in locales[lang]}
        index.setdefault(en, []).append([key, name, tr])
    print(key, len(default), {l: len(locales[l]) for l in LANGS}, file=sys.stderr)
json.dump(index, open(f'{DEV}/strings-index.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(index), 'texts')
