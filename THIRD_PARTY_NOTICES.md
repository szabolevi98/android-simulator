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

The unmodified `launcher-portal_container_holo.9.png`, `launcher-portal_ring_inner_holo.png` and `launcher-portal_ring_outer_holo.png` images come from [AOSP Launcher2, android-4.0.4_r2.1](https://android.googlesource.com/platform/packages/apps/Launcher2/+/android-4.0.4_r2.1/res/drawable-hdpi/). Copyright The Android Open Source Project; Apache License 2.0. The browser approximates Android's nine-patch rendering with CSS border images.

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
