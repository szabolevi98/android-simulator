"""Resolves theme attributes of a factory image's APK the way the 6.0.1 framework does, from aapt2's resource dump:
a style's own attribute, else its parent's (an app style's parent may be a framework style), a ?attr reference looked up
again from the start theme, an @color / @dimen reference followed to its value. The configuration is the Nexus 5X's: a
value's plain or -vNN (NN <= 23) entry, the highest version winning; other qualifiers (land, television …) do not apply.
    t = Themes('_aosp/bullhead/system/')
    t.attr('app/Chrome/Chrome.apk', '@7F0F016A', 'colorPrimary')   -> '#ff…' (or None)
Attributes are named as in the framework's attrs (colorPrimary, textColorPrimary …) or given as 0x… ids."""
import re, subprocess

AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
FRAMEWORK = 'framework/framework-res.apk'
FW_ATTRS = {'colorPrimary': '0x01010433', 'colorPrimaryDark': '0x01010434', 'colorAccent': '0x01010435',
            'textColorPrimary': '0x01010036', 'textColorSecondary': '0x01010038', 'windowBackground': '0x01010054',
            'colorBackground': '0x01010031', 'statusBarColor': '0x01010451', 'navigationBarColor': '0x01010452',
            'colorControlNormal': '0x01010429', 'colorControlActivated': '0x0101042a'}


def _score(q):
    if not q: return 0
    m = re.fullmatch(r'v(\d+)', q)
    return int(m.group(1)) if m and int(m.group(1)) <= 23 else None


class Table:
    """One APK's resources: entries {(type, name): {config: [lines]}}, ids both ways."""
    def __init__(self, path):
        text = subprocess.run([AAPT, 'dump', 'resources', path], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
        self.entries, self.by_id, self.id_of = {}, {}, {}
        cur = cfg = None
        for line in text.splitlines():
            m = re.match(r'\s+resource (0x[0-9a-f]{8}) (\w+)/(\S+)', line)
            if m:
                cur = (m.group(2), m.group(3)); self.by_id[m.group(1)] = cur; self.id_of[cur] = m.group(1)
                self.entries[cur] = {}; cfg = None; continue
            if cur is None: continue
            m = re.match(r'\s+\(([^)]*)\) (.*)', line)
            if m:
                cfg = m.group(1); self.entries[cur][cfg] = [m.group(2)]; continue
            if cfg is not None and line.strip(): self.entries[cur][cfg].append(line.strip())

    def best(self, key):
        configs = self.entries.get(key)
        if not configs: return None
        scored = [(s, lines) for q, lines in configs.items() if (s := _score(q)) is not None]
        return max(scored, key=lambda x: x[0])[1] if scored else None


class Themes:
    def __init__(self, system):
        self.system, self.tables = system, {}

    def table(self, apk):
        if apk not in self.tables: self.tables[apk] = Table(self.system + apk)
        return self.tables[apk]

    def _style(self, apk, ref):
        """(apk, style name) for @7F0F016A / 0x7f0f016a / style/Name / a framework id."""
        rid = ref.lstrip('@').lower()
        if rid.startswith('0x') or re.fullmatch(r'[0-9a-f]{8}', rid):
            rid = rid if rid.startswith('0x') else '0x' + rid
            src = FRAMEWORK if rid.startswith('0x01') else apk
            name = self.table(src).by_id.get(rid)
            return (src, name[1]) if name else None
        name = ref.split('/')[-1]
        return (apk, name)

    def attr(self, apk, theme_ref, attr):
        aid = FW_ATTRS.get(attr, attr if attr.startswith('0x') else None)
        start = self._style(apk, theme_ref)
        return self._resolve_attr(start, aid, attr, start, 0)

    def _resolve_attr(self, style, aid, aname, start, depth):
        while style and depth < 40:
            src, name = style
            lines = self.table(src).best(('style', name))
            if lines is None: return None
            for l in lines[1:]:
                m = re.match(r'(?:(\w+)\()?(0x[0-9a-f]{8})\)?=(.*)', l)
                if m and (m.group(2) == aid or (aid is None and m.group(1) == aname)):
                    return self._value(src, m.group(3), start, depth + 1)
            m = re.search(r'parent=(?:style/(\S+) \((0x[0-9a-f]{8})\)|(0x[0-9a-f]{8}))', lines[0])
            if not m: return None
            pid = m.group(2) or m.group(3)
            style = self._style(src, pid)
            depth += 1
        return None

    def _value(self, apk, value, start, depth):
        value = value.strip()
        if value.startswith('#'): return value
        if value.startswith('?'):   # ?attr/name, ?0x0101… : again from the start theme
            ref = value[1:]
            if ref.startswith('attr/'): return self._resolve_attr(start, None, ref[5:], start, depth + 1)
            return self._resolve_attr(start, ref if ref.startswith('0x') else None, ref, start, depth + 1)
        if value.startswith('@'):
            ref = value[1:]
            if ref.startswith('0x'):
                src = FRAMEWORK if ref.startswith('0x01') else apk
                key = self.table(src).by_id.get(ref)
            else:
                src = FRAMEWORK if ref.startswith('android:') else apk
                key = tuple(ref.split(':')[-1].split('/', 1))
            lines = self.table(src).best(key) if key else None
            if not lines: return None
            return self._value(src, lines[0].split(' ')[0] if not lines[0].startswith('(') else lines[0], start, depth + 1)
        return None
