"""Lists the home screen widgets a factory image offers: every receiver in /system/app and /system/priv-app that handles
android.appwidget.action.APPWIDGET_UPDATE, with its label (receiver, else application) in English and the
provider XML's minimum size and widgetCategory (home / keyguard).
    python docs/widget-providers.py maguro mako hammerhead shamu"""
import glob, re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
A = '{http://schemas.android.com/apk/res/android}'
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'


def label(apk, res, value):
    if not value: return ''
    if value.startswith('@'):
        try: return res.get_resolved_res_configs(int(value[1:], 16))[0][1]
        except Exception: return value
    return value


def main(device):
    apks = sorted(glob.glob(f'{ROOT}_aosp/{device}/system/app/*.apk') + glob.glob(f'{ROOT}_aosp/{device}/system/priv-app/*.apk')
                  + glob.glob(f'{ROOT}_aosp/{device}/system/app/*/*.apk') + glob.glob(f'{ROOT}_aosp/{device}/system/priv-app/*/*.apk'))
    print('==', device, len(apks), 'apks')
    for path in apks:
        try:
            apk = APK(path); manifest = apk.get_android_manifest_xml()
        except Exception as error:
            print('  !', path.split('/')[-1], error); continue
        app = manifest.find('application')
        found = []
        for receiver in manifest.iter('receiver'):
            actions = [a.get(A + 'name') for a in receiver.iter('action')]
            if 'android.appwidget.action.APPWIDGET_UPDATE' not in actions: continue
            meta = [m.get(A + 'resource') for m in receiver.iter('meta-data') if m.get(A + 'name') == 'android.appwidget.provider']
            found.append((receiver, meta[0] if meta else None))
        if not found: continue
        res = apk.get_android_resources()
        for receiver, meta in found:
            name = label(apk, res, receiver.get(A + 'label')) or label(apk, res, app.get(A + 'label'))
            info = ''
            if meta:
                try:
                    xml_name = res.get_resource_xml_name(int(meta[1:], 16)).split('/')[-1]
                    xml = AXMLPrinter(apk.get_file(f'res/xml/{xml_name}.xml')).get_xml().decode()
                    size = re.findall(r'android:min(?:Width|Height)="([^"]+)"', xml)
                    cat = re.findall(r'android:widgetCategory="([^"]+)"', xml)
                    info = f'{xml_name} min {"x".join(size)} category {cat[0] if cat else "home"}'
                except Exception as error:
                    info = f'{meta} ({error})'
            print(f'  {path.split("/")[-1]:32} {name!s:34} {receiver.get(A + "name")} {info}')


if __name__ == '__main__':
    for d in sys.argv[1:]: main(d)
