"""Fills an app module's text table from a factory image's APK: the template holds
    const STRINGS = __STRINGS__({"English text": "resource_name", ...});
and the output gets {"English text": [hu, de, fr, es]} as that APK in the image translates the resource (English where it
has no translation), plus the image's English as a fifth entry when it differs from the key. A value "Apk:resource_name"
reads another APK of the same image, "?name" may be missing from the image; "@plurals/name:one" (or
"Apk:@plurals/name:other") reads a quantity of a plurals resource through the Android SDK's aapt2, and "@array/name:2"
(or "Apk:@array/name:2") an item of a string array. "Telephony:name" reads Phone.apk where the image has it and
TeleService.apk from 4.4 on; "name_a|name_b" takes the first the image has. __DEVICE__ in the template becomes the device name. The image's string index comes from
docs/image-index.py.
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
src = open(ROOT + template, encoding='utf-8').read().replace('__DEVICE__', device)
TELEPHONY = 'TeleService' if any(a == 'TeleService' for a, _ in by) else 'Phone'
m = re.search(r'__STRINGS__\((\{.*?\})\)', src, re.S)
mapping = json.loads(m.group(1))
PLURALS = {}
def plural(source, name, quantity):
    """'@plurals/NAME:one' reads a quantity of a plurals resource through the Android SDK's aapt2 (dump resources)."""
    import glob, os, subprocess
    if source not in PLURALS:
        aapt = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))[-1]
        path = next(p for p in [f'{ROOT}_aosp/{device}/system/framework/framework-res.apk'] * (source == 'framework') + [f'{ROOT}_aosp/{device}/system/{d}/{source}.apk' for d in ('app', 'priv-app')] + [f'{ROOT}_aosp/{device}/system/{d}/{source}/{source}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
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
ARRAYS = {}
def array_item(source, name, index):
    """'@array/NAME:3' (or 'Apk:@array/NAME:3') reads an item of a string array (aapt2 dump resources, or androguard when
    the Android SDK is not installed); items that name a string resource resolve through the image's string index,
    literal items are taken per configuration."""
    import glob, os, subprocess
    path = next(p for p in [f'{ROOT}_aosp/{device}/system/framework/framework-res.apk'] * (source == 'framework') + [f'{ROOT}_aosp/{device}/system/{d}/{source}.apk' for d in ('app', 'priv-app')] + [f'{ROOT}_aosp/{device}/system/{d}/{source}/{source}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
    tools = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))
    if source not in ARRAYS and tools:
        out = subprocess.run([tools[-1], 'dump', 'resources', path], capture_output=True, text=True, encoding='utf-8').stdout
        res, cur, config, buf = {}, None, None, ''
        def flush():
            if cur is not None and config is not None and buf:
                cur[config] = re.findall(r'@string/[\w.]+|"(?:[^"\]|\.)*"', buf)
        for line in out.splitlines():
            m = re.match(r'\s+resource 0x\w+ array/(\S+)', line)
            if m or re.match(r'\s+resource ', line):
                flush(); cur = res.setdefault(m.group(1), {}) if m else None; config, buf = None, ''; continue
            m = re.match(r'\s+\(([^)]*)\) \(array\)', line)
            if m and cur is not None: flush(); config, buf = m.group(1), ''; continue
            if cur is not None and config is not None: buf += line
        flush()
        ARRAYS[source] = res
    elif name not in ARRAYS.get(source, {}) and not tools:
        from loguru import logger; logger.remove()
        from androguard.core.apk import APK
        apk_file = APK(path); r = apk_file.get_android_resources()
        # Old APKs carry an empty 'android' package first: look the array up in the APK's own package.
        pkg = 'android' if source == 'framework' else apk_file.get_package()
        configs = {}
        for config, entry in r.get_res_configs(r.get_res_id_by_key(pkg, 'array', name)):
            lang = (config.get_qualifier() or '').split('-')[0]
            if lang and lang not in ('hu', 'de', 'fr', 'es'): continue
            items = []
            for _, value in entry.item.items:
                if value.data_type == 1: items.append('@string/' + r.get_resource_xml_name(value.data).split('/')[-1])
                else: items.append('"' + value.format_value().replace('"', '\\"') + '"')
            configs.setdefault(lang, items)
        ARRAYS.setdefault(source, {})[name] = configs
    return _array_text(source, ARRAYS[source][name], index)
def _array_text(source, configs, index):
    def text(item, lang):
        if item.startswith('@string/'):
            en, tr = by[(source, item[8:])]
            return en if lang == '' else tr.get(lang, en)
        return item[1:-1].replace('\\"', '"').replace("\\'", "'")
    en = text(configs[''][index], '')
    return en, {lang: text((configs.get(lang) or configs[''])[index], lang if lang in configs or configs[''][index].startswith('@string/') else '') for lang in ('hu', 'de', 'fr', 'es')}
table = {}
for key, value in mapping.items():
    if '@array/' in value:
        source, _, rest = value.rpartition(':@array/') if ':@array/' in value else ('', '', value[len('@array/'):])
        name, _, index = rest.partition(':')
        en, tr = array_item({'Telephony': TELEPHONY}.get(source, source) or apk, name, int(index or 0))
        table[key] = [tr[lang] for lang in ('hu', 'de', 'fr', 'es')]
        if en != key: table[key].append(en); print(f'note: {name}:{index} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
        continue
    if '@plurals/' in value:
        source, _, rest = value.rpartition(':@plurals/') if ':@plurals/' in value else ('', '', value[len('@plurals/'):])
        name, _, quantity = rest.partition(':')
        en, tr = plural(source or apk, name, quantity or 'other')
        if en != key: print(f'note: {name}:{quantity} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
        table[key] = [tr[lang] for lang in ('hu', 'de', 'fr', 'es')]
        continue
    optional = value.startswith('?'); value = value.lstrip('?')
    # "name_a|name_b": the first of these resources the image has (a string renamed between releases).
    if '|' in value:
        value = next((v for v in value.split('|') if (v.rpartition(':')[0] or apk, v.rpartition(':')[2]) in by), value.split('|')[0])
    source, _, name = value.rpartition(':')
    if source == 'Telephony': source = TELEPHONY
    if (source or apk, name) not in by:
        if optional: print(f'note: {source or apk} has no {name}; left out', file=sys.stderr); continue
        sys.exit(f'{source or apk} has no {name}')
    en, tr = by[(source or apk, name)]
    table[key] = [tr.get(lang, en) for lang in ('hu', 'de', 'fr', 'es')]
    # A fifth entry carries this image's English wording when it differs from the key.
    if en != key: table[key].append(en); print(f'note: {name} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
out = src[:m.start()] + json.dumps(table, ensure_ascii=False, indent=4).replace('\n', '\n  ') + src[m.end():]
open(ROOT + output, 'w', encoding='utf-8', newline='\n').write(out)
print(len(table), 'strings ->', output)
