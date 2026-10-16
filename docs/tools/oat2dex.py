"""Android 6.0.1: the factory image's apps are pre-optimised, so their APKs carry no classes.dex; the code is in the OAT
file next to them (/system/app/X/oat/arm64/X.odex, /system/framework/arm64/boot*.oat). An OAT file (ELF, OAT version 064)
keeps every dex file it was made from whole inside its oatdata section, so this cuts them out by their header:
"dex\\n035\\0" magic, then file_size at offset 32.
    python docs/tools/oat2dex.py <file.odex | file.oat> <out dir>
Writes classes.dex, classes2.dex … in the order they appear. Methods the dex2oat compiler left to the interpreter may hold
ART's quickened opcodes (iget-quick and friends, 0xe3-0xf2 in ART 6.0); the compiled ones keep their original bytecode.
The SHA-1 signature and Adler-32 checksum are recomputed, since quickening changed bytes after they were written."""
import hashlib, os, struct, sys, zlib

src, out = sys.argv[1], sys.argv[2]
data = open(src, 'rb').read()
os.makedirs(out, exist_ok=True)
pos, n, found = 0, 0, []
while True:
    pos = data.find(b'dex\n035\x00', pos)
    if pos < 0: break
    size = struct.unpack_from('<I', data, pos + 32)[0]
    header = struct.unpack_from('<I', data, pos + 36)[0]
    # A real dex header is 0x70 bytes long and fits in the file; anything else is a string that happens to match.
    if header == 0x70 and pos + size <= len(data):
        n += 1
        name = 'classes.dex' if n == 1 else f'classes{n}.dex'
        dex = bytearray(data[pos:pos + size])
        # Quickening rewrote instructions after dex2oat checked the file: refresh the SHA-1 signature and the Adler-32
        # checksum so dex readers (androguard) accept it.
        dex[12:32] = hashlib.sha1(dex[32:]).digest()
        dex[8:12] = struct.pack('<I', zlib.adler32(bytes(dex[12:])))
        open(os.path.join(out, name), 'wb').write(dex)
        found.append((name, size))
        pos += size
    else:
        pos += 8
for name, size in found: print(os.path.join(out, name), size)
if not found: sys.exit(f'no dex in {src}')
