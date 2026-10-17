"""Android 6.0.1: the Settings app's preference screens from the Nexus 5X image (Settings.apk res/xml, MTC20K).

    python docs/tools/mm-prefs.py

Writes
  versions/6.0.1/mm-settings-data.js   MM.settingsXml = {<xml name>: node}; a node is {t: tag, key, title, summary, …,
                                       c: [children]} with every resource reference by name ("string/wifi_settings",
                                       "array/…"), entryValues as their values; an icon is {icon, tint?} naming its asset;
                                       MM.settingsLabels = {activity: its android:label}; MM.settingsTheme = the colours
                                       of Theme.Settings (docs/tools/apk_theme.py)
  versions/6.0.1/mm-strings-settings.js  the strings and arrays those screens name (docs/tools/mm-strings.py)
  docs/data/mm-assets-settings.tsv, docs/data/mm-vectors-settings.tsv  the drawables they name: a bitmap drawable of an
                                       *_alpha PNG tinted by an attribute (the dashboard's icons) is the PNG and the
                                       resolved tint, a vector goes to mm-vectors.py, a PNG to mm-assets.py
The configuration is the 5X's: res/xml (no other variant applies to a phone). Do not edit the outputs."""
import importlib.util, json, os, re, subprocess, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apk_theme import Themes

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + '_aosp/bullhead/system/'
APKPATH = 'priv-app/Settings/Settings.apk'
AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
ST = APK(SYSTEM + APKPATH)
RS, RF = ST.get_android_resources(), APK(SYSTEM + 'framework/framework-res.apk').get_android_resources()
THEMES = Themes(SYSTEM)
NS = '{http://schemas.android.com/apk/res/android}'
APP_THEME = ST.get_android_manifest_xml().find('application').get(NS + 'theme')
ATTRS = ['key', 'title', 'summary', 'summaryOn', 'summaryOff', 'entries', 'entryValues', 'dependency', 'defaultValue', 'icon',
         'dialogTitle', 'dialogMessage', 'order', 'disableDependentsState', 'persistent', 'enabled', 'selectable', 'layout',
         'widgetLayout', 'fragment', 'switchTextOn', 'switchTextOff', 'max', 'id', 'positiveButtonText', 'negativeButtonText',
         'ringtoneType', 'showDefault', 'showSilent', 'singleLine', 'inputType', 'password']
SKIP = {'appwidget_info', 'file_paths'}
EXTRA = ['settings_label_launcher', 'search_menu', 'framework/cancel', 'framework/ok',
         'switch_on_text', 'switch_off_text', 'status_unavailable',
         # DisplaySettings
         'display_auto_rotate_rotate', 'display_auto_rotate_stay_in_portrait', 'screensaver_settings_summary_off',
         # WifiSettings, AccessPoint, WifiConfigController, SavedAccessPointsWifiSettings
         'wifi_settings', 'wifi_empty_list_wifi_off', 'wifi_starting', 'wifi_stopping', 'wifi_empty_list_wifi_on', 'wifi_add_network',
         'wifi_saved_access_points_label', 'wifi_saved_access_points_titlebar', 'menu_stats_refresh', 'wifi_menu_advanced',
         'wifi_advanced_titlebar', 'wifi_menu_connect', 'wifi_menu_forget', 'wifi_menu_modify', 'wifi_remembered', 'wifi_not_in_range',
         'wifi_status', 'wifi_signal', 'wifi_speed', 'link_speed+args1', 'wifi_frequency', 'wifi_band_24ghz', 'wifi_band_5ghz',
         'wifi_security', 'wifi_security_none', 'wifi_security_wpa2', 'wifi_password', 'wifi_show_password', 'wifi_show_advanced',
         'wifi_connect', 'wifi_forget', 'wifi_cancel', 'wifi_save', 'wifi_ssid', 'wifi_ssid_hint', 'wifi_ip_settings',
         'proxy_settings_title', 'array:wifi_status', 'array:wifi_signal', 'array:wifi_security', 'array:wifi_ip_settings',
         'array:wifi_proxy_settings',
         # BluetoothSettings, BluetoothDevicePreference, CachedBluetoothDevice, BluetoothPairingDialog, DeviceProfilesSettings,
         # BluetoothNameDialogFragment
         'bluetooth_settings', 'bluetooth_empty_list_bluetooth_off', 'bluetooth_turning_on', 'bluetooth_preference_paired_devices',
         'bluetooth_preference_found_devices', 'bluetooth_is_visible_message+args1', 'bluetooth_search_for_devices',
         'bluetooth_searching_for_devices', 'bluetooth_rename_device', 'bluetooth_show_received_files', 'bluetooth_no_devices_found',
         'bluetooth_pairing', 'bluetooth_connected', 'bluetooth_connecting', 'bluetooth_device_details', 'bluetooth_disconnect_title',
         'bluetooth_disconnect_all_profiles+args1', 'bluetooth_pairing_request+args1', 'bluetooth_pairing_accept',
         'bluetooth_pairing_decline', 'bluetooth_pairing_key_msg', 'bluetooth_pairing_shares_phonebook+args1', 'bluetooth_rename_button',
         'progress_scanning', 'bluetooth_preference_paired_dialog_name_label', 'bluetooth_device_advanced_profile_header_title',
         'bluetooth_profile_headset', 'bluetooth_profile_a2dp', 'bluetooth_profile_pbap', 'forget', 'okay', 'cancel',
         # DeviceInfoSettings, Status, SimStatus, ImeiInformation, RegulatoryInfoDisplayActivity, Utils.getBatteryStatus
         'plurals:show_dev_countdown', 'show_dev_on', 'show_dev_already', 'battery_info_status_discharging',
         'battery_info_status_charging', 'battery_info_status_full', 'sim_signal_strength+args2', 'device_info_default',
         'radioInfo_service_in', 'radioInfo_service_off', 'radioInfo_roaming_not', 'radioInfo_data_connected',
         'radioInfo_data_disconnected', 'regulatory_information']
