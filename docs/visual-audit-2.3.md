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

## Lock screens — 2026-10-02

References:
- Framework 2.3.6 layouts: `keyguard_screen_tab_unlock.xml`, `keyguard_screen_unlock_portrait.xml` and `keyguard_screen_password_portrait.xml`.
- Sources: `LockScreen.java`, `SlidingTab.java`, `PatternUnlockScreen.java`, `PasswordUnlockScreen.java`, `LockPatternView.java` and `DigitalClock.java`.
- Resources: the `jog_tab_*` drawables and the `password_kbd_numeric` / `password_kbd_qwerty` keyboards.

The code is in `versions/2.3.6/gb-keyguard.js` / `.css`, with the credential screens in the version's `lockscreen.js`. The verification logic, attempt counting and 30 s lockout are unchanged.

- **Flow** (`LockPatternKeyguardView.getInitialMode`).
  - A pattern lock opens straight on the pattern screen.
  - PIN and password locks show the SlidingTab screen first, and its unlock tab leads to the password screen. Back returns to the SlidingTab screen.
  - Without a secure lock, the unlock tab goes home.
  - The notification shade can be pulled down over the insecure lock screen, but not over the secure ones.
- **SlidingTab screen.**
  - Carrier top right. Clockopia clock (72 sp, "kk:mm" or "h:mm" with a Droid Sans Bold AM/PM). The `full_wday_month_day_no_year` date, and the next alarm with `ic_lock_idle_alarm` in NEXT_ALARM_FORMATTED style ("Sat 7:00").
  - The two 162 × 140 jog tabs sit 80 dp above the bottom.
  - Grabbing a tab vibrates (30 ms), fades in its target (500 ms) and slides the other tab off (250 ms). The tab follows the finger with its hint bar ("Unlock", "Sound off" / "Sound on") trailing behind.
  - Crossing two thirds of the width turns the tab and bar to the green, gray or yellow confirm art and slides them away. Releasing earlier snaps the tab back, and leaving the 50 px tracking band counts as a release.
  - The sound tab toggles silent mode (vibrate unless "vibrate in silent" is off). It shows "Sound is OFF" (white) or "Sound is ON" (#e69310) with the ringer icon for 3.5 s, and the tab returns as the yellow vibrate or sound-off dial.
- **Pattern screen.**
  - A smaller 56 sp clock and the date, a divider, and a status line with `ic_lock_idle_lock`: "Draw pattern to unlock", "Sorry, try again" or the countdown.
  - The pattern uses `btn_code_lock_default` / `_touched` inside the `indicator_code_lock_point_area` default, green and red rings. While drawing, the rings are green with touched buttons; a finished wrong pattern turns red.
  - The path is white at alpha 128 and a quarter of a cell wide. Green or red drag-direction arrows sit at the top of each ring, pointing to the next dot.
  - An "Emergency call" footer.
- **Password screen.**
  - "Enter PIN code" or "Enter password to unlock" in textAppearanceLarge, a divider, and a bold 32 sp field on `password_field_default`.
  - A PasswordEntryKeyboardView on a transparent background with `btn_keyboard_key_fulltrans` keys. The numeric pad uses the `sym_keyboard_num` art with letters, plus OK, 0 and delete. The QWERTY layout has a number row, the inset second letter row, 15% shift and delete, and `?123` , - space = . OK.
  - A wrong code only clears the field, as in `PasswordUnlockScreen`. The same keyboards appear when choosing a PIN or password.
- **Translations.** Hints, toasts and instructions use the 2.3.6 framework translations.

Checks: `gb-keyguard.test.cjs` covers the clock formats, right-tab states and the screen markup. Headless Chrome covered the sound tab (toast and status icon), the unlock tab, a wrong pattern, then the right one, the PIN entered through the slide screen, and the password keyboard. No JavaScript errors.

Still inherited from ICS: setting up a screen lock in Settings (only its keyboards are Gingerbread).

## Launcher, window animations and app icons — 2026-10-02

References:
- Launcher2 2.3.6 sources: `launcher.xml`, `workspace_screen.xml` (port), `all_apps_2d.xml`, `application_boxed.xml`, `WorkspaceIcon` styles, `BubbleTextView`, `AllApps2D`, `default_workspace.xml`.
- Other packages: QuickSearchBox `search_widget.xml`, Protips (`widget.xml`, `ProtipWidget.java`, `arrays.xml`), Music `album_appwidget.xml`.
- The crespo device overlay at `android-2.3.6_r1` (googlesource).

The code is in `versions/2.3.6/gb-launcher.js` / `.css`, and the window animations are in the version's `transitions.js`.

- **Default home** (Launcher2 `default_workspace.xml`).
  - The middle screen has the Google search widget and the "Home screen tips" widget. The right screen has the Music widget. The Google-only Genie and Market widgets are left out.
  - The wallpaper is the Nexus live wallpaper, the crespo default (`default_wallpaper_component = .nexus.NexusWallpaper`). The overlay's random 0.7–1.7 pulse scale and its pyramid background already match the shared live-wallpaper module.
- **Workspace.**
  - 4 × 4 cells of 80 × 100 dp, 8 dp above and 78 dp below, with the rest of the height spread as the row gap.
  - BubbleTextView icons: 48 dp icon, 5 dp gap, 13 dip white label with a 2 px shadow on the #B2191919 bubble (8 dp corners). There are no first-run clings.
  - While dragging, the 70 dp trash can replaces the cluster. Over it the dragged view gets the red `delete_color_filter`. There is no holo drop outline.
- **Bottom of the screen.**
  - The `all_apps_button_cluster` sits on the hotseat backgrounds: phone, all apps, browser.
  - The 93 × 56 dp previous/next screen buttons show one dot per screen on that side (the `home_arrows` level-list) and update while paging.
- **Search widget.** On `search_floater`: the corpus button with the magnifier, the "Google" hint field and the voice button.
- **Protips.**
  - The bugdroid sits next to the `droid_widget` speech bubble: bold header, body, the all-apps or trash callout, and the "1 of 6" footer.
  - Tapping the bubble shows the next tip. Tapping the droid blinks it (closed 100 ms, open 200 ms).
  - Dialling `*#*#8477#*#*` (TIPS) swaps in the untranslated haiku set, goes home and blinks three times.
  - The tips use the 2.3.6 translations, including the Hungarian footer's swapped numbers ("6/1").
- **Music widget.** On `appwidget_bg` with a 3 : 1 : 1 split: title (18 sp bold) and artist, or "Touch to select music.", then the play/pause and next buttons with the `appwidget_inner_press` highlights.
- **All apps** (AllApps2D).
  - A black 4-column grid of `application_boxed` items (88 dp, two-line 13 dip labels), sorted alphabetically, above the home button.
  - It opens with `all_apps_2d_fade_in` (700 ms decelerate) and closes with the 700 ms accelerate fade-out.
- **App names and icons.** The 2.3.6 hdpi launcher icons replace the ICS ones: Phone, Contacts, Messaging, Browser, Camera, Gallery (Gallery3D), Settings, Clock, Calendar, Calculator, Music and Email. "People" is "Contacts" and "Play Store" is "Market"; the Market icon stays a placeholder, since it was never part of AOSP.
- **Window animations** (2.3.6 `core/res/res/anim`, short 150 / medium 300 / long 400 ms).
  - Launcher ↔ app: `wallpaper_close_*` / `wallpaper_open_*` — the app scales between 0.5 and 1 with a fade, the launcher between 1 and 2.
  - Within an app: `activity_*` — the new screen slides in from 33%, the old one slides off on top.
  - Between apps: `task_*` — the same, plus a 2× scale about the right edge.
  - Unlock: `lock_screen_exit` / `lock_screen_behind_enter` — a 400 ms fade.
  - The ticker now uses the 400 ms `config_longAnimTime`.

Checks: `gb-launcher.test.cjs` covers the tips per language and the haiku set, the footer, blink frames, arrow dots, cluster, search and music widget markup. Headless Chrome covered the middle and right screens, the all apps grid, a tip tap, dragging Browser from all apps onto the workspace, and dragging it to the trash. No JavaScript errors.

Not yet: the Menu-key icon menu (Add, Wallpaper, Search, Notifications, Settings), the "Add to Home screen" dialog, the wallpaper chooser, folders and screen previews.
