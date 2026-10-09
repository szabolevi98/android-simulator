"""Writes versions/4.3 and 4.4.4 camera-pano.js / .css (the camera's panorama module) from
docs/camera-pano.template.js / .css. Run from the repository root: python docs/camera-pano.py"""
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
for version, values in VERSIONS.items():
    for ext in ('js', 'css'):
        text = open(f'docs/camera-pano.template.{ext}', encoding='utf-8').read()
        for key, value in values.items(): text = text.replace(key, value)
        assert '__' not in text, (version, ext)
        open(f'versions/{version}/camera-pano.{ext}', 'w', encoding='utf-8', newline='\n').write(text)
    print(version)