strings, arrays, drawables = set(), set(), {}


def name_of(value):
    if not isinstance(value, str) or not re.fullmatch(r'@[0-9A-Fa-f]{8}', value): return None
    rid = int(value[1:], 16)
    res = RF if rid >> 24 == 1 else RS
    n = res.get_resource_xml_name(rid)
    return (('framework' if rid >> 24 == 1 else 'Settings'), n.split(':', 1)[-1].lstrip('@')) if n else None


def drawable(apk, key):
    """The asset for a drawable: {icon: file, tint?: colour}."""
    if (apk, key) in drawables: return drawables[(apk, key)]
    path = APKPATH if apk == 'Settings' else 'framework/framework-res.apk'
    out = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + path, '--file', f'res/drawable/{key}.xml'], capture_output=True, text=True).stdout
    prefix = 'st-' if apk == 'Settings' else 'fw-'
    if out.strip():
        root = re.search(r'E: ([\w.-]+)', out).group(1)
        if root == 'bitmap':
            src = re.search(r'src\(0x01010119\)=@(0x[0-9a-f]{8})', out).group(1)
            tint = re.search(r'tint\(0x01010121\)=\?(0x[0-9a-f]{8})', out)
            res = RF if src.startswith('0x01') else RS
            png = res.get_resource_xml_name(int(src, 16)).split('/')[-1]
            color = THEMES.attr(APKPATH, APP_THEME, tint.group(1)) if tint else None
            info = {'icon': f'{prefix}{png}.png', 'kind': 'png', 'res': png, 'path': path}
            if color: info['tint'] = '#' + color[-6:]
        elif root == 'vector':
            info = {'icon': f'{prefix}{key}.svg', 'kind': 'vector', 'res': key, 'path': path}
        else:
            info = {'icon': None, 'kind': root}
    else:
        info = {'icon': f'{prefix}{key}.png', 'kind': 'png', 'res': key, 'path': path}
    drawables[(apk, key)] = info
    return info


def ref(value):
    hit = name_of(value)
    if not hit: return value
    apk, name = hit
    kind, key = name.split('/', 1)
    if kind == 'string': strings.add((key, apk)); return f'string/{key}'
    if kind == 'array': arrays.add((key, apk)); return f'array/{key}'
    if kind == 'drawable' or kind == 'mipmap':
        d = drawable(apk, key)
        return {k: v for k, v in d.items() if k in ('icon', 'tint')}
    return name


def values(value):
    rid = int(value[1:], 16)
    res = RF if rid >> 24 == 1 else RS
    for config, entry in res.get_res_configs(rid):
        if (config.get_qualifier() or '') == '':
            return [res.stringpool_main.getString(i.data) if i.data_type == 3 else str(i.data) for _, i in entry.item.items]
    return []


def node(e):
    out = {'t': e.tag.split('.')[-1]}
    for k, v in e.attrib.items():
        name = k.split('}')[-1]
        if name == 'entryValues' and isinstance(v, str) and v.startswith('@'): out[name] = values(v)
        elif name in ATTRS: out[name] = ref(v)
    kids = []
    for ch in e:
        if ch.tag == 'intent': out['intent'] = {k.split('}')[-1]: v for k, v in ch.attrib.items()}
        elif ch.tag == 'extra': out.setdefault('extras', {})[ch.get(NS + 'name')] = ch.get(NS + 'value')
        else: kids.append(node(ch))
    if kids: out['c'] = kids
    return out


