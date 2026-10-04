"""Fills an app module's text table from a factory image's APK: the template holds
    const STRINGS = __STRINGS__({"English text": "resource_name", ...});
and the output gets {"English text": [hu, de, fr, es]} as that APK in the image translates the resource (English where it
has no translation). A value "Apk:resource_name" reads another APK of the same image; "@plurals/name:one" (or
"Apk:@plurals/name:other") reads a quantity of a plurals resource through the Android SDK's aapt2. The image's string index comes from docs/image-index.py.
    python docs/apk-strings.py <device> <apk> <template> <output>
e.g. python docs/apk-strings.py maguro Music2 docs/ics-play-music.template.js versions/4.0.4/ics-play-music.js"""
import json, re, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
device, apk, template, output = sys.argv[1:5]
idx = json.load(open(f'{ROOT}_aosp/{device}/strings-index.json', encoding='utf-8'))
by = {}
for en, hits in idx.items():
    for a, name, tr in hits:
        by.setdefault((a, name), (en, tr))
src = open(ROOT + template, encoding='utf-8').read()
m = re.search(r'__STRINGS__\((\{.*?\})\)', src, re.S)
mapping = json.loads(m.group(1))
PLURALS = {}
def plural(source, name, quantity):
    """'@plurals/NAME:one' reads a quantity of a plurals resource through the Android SDK's aapt2 (dump resources)."""
    import glob, os, subprocess
    if source not in PLURALS:
        aapt = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))[-1]
        path = next(p for p in (f'{ROOT}_aosp/{device}/system/{d}/{source}.apk' for d in ('app', 'priv-app')) if os.path.exists(p))
        out = subprocess.run([aapt, 'dump', 'resources', path], capture_output=True, text=True, encoding='utf-8').stdout
        res, cur, config = {}, None, None
        for line in out.splitlines():
            m = re.match(r'\s+resource 0x\w+ plurals/(\S+)', line)
            if m: cur = res.setdefault(m.group(1), {}); continue
            if re.match(r'\s+resource ', line): cur = None; continue
            m = re.match(r'\s+\(([^)]*)\) \(plurals\)', line)
            if m and cur is not None: config = cur.setdefault(m.group(1), {}); continue
            m = re.match(r'\s+(one|other)="(.*)"$', line)
            if m and cur is not None and config is not None: config[m.group(1)] = m.group(2).replace('\\"', '"').replace("\\'", "'")
        PLURALS[source] = res
    configs = PLURALS[source][name]
    en = configs[''][quantity]
    return en, {lang: (configs.get(lang) or {}).get(quantity, (configs.get(lang) or {}).get('other', en)) for lang in ('hu', 'de', 'fr', 'es')}
table = {}
for key, value in mapping.items():
    if '@plurals/' in value:
        source, _, rest = value.rpartition(':@plurals/') if ':@plurals/' in value else ('', '', value[len('@plurals/'):])
        name, _, quantity = rest.partition(':')
        en, tr = plural(source or apk, name, quantity or 'other')
        if en != key: print(f'note: {name}:{quantity} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
        table[key] = [tr[lang] for lang in ('hu', 'de', 'fr', 'es')]
        continue
    source, _, name = value.rpartition(':')
    if (source or apk, name) not in by: sys.exit(f'{source or apk} has no {name}')
    en, tr = by[(source or apk, name)]
    if en != key: print(f'note: {name} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
    table[key] = [tr.get(lang, en) for lang in ('hu', 'de', 'fr', 'es')]
out = src[:m.start()] + json.dumps(table, ensure_ascii=False, indent=4).replace('\n', '\n  ') + src[m.end():]
open(ROOT + output, 'w', encoding='utf-8', newline='\n').write(out)
print(len(table), 'strings ->', output)
