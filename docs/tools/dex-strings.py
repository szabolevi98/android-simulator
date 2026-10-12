"""Prints the string table of an .odex/.dex (the dex inside an odex starts at the offset in bytes 8-12):
    python docs/tools/dex-strings.py <file.odex | file.dex> [regex]"""
import re, struct, sys
data = open(sys.argv[1], 'rb').read()
if data[:4] == b'dey\n':
    off, size = struct.unpack('<II', data[8:16]); data = data[off:off + size]
count, ids = struct.unpack('<II', data[56:64])
pat = re.compile(sys.argv[2], re.S) if len(sys.argv) > 2 else None
def uleb(pos):
    result = shift = 0
    while True:
        b = data[pos]; pos += 1; result |= (b & 0x7f) << shift; shift += 7
        if b < 0x80: return result, pos
for i in range(count):
    (at,) = struct.unpack('<I', data[ids + 4 * i:ids + 4 * i + 4])
    _, pos = uleb(at)
    end = data.index(b'\0', pos)
    s = data[pos:end].decode('utf-8', 'replace')
    if not pat or pat.search(s): print(repr(s) if '\n' in s else s)
