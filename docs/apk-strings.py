"""Fills an app module's text table from a factory image's APK: the template holds
    const STRINGS = __STRINGS__({"English text": "resource_name", ...});
and the output gets {"English text": [hu, de, fr, es]} as that APK in the image translates the resource (English where it
has no translation). A value "Apk:resource_name" reads another APK of the same image. The image's string index comes from docs/image-index.py.
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
table = {}
for key, value in mapping.items():
    source, _, name = value.rpartition(':')
    if (source or apk, name) not in by: sys.exit(f'{source or apk} has no {name}')
    en, tr = by[(source or apk, name)]
    if en != key: print(f'note: {name} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
    table[key] = [tr.get(lang, en) for lang in ('hu', 'de', 'fr', 'es')]
out = src[:m.start()] + json.dumps(table, ensure_ascii=False, indent=4).replace('\n', '\n  ') + src[m.end():]
open(ROOT + output, 'w', encoding='utf-8', newline='\n').write(out)
print(len(table), 'strings ->', output)
