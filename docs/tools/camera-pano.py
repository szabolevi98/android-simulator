"""Writes versions/4.3 and 4.4.4 camera-pano.js / .css (the camera's panorama module) from
docs/templates/camera-pano.template.js / .css. Run from the repository root: python docs/tools/camera-pano.py"""
import sys as _sys; _sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
from dp_css import to_dp
VERSIONS = {
    '4.3': {'__ANDROID__': 'Android 4.3', '__MODULE__': 'PanoramaModule', '__APK__': 'GalleryGoogle 1.1.40012', '__IMAGE__': 'Nexus 4 JWR66Y',
            '__CAPTURE__': 'preview_frame_pano.xml', '__PANPLACE__': 'above the shutter', '__REVIEW__': 'pano_review.xml', '__REVIEWWEIGHT__': '1.5',
            '__SAVEPLACE__': "the saving progress bar above the shutter and the Cancel button (ic_menu_cancel_holo_light) in the shutter's place",
            '__PANPOS__': '.pnm-pan,.pnm-saving{bottom:88.2px}'},
    '4.4.4': {'__ANDROID__': 'KitKat', '__MODULE__': 'WideAnglePanoramaModule', '__APK__': 'GoogleCamera 2.0.002', '__IMAGE__': 'Nexus 5 KTU84P',
              '__CAPTURE__': 'pano_module_capture.xml', '__PANPLACE__': '20 dp into the lower bar', '__REVIEW__': 'pano_module_review.xml', '__REVIEWWEIGHT__': '2',
              '__SAVEPLACE__': 'pano_review_control.xml in the lower bar: the saving progress bar at its top, the Cancel button (ic_menu_cancel_holo_light) at its foot',
              '__PANPOS__': '.pnm-pan{top:calc(75% + 18px)} .pnm-saving{top:75%}'},
}
SCALE = {'4.3': .8516, '4.4.4': .906}  # 1 dp in px in each frame; the stylesheet is written in dp (docs/tools/dp_css.py)
for version, values in VERSIONS.items():
    for ext in ('js', 'css'):
        text = open(f'docs/templates/camera-pano.template.{ext}', encoding='utf-8').read()
        for key, value in values.items(): text = text.replace(key, value)
        assert '__' not in text, (version, ext)
        if ext == 'css': text = to_dp(text, SCALE[version])
        open(f'versions/{version}/camera-pano.{ext}', 'w', encoding='utf-8', newline='\n').write(text)
    print(version)
