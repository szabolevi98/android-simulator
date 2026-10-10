"""Builds versions/<v>/tzpicker.js and tzpicker.css: frameworks/opt/timezonepicker (TimeZonePickerDialog) as each image's
CalendarGoogle ships it, from docs/timezonepicker.template.js, with the data that image's phone used:
  - the Calendar APK's assets/zone.tab and assets/backward (the zones it lists, in zone.tab order, and the old ids it
    drops), its timezone_rename_ids / _labels, backup_country_codes / _names and its strings, and its search and clear
    icons;
  - the image's /system/usr/share/zoneinfo/tzdata (bionic's packed TZif files): each zone's raw offset, its transitions
    (TimeZoneInfo.hasSameRules compares the raw offset and the next six transitions) and whether it still uses DST;
  - the image's ICU data (/system/usr/icu/icudtNNl.dat): TimeZone.getDisplayName's long standard / daylight names
    (zoneStrings: the zone's own long / short name, else its metazone's; libcore drops names starting with "GMT" and
    makes "GMT+01:00" itself) and Locale.getDisplayCountry's country names (region/ Countries).
TimeZoneData's list depends on the event's own zone (it is added first, replacing an identical one), so the template
builds it at run time. Transitions are kept from 2015 on; "now" for the rule comparison and ICU's metazones is REFERENCE.
Needs androguard and the ext4 package; the images are unpacked in _aosp/<device> (system.raw.img).
    python docs/timezonepicker.py"""
import json, struct, sys
from datetime import datetime, timezone
import ext4
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from image_res import ImageRes, LANGS, ROOT
from icu_res import IcuData

VERSIONS = {
    # version: (device, app, image, 1 dp in px, drawable density)
    '4.3': ('mako', 'CalendarGoogle 201306090', 'Nexus 4 JWR66Y', .8516, 'xhdpi'),
    '4.4.4': ('hammerhead', 'CalendarGoogle 201308023', 'Nexus 5 KTU84P', .906, 'xxhdpi'),
}
LOCALES = {'en': 'en_US', 'hu': 'hu_HU', 'de': 'de_DE', 'fr': 'fr_FR', 'es': 'es_ES'}
REFERENCE = int(datetime(2026, 1, 1, tzinfo=timezone.utc).timestamp())
KEEP_FROM = int(datetime(2020, 1, 1, tzinfo=timezone.utc).timestamp())


def read_image(device, path):
    volume = ext4.Volume(open(f'{ROOT}_aosp/{device}/system.raw.img', 'rb'))
    return volume.inode_at(path).open().read()


def image_file(device, folder):
    volume = ext4.Volume(open(f'{ROOT}_aosp/{device}/system.raw.img', 'rb'))
    names = [entry.name_str if hasattr(entry, 'name_str') else entry.name.decode() for entry, _ in volume.inode_at(folder).opendir()]
    return next(n for n in names if n not in ('.', '..'))


