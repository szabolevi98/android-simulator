# Android 4.3 Jelly Bean audit

Target: stock **Android 4.3 on the Galaxy Nexus (JWR66Y)**, AOSP tag `android-4.3_r1.1`. The simulator starts from the [Android 4.0.4 reconstruction](visual-audit.md) and replaces ICS behavior with Jelly Bean behavior screen by screen. Anything not listed here still shows the ICS implementation.

## Baseline — 2026-10-01

- Separate directory `versions/4.3/`, saved under its own browser storage key, and enabled on the landing page. The landing card uses the 4.3 directory's artwork.
- About phone: Android version 4.3, build JWR66Y. The baseband (`I9250XXLJ1`) and kernel strings are illustrative 4.3-era values.
- [DeviceInfoSettings.java](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/src/com/android/settings/DeviceInfoSettings.java): Developer options are hidden until Build number is tapped seven times. Countdown toasts appear from the fourth tap, using the original `show_dev_countdown`, `show_dev_on` and `show_dev_already` strings (translated into all five languages).
- [PlatLogoActivity.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/java/com/android/internal/app/PlatLogoActivity.java): three quick taps on Android version open `platlogo_alt` over the wallpaper. A tap swaps to `platlogo` and shows the custom toast (“Android 4.3” in Roboto Light, “JELLY BEAN” bold); a long press opens BeanBag.
- [BeanBag.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/src/com/android/systemui/BeanBag.java): 40 beans with quadratic depth (scale 0.2–1), the original bean mix and 13 colors through the same color matrix, a 0.1% candy cane, drifting and spinning, respawning at the edges. Grabbed beans follow the pointer and inherit its velocity; releasing adds spin proportional to speed. The ICS Nyandroid styles and assets were removed from the 4.3 copy.

Checks: `jb-beanbag.test.cjs` (depth, colors, drift, grab velocity, fling spin, respawn); headless Chrome: landing cards, separate storage, About values, the full Build-number toast sequence, platlogo tap/toast, long-press BeanBag with 40 beans, Back to About, and window transitions on the copy. No JavaScript errors were logged.

![Jelly Bean platlogo and BeanBag](screenshots/jb-easter-egg.png)
