# Gingerbread 2.3.6 visual audit

Target: Android 2.3.6 (GRK39F) on the Nexus S (Samsung GT-I9020, `crespo`), the last GSM Nexus S release. AOSP references use the `android-2.3.6_r1` tag.

## Device frame — 2026-10-02

The Nexus S is an SVG drawing (`versions/2.3.6/assets/device-nexus-s.svg`) made by `docs/device-frames.py`, the same tool as the Galaxy Nexus and Nexus 4 frames.
- **Source.** The outline was traced from a front render on Wikimedia Commons ([File:Nexus S.png](https://commons.wikimedia.org/wiki/File:Nexus_S.png), CC BY-SA 3.0, by Bea, derived from Luckyz's Nexus_S.jpg). Only the outline is traced: the alpha mask, with the side keys cut off, smoothed into a path. No pixels from the photo are used.
- **Drawn parts.** The glossy black Contour Display body has a thin plastic rim and the inner edge of the curved glass. The earpiece grille sits at the top centre with the front camera to its right. Power is on the right and the volume rocker on the left, at their measured heights.
- **Keys.** The four capacitive keys sit under the glass in the AOSP order: Back, Menu, Search, Home. The frame draws them unlit; the simulator lights them while they are in use.
- **Size.** The display window is 276 × 460, the 480 × 800 panel at 0.575. This keeps the 4.0" screen in proportion to the 4.65" Galaxy Nexus (545 px tall), and keeps the dp scale of the other versions (1 dp ≈ 0.86 CSS px). The whole frame is 336 × 675.

## Version scaffold and touch keys — 2026-10-02

`versions/2.3.6/` starts as a copy of the 4.0.4 directory, the way 4.3 did. It saves its state under `android-time-machine-gb-v1`. At the owner's request it is listed as available on the landing page from the start, first in the list, with a Nexus S miniature and a work-in-progress note, while the Gingerbread screens replace the inherited ICS ones step by step.

- **No navigation bar.** The ICS on-screen bar is gone, and the display uses the full 460 px height.
- **Keys.** The four Nexus S keys are buttons laid over the drawn glyphs on the glass: Back, Menu, Search and Home, at their centres 68 / 136 / 199.7 / 263.7 px across and 606.7 px down.
  - Back and Home behave as before.
  - Menu opens the current screen's options menu (for now the inherited per-app menus), and screens without one ignore it.
  - Search opens the Browser for now, until the Gingerbread Quick Search Box exists.
  - Holding Home for the 500 ms long-press timeout shows the recent apps.
- **Backlight.** The key glyphs are unlit at rest. Following `PowerManagerService` in 2.3.6 (`SCREEN_BUTTON_BRIGHT` on user activity, `LONG_KEYLIGHT_DELAY` = 6 s), any touch or key press lights them, and they go dark six seconds after the last activity.
- **Mobile.** In mobile full-screen mode the keys become a 52 px black bar under the display.
- **About phone.**
  - Model number: Nexus S. Android version: 2.3.6. Build number: GRK39F.
  - Kernel version: `2.6.35.7-gf5f63ef` / `android-build@apa28 #1` / `Tue Aug 2 13:57:05 PDT 2011`. This was read from the `Linux version` banner inside the prebuilt kernel at `device/samsung/crespo` `android-2.3.6_r1`. It is laid out with the 2.3.6 `DeviceInfoSettings` regex, which shortens the build host to `apa28`.
  - Baseband: `I9020XXKD1`. This is the GSM Nexus S radio from the 2.3.4 update, which the GRK39F OTA did not replace. It is an inference, since no published GRK39F "About phone" capture was found.

## Status bar and notification shade — 2026-10-02

References: SystemUI 2.3.6 `status_bar.xml`, `status_bar_expanded.xml`, `status_bar_latest_event.xml`, `status_bar_tracking.xml`, `StatusBarService.java`, `Ticker.java`, `Clock.java` and `DateView.java`, plus framework `status_bar_latest_event_content.xml`, `config_statusBarIcons` and `stat_sys_battery.xml`. The code is in `versions/2.3.6/gb-statusbar.js` and `.css`. Text uses Droid Sans, the Gingerbread system font.

- **Bar.**
  - A 25 dp solid black bar. Every icon sits in its own 25 dp square, as `StatusBarService` lays them out (`status_bar_icon_size`), which gives Gingerbread's wide spacing.
  - On the left is one icon per notification: the Messaging and Calendar notification icons, the bug droid for system notices, and the phone icon during a call.
  - On the right, in `config_statusBarIcons` order: Bluetooth, ringer mode, then Wi-Fi or the 3G data icon, then signal, battery and alarm. The signal and Wi-Fi icons are the green "fully connected" set.
  - The battery follows the 5% level-list.
  - The clock is 14 sp bold white with `AM_PM_STYLE_GONE`, so it shows "8:47" without AM/PM.
- **Ticker.** A new notification replaces the icons with its icon and title: push-up in and out, 500 ms (`config_longAnimTime`). Each segment stays for 3 s (`TICKER_SEGMENT_DELAY`), then the icons push back down.
- **Shade.**
  - Tapping or dragging the bar pulls the panel down under the bar. The bar then shows the DateView (long date format).
  - The header is `title_bar_portrait` with the carrier name (textAppearanceLarge, #dfdfdf) and the small default "Clear" button. Below it are the "Ongoing" and "Notifications" sections (14 sp bold #969696 on #282828), or "No notifications".
  - Each notification is a 64 sp row on `status_bar_item_background` with the light divider. The 16 sp bold black title sits next to the 25 dp icon, and the 14 sp #6b6b6b text and time sit on the line below. A press shows the orange pressed frame.
  - The empty area is the TrackingView's #212121, and `status_bar_close_on` is the handle.
  - Gingerbread has no swipe-to-dismiss. "Clear" removes everything and collapses the panel.
- **Motion.** `StatusBarService` physics, scaled to the screen:
  - The panel's bottom edge follows the finger, or the handle when closing.
  - A tap expands with an initial 2000 px/s and +2000 px/s². Back, the handle or the bar collapse it at −2000 px/s, about 0.33 s for the full height.
  - On release, `performFling` decides the direction: 200 px/s, half the height when closed, or the last 25 px when open.
- **Translations.** The section titles use the 2.3.6 SystemUI translations ("Folyamatban van", "Aktuell", "En cours", "Entrante").

Checks: `gb-statusbar.test.cjs` covers battery levels, icon order, fling thresholds and the shade markup. Headless Chrome covered the bar, the tap-open animation (transform at 120 ms and at rest), closing by dragging the handle, the ticker, and the Hungarian shade at 360 × 640. No JavaScript errors.

Not yet Gingerbread: the lock screen, launcher, menus, Settings and apps are still the inherited ICS screens.
