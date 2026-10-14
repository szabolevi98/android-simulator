"""Android 2.1: generates the text tables versions/2.1/ec-strings-<table>.js from the Nexus One image.

    python docs/tools/ec-strings.py            (every table)
    python docs/tools/ec-strings.py statusbar  (one)

docs/data/ec-strings.txt lists the tables: a line "[table] Apk Apk …" starts one (the APKs as in the image, 'framework' =
framework-res.apk, tried in order), then resource names separated by spaces or newlines; "array:name" and "plurals:name"
take a string-array or a plurals resource, and "Apk/name" reads a resource of that APK (the row is keyed Apk/name). English, German, French and Spanish are the passion image's own text (ERE27).
The image has no Hungarian (it came with 2.3), so Hungarian is (owner's decision, 2026-10-13):
  1. the Nexus S 2.3.6 image's translation of exactly the same English text (_aosp/crespo/strings-index.json; the same
     APK and resource name first, then the same name, the same APK, framework, any APK), recorded as huFrom: 'crespo:<apk>:<name>';
  2. otherwise our own translation from docs/data/ec-hu.tsv (<English> TAB <Hungarian>), marked huOwn: true.
  A row keyed <Apk>/<resource> instead of English overrides 1. for that one resource, where the 2.3.6 text of the same
  English means something else in that app (Facebook's "Sign up" is not Thinkfree's "Sign up" = log in).
A row with neither is reported and keeps English. A German, French or Spanish text the image lacks is the English the
phone shows, listed in the row's untranslated; a text with none of the three (an English-only app such as Goggles) is
English in Hungarian as well, and so is a text without Hungarian in a table marked hu=en (one the phone never shows in
Hungarian: "[amazon] com.amazon.mp3 hu=en"). Each table is EC.strings('<table>', {name: {res, en, hu, de, fr, es, …}}).
Do not edit the output by hand; rerun this after changing the list."""
import json, os, sys
from image_res import ImageRes, ROOT

PASSION = ImageRes('passion')
CRESPO_INDEX = json.load(open(ROOT + '_aosp/crespo/strings-index.json', encoding='utf-8'))
OWN = {}
if os.path.exists(ROOT + 'docs/data/ec-hu.tsv'):
    for line in open(ROOT + 'docs/data/ec-hu.tsv', encoding='utf-8'):
        if line.strip() and not line.startswith('#'):
            en, hu = line.rstrip('\n').split('\t', 1)
            OWN[en.replace('\\n', '\n')] = hu.replace('\\n', '\n')


def tables():
    out, current = {}, None
    for line in open(ROOT + 'docs/data/ec-strings.txt', encoding='utf-8'):
        line = line.split('#', 1)[0].strip()
        if not line: continue
        if line.startswith('['):
            name, *apks = line[1:].replace(']', ' ').split()
            # "hu=en": the app never shows these texts in Hungarian (Amazon MP3 opens its Unsupported Locale page).
            flags = {a for a in apks if '=' in a}
            current = out.setdefault(name, {'apks': [a for a in apks if a not in flags], 'keys': [], 'huEnglish': 'hu=en' in flags})
        else:
            current['keys'] += line.split()
    return out


def hungarian(english, apk, name):
    rows = CRESPO_INDEX.get(english) or []
    rows = [r for r in rows if r[2].get('hu')]
    # 2.3 moved screens between APKs (the status bar went from framework to SystemUI), so the same resource name in any APK
    # comes before the same APK.
    for pick in (lambda r: r[0] == apk and r[1] == name, lambda r: r[1] == name, lambda r: r[0] == apk, lambda r: r[0] == 'framework', lambda r: True):
        hit = next((r for r in rows if pick(r)), None)
        if hit: return hit[2]['hu'], f'crespo:{hit[0]}:{hit[1]}'
    return None, None


def which_apk(apks, kind, key):
    for apk in apks:
        r, pkg, _ = PASSION._apk(apk)
        if r.get_res_id_by_key(pkg, kind, key) is not None: return apk
    return None


