"""Writes versions/4.3 and 4.4.4 gallery-video.js / .css (videos in the Gallery2 based Gallery) from
docs/templates/gallery2-video.template.js / .css. Run from the repository root: python docs/tools/gallery2-video.py"""
import sys as _sys; _sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
from dp_css import to_dp
VERSIONS = {
    '4.3': {'__ANDROID__': 'Android 4.3', '__GALLERY__': 'GalleryGoogle 1.1.40012', '__IMAGE__': 'Nexus 4 JWR66Y', '__NB__': '47px'},
    '4.4.4': {'__ANDROID__': 'KitKat', '__GALLERY__': 'GalleryGoogle 1.1.40304', '__IMAGE__': 'Nexus 5 KTU84P', '__NB__': 'var(--nb)'},
}
SCALE = {'4.3': .8516, '4.4.4': .906}  # 1 dp in px in each frame; the stylesheet is written in dp (docs/tools/dp_css.py)
for version, values in VERSIONS.items():
    for ext in ('js', 'css'):
        text = open(f'docs/templates/gallery2-video.template.{ext}', encoding='utf-8').read()
        for key, value in values.items(): text = text.replace(key, value)
        assert '__' not in text.replace("'__", '').replace('__STRINGS__', ''), (version, ext)
        if ext == 'css': text = to_dp(text, SCALE[version])
        open(f'versions/{version}/gallery-video.{ext}', 'w', encoding='utf-8', newline='\n').write(text)
    print(version)
