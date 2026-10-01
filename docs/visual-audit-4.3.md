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

## Notification panel and quick settings — 2026-10-01

References: SystemUI [status_bar_expanded.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/res/layout/status_bar_expanded.xml), [status_bar_expanded_header.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/res/layout/status_bar_expanded_header.xml), [flip_settings.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/res/layout/flip_settings.xml), [QuickSettings.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/src/com/android/systemui/statusbar/phone/QuickSettings.java), [QuickSettingsModel.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/src/com/android/systemui/statusbar/phone/QuickSettingsModel.java), [PhoneStatusBar.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/packages/SystemUI/src/com/android/systemui/statusbar/phone/PhoneStatusBar.java), plus `dimens.xml`, `colors.xml`, `config.xml`; Calendar [AlertReceiver.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_calendar/android-4.3_r1.1/src/com/android/calendar/alerts/AlertReceiver.java).

- **Panel.** It wraps its content over a `#B0000000` scrim, uses the `notification_panel_bg` color (`#0e0e0e` at 90%) and the 4.3 close handle (a dark bar with the stretched holo-blue line). The 48dp black header shows the 32dp Roboto Light clock, the uppercase date, Clear all and the settings/notifications flip button.
- **Flip settings** (`config_hasFlipSettingsPanel`): the visible page squashes horizontally in 125 ms, then the other grows in 225 ms; the header buttons cross-fade. A two-finger pull opens Quick Settings directly.
- **Quick Settings.** Three columns, 110dp cells, 4dp gaps, `#161616`/`#212121` tiles, original `ic_qs_*` artwork and labels. Me opens People; Brightness opens a slider with AUTO. Settings, Wi-Fi, mobile signal, battery, Bluetooth and Alarm open the matching screens; Airplane mode toggles. Wi-Fi and Bluetooth toggle on long press (`LONG_PRESS_TOGGLES`). Alarm (next alarm) and Location (when GPS is on) tiles appear only when relevant. There is no rotation tile on phones.
- **Notifications.** The template has a 64dp large icon, 18dp title, 14dp text, time and small icon. The top notification with expanded content opens expanded; others expand with a two-finger swipe down or a trackpad pinch (Ctrl+wheel) and collapse with the opposite gesture. Calendar alerts expand to big text with **Snooze**, which re-posts after `SNOOZE_DELAY` (5 minutes).
- **Clear all.** Rows slide right in 125 ms each, starting 140 ms apart with the gap shrinking by 10 ms (minimum 50 ms); then the panel collapses.

Checks: `jb-shade.test.cjs` (clear-all timing, flip duration, tile order and states, expansion defaults, escaping). Headless Chrome: pull-down, expansion by pinch, flip and the mid-flip frame, all tiles, long-press Wi-Fi toggle, airplane mode, calendar Snooze, staggered Clear all; the touch suite passes on 4.3. No JavaScript errors.

Limits: status-bar icons are still the ICS set; Map/Call/Email-guests actions, inbox-style messaging notifications, per-app notification priority and the brightness slider's live preview mechanics are simplified.

![Jelly Bean notifications and Quick Settings](screenshots/jb-shade.png)

## Keyguard: widget pager and GlowPad — 2026-10-01

References: framework [keyguard_host_view.xml (port)](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/res/res/layout-port/keyguard_host_view.xml), [keyguard_glow_pad_view.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/res/res/layout/keyguard_glow_pad_view.xml), [keyguard_status_view.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/res/res/layout/keyguard_status_view.xml), [GlowPadView.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/java/com/android/internal/widget/multiwaveview/GlowPadView.java), [PointCloud.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/core/java/com/android/internal/widget/multiwaveview/PointCloud.java), [KeyguardSelectorView.java](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.3_r1.1/policy/src/com/android/internal/policy/impl/keyguard/KeyguardSelectorView.java), KeyguardStatusView/ClockView, and `dimens.xml`/`arrays.xml`.

