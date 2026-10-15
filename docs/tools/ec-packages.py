"""Android 2.1: every package of the Nexus One image (ERE27) for Settings' Manage applications and its app details.

    python docs/tools/ec-packages.py

Reads _aosp/passion/system/app/*.apk and framework/framework-res.apk and writes
  versions/2.1/ec-packages.js       EC.packages: [{pkg, apk, version, size, icon, persistent, perms, label: {res, en, …}}]
                                    with size = the APK's bytes plus its odex (PackageStats.codeSize of a system app),
                                    perms = the uses-permission names the image defines; EC.permissions: {name:
                                    {group, dangerous, label: {…}}} and EC.permGroups: {name: {label: {…}}} for
                                    AppSecurityPermissions. Labels follow docs/tools/ec-strings.py (crespo Hungarian, then
                                    docs/data/ec-hu.tsv; text the image translates into none of de / fr / es stays English).
  docs/data/ec-assets-packages.tsv  the application icons not yet among the 2.1 assets (pk-<package>.png), which
                                    docs/tools/ec-assets.py copies; an icon already copied under another name is reused.
Do not edit the outputs by hand."""
import glob, hashlib, importlib.util, json, os, re
from loguru import logger; logger.remove()
from androguard.core.apk import APK

ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
SYSTEM = ROOT + '_aosp/passion/system/'
ASSETS = ROOT + 'versions/2.1/assets/'
NS = '{http://schemas.android.com/apk/res/android}'
spec = importlib.util.spec_from_file_location('ec_strings', ROOT + 'docs/tools/ec-strings.py')
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
DENSITY = ['-hdpi', '', '-nodpi', '-mdpi', '-ldpi']
missing = []


def text(apk_name, res, key):
    """A label entry for string `key` of the APK (ImageRes name), with the 2.1 language rules."""
    value = S.PASSION.string([apk_name], key)
    row = {'res': f'passion:{apk_name}:{key}', 'en': value['en']}
    row.update({lang: value[lang] for lang in ('de', 'fr', 'es') if value.get(lang) is not None})
    gaps = [lang for lang in ('de', 'fr', 'es') if lang not in row]
    for lang in gaps: row[lang] = row['en']
    if len(gaps) == 3: row['hu'] = row['en']; gaps.append('hu')
    else:
        hu, src = S.hungarian(value['en'], apk_name, key)
        if f'{apk_name}/{key}' in S.OWN: row['hu'] = S.OWN[f'{apk_name}/{key}']
        elif hu: row['hu'], row['huFrom'] = hu, src
        elif value['en'] in S.OWN: row['hu'], row['huOwn'] = S.OWN[value['en']], True
        else: row['hu'] = row['en']; missing.append(value['en'])
    if gaps: row['untranslated'] = gaps
    return row


def res_name(r, ref):
    """'@7F090001' / '@android:01040116' -> the resource's (type, name) in that table."""
    rid = int(ref.split(':')[-1].lstrip('@'), 16)
    name = r.get_resource_xml_name(rid)   # '@package:type/name'
    kind, key = name.split(':', 1)[1].split('/', 1)
    return kind, key, rid


def icon_file(a, r, rid):
    paths = {}
    for config, value in r.get_resolved_res_configs(rid):
        paths[config.get_qualifier() or ''] = value
    for d in DENSITY:
        q = d.lstrip('-')
        if q in paths and paths[q].endswith('.png'): return a.get_file(paths[q])
    return None


