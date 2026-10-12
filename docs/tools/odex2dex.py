"""Turns an image's odex back into plain dex files that dexdump can read (the factory images' apps keep their code in
odex files next to the APK, not in classes.dex):
    python docs/tools/odex2dex.py <file.odex> <out dir>
    D:/android_sdk/build-tools/36.0.0/dexdump.exe -d <out dir>/classes.dex > dex.txt
- Dalvik odex (Android 2.3-4.4, magic "dey\\n"): the dex sits at the offset in bytes 8-12; dexopt marks its classes as
  verified / optimized in the access flags (0x10000, 0x20000), which dexdump rejects, so those bits are cleared. Its
  "quickened" instructions (field and vtable offsets instead of references) stay; dexdump shows them as unused or
  odd opcodes, while names, strings, constants and most calls stay readable.
- ART oat odex (Android 5.x, e.g. /system/app/<App>/arm/<App>.odex): every embedded "dex\\n035" blob is cut out.
The Adler-32 checksum of each dex is recomputed. Resource ids (#7f...) resolve with `aapt2 dump resources <apk>`."""
import os, struct, sys, zlib

src, out = sys.argv[1], sys.argv[2]
data = open(src, 'rb').read()
os.makedirs(out, exist_ok=True)

def write(blob, n):
    struct.pack_into('<I', blob, 8, zlib.adler32(bytes(blob[12:])) & 0xffffffff)
    path = os.path.join(out, f'classes{n + 1 if n else ""}.dex')
    open(path, 'wb').write(blob)
    print(path, len(blob))

if data[:4] == b'dey\n':
    offset, length = struct.unpack_from('<II', data, 8)
    blob = bytearray(data[offset:offset + length])
    count, defs = struct.unpack_from('<II', blob, 0x60)  # class_defs_size, class_defs_off
    for i in range(count):
        at = defs + i * 32 + 4  # access_flags of class_def i
        struct.pack_into('<I', blob, at, struct.unpack_from('<I', blob, at)[0] & 0xffff)
    write(blob, 0)
else:
    i = n = 0
    while (i := data.find(b'dex\n035\0', i)) >= 0:
        size = struct.unpack_from('<I', data, i + 32)[0]
        write(bytearray(data[i:i + size]), n)
        n += 1; i += size
    if not n: sys.exit(f'{src}: no dex inside (neither a Dalvik odex nor an oat file with dex blobs)')
