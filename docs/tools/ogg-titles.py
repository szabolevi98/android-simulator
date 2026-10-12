"""Prints the Vorbis TITLE of every ringtone, notification and alarm sound of a device image (what the pickers show).
    python docs/tools/ogg-titles.py _aosp/<device>   (also writes _aosp/<device>/sounds.json)"""
import os, re, sys, json
dev = sys.argv[1]; out = {}
for kind in ('ringtones', 'notifications', 'alarms'):
    rows = []
    folder = f'{dev}/system/media/audio/{kind}'
    for name in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
        data = open(f'{folder}/{name}', 'rb').read(8192)
        m = re.search(rb'(?i)title=([^\x00-\x1f]+)', data)
        rows.append([os.path.splitext(name)[0], m.group(1).decode('utf-8', 'replace') if m else None])
    out[kind] = rows
json.dump(out, open(f'{dev}/sounds.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for kind, rows in out.items(): print(dev, kind, [t or f for f, t in rows])
