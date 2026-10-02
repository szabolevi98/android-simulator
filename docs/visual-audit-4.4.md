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

## Launcher3 — 2026-10-02

From Launcher3 `DynamicGrid`, `DeviceProfile`, `CellLayout`, `Workspace`, `PageIndicatorMarker`, `AppsCustomizeTabHost`, `Cling` / `LauncherClings` and `res/` at `android-4.4.4_r1` (the hammerhead tree has no Launcher3 overlay):
- **Grid:** the "Nexus 5" profile: 4 × 4 cells, 60 dp icons, 13 sp Roboto Condensed labels, 5 hotseat cells with 56 dp icons.
- **Layout:**
  - A 48 dp `search_frame` search bar, 12 dp below the status bar, with the Google logo and the microphone.
  - The workspace has 60 dp of padding at the top and 108 dp at the bottom, and its cells have no gaps.
  - The page indicator row is 24 dp, and the hotseat is 84 dp.
  - `workspace_bg` darkens the top and bottom ~100 dp.
- **Default desktop:** `default_workspace.xml` places the power control on page 0, the analog clock with Camera on page 1, and Gallery and Settings on page 2. There is no Google folder. The default page is 0.
- **Dynamic pages:**
  - Dragging adds an empty page, marked with the `ic_pageindicator_add` dot.
  - Empty pages are removed after the drop.
  - The page indicator dots fade and grow over 175 ms.
- **Wallpaper:** the hammerhead `default_wallpaper.jpg` is two screens wide. It pans with the pages over at least three page gaps (`MIN_PARALLAX_PAGE_SPAN`). A live wallpaper spans exactly the pages.
- **All apps:**
  - There is no tab bar, and the market button is disabled (`DISABLE_MARKET_BUTTON`).
  - The pane is 65 % black over the wallpaper.
  - The 4 × 5 app pages run straight into the widget pages, under one indicator.
- **Folders:** the 72 dp `portal_ring_inner_holo` icon carries three previews at FolderIcon's perspective offsets. The folder opens as a white `portal_container_holo` card with #333 labels and a #777 name hint.
- **Overview mode:**
  - A long press on the background opens it.
  - The pages scale to 0.573 and show `screenpanel`; the bar is 20 % of the height.
  - The bar holds Wallpapers and Widgets. Settings is hidden because `hasSettings()` is false in AOSP.
  - Back from the widget pages returns to overview mode.
- **Clings:**
  - First run: "Welcome" on a #64b1ea circle with a radius of 110 dp, over a #cc000000 scrim.
  - Then the workspace cling: a 60 dp ring at half alpha with a 50 dp hole, 30 dp above the centre. A long press dismisses it into overview mode.
  - The folder cling.
  - While a cling shows, the launcher sets `SYSTEM_UI_FLAG_LOW_PROFILE`: the nav keys turn into the lights-out dots, and the battery and clock drop to 50 %.
- **Icons:** the 4.4.4 `mipmap-xxhdpi` launcher icons. Gallery ships only xhdpi and Music only hdpi.

## Keyguard — 2026-10-02

The 4.4 keyguard moved to `frameworks/base/packages/Keyguard`. Compared with 4.3:
- **Status view:** one centred `TextClock` in `widget_big_thin` (80 dp sans-serif-thin), in `h:mm` / `kk:mm` with no AM/PM.
- **Status area:** the date and the next alarm, centred, in `widget_label` (14 dp bold condensed caps). The alarm is #80ffffff with `ic_alarm_small`.
- **Glow pad:** unchanged; it holds the unlock target only.
- **Window:** the keyguard draws under the translucent bars, and its content stays inside them.
- **Navigation bar:** `KeyguardViewMediator` disables Recents, and Back stays hidden until the bouncer opens, so only Home shows.
