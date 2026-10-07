"""Prints a preference screen from a factory image's APK as rows: type, key, title and summary (English, resolved), with
dependency / persistent hints. Used to check the simulator's Settings pages against each image.
    python docs/prefs-dump.py <device> <apk name> <xml name> [...]
    python docs/prefs-dump.py mako Settings date_time_prefs tether_prefs wifi_advanced_settings"""
import glob, re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
A = '{http://schemas.android.com/apk/res/android}'


def main(device, apk_name, names):
    paths = glob.glob(f'{ROOT}_aosp/{device}/system/*app/{apk_name}.apk') + glob.glob(f'{ROOT}_aosp/{device}/system/*app/{apk_name}/{apk_name}.apk')
    apk = APK(paths[0]); res = apk.get_android_resources()
    fw = APK(f'{ROOT}_aosp/{device}/system/framework/framework-res.apk').get_android_resources()

    def text(value):
        if not value: return ''
        m = re.match(r'@(android:)?([0-9A-Fa-f]{8})$', value)
        if not m: return value
        rid = int(m.group(2), 16); table = fw if rid >> 24 == 1 else res
        try:
            name = table.get_resource_xml_name(rid)
            if '/string/' in name or ':string/' in name: return f"{table.get_resolved_res_configs(rid)[0][1]} <{name.split('/')[-1]}>"
            return name.split(':')[-1]
        except Exception: return value
    for name in names:
        try: xml = AXMLPrinter(apk.get_file(f'res/xml/{name}.xml')).get_xml_obj()
        except Exception as error:
            print(f'== {device} {apk_name} {name}: {error}'); continue
        print(f'== {device} {apk_name} {name}')
        def walk(node, depth):
            for child in node:
                tag = child.tag.split('.')[-1]
                title, summary = text(child.get(A + 'title')), text(child.get(A + 'summary'))
                extra = ' '.join(f'{k}={text(child.get(A + k))}' for k in ('summaryOn', 'summaryOff', 'dependency', 'entries', 'defaultValue', 'fragment', 'targetClass') if child.get(A + k))
                print(f'{"  " * depth}{tag:26} {child.get(A + "key") or "":30} {title!s:40} {summary!s:50} {extra}'.rstrip())
                walk(child, depth + 1)
        walk(xml, 1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