class Zone:
    """libcore's ZoneInfo over one TZif entry: the raw offset is the latest standard offset, getOffset / inDaylightTime
    look the time up in the transitions, useDaylightTime is whether the last transition is still ahead."""
    def __init__(self, zid, blob):
        self.id = zid
        assert blob[:4] == b'TZif'
        isutc, isstd, leap, timecnt, typecnt, charcnt = struct.unpack_from('>6l', blob, 20)
        p = 44
        self.trans = list(struct.unpack_from('>%dl' % timecnt, blob, p)); p += 4 * timecnt
        self.types = list(blob[p:p + timecnt]); p += timecnt
        self.offsets, self.dst = [], []
        for _ in range(typecnt):
            off, isdst, _abbr = struct.unpack_from('>lBB', blob, p); p += 6
            self.offsets.append(off); self.dst.append(isdst)
        last_std = next((i for i in range(len(self.trans) - 1, -1, -1) if self.dst[self.types[i]] == 0), -1)
        last_std = max(last_std, 0)
        self.raw = self.offsets[0] if last_std >= len(self.types) else self.offsets[self.types[last_std]]
        self.use_dst = bool(self.trans) and REFERENCE < self.trans[-1]

    def state(self, t):
        i = next((k for k in range(len(self.trans) - 1, -1, -1) if self.trans[k] <= t), -1)
        if i < 0:
            return self.raw, 0
        return self.offsets[self.types[i]], self.dst[self.types[i]]

    def signature(self):
        """TimeZoneInfo.mRawoffset and mTransitions: null without transitions, else the next six, padded with zeros."""
        if not self.trans:
            return (self.raw, None)
        nxt = [t for t in self.trans if t >= REFERENCE][:6]
        return (self.raw, tuple(nxt + [0] * (6 - len(nxt))))

    def runtime(self):
        """The offsets from KEEP_FROM on: [offset minutes and DST flag then, [[offset, dst] per type], "transitions"],
        the transitions as base-36 minutes since the previous one (or KEEP_FROM) and the type's index, comma-separated."""
        off, dst = self.state(KEEP_FROM)
        kinds, steps, last = [], [], KEEP_FROM // 60
        for t, ty in zip(self.trans, self.types):
            if t > KEEP_FROM:
                kind = [self.offsets[ty] // 60, self.dst[ty]]
                if kind not in kinds: kinds.append(kind)
                steps.append(f'{base36(t // 60 - last)}.{kinds.index(kind)}'); last = t // 60
        return [off // 60, dst, kinds, ','.join(steps)]


def base36(n):
    digits = ''
    while True:
        n, r = divmod(n, 36); digits = '0123456789abcdefghijklmnopqrstuvwxyz'[r] + digits
        if not n: return digits


def tzdata(device):
    """bionic's tzdata: 'tzdataYYYYx', the index (40-byte name, start, length, raw offset) and the TZif blobs."""
    data = read_image(device, '/usr/share/zoneinfo/tzdata')
    version = data[:11].decode()
    index, start, _zonetab = struct.unpack_from('>3l', data, 12)
    zones = {}
    for p in range(index, start, 52):
        name = data[p:p + 40].split(b'\0')[0].decode()
        off, length, _raw = struct.unpack_from('>3l', data, p + 40)
        zones[name] = Zone(name, data[start + off:start + off + length])
    return version, zones


class Names:
    """TimeZone.getDisplayName(daylight, LONG, locale) and Locale.getDisplayCountry as the image's ICU gives them."""
    def __init__(self, icu):
        self.icu = icu
        self.type_map = icu.raw('timezoneTypes', 'typeMap', 'timezone') or {}
        self.type_alias = icu.raw('timezoneTypes', 'typeAlias', 'timezone') or {}
        self.meta = icu.raw('metaZones', 'metazoneInfo') or {}

    def canonical(self, zid):
        key = zid.replace('/', ':')
        if key in self.type_map:
            return key
        if key in self.type_alias:
            return self.type_alias[key].replace('/', ':')
        return key

    def metazone(self, key):
        for entry in self.meta.get(key, []):
            if len(entry) == 1:
                return entry[0]
            begin = datetime.strptime(entry[1], '%Y-%m-%d %H:%M').replace(tzinfo=timezone.utc).timestamp()
            end = datetime.strptime(entry[2], '%Y-%m-%d %H:%M').replace(tzinfo=timezone.utc).timestamp()
            if begin <= REFERENCE < end:
                return entry[0]
        return None

    def zone(self, zid, lang, daylight, short=False):
        """ICU's long (or short) name, or None where libcore makes the GMT string itself (none, or one starting with GMT)."""
        locale, kind, key = LOCALES[lang], ('s' if short else 'l') + ('d' if daylight else 's'), self.canonical(zid)
        name = self.icu.get('zone', locale, 'zoneStrings', key, kind)
        if not name:
            mz = self.metazone(key)
            name = mz and self.icu.get('zone', locale, 'zoneStrings', 'meta:' + mz, kind)
        return None if not name or name.startswith('GMT') else name

    def country(self, code, lang):
        return self.icu.get('region', LOCALES[lang], 'Countries', code)


def build(version, device, app, image, d, density):
    res = ImageRes(device)
    apk_path = f'{ROOT}_aosp/{device}/system/app/CalendarGoogle.apk'
    apk = APK(apk_path)
    zone_tab = apk.get_file('assets/zone.tab').decode('utf-8')
    backward = apk.get_file('assets/backward').decode('utf-8')
    tz_version, zones = tzdata(device)
    icu_name = image_file(device, '/usr/icu')
    icu = IcuData(read_image(device, f'/usr/icu/{icu_name}'))
    names = Names(icu)

    zt = []
    for line in zone_tab.splitlines():
        if line and not line.startswith('#'):
            fields = line.split('\t')
            zt.append([fields[2], fields[0]])
    links = {}
    for line in backward.splitlines():
        if line and not line.startswith('#'):
            fields = [f for f in line.split('\t') if f]
            links[fields[-1]] = fields[1]
    processed = {z for z, _ in zt} | set(links)
    etc = [z for z in zones if z not in processed and z.startswith('Etc/GMT')]

    unknown = [z for z, _ in zt if z not in zones]
    if unknown:
        print(version, 'zone.tab ids missing from tzdata (TimeZone.getTimeZone gives GMT):', unknown)

    # Interned strings: display names and countries.
    pool, at = [], {}
    def intern(text):
        if text is None:
            return -1
        if text not in at:
            at[text] = len(pool); pool.append(text)
        return at[text]

    # The zones the dialog can reach: zone.tab's, the Etc/GMT ones and GMT (TimeZone.getTimeZone's answer to an unknown
    # id); an old id of an event maps through backward to its new one. Rule signatures, name tuples and transition
    # tables are shared between zones.
    tables = {'sigs': [], 'names': [], 'trans': []}
    def share(kind, value):
        table = tables[kind]
        if value not in table: table.append(value)
        return table.index(value)
    out_zones = {}
    for zid in [z for z, _ in zt if z in zones] + etc + ['GMT']:
        z = zones[zid]
        out_zones[zid] = [z.raw // 60, int(z.use_dst), share('sigs', z.signature()),
                          share('names', [intern(names.zone(zid, lang, dl, short)) for lang in LANGS for short in (False, True) for dl in (False, True)]),
                          share('trans', z.runtime())]
    sigs = tables['sigs']

    codes = sorted({cc for _, cc in zt})
    backup = (res.array(['CalendarGoogle'], 'backup_country_codes') or {}).get('en', [])
    backup_names = res.array(['CalendarGoogle'], 'backup_country_names') or {}
    palestine = res.string(['CalendarGoogle'], 'palestine_display_name')
    countries = {}
    for cc in codes:
        row = []
        for lang in LANGS:
            if cc.upper() == 'PS':
                name = palestine.get(lang, palestine['en'])
            else:
                name = names.country(cc, lang) or cc
                if name == cc and cc in backup:
                    name = backup_names.get(lang, backup_names['en'])[backup.index(cc)]
            row.append(intern(name))
        countries[cc] = row

    rename_ids = res.array(['CalendarGoogle'], 'timezone_rename_ids')['en']
    rename_labels = res.array(['CalendarGoogle'], 'timezone_rename_labels')
    renames = {zid: [intern(rename_labels.get(lang, rename_labels['en'])[i]) for lang in LANGS] for i, zid in enumerate(rename_ids)}

    strings = {}
    for key in ('hint_time_zone_search', 'no_results_found', 'searchview_description_clear', 'accessibility_pick_time_zone'):
        value = res.string(['CalendarGoogle'], key)
        strings[key] = [value.get(lang, value['en']) for lang in LANGS]

    data = {'from': KEEP_FROM // 60, 'zoneTab': zt, 'links': links, 'etc': etc, 'zones': out_zones, 'zoneNames': tables['names'], 'transitions': tables['trans'],
            'countries': countries, 'renames': renames, 'names': pool, 'strings': strings}
    template = open(ROOT + 'docs/timezonepicker.template.js', encoding='utf-8').read()
    js = (template.replace('__APP__', app).replace('__IMAGE__', image).replace('__TZDATA__', tz_version).replace('__ICU__', icu_name)
          .replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':'))))
    open(f'{ROOT}versions/{version}/tzpicker.js', 'w', encoding='utf-8', newline='\n').write(js)
    open(f'{ROOT}versions/{version}/tzpicker.css', 'w', encoding='utf-8', newline='\n').write(CSS % {'app': app, 'image': image, 'd': d, 'slice': {'xhdpi': 20, 'xxhdpi': 30}[density]})
    for name in ('ic_search_holo_light', 'ic_clear_search_holo_light'):
        rid = apk.get_android_resources().get_res_id_by_key(res._apk('CalendarGoogle')[1], 'drawable', name)
        files = {}
        for config, _ in apk.get_android_resources().get_res_configs(rid):
            q = config.get_qualifier() or ''
            path = apk.get_android_resources().get_resolved_res_configs(rid, config)[0][1]
            files[next((x for x in q.split('-') if x.endswith('dpi')), '')] = path
        pick = files.get(density) or files.get('xhdpi') or next(iter(files.values()))
        open(f'{ROOT}versions/{version}/assets/tzp-{name}.png', 'wb').write(apk.get_file(pick))
    print(version, tz_version, icu_name, len(zt), 'zone.tab rows,', len(etc), 'Etc/GMT zones,', len(out_zones), 'zones,', len(sigs), 'rule sets,',
          len(pool), 'names,', round(len(js) / 1024), 'KiB')