def main():
    existing = {}
    for f in os.listdir(ASSETS):
        # pk- files are this generator's own output: left out, so a second run lists them again.
        if f.endswith('.png') and not f.startswith('pk-'): existing.setdefault(hashlib.md5(open(ASSETS + f, 'rb').read()).hexdigest(), f)
    framework = APK(SYSTEM + 'framework/framework-res.apk')
    fr = framework.get_android_resources()
    fx = framework.get_android_manifest_xml()
    perms, groups = {}, {}
    def add_perms(xml, apk_name, r):
        for g in xml.iter('permission-group'):
            label = g.get(NS + 'label')
            if label and label.startswith('@'):
                kind, key, _ = res_name(r, label)
                groups[g.get(NS + 'name')] = {'label': text(apk_name, r, key)}
        for p in xml.iter('permission'):
            label = p.get(NS + 'label')
            if not label or not label.startswith('@'): continue
            kind, key, _ = res_name(r, label)
            level = int(p.get(NS + 'protectionLevel') or '0', 0)
            perms[p.get(NS + 'name')] = {'group': p.get(NS + 'permissionGroup'), 'dangerous': level == 1, 'label': text(apk_name, r, key)}
    add_perms(fx, 'framework', fr)
    apks = sorted(glob.glob(SYSTEM + 'app/*.apk'))
    loaded = []
    for path in apks:
        a = APK(path); x = a.get_android_manifest_xml(); r = a.get_android_resources()
        name = os.path.basename(path)[:-4]
        loaded.append((name, path, a, x, r))
        add_perms(x, name, r)
    packages, rows = [], []
    for name, path, a, x, r in [('framework', SYSTEM + 'framework/framework-res.apk', framework, fx, fr)] + loaded:
        app = x.find('application')
        label = app.get(NS + 'label') if app is not None else None
        if label and label.startswith('@'):
            kind, key, _ = res_name(fr if label.startswith('@android:') else r, label)
            entry = text('framework' if label.startswith('@android:') else name, r, key)
        else:
            entry = {'own': x.get('package'), 'en': x.get('package'), 'de': x.get('package'), 'fr': x.get('package'), 'es': x.get('package'), 'hu': x.get('package')}
        icon = None
        ref = app.get(NS + 'icon') if app is not None else None
        if ref and ref.startswith('@'):
            table, owner = (fr, framework) if ref.startswith('@android:') else (r, a)
            data = icon_file(owner, table, int(ref.split(':')[-1].lstrip('@'), 16))
            if data:
                digest = hashlib.md5(data).hexdigest()
                if digest in existing: icon = existing[digest]
                else:
                    icon = f'pk-{x.get("package")}.png'
                    kind, key, _ = res_name(table, ref)
                    rows.append(f'{icon}\t{"framework/framework-res.apk" if owner is framework else "app/" + name + ".apk"}\tdrawable/{key}')
                    existing[digest] = icon
        odex = path[:-4] + '.odex'
        size = os.path.getsize(path) + (os.path.getsize(odex) if os.path.exists(odex) else 0)
        uses = sorted({p.get(NS + 'name') for p in x.iter('uses-permission')} & set(perms))
        packages.append({'pkg': x.get('package'), 'apk': os.path.basename(path), 'version': x.get(NS + 'versionName') or '',
                         'size': size, 'icon': icon, 'persistent': (app.get(NS + 'persistent') == 'true') if app is not None else False,
                         'perms': uses, 'label': entry})
    head = ('/* Generated by docs/tools/ec-packages.py from the Nexus One ERE27 image: its packages (label, version, icon, code size =\n'
            '   APK + odex bytes, persistent, permissions used) and the permissions and groups the image defines. Do not edit. */\n')
    body = (f'EC.packages = {json.dumps(packages, ensure_ascii=False, indent=0)};\n'
            f'EC.permissions = {json.dumps(perms, ensure_ascii=False, indent=0)};\n'
            f'EC.permGroups = {json.dumps(groups, ensure_ascii=False, indent=0)};\n')
    open(ROOT + 'versions/2.1/ec-packages.js', 'w', encoding='utf-8', newline='\n').write(head + body)
    open(ROOT + 'docs/data/ec-assets-packages.tsv', 'w', encoding='utf-8', newline='\n').write(
        '# Generated by docs/tools/ec-packages.py: application icons for Manage applications.\n' + '\n'.join(rows) + '\n')
    print(len(packages), 'packages,', len(perms), 'permissions,', len(groups), 'groups,', len(rows), 'new icons')
    if missing: print('no Hungarian for:', sorted(set(missing)))


if __name__ == '__main__':
    main()
