"""Builds a version's Developer options module from its factory image: the rows of Settings.apk's
res/xml/development_prefs.xml in order (categories, CheckBoxPreference / SwitchPreference, ListPreference,
PreferenceScreen, Preference), the summaries DevelopmentSettings shows by default (the summary attribute, or the default
entry of the list's array), and every text in Hungarian, German, French and Spanish as that image translates it.
    python docs/devopts.py mako       -> versions/4.3/jb-devopts.js
    python docs/devopts.py hammerhead -> versions/4.4.4/kk-devopts.js
    python docs/devopts.py shamu      -> versions/5.1.1/lp-devopts.js
The behaviour lives in docs/devopts.template.js."""
import glob, json, os, re, subprocess, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
DEVICES = {'mako': ('4.3', 'jb', 'android-4.3_r1.1', 'Nexus 4 (JWR66Y)'), 'hammerhead': ('4.4.4', 'kk', 'android-4.4.4_r1', 'Nexus 5 (KTU84P)'),
           'shamu': ('5.1.1', 'lp', 'android-5.1.1_r9', 'Nexus 6 (LMY48Y)')}
device = sys.argv[1]
version, prefix, tag, phone = DEVICES[device]
AAPT = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))[-1]
SYSTEM = f'{ROOT}_aosp/{device}/system/'
def apk(name):
    if name == 'framework': return SYSTEM + 'framework/framework-res.apk'
    return next(p for p in [SYSTEM + f'{d}/{name}.apk' for d in ('app', 'priv-app')] + [SYSTEM + f'{d}/{name}/{name}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
def run(*args): return subprocess.run([AAPT, *args], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
RES = {}
def table(name):
    """Resource id -> name, and array name -> {config: [items]} of an APK."""
    if name in RES: return RES[name]
    ids, arrays, cur, config, buf = {}, {}, None, None, ''
    def flush():
        if cur is not None and config is not None and buf: arrays[cur][config] = re.findall(r'@string/[\w.]+|"(?:[^"\\]|\\.)*"', buf)
    for line in run('dump', 'resources', apk(name)).splitlines():
        m = re.match(r'\s+resource (0x[0-9a-f]+) (\S+)', line)
        if m:
            flush(); ids[int(m.group(1), 16)] = m.group(2); config, buf = None, ''
            cur = m.group(2)[6:] if m.group(2).startswith('array/') else None
            if cur is not None: arrays[cur] = {}
            continue
        m = re.match(r'\s+\(([^)]*)\) \(array\)', line)
        if m and cur is not None: flush(); config, buf = m.group(1), ''; continue
        if cur is not None and config is not None: buf += line
    flush()
    RES[name] = (ids, arrays); return RES[name]
idx = json.load(open(f'{ROOT}_aosp/{device}/strings-index.json', encoding='utf-8'))
by = {}
for en, hits in idx.items():
    for a, n, tr in hits: by.setdefault((a, n), (en, tr))
LANGS = ('hu', 'de', 'fr', 'es')
STRINGS = {}
def text(source, name):
    """English text of a string resource, its translations recorded in STRINGS."""
    en, tr = by[(source, name)]
    en = en.replace("\\'", "'").replace('\\"', '"')
    STRINGS.setdefault(en, [tr.get(l, en).replace("\\'", "'").replace('\\"', '"') for l in LANGS]); return en
def array_text(name, index):
    ids, arrays = table('Settings')
    configs = arrays[name]
    def item(config):
        x = (configs.get(config) or configs[''])[index]
        if x.startswith('@string/'): return by[('Settings', x[8:])]
        return x[1:-1], {}
    en, tr = item('')
    if not by.get(('Settings', (configs[''][index] or '')[8:])):
        STRINGS.setdefault(en, [item(l)[0] if l in configs else en for l in LANGS])
    else:
        STRINGS.setdefault(en, [tr.get(l, en) for l in LANGS])
    return en
def ref(value):
    """'@0x7f0c0123' or '@android:string/x' -> (apk, name)."""
    m = re.match(r'@(0x[0-9a-f]+)', value)
    if m:
        rid = int(m.group(1), 16)
        source = 'framework' if rid >> 24 == 1 else 'Settings'
        return source, table(source)[0][rid].split('/', 1)[1]
    raise ValueError(value)
# The simulator's setting keys for the rows it already keeps (data.settings); new switches get their own.
KEYS = {'keep_screen_on': 'stayAwake', 'enforce_read_external': 'protectStorage', 'enable_adb': 'usbDebug', 'bugreport_in_power': 'bugreportPower',
        'allow_mock_location': 'mockLocations', 'wait_for_debugger': 'waitDebugger', 'verify_apps_over_usb': 'verifyUsb', 'show_touches': 'showTouches',
        'pointer_location': 'pointerLocation', 'show_screen_updates': 'surfaceUpdates', 'debug_layout': 'layoutBounds', 'force_hw_ui': 'forceGpu',
        'show_hw_screen_udpates': 'gpuUpdates', 'show_hw_layers_udpates': 'layerUpdates', 'show_hw_overdraw': 'gpuOverdraw', 'force_msaa': 'forceMsaa',
        'disable_overlays': 'disableOverlays', 'strict_mode': 'strictMode', 'show_cpu_usage': 'showCpu', 'immediately_destroy_activities': 'dontKeep',
        'show_all_anrs': 'showAnrs', 'experimental_webview': 'experimentalWebview', 'bt_hci_snoop_log': 'btSnoopLog', 'enable_terminal': 'localTerminal',
        'wifi_display_certification': 'wifiDisplayCertification', 'force_rtl_layout_all_locales': 'forceRtl', 'oem_unlock_enable': 'oemUnlock',
        'debug_view_attributes': 'viewAttributes', 'wifi_verbose_logging': 'wifiVerboseLogging', 'wifi_aggressive_handover': 'wifiAggressiveHandover',
        'wifi_allow_scan_with_traffic': 'wifiRoamScans', 'use_awesomeplayer': 'useAwesomePlayer', 'usb_audio': 'usbAudioRouting'}
SCALES = {'window_animation_scale': 'windowScale', 'transition_animation_scale': 'transitionScale', 'animator_duration_scale': 'animatorScale'}
# DevelopmentSettings' summaries of the lists at their defaults: [array, index].
LIST_DEFAULTS = {'hdcp_checking': ('hdcp_checking_summaries', 1), 'select_runtime': ('select_runtime_summaries', 0),
                 'select_logd_size': ('select_logd_size_summaries', 1), 'overlay_display_devices': ('overlay_display_devices_entries', 0),
                 'show_non_rect_clip': ('show_non_rect_clip_entries', 0), 'debug_hw_overdraw': ('debug_hw_overdraw_entries', 0),
                 'simulate_color_space': ('simulate_color_space_entries', 0), 'track_frame_time': ('track_frame_time_entries', 0),
                 'enable_opengl_traces': ('enable_opengl_traces_entries', 0), 'app_process_limit': ('app_process_limit_entries', 0)}
tree = run('dump', 'xmltree', apk('Settings'), '--file', 'res/xml/development_prefs.xml')
elements, cur = [], None
for line in tree.splitlines():
    m = re.match(r'\s*E: (\S+)', line)
    if m: cur = {'tag': m.group(1).rsplit('.', 1)[-1]}; elements.append(cur); continue
    m = re.match(r'\s*A: (?:http://schemas.android.com/apk/res/android:)?(\w+)(?:\(0x[0-9a-f]+\))?=(.*)', line)
    if m and cur is not None:
        v = m.group(2)
        raw = re.search(r'\(Raw: "([^"]*)"\)', v)
        cur[m.group(1)] = raw.group(1) if raw else v.split(' ')[0]
sections, rows = [], None
for el in elements:
    tag = el['tag']
    if tag == 'PreferenceScreen' and 'key' not in el: continue
    if tag == 'PreferenceCategory':
        rows = []; sections.append([text(*ref(el['title'])), rows]); continue
    if tag not in ('CheckBoxPreference', 'SwitchPreference', 'ListPreference', 'PreferenceScreen', 'Preference', 'BugreportPreference'): continue
    if rows is None: rows = []; sections.append(['', rows])
    key, title = el.get('key', ''), text(*ref(el['title']))
    summary = text(*ref(el['summary'])) if el.get('summary', '').startswith('@') else ''
    if tag in ('CheckBoxPreference', 'SwitchPreference'):
        row = ['switch' if tag == 'SwitchPreference' else 'check', title, summary, KEYS[key]]
        if key == 'wait_for_debugger': row.append(True)
    elif key in SCALES: row = ['scale', title, '', SCALES[key]]
    elif tag == 'ListPreference': row = ['list', title, array_text(*LIST_DEFAULTS[key]) if key in LIST_DEFAULTS else summary]
    elif key == 'debug_app': row = ['list', title, text('Settings', 'debug_app_not_set')]
    else: row = ['list', title, summary]
    rows.append(row)
src = open(ROOT + 'docs/devopts.template.js', encoding='utf-8').read()
header = f"""/* Developer options of the {phone} image (Settings.apk res/xml/development_prefs.xml, {tag}), generated by
   docs/devopts.py {device} from docs/devopts.template.js: the rows in the XML's order, the default summaries
   DevelopmentSettings shows, and the image's own Hungarian, German, French and Spanish texts. */"""
out = src.replace('__HEADER__', header).replace('__SECTIONS__', json.dumps(sections, ensure_ascii=False, indent=2).replace('\n', '\n  '))
out = out.replace('__STRINGS__', json.dumps(STRINGS, ensure_ascii=False, separators=(',', ':'))[1:-1].replace('],"', '],\n    "'))
out = out.replace('__CATEGORY_CAPS__', 'false' if prefix == 'lp' else 'true')
target = f'{ROOT}versions/{version}/{prefix}-devopts.js'
open(target, 'w', encoding='utf-8', newline='\n').write(out)
print(sum(len(r) for _, r in sections), 'rows,', len(STRINGS), 'texts ->', target)