- **Status widget.** The clock uses AndroidClock at 75dp, right-aligned with a 16dp margin; AM/PM is separate. The date is the locale's best weekday-month-day pattern in upper case, followed by the next alarm with `ic_lock_idle_alarm` and owner info.
- **Widget pager.** Pages follow KeyguardHostView order: the **+** slot (while fewer than five widgets), user widgets, the Music transport while Music is active, the status clock, then camera. The `kg_widget_bg_padded` frames fade in only while paging; edges resist. The add slot opens a picker with Calendar and the 4.2 DeskClock digital clock. Widgets are saved and can be removed by long-pressing and dragging to the top Remove target. Settling on the camera page opens Camera, as CameraWidgetFrame does.
- **GlowPad.** The phone keyguard uses `lockscreen_targets_unlock_only`, so dragging past the target radius minus the 40dp snap margin in any direction snaps to the single unlock target (`ic_lockscreen_unlock_activated`) with a 20 ms vibration. The PointCloud is rebuilt with the same inner/outer radii and spacing; dots use `ic_lockscreen_glowdot` with the cos¹⁰ finger glow (75dp) and cos²⁰ wave edge. On grab, the handle hides and the ring (0.5→1) and target (0.8→1) show in 200 ms after a 50 ms delay. A miss fades the glow back in 200 ms (Quart) and pings a 1350 ms Quad wave out to twice the ring radius. Keyboard Enter/Space on the handle unlocks.

Checks: `jb-keyguard.test.cjs` (cloud geometry, glow/wave alpha, page order, defaults, widget limit). Headless Chrome with mouse and with emulated touch: idle ping, grab glow, snapping, unlocking, paging to +, adding and storing a Digital clock widget, paging to camera opening Camera; the full touch suite passes on 4.3 and 4.0.4. No JavaScript errors.

Limits: pattern/PIN/password still use the ICS full-screen screens rather than SlidingChallengeLayout's bouncer and widget area; no Google Now (AOSP has no assist activity), no widget reordering, user switcher or Face Unlock; the camera page shows an icon rather than a live preview.

![Jelly Bean keyguard: idle, grab, snap and a lock-screen widget](screenshots/jb-keyguard.png)

## Launcher: reorder and resizable widgets — 2026-10-01

References: Launcher2 4.3 [CellLayout.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_launcher2/android-4.3_r1.1/src/com/android/launcher2/CellLayout.java), [Workspace.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_launcher2/android-4.3_r1.1/src/com/android/launcher2/Workspace.java), [AppWidgetResizeFrame.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_launcher2/android-4.3_r1.1/src/com/android/launcher2/AppWidgetResizeFrame.java), [default_workspace.xml](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_launcher2/android-4.3_r1.1/res/xml/default_workspace.xml) (same layout as 4.0.4); provider metadata from Calendar and DeskClock 4.3 (`resizeMode`, `minResizeWidth/Height`).

- **Reorder.** Hovering a dragged icon or widget over occupied cells for `REORDER_TIMEOUT` (250 ms) computes an arrangement: occupants move to the nearest free area, preferring the direction the drag came from, and slide there in `REORDER_ANIMATION_DURATION` (150 ms). The drag outline appears once a solution exists. Moving elsewhere undoes the slide; dropping commits it. A drop before the timeout is solved immediately, as CellLayout does on drop. Within 0.55 icon widths of an icon's centre the drop still creates or fills a folder, and only then does the folder ring appear.
- **Resize frame.** Dropping a resizable widget shows the `widget_resize_frame_holo` frame with four handles. Edges snap in whole cells once a drag passes 66% of a cell (`RESIZE_THRESHOLD`), limited by the provider's minimum resize span and the grid. Shortcuts and widgets in the way move aside. Tapping elsewhere hides the frame. Resizable: Calendar (minimum 2 × 2) and the new DeskClock **Digital clock** widget (3 × 2, minimum 3 × 2); Music, Power control, Analog clock and Photo Gallery are fixed, as their 4.3 provider XML declares.

Checks: `jb-launcher.test.cjs` (item spans, nearest-free placement, own-cell reuse, multi-item widget push, impossible cases, apply, resize thresholds, folder zone). Headless Chrome: an icon displaces Music and lands in its cell; the Calendar widget pushes two icons and gets the resize frame; the bottom handle grows it to 2 × 3, moving icons. Both touch suites pass on 4.3, including folder creation by dropping on an icon centre. No JavaScript errors.

