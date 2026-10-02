# Android 4.4.4 KitKat on the Nexus 5 — visual audit

Target: Android 4.4.4 (KTU84P, AOSP tag `android-4.4.4_r1`) on the Nexus 5 (LG-D821, hammerhead), mid-2014. Device overlays come from `device/lge/hammerhead` at the same tag.

## Frame — 2026-10-02

`docs/device-frames.py` traces the outline from Google's front render ([Wikimedia Commons "Nexus 5 Front View.png"](https://commons.wikimedia.org/wiki/File:Nexus_5_Front_View.png), CC BY 2.5, Google Android).
- The render's display is exactly 1080 × 1920 at (304, 436).
- The 4.95" panel next to the 4.65" Galaxy Nexus is 580 px tall, so the window is 326.25 × 580 (1 dp = 0.906 px).
- Features: the front camera, the round earpiece grille, the proximity / light sensors, power on the right, volume on the left.
- The render's drop shadow under the bottom edge is kept out of the outline (alpha threshold 235).

## System bars — 2026-10-02

From SystemUI `BarTransitions`, `PhoneStatusBarTransitions`, `NavigationBarTransitions`, `BatteryMeterView` and `res/values` at `android-4.4.4_r1`:
- **Sizes:** a 25 dp status bar and a 48 dp navigation bar.
- **In apps:** opaque black bars, with the status icons and clock at 75 % (`status_bar_icon_drawing_alpha`).
- **On the launcher and keyguard:** translucent mode. The content runs under the bars, which draw the `status_background` / `nav_background` black gradients, with the icons at full alpha.
- **Icons:** the white xxhdpi status icons (18 dp) and the 16 dp white clock.
- **Battery:** the BatteryMeterView, a 10.5 × 16 dp #66FFFFFF frame with a white level that turns #FF3300 at 15 % or below.
- **Navigation keys:** the `ic_sysbar_*` keys.
