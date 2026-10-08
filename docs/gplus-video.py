"""Writes versions/4.4.4 and 5.1.1 photos-video.js / .css (videos in Photos, the Google+ app of each image) from
docs/gplus-video.template.js / .css. Run from the repository root: python docs/gplus-video.py
4.4.4: Google+ 4.2.3, ImageResourceView's ov_play_video_32, VideoViewTheme on Theme.Holo.Light (v14), so the seek
bar is progress_horizontal_holo_light (progress_bg_holo_light 3.3 dp #0000004D, progress_primary_holo_light #33B5E5)
with scrubber_control_normal_holo (32 dp). 5.1.1: Google+ 4.9.0, MediaView's quantum_ic_play_circle_fill_white_36,
VideoViewTheme on Theme.AppCompat.Light, so progress_horizontal_material (progress_mtrl_alpha, 3.3 dp) tinted
colorControlNormal (#8A000000) at disabledAlpha 0.26 and accent_material_light #009688, the 12 dp
scrubber_control_to_pressed_mtrl_000 thumb in the accent."""
VERSIONS = {
    '4.4.4': {'__PLUS__': 'Google+ 4.2.3', '__IMAGE__': 'Nexus 5 KTU84P', '__TILEVIEW__': 'ImageResourceView', '__TILE__': 'ov_play_video_32',
              '__TILEDP__': '32', '__TILEPX__': '28.99px', '__PREFIX__': 'gp', '__THEME__': 'VideoViewTheme on Theme.Holo.Light',
              '__SEEK__': 'Holo Light: #0000004D track, #33B5E5 progress, scrubber_control_normal_holo',
              '__SEEKPAD__': '14.5px', '__BARPX__': '3.02px', '__TRACK__': '#0000004d', '__PROGRESS__': '#33b5e5e6',
              '__THUMB__': "width:28.99px;height:28.99px;background:url('assets/gpv-scrubber_control_normal_holo.png') center/100% no-repeat"},
    '5.1.1': {'__PLUS__': 'Google+ 4.9.0', '__IMAGE__': 'Nexus 6 LMY48Y', '__TILEVIEW__': 'MediaView', '__TILE__': 'quantum_ic_play_circle_fill_white_36',
              '__TILEDP__': '36', '__TILEPX__': '32.62px', '__PREFIX__': 'gp4', '__THEME__': 'VideoViewTheme on Theme.AppCompat.Light',
              '__SEEK__': 'Material: progress_mtrl_alpha in colorControlNormal at 0.26 and the #009688 accent, a 12 dp accent thumb',
              '__SEEKPAD__': '7.25px', '__BARPX__': '3.02px', '__TRACK__': '#00000024', '__PROGRESS__': '#009688',
              '__THUMB__': 'width:10.87px;height:10.87px;border-radius:50%;background:#009688'},
}
for version, values in VERSIONS.items():
    for ext in ('js', 'css'):
        text = open(f'docs/gplus-video.template.{ext}', encoding='utf-8').read()
        for key, value in values.items(): text = text.replace(key, value)
        assert '__' not in text, (version, ext)
        open(f'versions/{version}/photos-video.{ext}', 'w', encoding='utf-8', newline='\n').write(text)
    print(version)
