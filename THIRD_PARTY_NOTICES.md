# Third-party notices

The Android 4.0.4 simulator includes artwork and a font from the Android Open Source Project, tag [`android-4.0.4_r2.1`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/). These files are distributed under the Apache License, Version 2.0. A copy is in [`third_party/Apache-2.0.txt`](third_party/Apache-2.0.txt).

- `versions/4.0.4/assets/aosp-wallpaper.jpg`, `platlogo.png`, and `Roboto-Regular.ttf`: [AOSP frameworks/base](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/).
- `versions/4.0.4/assets/nav-*.png`: [AOSP SystemUI](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-hdpi/).
- `versions/4.0.4/assets/nyandroid*.png` and `star*.png`: [AOSP SystemUI drawable-nodpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-nodpi/).
- `versions/4.0.4/assets/ic_notify_*.png`, `stat_sys_*.png`, and `stat_notify_more.png`: [AOSP SystemUI drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/packages/SystemUI/res/drawable-hdpi/).
- `versions/4.0.4/assets/stat_notify_sms.png`: [AOSP Mms drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `versions/4.0.4/assets/ic_lockscreen_*.png`: [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/).
- `versions/4.0.4/assets/apps.png`: [AOSP Launcher2](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/).
- `versions/4.0.4/assets/wallpaper_*.jpg` and `ic_launcher_market_holo.png`: [AOSP Launcher2](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/res/).
- `versions/4.0.4/assets/ic_btn_speak_now.png`: [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/).
- Other `versions/4.0.4/assets/*.png` application icons: corresponding [AOSP packages/apps](https://android.googlesource.com/platform/packages/apps/) projects at tag `android-4.0.4_r2.1` (Browser, Calculator, Calendar, Contacts, DeskClock, Email, Gallery, Mms, Music, Settings).
- `versions/4.0.4/assets/setting-bluetooth.png`: the `ic_settings_bluetooth2.png` resource selected by the [Android 4.0.4 Settings header](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/tags/android-4.0.4_r2.1/res/xml/settings_headers.xml).

Android is a trademark of Google LLC. This project is an independent, unofficial browser simulation.

## Additional resources used by the 2026-09-28 audit

All resources below use the same AOSP tag and Apache-2.0 license:

- `background_holo_dark.png`: framework `core/res/res/drawable-nodpi/background_holo_dark.png`.
- `appwidget_clock_dial.png`, `appwidget_clock_hour.png`, `appwidget_clock_minute.png`: [DeskClock `res/drawable-hdpi`](https://android.googlesource.com/platform/packages/apps/DeskClock/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `btn_check_*_holo_dark.png`, `ic_ab_back_holo_dark.png`, `ic_menu_moreoverflow_normal_holo_dark.png`: framework `core/res/res/drawable-hdpi`.
- `ic_bt_*.png`, `ic_wifi_*.png`: [Settings `res/drawable-hdpi`](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `power-*.png`: Settings `ic_appwidget_settings_*_holo.png`, renamed for browser use.
- `widget-power-bg.png`: Settings `appwidget_bg_holo.9.png`.
- `appwidget_settings_ind_*_c_holo.png`: corresponding Settings `.9.png` resources.
- `status_bar_close_on.png`: SystemUI `res/drawable-hdpi/status_bar_close_on.9.png`.
- `toast_frame_holo.png`: framework `core/res/res/drawable-xhdpi/toast_frame_holo.9.png`.

For converted `.9.png` resources, the one-pixel Android stretch-metadata border was removed. CSS border images or repeat/stretch rules reproduce the frame; the original artwork inside the metadata border is retained.

## Phone and Calculator reconstruction

- `dial_num_*_wht.png`, `dial_background_texture.png`, `ic_ab_{dialer,history,favourites}_holo_dark.png`, `ic_dial_action_*.png`, `ic_menu_overflow.png`, `ic_call_outgoing_holo_dark.png`, `ic_contact_picture_holo_dark.png`: [Contacts hdpi resources](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/).
- `calc-btn_keyboard_key_*.png`: [Calculator hdpi resources](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/), renamed and stripped of their one-pixel nine-patch metadata borders. CSS preserves the source stretch regions.

These resources retain the AOSP Apache-2.0 license described above. The JavaScript expression evaluator is project code, not a port of Calculator's Arity dependency.

## Play Store demo

`assets/play-store.svg` is a project-authored recreation of a shopping bag with the Play mark. Storefront illustrations are project CSS, apart from the existing AOSP canyon wallpaper and application icons listed above. No Google Play APK, proprietary storefront assets, or historical screenshot is redistributed. Google Play is a trademark of Google LLC; this offline sample catalog is unofficial and is not connected to Google services.

## Messaging reconstruction

`versions/4.0.4/assets/mms-*.png` are unmodified [AOSP Mms hdpi resources at `android-4.0.4_r2.1`](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/), renamed with the `mms-` prefix: `ic_contact_picture`, `ic_menu_attachment`, `ic_menu_call`, `ic_menu_msg_compose_holo_dark`, `ic_menu_search_holo_dark`, `ic_send_holo_light`, `msg_bubble_left` and `msg_bubble_right`. They retain the AOSP Apache-2.0 license described above. The browser UI and SMS segment counter are project code.

## People and Browser resources

The `people-*.png` resources are from [AOSP Contacts drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/); `web-*.png` resources are from [AOSP Browser drawable-hdpi](https://android.googlesource.com/platform/packages/apps/Browser/+/refs/tags/android-4.0.4_r2.1/res/drawable-hdpi/). They retain their original artwork with a filename prefix added, under the same Apache-2.0 license. The additional offline articles are project-authored fictional demo content.

## DeskClock resources

- `AndroidClock.ttf`: [AOSP frameworks/base data/fonts](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/data/fonts/AndroidClock.ttf).
- `clock-*.png`: [AOSP DeskClock drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_deskclock/tree/android-4.0.4_r2.1/res/drawable-hdpi), with a filename prefix added. Original images are unchanged.

These resources use the same Android 4.0.4 tag and Apache-2.0 license noted above.

## Camera and Gallery resources

- `camera-*.png`: [AOSP Camera drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_camera/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `gallery-*.png`: [AOSP Gallery2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.0.4_r2.1/res/drawable-hdpi).

Original PNG artwork is unchanged, with filename prefixes added. The same Apache-2.0 license applies. The SVG camera/gallery scenes generated by `media.js` are original project illustrations, not photographs or AOSP assets.


### Calendar controls

`versions/4.0.4/assets/calendar-ic_menu_{today,done,cancel}_holo_light.png` are unmodified AOSP Calendar assets from [android-4.0.4_r2.1](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi). `btn_check_{off,on}_holo_light.png` and `ic_menu_moreoverflow_normal_holo_light.png` come from the [Android framework at the same tag](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0.


### AOSP Music artwork

The `music-*.png` tab, album placeholder, playlist, shuffle/repeat and metadata images are unmodified assets from [AOSP Music, android-4.0.4_r2.1](https://github.com/aosp-mirror/platform_packages_apps_music/tree/android-4.0.4_r2.1/res/drawable-hdpi). `music-ic_media_{play,pause,previous,next}.png` come from [frameworks/base at the same tag](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0. Demo track names and artists are fictional; no recordings are distributed.


### Email controls

The unmodified `email-*.png` images come from [AOSP Email, android-4.0.4_r2.1](https://github.com/aosp-mirror-neo/platform_packages_apps_email/tree/android-4.0.4_r2.1/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0. The forward icon is darkened with CSS for the light toolbar.


### In-call Phone artwork

The unmodified `phone-*.png` images come from [AOSP Phone, android-4.0.4_r2.1](https://github.com/aosp-mirror/platform_packages_apps_phone/tree/android-4.0.4_r2.1/res/drawable-hdpi). Copyright The Android Open Source Project; Apache License 2.0.

### Launcher folders

The `launcher-portal_container_holo.png` (nine-patch guide border removed), `launcher-portal_ring_inner_holo.png` and `launcher-portal_ring_outer_holo.png` images come from [AOSP Launcher2, android-4.0.4_r2.1](https://android.googlesource.com/platform/packages/apps/Launcher2/+/android-4.0.4_r2.1/res/drawable-hdpi/). Copyright The Android Open Source Project; Apache License 2.0. The browser approximates Android's nine-patch rendering with CSS border images.

### Credential lock artwork

The unmodified `lock-*.png` assets come from [AOSP frameworks/base, android-4.0.4_r2.1, drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/android-4.0.4_r2.1/core/res/res/drawable-hdpi/): the default/touched pattern points, default/green/red point rings, emergency-call icon and keyboard OK icon. Copyright The Android Open Source Project; Apache License 2.0. The keyboard key backgrounds are CSS approximations.

### Launcher widgets

Unmodified AOSP resources at `android-4.0.4_r2.1`, Apache License 2.0:

- `calwidget-header_bg_cal_widget_holo.png`, `calwidget-header_row_press_cal_widget_holo.png` and `calwidget-calendar_widget_preview.png`: [Calendar drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `music-appwidget_bg.png`, `music-appwidget_inner_press_{l,c,r}.png` and `music-ic_appwidget_music_{play,pause,next}.png`: [Music drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_music/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `gallery-appwidget_photo_border.png`, `gallery-border_photo_frame_widget_holo.png`, `gallery-border_photo_frame_widget_pressed_holo.png` and `gallery-widget_preview.png` (`preview.png`): [Gallery2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.0.4_r2.1/res/drawable-hdpi).
- `btn_radio_{on,off}_holo_dark.png`: framework `core/res/res/drawable-hdpi`.

Resources that are `.9.png` files in AOSP were renamed and their one-pixel nine-patch metadata border was removed; CSS border images reproduce the stretch regions. Flat nine-patches (event rows, list background and color chips) are drawn as CSS colors.

### Launcher drop targets

`launcher-ic_launcher_clear_{normal,active}_holo.png` and `launcher-ic_launcher_info_{normal,active}_holo.png` are unmodified [AOSP Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.0.4_r2.1/res/drawable-hdpi) resources at `android-4.0.4_r2.1`, Apache License 2.0.

`calendar-stat_notify_calendar.png` is the unmodified [AOSP Calendar](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.0.4_r2.1/res/drawable-hdpi) `stat_notify_calendar.png` at `android-4.0.4_r2.1`, Apache License 2.0.

`ic_lockscreen_chevron_right.png`, `ic_lockscreen_unlock_activated.png`, `ic_lockscreen_camera_activated.png` and `ic_lockscreen_handle_pressed.png` are unmodified [AOSP framework drawable-hdpi](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1/core/res/res/drawable-hdpi/) resources at `android-4.0.4_r2.1`, Apache License 2.0.

## Android 4.3 Jelly Bean

`versions/4.3/` begins as a copy of the 4.0.4 directory; the resources above apply to it too. Added resources from tag `android-4.3_r1.1`, Apache License 2.0:

- `jb-platlogo.png` and `jb-platlogo_alt.png`: framework `core/res/res/drawable-nodpi/platlogo.png` and `platlogo_alt.png`, renamed.
- `redbean0.png`, `redbean1.png`, `redbean2.png`, `redbeandroid.png` and `jandycane.png`: SystemUI `res/drawable-nodpi`, unmodified.
- `jb-ic_notify_*`, `jb-ic_notifications_normal.png` and `jb-ic_qs_*`: SystemUI `res/drawable-hdpi`, renamed with a `jb-` prefix.
- `jb-status_bar_close_on.png`: SystemUI `status_bar_close_on.9.png` with the nine-patch border removed.
- `calendar-ic_alarm_holo_dark.png`, `calendar-ic_map.png` and `calendar-ic_menu_email_holo_dark.png`: [AOSP Calendar](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `jb-ic_lockscreen_glowdot.png`, `jb-ic_lock_idle_alarm.png`, `jb-ic_lockscreen_alarm.png`, `jb-kg_add_widget.png`, `jb-kg_add_widget_pressed.png` and `jb-kg_widget_bg_padded.png` (nine-patch border removed): framework `core/res/res/drawable-hdpi`.
- `jb-wallpaper_{01,02,03,04,05,08,09,10,11,12}.jpg` and their `_small` thumbnails: [Launcher2 drawable-nodpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-nodpi), renamed with a `jb-` prefix. `jb-search_frame.png` (nine-patch border removed) and `launcher-ic_home_voice_search_holo.png`: Launcher2 `drawable-hdpi`.
- Launcher icons replaced in `versions/4.3/assets` (`browser`, `calculator`, `calendar`, `clock`, `email`, `messaging`, `settings`, `people`, `phone`, `camera`, `gallery`): the `ic_launcher_*` `mipmap-xhdpi` resources of Browser, Calculator, Calendar, DeskClock, Email, Mms, Settings, Phone and Gallery2 at `android-4.3_r1.1`. `appwidget_clock_{dial,hour,minute}.png`, `clock-ic_menu_add.png` and `jbclock-appwidget_digital_clock_preview.png`: DeskClock 4.3. `calendar-ic_menu_today_holo_light.png`: Calendar 4.3. `mms-msg_bubble_{left,right}.png`: Mms 4.3. `Roboto-Regular.ttf` and `AndroidClock.ttf`: framework `data/fonts` at `android-4.3_r1.1`.
- `jb-ic_action_assist_generic_{normal,activated}.png`: framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`, renamed with a `jb-` prefix.
- `jb-btn_call_pressed.png`: [AOSP Dialer drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_dialer/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jb-` prefix.
- `calwidget-header_bg_cal_widget_pressed_holo.png` (nine-patch border removed): Calendar `drawable-hdpi` at `android-4.3_r1.1`.
- `jbgal-*.png`: Gallery2 `drawable-hdpi` at `android-4.3_r1.1` (`actionbar_translucent`, `ic_menu_edit_holo_dark`, `ic_menu_savephoto`, the `ic_photoeditor_*` panel icons and `filtershow_button_undo/redo`) and framework `spinner_ab_{default,pressed}_holo_dark` and `ic_menu_moreoverflow_normal_holo_dark`; nine-patch borders removed where present.
- `jbcam-*.png`: [Gallery2 camera drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1` (shutter states, switcher, pie, exposure, flash, white-balance, scene, location, timer and on-screen indicator icons), renamed with a `jbcam-` prefix.
- `jb-kg_bouncer_bg_white.png` (nine-patch border removed), `jb-kg_security_lock_{normal,pressed,focused}.png`, `jb-sym_keyboard_return_holo.png` and `jb-ic_input_delete.png`: [framework drawable-hdpi](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.3_r1.1/core/res/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jb-` prefix. The 4.3 pattern dots and emergency-call icon are byte-identical to the ICS `lock-*` files already listed.
- `jb-widget_resize_frame_holo.png` (nine-patch border removed) and `jb-widget_resize_handle_{left,top,right,bottom}.png`: [Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `jbclock-*.png`: [DeskClock drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_deskclock/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`, renamed with a `jbclock-` prefix. `Roboto-Thin.ttf` and `AndroidClockMono-{Thin,Light,Bold}.ttf`: DeskClock `assets/fonts`, Apache License 2.0.

### Power menu and boot animation

`versions/{4.0.4,4.3}/assets/ga-*.png`: framework `core/res/res/drawable-hdpi` at [`android-4.0.4_r2.1`](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.0.4_r2.1/core/res/res/drawable-hdpi) and [`android-4.3_r1.1`](https://github.com/aosp-mirror/platform_frameworks_base/tree/android-4.3_r1.1/core/res/res/drawable-hdpi): `ic_lock_power_off`, `ic_lock_airplane_mode{,_off}`, `ic_audio_vol{,_mute}`, `ic_audio_ring_notif_vibrate`, `spinner_48_{outer,inner}_holo`, `dialog_full_holo_dark` (nine-patch border removed) and, in 4.3 only, `stat_sys_adb`. All are renamed with a `ga-` prefix. `boot-android-logo-{mask,shine}.png`: framework `core/res/assets/images`. `stat_sys_ringer_{vibrate,silent}.png` and `stat_sys_alarm.png`: SystemUI `res/drawable-hdpi`. All Apache License 2.0.

`versions/{4.0.4,4.3}/assets/vol-scrubber_*.png`: each version's framework `drawable-hdpi` holo SeekBar (`scrubber_track_holo_dark` and `scrubber_primary_holo` with the nine-patch border removed, `scrubber_control_{normal,pressed,disabled}_holo`). `ga-ic_audio_ring_notif{,_mute}.png` and `ga-ic_audio_phone.png` come from the same framework directories. All Apache License 2.0.

### Launcher clings

`versions/{4.0.4,4.3}/assets/cling-*.png`: [Launcher2 drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_launcher2/tree/android-4.3_r1.1/res/drawable-hdpi) (`bg_cling1`–`3`, `cling`, `hand`, and `btn_cling_{normal,pressed}` with the nine-patch border removed), byte-identical at `android-4.0.4_r2.1` and `android-4.3_r1.1`. Apache License 2.0.

### Wi-Fi settings (4.3)

- `versions/4.3/assets/jb-ic_wps.png` and `jb-ic_menu_add.png`: [AOSP Settings drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_settings/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `calendar-ic_menu_compose_holo_light.png` and `calendar-ic_menu_trash_holo_light.png`: [AOSP Calendar drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_apps_calendar/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `mms-ic_send_disabled_holo_light.png`: [AOSP Mms drawable-hdpi](https://github.com/aosp-mirror/platform_packages_apps_mms/tree/android-4.3_r1.1/res/drawable-hdpi) at `android-4.3_r1.1`.
- `jb-ab_solid_shadow_holo.png` (nine-patch border removed): framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`, used under the People contact photo.
- `jb-btn_default_{normal,pressed}_holo_dark.png` and `jb-progress_{bg,primary}_holo_dark.png` (nine-patch borders removed): framework `core/res/res/drawable-hdpi` at `android-4.3_r1.1`.

Apache License 2.0.

### Live wallpapers

`versions/{4.0.4,4.3}/assets/lw-*`: [packages/wallpapers/Basic drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_basic/tree/android-4.3_r1.1/res/drawable-hdpi) (the Nexus pyramid background, pulse and glow; the Grass skies; the Galaxy space, flares and light; the Water pond and leaves; and the thumbnails) and [LivePicker](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_LivePicker/tree/android-4.3_r1.1/res/drawable-hdpi) `livewallpaper_placeholder`. All are prefixed `lw-`. `lw-vis-*` and `lw-vis2`–`5`: [packages/wallpapers/MusicVisualization](https://github.com/aosp-mirror-neo/platform_packages_wallpapers_MusicVisualization/tree/android-4.3_r1.1/res) (the meter background, frame, needle and peak lamps, album art, the fire/ice line gradients and the thumbnails). The renderers in `live-wallpapers.js` are JavaScript/WebGL ports of the same packages' RenderScript and Java sources. Apache License 2.0.

### Nexus 4 additions (4.3)

`versions/4.3/assets/jb-stat_sys_data_fully_connected_h.png`, `jb-ic_qs_signal_full_h.png` and `jb-ic_qs_remote_display.png`: SystemUI `res/drawable-hdpi` at `android-4.3_r1.1`. `jbcam-ic_hdr.png`, `jbcam-ic_hdr_off.png` and `jbcam-ic_indicator_sce_hdr.png`: Gallery2 camera `res/drawable-hdpi` at `android-4.3_r1.1`. Apache License 2.0.

### Keyboard

`versions/{4.0.4,4.3}/assets/ime-*.png`: [AOSP LatinIME java/res/drawable-hdpi](https://github.com/aosp-mirror-neo/platform_packages_inputmethods_latinime/tree/android-4.3_r1.1/java/res/drawable-hdpi) (`btn_keyboard_key_{light,dark}_{normal,pressed}_holo`, `keyboard_background_holo` with the nine-patch border removed, and `sym_keyboard_*_holo`), identical at `android-4.0.4_r2.1` and `android-4.3_r1.1`. Apache License 2.0.
