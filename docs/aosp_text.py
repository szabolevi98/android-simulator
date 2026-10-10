"""Shared by the docs/ generators that read AOSP strings.xml files: fetch() downloads a resource file, clean() gives a
<string> body as aapt compiles it."""
import html, re, urllib.error, urllib.request


def clean(value):
    """A <string> body as aapt stores it: entities decoded first, then double-quoted runs kept verbatim and their quotes
    dropped, whitespace outside them collapsed to one space (and trimmed at the ends), backslash escapes (\\n, \\', \\",
    \\uXXXX) resolved; an escaped or quoted space stays even at an end."""
    value = re.sub(r'<xliff:g[^>]*>(.*?)</xliff:g>', r'\1', value, flags=re.S)
    value = html.unescape(re.sub(r'<[^>]+>', '', value))
    RAW = '\x00'  # a collapsed run of raw whitespace, trimmed at the ends
    out, quoted, i = [], False, 0
    while i < len(value):
        c = value[i]
        if c == '\\' and i + 1 < len(value):
            n = value[i + 1]
            if n == 'u' and re.match(r'[0-9a-fA-F]{4}', value[i + 2:i + 6]):
                out.append(chr(int(value[i + 2:i + 6], 16))); i += 6; continue
            out.append({'n': '\n', 't': '\t'}.get(n, n)); i += 2; continue
        if c == '"':
            quoted = not quoted; i += 1; continue
        if not quoted and c in ' \t\r\n':
            if out and out[-1] != RAW: out.append(RAW)
            i += 1; continue
        out.append(c); i += 1
    text = ''.join(out).strip(RAW).replace(RAW, ' ')
    return re.sub(r' *\n *', '\n', text)


_fetched = {}


def fetch(url):
    """The file at url (cached); a 404 raises at once, other failures are retried so a flaky download does not drop a language."""
    if url not in _fetched:
        for attempt in range(4):
            try:
                _fetched[url] = urllib.request.urlopen(url, timeout=60).read().decode('utf-8')
                break
            except urllib.error.HTTPError as err:
                if err.code == 404 or attempt == 3:
                    raise
            except Exception:
                if attempt == 3:
                    raise
    return _fetched[url]
