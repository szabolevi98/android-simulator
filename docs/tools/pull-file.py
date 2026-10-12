"""Copies files out of an unpacked factory image's system.raw.img (ext4):
    python docs/tools/pull-file.py _aosp/<device> <out dir> /app/Gmail.odex [/lib/libfoo.so ...]"""
import os, sys
import ext4
ROOT, OUT, paths = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(OUT, exist_ok=True)
with open(f'{ROOT}/system.raw.img', 'rb') as fh:
    volume = ext4.Volume(fh)
    for path in paths:
        path = '/' + path.lstrip('/')
        try: data = volume.inode_at(path).open().read()
        except FileNotFoundError: print('missing', path); continue
        with open(os.path.join(OUT, os.path.basename(path)), 'wb') as out: out.write(data)
        print(path, len(data))
