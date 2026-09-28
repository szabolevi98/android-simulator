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
