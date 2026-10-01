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

## Secure keyguard: pattern, PIN and password — 2026-10-01

References (tag `android-4.3_r1.1`): framework [keyguard_host_view.xml (port)](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/core/res/res/layout-port/keyguard_host_view.xml), [keyguard_pattern_view.xml](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/core/res/res/layout/keyguard_pattern_view.xml), [keyguard_pin_view.xml](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/core/res/res/layout/keyguard_pin_view.xml), [keyguard_password_view.xml](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/core/res/res/layout/keyguard_password_view.xml), `keyguard_emergency_carrier_area.xml`, `keyguard_message_area.xml`, `values/dimens.xml`, `values/styles.xml`, `values/arrays.xml`; `policy/.../keyguard/` [SlidingChallengeLayout.java](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/policy/src/com/android/internal/policy/impl/keyguard/SlidingChallengeLayout.java), `KeyguardViewStateManager.java`, `KeyguardSecurityViewHelper.java`, `KeyguardMessageArea.java`, `KeyguardPatternView.java`, `KeyguardWidgetPager.java`, `KeyguardWidgetFrame.java`, `KeyguardHostView.java`, `NumPadKey.java`; `core/java/.../LockPatternView.java`.

- **Layout.** Pattern, PIN and password locks now use the 4.3 KeyguardHostView instead of the ICS screens. The widget pager (clock, user widgets, music transport, camera) stays on top, and the KeyguardSecurityContainer (320 × 400dp max, 8dp top margin) is pinned to the bottom. While it is up, the current widget shrinks to `kg_small_widget_height` (160dp).
- **Sliding.** To slide the challenge down, drag across its top edge or start above it and pull down. The 64dp expand handle (`kg_security_lock`) then fades in (250 ms, quadratic). Tapping or dragging the handle brings the challenge back. Opacity follows (offset − 1)³ + 1, and settling uses the quintic ease-out. Duration is (distance ratio + 1) × 100 ms, or 4 × distance / velocity after a fling, capped at 600 ms.
- **Paging.** With the challenge up, only swipes that start in the 24dp edge strips page the widgets, even over the challenge (`dispatchTouchEvent`). Paging fades the challenge out in 100 ms. It fades back in (160 ms) only if the page did not change; otherwise it stays down.
- **Bouncer.** Tapping a widget (calendar), the **+** page or the camera page while locked shows the bouncer:
  - a #99000000 scrim covers the pager;
  - the current page zooms to 0.67 (250 ms, decelerate 1.5);
  - the carrier/emergency area fades out;
  - the `kg_bouncer_bg_white` corner frame fades in.

  Tapping the scrim or pressing Back dismisses it. After a correct entry the pending action runs: Calendar or the event opens, the camera opens, or the widget picker appears and then the device locks again with the new widget.
- **Message area.** As in KeyguardMessageArea, the instructions (“Draw your pattern”, “Enter PIN”) are not shown. The line shows the owner info, then “Wrong Pattern / Wrong PIN / Wrong Password” for 5 seconds, or “Try again in N seconds.” during the 30-second lockout. Owner info also moved out of the clock page into the selector's message area on the slide lock.
- **Views.**
  - **Pattern:** LockPatternView inside the bouncer frame, white path at alpha 128 and 5% of a cell wide; a wrong pattern clears after 2 s.
  - **PIN:** NumPadKey rows with the “klondike” letters (ABC … WXYZ, 20dp condensed at 50% white), a password-dotted entry with `ic_input_delete`, a `#55FFFFFF` divider and `sym_keyboard_return_holo`.
  - **Password:** a #70000000 strip with 36sp text between two spacers, with the simulator keyboard below as the IME.
  - All three have the carrier line and the Emergency call button.
- **Unchanged checks.** Hashing, attempt counting and lockout are the existing simulator logic; only the surface is new.

Checks:
- `jb-challenge.test.cjs`: alpha and settle timing, fling direction, message priorities, view markup, lockout disabling, and the controller skin with a wrong and then a correct PIN.
- Headless Chrome, 390 × 760 and 320 × 568, in en/hu/de/fr/es, for all three lock types: wrong entry and message, drag down, handle visible and tap up, edge swipe to the calendar widget, tap → bouncer at 0.67 scale, then the correct code opens Calendar.
- The slide-lock GlowPad suite still passes. No JavaScript errors.

