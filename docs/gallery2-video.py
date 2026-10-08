"""Writes versions/4.3 and 4.4.4 gallery-video.js / .css (videos in the Gallery2 based Gallery) from
docs/gallery2-video.template.js / .css. Run from the repository root: python docs/gallery2-video.py"""
VERSIONS = {
    '4.3': {'__ANDROID__': 'Android 4.3', '__GALLERY__': 'GalleryGoogle 1.1.40012', '__IMAGE__': 'Nexus 4 JWR66Y', '__NB__': '47px'},
    '4.4.4': {'__ANDROID__': 'KitKat', '__GALLERY__': 'GalleryGoogle 1.1.40304', '__IMAGE__': 'Nexus 5 KTU84P', '__NB__': 'var(--nb)'},
}
for version, values in VERSIONS.items():
    for ext in ('js', 'css'):
        text = open(f'docs/gallery2-video.template.{ext}', encoding='utf-8').read()
        for key, value in values.items(): text = text.replace(key, value)
        assert '__' not in text.replace("'__", '').replace('__STRINGS__', ''), (version, ext)
        open(f'versions/{version}/gallery-video.{ext}', 'w', encoding='utf-8', newline='\n').write(text)
    print(version)
