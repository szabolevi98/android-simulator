"""Builds versions/<v>/stock-strings.js from docs/stock-strings.json: per app, the texts the stock Google app screens
(stock-apps.js) draw, as that version's factory image translates them in the app's own APK (hu, de, fr, es, and the
image's English when it differs from the key). stock-apps.js reads them through S(ctx, app, key) before i18n.js.
    python docs/stock-strings.py
The image's string index comes from docs/image-index.py (_aosp/<device>/strings-index.json); APKs the index skips
(PrebuiltGmsCore) are read through the Android SDK's aapt2 (or androguard without it). A reference
"Apk:@array/name:i" takes item i of a string-array."""
import glob, json, os, re, subprocess, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
DEVICES = {'4.0.4': 'maguro', '4.3': 'mako', '4.4.4': 'hammerhead', '5.1.1': 'shamu'}
spec = json.load(open(ROOT + 'docs/stock-strings.json', encoding='utf-8'))
DUMPS = {}
def from_array(device, apk, name):
    """(English, {lang: text}) of item i of string-array NAME ("@array/name:i") in an APK, read with androguard."""
    from loguru import logger; logger.remove()
    from androguard.core.apk import APK
    array, _, index = name[len('@array/'):].partition(':')
    path = next((p for d in ('app', 'priv-app') for p in glob.glob(f'{ROOT}_aosp/{device}/system/{d}/{apk}.apk') + glob.glob(f'{ROOT}_aosp/{device}/system/{d}/{apk}/{apk}.apk')), None)
    if not path: return None
    if path not in DUMPS: DUMPS[path] = APK(path).get_android_resources()
    res = DUMPS[path]; pkg = ([name for name in res.get_packages_names() if name != 'android'] or res.get_packages_names())[-1]
    public = res.get_public_resources(pkg); public = public.decode() if isinstance(public, bytes) else public
    rid = dict(re.findall(r'type="array" name="([^"]+)" id="(0x[0-9a-f]+)"', public)).get(array)
    if not rid: return None
    def by_lang(rid):
        out = {}
        for config, entry in res.get_res_configs(rid, None):
            lang, region = config.get_language(), config.get_country()
            if region and '\x00' not in region: continue
            out.setdefault('' if '\x00' in lang else lang, entry)
        return out
    arrays = by_lang(int(rid, 16))
    def text(lang):
        # An untranslated array of string references still reads each string in the language.
        value = (arrays.get(lang) or arrays.get('')).item.items[int(index)][1]
        if value.data_type != 1: return value.format_value() if lang in arrays or not lang else None
        strings = by_lang(value.data); entry = strings.get(lang) or (strings.get('') if not lang else None)
        return entry.get_key_data() if entry else None
    values = {lang: text(lang) for lang in ('', 'hu', 'de', 'fr', 'es') if '' in arrays}
    values = {lang: value for lang, value in values.items() if value is not None}
    if '' not in values: return None
    return values[''], {lang: values[lang] for lang in ('hu', 'de', 'fr', 'es') if lang in values}
def from_arsc(path):
    """The string part of `aapt2 dump resources` for an APK, read with androguard when the SDK is missing."""
    from loguru import logger; logger.remove()
    from androguard.core.apk import APK
    res = APK(path).get_android_resources(); pkg = ([name for name in res.get_packages_names() if name != 'android'] or res.get_packages_names())[-1]
    public = res.get_public_resources(pkg); public = public.decode() if isinstance(public, bytes) else public
    out = []
    for name, rid in re.findall(r'type="string" name="([^"]+)" id="(0x[0-9a-f]+)"', public):
        out.append(f'resource {rid} string/{name}')
        for config, entry in res.get_res_configs(int(rid, 16), None):
            try: lang, region, text = config.get_language(), config.get_country(), entry.get_key_data()
            except Exception: continue
            if '\x00' in lang: lang = ''
            if region and '\x00' not in region: lang = f'{lang}-r{region}'
            out.append(f'      ({lang}) {json.dumps(text, ensure_ascii=False)}')
    return '\n'.join(out) + '\n'
def from_aapt(device, apk, name):
    """(English, {lang: text}) of string NAME in an APK the index skips, from `aapt2 dump resources`."""
    if (device, apk) not in DUMPS:
        path = next((p for d in ('app', 'priv-app') for p in glob.glob(f'{ROOT}_aosp/{device}/system/{d}/{apk}.apk') + glob.glob(f'{ROOT}_aosp/{device}/system/{d}/{apk}/{apk}.apk')), None)
        if not path: return None
        aapt = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))
        DUMPS[(device, apk)] = subprocess.run([aapt[-1], 'dump', 'resources', path], capture_output=True, text=True, encoding='utf-8').stdout if aapt else from_arsc(path)
    m = re.search(rf'resource 0x\w+ string/{re.escape(name)}\n((?:[ \t]+\(.*\n)+)', DUMPS[(device, apk)])
    if not m: return None
    values = {c: json.loads(t) for c, t in re.findall(r'\(([\w-]*)\) ("(?:[^"\\]|\\.)*")', m.group(1))}
    if '' not in values: return None
    return values[''], {lang: values[lang] for lang in ('hu', 'de', 'fr', 'es') if lang in values}
for v, apps in spec.items():
    idx = json.load(open(f'{ROOT}_aosp/{DEVICES[v]}/strings-index.json', encoding='utf-8'))
    by = {}
    for en, hits in idx.items():
        for apk, name, tr in hits: by.setdefault((apk, name), (en, tr))
    out, missing = {}, []
    for app, rows in apps.items():
        for key, ref in rows.items():
            apk, _, name = ref.partition(':')
            hit = from_array(DEVICES[v], apk, name) if name.startswith('@array/') else by.get((apk, name)) or from_aapt(DEVICES[v], apk, name)
            if not hit: missing.append(f'{app}: {ref}'); continue
            en, tr = hit
            row = [tr.get(lang, en) for lang in ('hu', 'de', 'fr', 'es')]
            if en != key: row.append(en)
            out.setdefault(app, {})[key] = row
    if missing: sys.exit(f'{v}: missing ' + ', '.join(missing))
    body = json.dumps(out, ensure_ascii=False, indent=1)
    open(f'{ROOT}versions/{v}/stock-strings.js', 'w', encoding='utf-8', newline='\n').write(
        f'/* Generated by docs/stock-strings.py from docs/stock-strings.json and the {DEVICES[v]} factory image. Do not edit. */\nwindow.StockStrings = {body};\n')
    print(v, sum(len(r) for r in out.values()), 'strings')