def main():
    data = {}
    for path in sorted(p for p in ST.get_files() if re.fullmatch(r'res/xml/\w+\.xml', p)):
        name = path[8:-4]
        if name in SKIP: continue
        data[name] = node(AXMLPrinter(ST.get_file(path)).get_xml_obj())
    labels = {}
    for act in ST.get_android_manifest_xml().iter('activity'):
        lab = act.get(NS + 'label')
        if lab: labels[act.get(NS + 'name').split('.')[-1]] = ref(lab)
    theme = {a: (THEMES.attr(APKPATH, APP_THEME, a) or '')[-6:] for a in ('colorAccent', 'colorPrimary', 'colorPrimaryDark', 'windowBackground')}
    head = ('/* Generated by docs/tools/mm-prefs.py from the Nexus 5X MTC20K image\'s Settings.apk res/xml: every preference screen\n'
            '   with its resources by name (the texts are in mm-strings-settings.js). Do not edit. */\n')
    open(ROOT + 'versions/6.0.1/mm-settings-data.js', 'w', encoding='utf-8', newline='\n').write(
        head + 'MM.settingsXml = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
        + 'MM.settingsLabels = ' + json.dumps(labels, ensure_ascii=False, separators=(',', ':')) + ';\n'
        + 'MM.settingsTheme = ' + json.dumps({k: '#' + v for k, v in theme.items()}) + ';\n')
    spec = importlib.util.spec_from_file_location('mm_strings', ROOT + 'docs/tools/mm-strings.py')
    ms = importlib.util.module_from_spec(spec); spec.loader.exec_module(ms)
    keys = [n if apk == 'Settings' else f'framework/{n}' for n, apk in sorted(strings)]
    # The dashboard's external tile: GMS Core's GoogleSettingsLink (category personal, its label and settings icon).
    keys.append('PrebuiltGmsCore/common_google_platform_settings')
    # Texts the Settings code shows itself (titles, dialog buttons, summaries it formats), kept with the screens'.
    for extra in EXTRA:
        if extra not in keys: keys.append(extra)
    keys += [f'array:{n}' if apk == 'Settings' else f'array:framework/{n}' for n, apk in sorted(arrays)]
    ms.build('settings', {'apks': ['Settings', 'framework'], 'keys': keys}, {})
    png = ['# Settings drawables named by its preference screens (written by docs/tools/mm-prefs.py)']
    vec = ['# Settings vector drawables named by its preference screens (written by docs/tools/mm-prefs.py)',
           'gms-ic_google_settings.svg	priv-app/PrebuiltGmsCore/PrebuiltGmsCore.apk	ic_google_settings	-']
    # Drawables the Settings code sets itself: AccessPointPreference's wifi_signal (a level list of ic_wifi_signal_1..4
    # with ic_wifi_signal_lock layered over a secured network), every path in ?wifi_signal_color (#009688).
    for name in ['ic_wifi_signal_1', 'ic_wifi_signal_2', 'ic_wifi_signal_3', 'ic_wifi_signal_4', 'ic_wifi_signal_lock']:
        vec.append(f'st-{name}.svg	{APKPATH}	{name}	tint=#ff' + THEMES.attr(APKPATH, APP_THEME, 'wifi_signal_color')[-6:])
    # wifi_advanced_toggle's ic_expand: ic_expand_more, checked ic_expand_less, in the dialog's colorControlNormal.
    for name in ['ic_expand_more', 'ic_expand_less']:
        vec.append(f'st-{name}.svg	{APKPATH}	{name}	tint=#8a000000')
    # Bitmaps the Settings code sets itself: BluetoothDevicePreference's class icons and preference_bluetooth's gear.
    # RegulatoryInfoDisplayActivity's image for the SKU (ro.boot.hardware.sku; the simulator is the US LG-H790).
    png.append(f'st-regulatory_info_lgh790.png	{APKPATH}	drawable/regulatory_info_lgh790')
    for name in ['ic_bt_headset_hfp', 'ic_bt_headphones_a2dp', 'ic_bt_config']:
        png.append(f'st-{name}.png	{APKPATH}	drawable/{name}')
    for (apk, key), d in sorted(drawables.items()):
        if d['kind'] == 'png': png.append(f"{d['icon']}\t{d['path']}\tdrawable/{d['res']}")
        elif d['kind'] == 'vector': vec.append(f"{d['icon']}\t{d['path']}\t{d['res']}\t-")
    open(ROOT + 'docs/data/mm-assets-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(png) + '\n')
    open(ROOT + 'docs/data/mm-vectors-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(vec) + '\n')
    print(len(data), 'screens,', len(strings), 'strings,', len(arrays), 'arrays,', len(drawables), 'drawables')


if __name__ == '__main__':
    main()