CSS = """/* frameworks/opt/timezonepicker (tzpicker.js) of %(app)s, %(image)s; 1 dp = %(d)spx. Generated by docs/timezonepicker.py.
   TimeZonePickerDialog on Theme.Holo.Light.Dialog without a title (95 %% wide on a phone, windowMinWidthMinor):
   timezonepickerview.xml (300 dp minimum width) with the
   AutoCompleteTextView (48 dp, 8 dp margins, 30 dp right padding for clear_search, textfield_*_holo_light underline,
   the "Type country name" hint after ic_search_holo_light at 1.25 x the 18 sp text) over the #ECECEC timezonelist.
   time_zone_item.xml: 20 dp sides; the name in textAppearanceMedium (18 sp #000000) 8 dp from the top, the time and
   GMT offset (16 sp; the offset in #888888, the DST sun in #BFBFBF), the country in textAppearanceSmall (14 sp
   #323232) 8 dp above the bottom, all sans-serif-light; empty_time_zone_item.xml says no_results_found (16 sp) at the
   same height. The suggestions (time_zone_filter_item.xml: 8 dp padding, 32 dp minimum, 18 sp) drop down under the
   field on menu_dropdown_panel_holo_light. */
.tzp{--d:%(d)spx;position:absolute;z-index:26;left:50%%;top:50%%;transform:translate(-50%%,-50%%);width:95%%;min-width:min(calc(300 * var(--d)),100%%);max-height:calc(100%% - 48 * var(--d));display:flex;flex-direction:column;background:#f3f3f3;box-shadow:0 0 0 1px #0002,0 6px 24px #0009;font-family:Roboto,RobotoICS,sans-serif;font-weight:300;color:#000;user-select:none}
.tzp-search{flex:none;position:relative;padding:calc(8 * var(--d)) calc(8 * var(--d)) calc(8 * var(--d))}
.screen .tzp-input{display:block;box-sizing:border-box;width:100%%;min-height:calc(48 * var(--d));margin:0;padding:0 calc(30 * var(--d)) 0 calc(4 * var(--d));border:0;border-radius:0;background:linear-gradient(#bababa,#bababa) left bottom/100%% 1px no-repeat,linear-gradient(#bababa,#bababa) left bottom/1px calc(5 * var(--d)) no-repeat,linear-gradient(#bababa,#bababa) right bottom/1px calc(5 * var(--d)) no-repeat;font:300 calc(18 * var(--d))/1.2 Roboto,RobotoICS,sans-serif;color:#000;outline:none;caret-color:#33b5e5}
.screen .tzp-input:focus{background:linear-gradient(#33b5e5,#33b5e5) left bottom/100%% 2px no-repeat,linear-gradient(#33b5e5,#33b5e5) left bottom/2px calc(6 * var(--d)) no-repeat,linear-gradient(#33b5e5,#33b5e5) right bottom/2px calc(6 * var(--d)) no-repeat}
.tzp-hint{position:absolute;left:calc(12 * var(--d));top:calc(8 * var(--d));height:calc(48 * var(--d));display:flex;align-items:center;gap:calc(4.5 * var(--d));font-size:calc(18 * var(--d));color:#808080;pointer-events:none}
.tzp-hint img{width:calc(22.5 * var(--d));height:calc(22.5 * var(--d));margin-left:calc(4.5 * var(--d))}
.screen .tzp-clear{position:absolute;right:calc(8 * var(--d));top:calc(8 * var(--d));height:calc(48 * var(--d));display:flex;align-items:center;padding:0 calc(8 * var(--d));border:0;background:none;cursor:pointer}
.screen .tzp-clear:active{background:#33b5e566}
.tzp-clear img{width:calc(32 * var(--d));height:calc(32 * var(--d))}
.tzp-list{flex:1 1 auto;min-height:0;overflow-y:auto;background:#ececec;scrollbar-width:none}
.screen .tzp-row{display:flex;flex-direction:column;align-items:flex-start;width:100%%;padding:0 calc(20 * var(--d));border:0;border-bottom:1px solid #d6d6d6;background:none;text-align:left;font:inherit;color:inherit;cursor:pointer}
.screen .tzp-row:active{background:#33b5e566}
.tzp-row span{display:block;max-width:100%%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tzp-name{padding-top:calc(8 * var(--d));font-size:calc(18 * var(--d));line-height:1.3;color:#000}
.tzp-time{font-size:calc(16 * var(--d));line-height:1.3;color:#000}
.tzp-time i{font-style:normal;color:#888}
.tzp-time b{font-weight:inherit;color:#bfbfbf}
.tzp-country{padding-bottom:calc(8 * var(--d));font-size:calc(14 * var(--d));line-height:1.3;color:#323232}
.tzp-country.none{visibility:hidden}
.tzp-empty{position:relative;padding:0 calc(20 * var(--d));border-bottom:1px solid #d6d6d6}
.tzp-empty .tzp-row{visibility:hidden;padding:0;border:0}
.tzp-empty p{position:absolute;inset:0 calc(20 * var(--d));margin:0;padding-top:calc(8 * var(--d));display:flex;align-items:center;font-size:calc(16 * var(--d));color:#000}
.tzp-drop{position:absolute;left:calc(8 * var(--d));right:calc(8 * var(--d));top:calc(56 * var(--d));z-index:1;max-height:calc(240 * var(--d));overflow-y:auto;border:calc(10 * var(--d)) solid transparent;border-image:url(assets/menu_dropdown_panel_holo_light.png) %(slice)s fill/calc(10 * var(--d));scrollbar-width:none}
.screen .tzp-drop button{display:flex;align-items:center;width:100%%;min-height:calc(48 * var(--d));padding:calc(8 * var(--d));border:0;background:none;text-align:left;font:300 calc(18 * var(--d)) Roboto,RobotoICS,sans-serif;color:#000;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.screen .tzp-drop button:active{background:#33b5e566}
.cal-tz{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-tz i{font-style:normal;color:#888}
.cal-tz b{font-weight:inherit;color:#bfbfbf}
"""

if __name__ == '__main__':
    for v in sys.argv[1:] or VERSIONS:
        build(v, *VERSIONS[v])
