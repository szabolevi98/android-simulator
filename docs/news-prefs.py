"""Writes versions/<v>/news-prefs.js (News & Weather's settings and story page) from docs/news-prefs.template.js for each
version with GenieWidget.apk, naming the APK version and the image in its header.
    python docs/news-prefs.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = {'2.3.6': ('1.3.04', 'crespo (GRK39F)'), '4.0.4': ('1.3.04', 'maguro (IMM76I)'), '4.3': ('1.3.11', 'mako (JWR66Y)'), '4.4.4': ('1.3.11', 'hammerhead (KTU84P)')}
template = open(ROOT + 'docs/news-prefs.template.js', encoding='utf-8').read()
for v, (apk, image) in VERSIONS.items():
    out = template.replace('__VERSION__', apk).replace('__IMAGE__', image)
    open(f'{ROOT}versions/{v}/news-prefs.js', 'w', encoding='utf-8', newline='\n').write(out)
    print(v, apk, image)