Limits: a simplified solver (Launcher's swap/push search and reorder-hint wobble are not reproduced), no cross-page reorder and no resize from keyboard.

![Reorder, resize frame and a resized Calendar widget](screenshots/jb-launcher.png)

## Clock (DeskClock 4.2/4.3) — 2026-10-01

References at DeskClock `android-4.3_r1.1`: [DeskClock.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/src/com/android/deskclock/DeskClock.java), [clock_fragment.xml](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/res/layout/clock_fragment.xml), [timer_fragment.xml](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/res/layout/timer_fragment.xml), [time_setup_view.xml](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/res/layout/time_setup_view.xml), [stopwatch_fragment.xml](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/res/layout/stopwatch_fragment.xml), [CircleTimerView.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.3_r1.1/src/com/android/deskclock/CircleTimerView.java), plus `styles.xml`, `dimens.xml` and `colors.xml`.

- **Tabs.** A ViewPager with icon tabs (timer, clock, stopwatch) opens on Clock; tap or swipe changes pages, with the holo-blue underline.
- **Clock.** Bold hours and Roboto Thin minutes (`big_bold`/`big_thin`), the condensed uppercase date and the next alarm with `ic_alarm_small`. The footer has Alarms (opens the existing AlarmClock list and editor), Cities and the overflow menu (the last two only show a demo notice).
- **Timer.** The TimerSetupView fills H MM SS from the right; the keypad and backspace match the layout, and Start stays disabled until a duration exists. Running timers show the CircleTimerView with its rules: a 4dp white ring, `clock_red` arc drawn counter-clockwise from 12 o'clock, and the red diamond. Each has delete, Stop/Start/Reset and +1 minute; Add Timer opens the keypad again. A finished timer turns red with “Time's up”, posts a notification and switches to the Timer page. Durations use real elapsed time.
- **Stopwatch.** The counter shows hundredths in AndroidClockMono. After the first lap the red arc runs clockwise relative to that lap, with a 16dp marker at the previous lap. Lap/Reset, Start/Stop and Share are present, and Share writes the times into a new Messaging draft. The lap list is newest first.

Checks: `jb-deskclock.test.cjs` (setup digits and limits, timer state changes, formats, laps and reset, rendering). Headless Chrome: tabs, keypad 1-0-5 → 0h 01m 05s, running countdown, a 2-second timer finishing with its notification, two laps, sharing to Messaging, and swiping from Timer to Clock. No JavaScript errors.

Limits: no world-clock city list, night mode, screensaver settings, timer labels/sounds or stopwatch notification; alarms still use the ICS list and editor rather than the 4.2 time picker.

![Clock, timer setup, running timer and stopwatch](screenshots/jb-deskclock.png)

## Settings and Daydream — 2026-10-01

References: Settings 4.3 [settings_headers.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/res/xml/settings_headers.xml), [location_settings.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/res/xml/location_settings.xml), [display_settings.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/res/xml/display_settings.xml), [device_info_settings.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/res/xml/device_info_settings.xml), [security_settings_misc.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.3_r1.1/res/xml/security_settings_misc.xml) and `strings.xml`; DeskClock 4.3 `desk_clock_saver.xml`.

- **Headers.** PERSONAL now starts with Location access; accounts move into their own ACCOUNTS section (Google, Add account). Users is omitted, as on single-user phones.
- **Location access.** The “Access to my location” switch enables or disables (greys out) the GPS satellites and Wi-Fi & mobile network location sources, using the original 4.3 wording.
- **Daydream.** Display has a Daydream entry after Sleep. The Daydream screen has the master switch, the off-state prompt, radio choices (Clock, Colors, Photo Frame), Start now and When to daydream (While docked / While charging / Either). Start now runs a full-screen dream that any tap ends: Clock is the dimmed DeskClock saver, which moves once a minute; Colors is a slow hue gradient; Photo Frame cross-fades Gallery pictures every six seconds.
- **Security and About.** Unknown sources uses the 4.3 summary; Verify apps (on by default) and Notification access (no listeners) are added. About phone shows SELinux status: Permissive, as on Galaxy Nexus 4.3 builds.

Checks: headless Chrome walked the header order, the location switch (greying sources and saving), Daydream off/on, dream choice, Start now with Clock and Colors, exit by tap, and About. No JavaScript errors.

Limits: dreams do not start automatically (no charging/dock state), Photo Table and Google dreams are absent, and the Colors dream approximates the GL renderer with a CSS gradient.


## Five-language and mobile sweep — 2026-10-01

Each JB-specific screen was checked in English, Hungarian, German, French and Spanish at 360×640 and 320×568 with touch emulation. The screens covered were the notification shade, quick settings flip, keyguard, clock tabs, timer keypad, stopwatch and Daydream settings. The existing app and settings sweep ran on 4.3 too. The checks were text overflow, untranslated strings, elements past the screen edge, and JavaScript errors. The earlier touch suites (long-press, drag, scroll, keyboard) also pass on 4.3.

- Pages that are not on screen in the keyguard pager and the DeskClock pager are now `inert` and `aria-hidden`. Hidden widget, camera or timer pages can no longer take focus or keyboard input.
- Known false positives:
  - French Email shows “Agenda” as a sender name.
  - At 320 px the GlowPad's invisible right-hand target box (108dp, opacity 0 at rest) sits 4 px past the edge. AOSP sizes the GlowPad in dp and crops it the same way on narrow screens.