def build(table, spec):
    entries, missing = {}, []
    for item in spec['keys']:
        kind, key = item.split(':', 1) if ':' in item else ('string', item)
        name = key
        if '/' in key:   # Apk/resource names the APK; the row is keyed Apk/resource
            apk_hint, key = key.split('/', 1)
            apk = which_apk([apk_hint], kind, key)
        else:
            apk = which_apk(spec['apks'], kind, key)
        if not apk: raise SystemExit(f'{table}: {kind} {key} is not in {spec["apks"]}')
        value = getattr(PASSION, kind)([apk], key)
        row = {'res': f'passion:{apk}:{key}'}
        if kind == 'string':
            row.update({lang: value[lang] for lang in ('en', 'de', 'fr', 'es') if value.get(lang) is not None})
            hu, src = hungarian(value['en'], apk, key)
            # An ec-hu.tsv row keyed Apk/resource wins where crespo's same English means something else there.
            if f'{apk}/{key}' in OWN: row['hu'], row['huOwn'] = OWN[f'{apk}/{key}'], True
            elif hu: row['hu'], row['huFrom'] = hu, src
            elif value['en'] in OWN: row['hu'], row['huOwn'] = OWN[value['en']], True
            else: missing.append(value['en'])
        elif kind == 'array':
            row.update({lang: value[lang] for lang in ('en', 'de', 'fr', 'es') if lang in value})
            hu = [hungarian(text, apk, key)[0] or OWN.get(text) for text in value['en']]
            if all(hu): row['hu'] = hu
            else: missing += [t for t, h in zip(value['en'], hu) if not h]
        else:  # plurals
            row.update({lang: value[lang] for lang in ('en', 'de', 'fr', 'es') if lang in value})
            forms = {q: hungarian(text, apk, key)[0] or OWN.get(text) for q, text in value['en'].items()}
            if all(forms.values()): row['hu'] = forms
            else: missing += [t for q, t in value['en'].items() if not forms[q]]
        # A language the image does not translate shows the English on the phone; the row says so (untranslated).
        gaps = [lang for lang in ('de', 'fr', 'es') if lang not in row and 'en' in row]
        for lang in gaps: row[lang] = row['en']
        # Text the image translates into none of them (an English-only app) is English on every phone: Hungarian too.
        if len(gaps) == 3:
            english = row['en'] if isinstance(row['en'], list) else list(row['en'].values()) if isinstance(row['en'], dict) else [row['en']]
            missing[:] = [m for m in missing if m not in english]
            row['hu'] = row['en']; gaps.append('hu')
            for field in ('huFrom', 'huOwn'): row.pop(field, None)
        if spec['huEnglish'] and row.get('hu') is None:
            english = row['en'] if isinstance(row['en'], list) else list(row['en'].values()) if isinstance(row['en'], dict) else [row['en']]
            missing[:] = [m for m in missing if m not in english]
            row['hu'] = row['en']; gaps.append('hu')
        if gaps: row['untranslated'] = gaps
        entries[name] = row
    head = (f'/* Generated by docs/tools/ec-strings.py from the Nexus One ERE27 image ({", ".join(spec["apks"])}; en, de, fr, es) with\n'
            f'   Hungarian from the Nexus S 2.3.6 image where the English is the same (huFrom) or docs/data/ec-hu.tsv (huOwn). Do not edit. */\n')
    body = json.dumps(entries, ensure_ascii=False, indent=0)
    open(f'{ROOT}versions/2.1/ec-strings-{table}.js', 'w', encoding='utf-8', newline='\n').write(f"{head}EC.strings('{table}', {body});\n")
    print(f'{table}: {len(entries)} rows' + (f'; no Hungarian for: {missing}' if missing else ''))
    return missing


if __name__ == '__main__':
    all_tables = tables()
    for name in sys.argv[1:] or list(all_tables):
        build(name, all_tables[name])
