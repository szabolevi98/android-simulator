"""Apply an incremental (file-based) OTA package to an unpacked system folder, the way recovery's applypatch does.

Handles the updater-script steps that touch /system: delete(...), apply_patch(...) with BSDIFF40 and IMGDIFF2
patches, package_extract_dir("system"/"recovery", "/system") and symlink(...). Every patched file is checked
against the target SHA-1 the script names, so a wrong source or a wrong patch stops the run.

    python docs/tools/ota-apply.py _aosp/passion/dl/Update-Passion-ERE27-From-ERD79.zip _aosp/passion/erd79/system _aosp/passion/ere27/system

The source folder is copied to the destination first; the source stays untouched.
"""
import bz2
import hashlib
import os
import re
import shutil
import struct
import sys
import zipfile
import zlib

import numpy as np


def offtin(b):
    v = struct.unpack('<Q', b)[0]
    return -(v & 0x7FFFFFFFFFFFFFFF) if v & 0x8000000000000000 else v


def bspatch(old, patch):
    if patch[:8] != b'BSDIFF40':
        raise ValueError('not BSDIFF40')
    clen, dlen, nsize = offtin(patch[8:16]), offtin(patch[16:24]), offtin(patch[24:32])
    ctrl = bz2.decompress(patch[32:32 + clen])
    diff = bz2.decompress(patch[32 + clen:32 + clen + dlen])
    extra = bz2.decompress(patch[32 + clen + dlen:])
    oldarr = np.frombuffer(old, dtype=np.uint8)
    new = bytearray(nsize)
    newpos = oldpos = dpos = epos = 0
    for i in range(0, len(ctrl), 24):
        x, y, z = offtin(ctrl[i:i + 8]), offtin(ctrl[i + 8:i + 16]), offtin(ctrl[i + 16:i + 24])
        d = np.frombuffer(diff, dtype=np.uint8, count=x, offset=dpos)
        o = np.zeros(x, dtype=np.uint8)
        lo, hi = max(oldpos, 0), min(oldpos + x, len(old))
        if hi > lo:
            o[lo - oldpos:hi - oldpos] = oldarr[lo:hi]
        new[newpos:newpos + x] = (d + o).tobytes()
        newpos += x
        oldpos += x
        dpos += x
        new[newpos:newpos + y] = extra[epos:epos + y]
        newpos += y
        epos += y
        oldpos += z
    return bytes(new)


def imgpatch(old, patch):
    if patch[:8] != b'IMGDIFF2':
        raise ValueError('not IMGDIFF2')
    count = struct.unpack_from('<i', patch, 8)[0]
    pos = 12
    out = []
    for _ in range(count):
        kind = struct.unpack_from('<i', patch, pos)[0]
        pos += 4
        if kind == 0:  # normal
            start, length, poff = struct.unpack_from('<qqq', patch, pos)
            pos += 24
            out.append(bspatch(old[start:start + length], patch[poff:]))
        elif kind == 2:  # deflate
            start, length, poff, _exp, tlen = struct.unpack_from('<qqqqq', patch, pos)
            pos += 40
            level, method, wbits, memlevel, strategy = struct.unpack_from('<iiiii', patch, pos)
            pos += 20
            expanded = zlib.decompress(old[start:start + length], -15)
            target = bspatch(expanded, patch[poff:])
            if len(target) != tlen:
                raise ValueError('deflate chunk size')
            c = zlib.compressobj(level, method, wbits, memlevel, strategy)
            out.append(c.compress(target) + c.flush())
        elif kind == 3:  # raw
            n = struct.unpack_from('<i', patch, pos)[0]
            pos += 4
            out.append(patch[pos:pos + n])
            pos += n
        else:
            raise ValueError('chunk type %d' % kind)
    return b''.join(out)


def sha1(b):
    return hashlib.sha1(b).hexdigest()


def main(ota, src, dst):
    z = zipfile.ZipFile(ota)
    script = z.read('META-INF/com/google/android/updater-script').decode()
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

    def local(p):
        return os.path.join(dst, p[len('/system/'):])

    for block in re.findall(r'delete\((.*?)\);', script, re.S):
        for p in re.findall(r'"(/system/[^"]+)"', block):
            if os.path.exists(local(p)):
                os.remove(local(p))
            elif os.path.exists(local(p) + '.symlink'):
                os.remove(local(p) + '.symlink')

    patched = 0
    # Both script styles: "<sha>:/tmp/patchtmp/<path>.p" (2010) and package_extract_file("<member>") (later).
    for p, tsha, tsize, ssha, pname in re.findall(
            r'apply_patch\("(/system/[^"]+)", "-",\s*(\w+), (\d+),\s*"?(\w+)(?::/tmp/patchtmp/|, package_extract_file\(")([^"]+)"', script):
        if not pname.startswith('patch/'):
            pname = 'patch/' + pname
        old = open(local(p), 'rb').read()
        if sha1(old) != ssha:
            raise SystemExit('source mismatch ' + p)
        patch = z.read(pname)
        new = imgpatch(old, patch) if patch[:8] == b'IMGDIFF2' else bspatch(old, patch)
        if sha1(new) != tsha or len(new) != int(tsize):
            raise SystemExit('target mismatch ' + p)
        open(local(p), 'wb').write(new)
        patched += 1

    added = 0
    for name in z.namelist():
        for prefix in ('system/', 'recovery/'):
            if name.startswith(prefix) and not name.endswith('/'):
                out = os.path.join(dst, name[len(prefix):])
                os.makedirs(os.path.dirname(out), exist_ok=True)
                open(out, 'wb').write(z.read(name))
                added += 1

    links = 0
    for target, block in re.findall(r'symlink\("([^"]+)",(.*?)\);', script, re.S):
        for p in re.findall(r'"(/system/[^"]+)"', block):
            open(local(p) + '.symlink', 'w').write(target)
            links += 1
    print('patched', patched, 'added', added, 'symlinks', links)


if __name__ == '__main__':
    main(*sys.argv[1:4])