Limits:
- The camera page asks for the bouncer instead of opening the 4.2 secure camera.
- The widget frame does not track the challenge top pixel by pixel while dragging; it shows the outline and switches size when the challenge settles.
- Face Unlock, SIM PIN/PUK and the account-unlock fallback after 20 failures are not simulated.
- On short screens the challenge is capped so the clock stays visible.

![PIN, wrong pattern, password with IME, challenge slid down, bouncer](screenshots/jb-keyguard-secure.png)

## Owner-reported fixes — 2026-10-01

- **BeanBag.** Beans could not be grabbed: the global `.screen img{pointer-events:none}` rule also applied to the bean images, so touches reached the board instead. Beans now take pointer events (and `touch-action:none`). As in BeanBag.java, a held bean follows the finger. Its velocity is smoothed (0.75 old + 0.25 new), it keeps flying after release, and it spins in proportion to the release speed. Headless Chrome confirmed this with both mouse and touch.
- **Folder background and analog clock drag ghost.** The ICS fixes apply here too; see the ICS audit.

## Camera — 2026-10-01

References (Gallery2 `android-4.3_r1.1`, where the 4.3 camera lives): [layout-port/camera_controls.xml](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/blob/android-4.3_r1.1/res/layout-port/camera_controls.xml), `switcher_popup.xml`, `menu_indicators.xml`, `count_down_to_capture.xml`, `values/dimens.xml`, `arrays.xml`, `strings.xml`, `xml/camera_preferences.xml`; [PieRenderer.java](https://github.com/aosp-mirror-neo/platform_packages_apps_gallery2/blob/android-4.3_r1.1/src/com/android/camera/ui/PieRenderer.java), `PieController.java`, `PhotoMenu.java`, `PreviewGestures.java`, `CameraSwitcher.java`, `OnScreenIndicators.java`, `ZoomRenderer.java`, `CaptureAnimManager.java`, `CameraSettings.java`, `CountDownTimerPreference.java`.

- **Controls.** At the bottom, the 72dp CameraSwitcher sits on the left with its corner mark. The ShutterButton (`btn_shutter_default`, offset −22dp) is in the middle. On the right is the PieMenuButton over the six OnScreenIndicators ring segments (scene, timer, flash, exposure, location, white balance), which follow the settings.
- **Pie menu.** Holding the preview for 200 ms opens the 4.3 arc pie at the finger; the menu button opens it in tap mode, 2.5 × 36dp above the bottom.
  - Geometry: items lie on an arc (214dp radius, centred 166dp below the touch point) 2/3 of a 48dp ring further out and 0.23 rad apart, with the white 140-alpha arc stroke under them. The arc tilts by up to 24° inside the edge zones (36 + 92dp).
  - Selection: the selected item gets the #33B5E5 annular slice, which slides between items in 80 ms, and its label appears above the arc. Hit testing uses the original slice wedges (0.14 rad around a centre 322dp below), with the 32dp touch offset while swiping. Pulling back towards the finger closes a submenu.
  - Submenus: they open after hovering for 400 ms (or at once in tap mode) one ring higher, cross-fading in 200 ms. A leaf fades out over 600 ms before its action runs; the pie fades in over 200 ms from 0.9 scale.
  - Items, left to right (PhotoMenu): Exposure (−3…+3, `EXPOSURE ±n`), More options, Flash mode (off/auto/on) and the camera switch, labelled with the camera it switches to. More options holds Location, Countdown timer, Picture size, White balance (incandescent, fluorescent, auto, daylight, cloudy) and Scene mode (action, night, none, sunset, party).
- **Popups.** Countdown timer and Picture size use the #282828 setting popup with a holo-blue title and 2dp rule. The timer steps through 0, 1, 2, 3, 4, 5, 10, 15, 20, 30 and 60 s, with “Beep during countdown”; picture sizes are the Galaxy Nexus 5M…QVGA list.
- **Focus.** A tap draws the PieRenderer focus ring at the touch point: a 72dp circle with a 3dp stroke, and an inner dial with two 45° arcs and four ticks. The dial turns from 67° by a random ±60° over 600 ms, snaps back in green in 100 ms, then hides after 200 ms.
- **Zoom.** The mouse wheel or a pinch shows the ZoomRenderer: 48dp and maximum rings, a guide line, the current ring and “x.yx”.
- **Capture.**
  - With a timer, the 160sp countdown and “Counting down to take a photo” run first; pressing the shutter again cancels.
  - CaptureAnimManager: a white flash (0.3 → 0 in 200 ms), hold to 400 ms, a decelerating slide to the 48dp thumbnail (16dp margins) by 800 ms, hold with border until 3.3 s, then a slide off to the right by 4.1 s. Tapping the thumbnail opens the photo in Gallery.
  - Swiping left on the preview also opens Gallery, standing in for the filmstrip.
- **Modules.** The switcher popup (#80000000, 0.3 → 1 scale in 200 ms) lists panorama, video and photo, with photo at the bottom.
  - Video uses the video shutter states and a red recording timer.
  - The scene-mode and fluorescent tints and the ±3 exposure range feed the illustrated preview and saved pictures.

Checks:
- `jb-camera.test.cjs`: pie tree and order, indicators, geometry symmetry, hit testing of every item in both modes, pull-to-centre, capture phases, timer values and markup.
- Headless Chrome, en at 390 × 760, hu at 320 × 568, and de/fr/es at 360 × 640, all on real mouse input:
  - tap focus;
  - hold → pie → flash → FLASH ON (setting saved, indicator updated);
  - menu button → More → Countdown timer → 3 s;
  - shutter → countdown → capture animation and thumbnail;
  - switcher → video recording;
  - wheel zoom to 1.9x;
  - swipe left to Gallery.

  No JavaScript errors.

Limits:
- Video is not saved, and panorama capture is only a message. There is no HDR (Galaxy Nexus has none), face detection, Photo Sphere or real filmstrip.
- Location and picture size are stored settings only. The countdown beep is silent.

![Focus, pie selection, flash submenu, More options, countdown, thumbnail, switcher, zoom](screenshots/jb-camera.png)

## Status bar icons — 2026-10-01

The SystemUI `drawable-hdpi` status icons at `android-4.3_r1.1` were compared byte for byte with the ICS assets in use: `stat_sys_wifi_signal_4_fully`, `stat_sys_signal_4_fully`, `stat_sys_battery_71`, `stat_notify_more`, `stat_sys_data_bluetooth` and `stat_sys_signal_flightmode`. All six are identical, so the Jelly Bean status bar keeps them, and this roadmap item needs no new artwork.

## Window and launch animations — 2026-10-01

References (`android-4.3_r1.1`): framework `core/res/res/anim/` (`activity_*`, `task_*`, `wallpaper_*`, `lock_screen_exit.xml`, `lock_screen_wallpaper_behind_enter.xml`), [AppTransition.java](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-4.3_r1.1/services/java/com/android/server/wm/AppTransition.java) (`createScaleUpAnimationLocked`, `computePivot`, thumbnail fade-out), and Launcher2 `startActivity` with `ActivityOptions.makeScaleUpAnimation`.

- **Launching from the launcher.** Home-screen, dock, folder and drawer icons now start apps the 4.1+ way: the app grows from the tapped icon's rectangle. The pivot is −start / (scale − 1), so the first frame covers the icon exactly, and the scale uses decelerate_cubic over 250 ms (the wallpaper-transit duration). Opacity rises linearly over the first quarter and then holds, and the launcher stays in place underneath.
- **Back to the launcher.** `wallpaper_open_exit`: the app fades out in 200 ms (accelerate/decelerate) while shrinking to 0.5 in 375 ms.
- **Between tasks.** The 4.3 card animation (`task_open_*` / `task_close_*`), on black:
  - The old task fades, shrinks to 0.5 towards its top and slides 120% up (300 ms, accelerating).
  - After 300 ms the new one rises from 120% below, growing from 0.5 about its bottom edge (400 ms, decelerating).
  - Closing a task mirrors the motion.
- **Inside an app.** `activity_open_*`: the new screen fades in and grows from 0.8 over 300 ms (decelerate_cubic) while the old one fades out. `activity_close_*` reverses it.
- **Unlocking.** The keyguard grows to 1.1 and fades in 200 ms, and the launcher fades in after 200 ms (`lock_screen_wallpaper_behind_enter`) instead of the ICS 0.95 zoom.
- **Unchanged.** The app drawer, folders and drag animations keep their values, because Launcher2 4.3 `config.xml` has the same zoom, fade and stagger times as 4.0.4.

Checks: `jb-transitions.test.cjs`, and headless Chrome sampling of the Messaging launch from the dock (first frame at the icon, about 0.54 × 0.48 scale with the computed pivot, about 0.69 opacity at 40 ms), Back to home, and a Settings subpage. No JavaScript errors.

Limits: notification and widget launches use the plain wallpaper/task transits rather than their own scale-up rectangles. Recents still uses the task animation instead of the 4.1+ thumbnail scale-up; that change comes with the Recents rework.

## Asset audit against 4.3 — 2026-10-01

Every inherited ICS asset in `versions/4.3/assets` was matched byte for byte to its `android-4.0.4_r2.1` source file and then compared with the same resource at `android-4.3_r1.1`. Launcher icons moved into `mipmap-*` folders, and the Phone/People icons and dialer resources moved into the Phone app. Results: 129 identical, 22 changed, 28 moved or removed, and the rest renamed project copies, which were checked individually.

Replaced with the 4.3 files:
- **Launcher icons.** Browser, Calculator, Calendar, Clock (the new 4.2 face), Email, Messaging, Settings, People (stacked cards), Phone, and Camera and Gallery (the new Gallery2 camera and picture icons).
- **Wallpapers.** The Launcher2 4.3 set `wallpaper_01…05, 08…12` (06 and 07 are tablet-only), with thumbnails from `*_small.jpg`. `wallpaper_01` is byte-identical to the framework `default_wallpaper` and is the default; the chooser shows thumbnails without names, as in 4.3.
- **Search bar.** Launcher2's `search_bar` layout is unchanged, but `search_frame.9.png` is now a filled, rounded, translucent white bar instead of the ICS outlined box. The bar uses it (nine-patch border stripped, 9 px slices) and Launcher2's own `ic_home_voice_search_holo` microphone.
- **Digital clock widget.** It was drawn in AndroidClock. It now follows DeskClock 4.3 `digital_widget_time`:
  - bold sans-serif hours and thin minutes at `widget_big_font_size` 80dp, scaled down below `def_digital_widget_width` as in `WidgetUtils.getScaleRatio`;
  - then the 14sp bold condensed uppercase date and the 50%-white next alarm with `ic_alarm_small`;
  - the drawer uses the original `appwidget_digital_clock_preview`;
  - it can shrink to 2 × 1 (`min_digital_widget_resize_*`);
  - the keyguard page uses the same layout.
- **Analog clock widget.** The 4.2 `appwidget_clock_dial/hour/minute` (thin ring and slim hands).
- **Other images and fonts.** `Roboto-Regular.ttf` and `AndroidClock.ttf` from 4.3 `data/fonts`, Calendar `ic_menu_today_holo_light`, DeskClock `ic_menu_add`, and the Mms `msg_bubble_left/right` tails.

Unchanged in 4.3 (kept): navigation bar keys, status bar icons, Settings header icons, Power widget icons and frame, holo check boxes, action bar back, overflow, the music icon and the all-apps button.

Still to review with their apps: the Calendar widget header nine-patches (removed in 4.3), Contacts' `ic_contact_picture*`, `ic_menu_*` and the dialer graphics (moved to Phone), and the in-call `ic_end_call`. These belong to the People/Phone and Calendar passes. The ICS Camera images are no longer used now that the 4.3 Camera has its own `jbcam-` set.

Limits: the “Google” label in the search bar is still project text. The real 4.3 builds draw the Google Search app's toolbar logo, which is not an AOSP asset.
