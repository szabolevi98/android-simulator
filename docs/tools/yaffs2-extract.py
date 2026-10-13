"""Unpack a YAFFS2 system.img (as made by mkyaffs2image: 2048-byte pages + 64-byte spare) into a folder.

Used for the Nexus One (passion) images, which predate ext4. Directories, files and symlinks are written;
hard links and special files are listed and skipped.

    python docs/tools/yaffs2-extract.py _aosp/passion/erd79/system.img _aosp/passion/erd79/system
"""
import os
import struct
import sys

PAGE, SPARE = 2048, 64


def main(img, out):
    data = open(img, 'rb').read()
    step = PAGE + SPARE
    objects = {1: {'type': 3, 'parent': 1, 'name': ''}}
    chunks = {}
    for off in range(0, len(data) - step + 1, step):
        page = data[off:off + PAGE]
        seq, obj, chunk, nbytes = struct.unpack_from('<IIII', data, off + PAGE)
        if seq == 0xFFFFFFFF:
            continue
        if chunk & 0x80000000:  # extra header info packed into the tags
            chunk = 0
        obj &= 0x0FFFFFFF
        if chunk == 0:
            typ, parent = struct.unpack_from('<Ii', page, 0)
            name = page[10:10 + 256].split(b'\0', 1)[0].decode('utf-8', 'replace')
            size = struct.unpack_from('<i', page, 0x124)[0]
            alias = page[0x12C:0x12C + 160].split(b'\0', 1)[0].decode('utf-8', 'replace')
            objects[obj] = {'type': typ, 'parent': parent, 'name': name, 'size': size, 'alias': alias}
        else:
            chunks.setdefault(obj, {})[chunk] = page[:nbytes]

    def path(o):
        parts = []
        while o != 1 and o in objects:
            parts.append(objects[o]['name'])
            o = objects[o]['parent']
        return os.path.join(out, *reversed(parts))

    counts = {}
    for o, info in sorted(objects.items()):
        p = path(o)
        t = info['type']
        counts[t] = counts.get(t, 0) + 1
        if t == 3:
            os.makedirs(p, exist_ok=True)
        elif t == 1:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            body = b''.join(c for _, c in sorted(chunks.get(o, {}).items()))
            with open(p, 'wb') as f:
                f.write(body[:info['size']])
        elif t == 2:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p + '.symlink', 'w') as f:
                f.write(info['alias'])
        else:
            print('skipped type', t, p)
    print('objects by type (1 file, 2 symlink, 3 dir):', counts)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
