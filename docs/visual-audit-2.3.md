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

## Options menu and dialogs — 2026-10-02

References:
- Framework 2.3.6: `icon_menu_layout.xml` (port), `IconMenuView.java`, `Theme.IconMenu`, `options_panel_enter/exit`, `alert_dialog.xml`, `AlertController.setBackground`, `select_dialog_item`, `dialog_enter/exit`, `Widget.Button`.
- Launcher2: `Launcher.onCreateOptionsMenu`, `AddAdapter`, `add_list_item.xml`.

The shared code is in `versions/2.3.6/gb-ui.js` / `.css`.

- **Icon menu (Menu key).**
  - A full-width panel on `menu_background_fill_parent_width`: 90% black under a gray top edge. Rows are 66 dip, with up to three items per row and six in total.
  - Over six items, the first five show plus "More" (`ic_menu_more`), which opens the expanded list. `layoutItemsUsingGravity` gives the leftover items to the bottom rows.
  - Each item has a 48 dp icon over a 14 sp label. Dark dividers sit between items, and `highlight_pressed` shows on touch.
  - It slides up 25% with a 150 ms fade, and slides down 50% when closed. The Menu key toggles it.
- **Launcher menu:** Add, Manage apps, Wallpaper / Search, Notifications, Settings, with their 2.3 icons.
- **Inherited menus.** The ICS holo overflow menus that the apps still use are converted into icon menus on the fly. Known commands get their 2.3 menu icons (framework, Browser and Music art), for example Browser's Forward, Refresh, New window, Bookmark, Bookmarks and More.
- **AlertDialog.**
  - A dark title (`popup_top_dark`, 22 sp, 1 dip divider) over either a dark message (18 sp) or a bright list (22 sp black text, 64 dip rows), then the buttons on `popup_bottom_medium`. The pieces use `AlertController.setBackground`'s top / center / bottom / full rule.
  - Buttons use `btn_default` with 14 sp black text, and a single button gets the 0.25 / 1 / 0.25 spacing.
  - Radio and check variants use `btn_radio` / `btn_check`.
  - The window dims what is behind it by 0.6 and opens with `dialog_enter` (scale 0.9 + fade, 150 ms).
- **Add to Home screen** (AddAdapter): Shortcuts, Widgets, Folders, Wallpapers.
  - Shortcuts lists the apps ("Select shortcut") and puts the chosen one in the first free cell, or reports "No more room on this Home screen."
  - Widgets ("Choose widget") lists the widget types and adds the chosen one.
  - Wallpapers opens "Select wallpaper from": Gallery, Live wallpapers, Wallpapers.
- **Translations.** Launcher2, framework, Settings and LivePicker 2.3.6 strings.

Checks: headless Chrome covered the home menu (two rows of three), Add → Widgets → Analog clock, Add → Shortcuts → Calculator, the Browser menu conversion and closing with the Menu key. No JavaScript errors.

Next: Gingerbread folders (New folder, the UserFolder panel, rename), the wallpaper chooser and the home screen previews.

## Folders, wallpapers, toasts and screen previews — 2026-10-02

References: Launcher2 2.3.6 `user_folder.xml`, `Folder.java`, `UserFolder.java`, `Workspace.acceptDrop`, `AddAdapter`, `WallpaperChooser` (`wallpaper_chooser.xml`), `Launcher.showPreviews`; crespo `wallpapers.xml`; Contacts live folders; framework `transient_notification.xml`, `toast_frame`, `toast_enter/exit`.

- **Folders.**
  - Folders come from Add → Folders ("Select folder"): New folder, or the Contacts live folders All contacts, Contacts with phone numbers and Starred contacts.
  - Dropping one icon on another never makes a folder. As in `Workspace.acceptDrop`, the item goes to the nearest vacant cell, or "No more room on this Home screen." if there is none.
  - Dropping onto a folder icon adds the item. Folders keep their place even when empty.
  - The icon is `ic_launcher_folder`, and `ic_launcher_folder_open` while open; live folders use the Contacts icons.
  - The open UserFolder covers the CellLayout area: a `box_launcher_top` title (14 sp bold #404040) and a 4-column `application_boxed` grid on `box_launcher_bottom`.
  - Touching the title closes the folder. Touching and holding it opens "Rename folder" (an AlertDialog with a "Folder name" field, OK and Cancel).
  - Live folders list the matching contacts and open them in Contacts.
- **Wallpapers.**
  - The 15 Nexus S wallpapers in the crespo order, as 960 × 800 images (re-encoded at quality 82): Street lights, Stream, Phase beam, Pulse, Nexus rain, Stars, Canyon, Grass, Zanzibar, Cloud, Monument valley, Mountains, Sunset, Golden gate, Shuttle.
  - A static wallpaper spans two screens and moves a quarter of its spare width per home screen.
  - The WallpaperChooser shows a fitCenter preview, a Gallery of the `_small` thumbnails, and "Set wallpaper".
- **Toasts.** `toast_frame`, 14 sp white text with the #BB000000 shadow, 64 dip above the bottom, and a 400 ms fade.
- **Screen previews.**
  - Touching and holding the previous/next arrows or the all apps button opens the PopupWindow of all five screens.
  - Each CellLayout is drawn without the wallpaper at the scale that fits five across, in `preview_background` frames, with the current screen in the pressed frame. Touching one goes to that screen.

Checks: `gb-ui.test.cjs` was updated for the dialog section classes. Headless Chrome covered New folder and All contacts, dragging Browser from all apps into the folder, opening it, renaming it to "Web", the live folder list, Mountains via the chooser with the parallax at 50% and 75%, and the previews from the right arrow, jumping to screen 4. No JavaScript errors.

## Power menu — 2026-10-02

References: 2.3.6 `GlobalActions.java`, `global_actions_item.xml`, `ShutdownThread`, `progress_dialog.xml`, `progress_medium_white`.

- **Phone options** (touch & hold power). An AlertDialog over a bright list (`setInverseBackgroundForced`) with three items.
  - **Silent mode:** `ic_lock_silent_mode_off` and "Sound is ON", or the silent or vibrate icon and "Sound is OFF". It switches to vibrate unless "vibrate in silent" is off.
  - **Airplane mode:** "Airplane mode is ON/OFF" with its icon.
  - **Power off.**
  - Each row is `global_actions_item.xml`: a 22 sp label with a 14 sp status line. There is no bug report or ringer-mode row; those are 4.x.
- **Shutdown.**
  - The confirmation is `ic_dialog_alert`, "Power off" and "Your phone will shut down." with OK / Cancel.
  - Then the ProgressDialog shows `spinner_white_48` stepping 12 frames every 100 ms beside "Shutting down…".
- **Strings.** Framework 2.3.6 translations.

## Settings — 2026-10-02

References: Settings 2.3.6 `res/xml` (`settings.xml`, `wireless_settings`, `tether_prefs`, `sound_settings`, `display_settings`, `security_settings*`, `application_settings`, `privacy_settings`, `device_info_memory`, `language_settings`, `accessibility_settings`, `date_time_prefs`, `device_info_settings`, `device_info_status`), `SecuritySettings.java`; framework `preference.xml`, `Widget.TextView.ListSeparator`, `WindowTitle`, `activity_title_bar`, `dark_header`; SettingsProvider `defaults.xml` and the crespo overlay.

The code is in `versions/2.3.6/gb-settings.js` / `.css`. `gb-settings-strings.js` is generated by `docs/gb-settings-strings.py` from the Settings and framework strings in English, Hungarian, German, French and Spanish, so every title, summary and list entry uses the shipped 2.3.6 translation.

- **Look.**
  - Each screen has the 25 dip `activity_title_bar` window title (14 sp bold white with the #BB000000 shadow) over a black list.
  - Categories are 25 dip `dark_header` separators with 14 sp bold #bebebe text.
  - Preferences are `preference.xml` rows: 64 dip, 22 sp title, 14 sp #bebebe summary (up to four lines), the `btn_check` widget on the right, dark dividers and the orange pressed highlight. Disabled rows are dimmed.
- **Main list** (settings.xml with the `ic_settings_*` icons): Wireless & networks, Call settings, Sound, Display, Location & security, Applications, Accounts & sync, Privacy, Storage, Language & keyboard, Voice input & output, Accessibility, Date & time, About phone. Dock is hidden, as on the Nexus S.
- **Screens.** Each follows its XML, or `SecuritySettings` for Location & security.
  - Wireless & networks: airplane mode disables Wi-Fi and Bluetooth; tethering (USB and Wi-Fi), VPN, NFC and Mobile networks.
  - Sound: General, Incoming calls, Notifications and Feedback; Vibrate and Emergency tone are ListPreferences.
  - Display: Brightness dialog with Automatic brightness, Auto-rotate, Animation, Screen timeout.
  - Location & security:
    - My Location: wireless networks, GPS, and assisted GPS, which depends on GPS.
    - Screen unlock: "Set up screen lock", or "Change screen lock" plus "Use visible pattern" and "Use tactile feedback" for a secure lock.
    - Passwords, Device administration and Credential storage.
  - The rest: Applications, Privacy (backup and restore, factory data reset), Storage (SD card / internal), Language & keyboard, Accessibility (power button ends call), Date & time, About phone and Status.
- **ListPreference.** A single-choice AlertDialog with Cancel; the row summary shows the chosen entry where the XML has no fixed summary.
- **Defaults** (SettingsProvider `defaults.xml`, crespo overlay):
  - screen timeout 1 minute, All animations, vibrate "Only in Silent mode";
  - lock screen sounds off, haptic feedback on, assisted GPS on, automatic time on;
  - automatic brightness on (crespo).
- **Navigation.** Back walks the order the screens were opened in, including the inherited pages that have no 2.3 definition yet: the Wi-Fi network list, Bluetooth, Accounts & sync, Manage applications, Battery use, Development, Volume, Phone ringtone, Legal information, Factory data reset and the language picker.

Checks: `gb-settings.test.cjs` covers the main list order and icons, translations, check boxes with the airplane dependency, the ListPreference summary and dialog, the lock-dependent security rows, About phone and unknown screens. Headless Chrome covered English and Hungarian: the main list, Wireless (Bluetooth toggle), Sound, the Vibrate dialog, Brightness, Location & security, About and Status, and back navigation. No JavaScript errors.
- **Update 2026-10-02 (inherited pages replaced).**
  - **Wi-Fi settings** (`wifi_settings.xml`): the toggle with the `wifi_status_with_ssid` summary ("Connected to …"), Network notification, the Wi-Fi networks category and "Add Wi-Fi network".
    - Access points show the `ic_wifi_(lock_)signal_*` icons and "Connected" / "Secured with WPA2", with the connected network first and then by signal.
    - The Menu key gives Scan / Advanced (sleep policy, MAC and IP).
    - The WifiDialog shows status, signal, speed, security and IP with Forget / Cancel, or Security, Signal, Password and "Show password." with Connect / Cancel. WPA networks need 8 characters.
  - **Bluetooth settings** (`bluetooth_settings.xml`): the toggle, Device name (EditText dialog), Discoverable ("Discoverable for 120 seconds…"), Discoverable timeout, and "Scan for devices", which finds a headset, a car kit and a laptop with the `ic_bt_*` icons. Touching a device pairs and connects it.
  - **Development** (`development_prefs.xml`): USB debugging asks "Allow USB debugging?" first; Stay awake; Allow mock locations.
  - **Volume** (RingerVolumePreference): Ringtone, "Use incoming call volume for notifications" (which shows the Notification slider when cleared), Media and Alarm.
  - **Phone and notification ringtone pickers:** Silent plus the `OriginalAudio.mk` sounds the full crespo build ships. The default notification is On The Hunt (`core.mk`), and there is no default ringtone.
  - **Select language:** a locale list that switches the simulator language.
- **Update 2026-10-02 (screen lock setup).**
  - "Set up / Change screen lock" opens ChooseLockGeneric: the "Screen unlock security" list with None, Pattern, PIN and Password and their summaries. "None" is the plain slide lock, as in 2.3.
  - **ChooseLockPattern** (`choose_lock_pattern.xml`): on black, the header steps through "Draw an unlock pattern" (footer "Press Menu for help."), "Release finger when done.", "Connect at least 4 dots. Try again:", "Pattern recorded!", "Draw pattern again to confirm:" and "Your new unlock pattern:". The pattern sits between `code_lock_top` and `code_lock_bottom`.
    - The ButtonBar switches between Cancel / Retry and Continue / Confirm, enabled only for a valid pattern.
    - ConfirmLockPattern shows "Confirm saved pattern" or "Sorry, try again:".
  - **ChooseLockPassword**: "Choose your PIN / password", then "Confirm your …", with "PINs don't match" or "PIN must be at least 4 characters" on errors. The field and the PasswordEntryKeyboardView sit above the `bottom_bar` with Cancel and Continue / OK.

## Phone and Contacts (Dialtacts) — 2026-10-02

References: Contacts 2.3.6 (`layout-finger/twelve_key_dialer.xml`, `dialpad.xml`, `voicemail_dial_delete.xml`, `recent_calls_list_item_layout.xml`, `DialtactsActivity.java`, `drawable-hdpi-finger`), framework `tab_indicator.xml` and the `tab_*` drawables. Strings are generated by `docs/gb-strings.py contacts` into `gb-strings-contacts.js` (Contacts app translations). The code is in `versions/2.3.6/gb-phone.js` / `.css`.

- **Tabs.** The TabWidget has Phone, Call log, Contacts and Favorites (`ic_tab_selected/unselected_*`) as 64 dip tab indicators with a 14 sp label, the light `tab_selected` and dark `tab_unselected` backgrounds, and #fff / #808080 text. The Contacts launcher icon opens the same activity on its Contacts tab.
- **Phone (TwelveKeyDialer).**
  - The digits field is 67 dip on `btn_dial_textfield` with 33 sp digits. The ButtonGridLayout has 88 × 50 dp keys (`btn_dial`, transparent with a divider, green when pressed), using the `dial_num_*_wht` art, which switches to `_blk` while pressed.
  - Below are voicemail, dial and delete on the `btn_dial_action_left/middle/right` pieces.
  - The Menu key gives Add to contacts, Add 2-sec pause and Add wait once digits are entered.
- **Call log.** Rows show the name or number (22 sp), the call-type arrow, the number label and a relative time, then a divider and the call button. "Call log is empty." when there are none, and Menu → Clear call log asks to confirm.
- **Contacts.** An alphabetical list with `dark_header` section letters, 48 dp contact pictures and 22 sp names. Menu: Search, New contact, Display options, Accounts, Import/Export.
- **Favorites.** The starred contacts, or the "You don't have any favorites…" help text.
- **Contact details** (ViewContactActivity): the header with picture, name and the big star, then Call mobile, Text mobile and Email home with their action icons. Menu: Edit contact, Share, Delete contact.

Checks: `gb-phone.test.cjs` covers tab order and translations, the 12 keys and their art, call log order, arrows, relative time and the empty state, contact sections and sorting, favorites, details and the menus. Headless Chrome covered dialling 5551234, calling and hanging up, the call log, contacts, details with its menu, back to the list, and favorites. No JavaScript errors.

Still ICS: the contact editor.

## In-call screen (InCallScreen) — 2026-10-02

References: Phone 2.3.6 (`incall_screen.xml`, `call_card.xml`, `call_card_person_info.xml`, `incall_touch_ui.xml`, `layout-long-finger/non_drawer_dialpad.xml`, `InCallScreen.updateInCallBackground`, `CallCard.updateCardTitleWidgets`, `InCallTouchUi`, `InCallControlState`, `NotificationMgr`), Contacts `TwelveKeyDialer.showDialpadChooser`. Strings are generated by `docs/gb-strings.py phone` into `gb-strings-phone.js`. Phone drawables are installed as `assets/gb-p-*` (9-patch borders stripped).

- **Background.** The mainFrame uses `bg_in_call_gradient_*`: gray (unidentified) while dialing, green once connected, orange on hold, blue with Bluetooth audio, and red after the call ends.
- **Call card.** "Dialing" as the 28 sp upper title while dialing. When connected the title is cleared and the 15 sp bold elapsed time appears beside the photo in green (blue with Bluetooth). On hold it reads "On hold" in orange. The photo is `picture_unknown` in `incall_photo_border_lg` (172 × 166 dp), the 28 sp name sits under it, then the label and number in 18 sp secondary text.
- **Touch UI.** The bottom cluster has Add call / End (red label) / Dialpad on `incall_button`, then Bluetooth / Mute / Speaker toggles on `incall_toggle_button` with the green indicator light.
  - Add call and Dialpad are disabled while dialing. Mute is disabled on hold, and Bluetooth needs a paired headset with Bluetooth on.
  - The round Hold / Unhold button sits in the upper-left corner while connected.
  - Dialpad opens the DTMF pad (88 × 58 dp keys on `btn_dial_green`, 24 sp field), which hides the call card. The button then reads Hide.
- **Hang-up.** "Hanging up" on the connected background, then the red "Call ended" title and time without controls. The screen then closes and the call is logged.
- **Status bar.** `stat_sys_phone_call` (on hold / Bluetooth variants), and the ongoing notification "Current call (0:12)" with the caller. Tapping it returns to the call.
- **Dialtacts during a call.** The launcher icon opens Dialtacts. The Phone tab shows the dialpad chooser: Use touch tone keypad, Return to call in progress, Add call (`ic_dialer_fork_*`). Add call shows the normal dial pad, and Back returns to the call. The simulator has one line, so dialing from Add call ends the first call and dials the new number.

Checks: `gb-incall.test.cjs` covers the state machine, elapsed time, backgrounds, titles, enabled/disabled controls, the DTMF pad, hang-up states, Hungarian strings and the chooser. Headless Chrome covered calling a contact, dialing → connected, speaker/mute, hold/unhold, DTMF digits, the shade notification and returning from it, the chooser, Add call with Back, a second call via Add call, and hang-up into the call log. No JavaScript errors.

## Messaging (Mms) — 2026-10-02

References: Mms 2.3.6 (`conversation_list_screen.xml`, `conversation_list_item.xml`, `ConversationListItem.formatMessage`, `compose_message_activity.xml`, `message_list_item.xml`, `MessageListItem.formatMessage`, `MessageItem`, `MessageUtils.formatTimeStampString` / `getTextMessageDetails`, `SmileyParser`, `AttachmentTypeSelectorAdapter`, the `onPrepareOptionsMenu` methods), framework `Widget.QuickContactBadge`, `Widget.ListView.White`, `textfield_*`, `btn_default`. Strings and the smiley arrays come from `docs/gb-strings.py mms` (the generator now also reads `<string-array>`s and decodes `\uXXXX`). Assets: `gb-m-*`, `gb-quickcontact_badge_*`. Code: `versions/2.3.6/gb-mms.js` / `.css`.

- **Conversation list.** A white list under the "Messaging" title bar.
  - The first row is "New message / Compose new message".
  - Each conversation row is 64 dip with the QuickContactBadge (the "…" strip under the picture), the 18 sp name with " (n) " and a red "Draft", and the snippet and date in 14 sp #323232 (time today, "Jan 5" earlier, with the year when older).
  - Unread conversations are bold on white; read ones sit on #eeeeee.
  - Menu: Compose, Delete threads, Search, Settings. A long press opens View thread / View contact (or Add to Contacts) / Delete thread.
- **Conversation.** The title bar shows "Name <number>". The history is stacked from the bottom on white.
  - Each message is "**Name**: body" (sent ones say "Me") at 18 sp, with the badge in the leading margin and "Sent: time" in 14 sp at #bf000000. Received rows are light blue (#ecfbff) and sent rows white.
  - SmileyParser replaces the 17 default smiley texts with the `emo_im_*` art.
  - The bottom panel has the `bottombar_landscape_565` background, the "Type to compose" edit text and the Send button (disabled while empty). The white bold 11 sp counter appears from 10 remaining characters or with more than one part, and reads "MMS" with an attachment.
  - New messages get the "To" recipients editor with contact suggestions. Add subject shows the Subject field, and a sent subject displays as "<Subject: …> - body".
- **Menus and dialogs.**
  - Conversation menu: Call, View contact, Add subject, Attach, Send, Insert smiley, Delete thread or Discard, All threads, Add to Contacts (as applicable; more than six go to More).
  - **Attach** lists Pictures, Capture picture, Videos, Capture video, Audio, Record audio and Slideshow. Pictures picks from the simulator photos and shows the attachment with View / Replace picture / Remove. The rest say they are unavailable.
  - **Insert smiley** lists the icon, translated name and text.
  - **Message options** (tap or long press): Forward, Copy message text, View message details ("Type / From or To / Received or Sent"), Delete message, Lock/Unlock message (lock icon).
  - The delete confirmations use the "Delete" alert with the Mms messages.

Checks: `gb-mms.test.cjs` covers the list rows, unread/read, counts, drafts, date formats, the compose title, message formatting with smileys, the counter, recipients and subject fields, all menus and dialogs, and the Hungarian smiley names. Headless Chrome covered opening Messaging, both menus, sending a message with a smiley, message options and details, Insert smiley, attaching a picture, the draft in the list, and the new-message recipient suggestions. No JavaScript errors.

## Calculator — 2026-10-02

References: Calculator 2.3.6 (`layout-port/main.xml`, `values/styles.xml`, `drawable/button.xml`, `drawable/blue_button.xml`, `ColorButton`, `Calculator.adjustFontSize`, `PanelSwitcher`, `CalculatorDisplay`, `EventListener`, `Logic.onDelete`). Strings come from `docs/gb-strings.py calculator`, and the menu icons are `gb-calc-*`.

- **Layout.** Theme.Black.NoTitleBar. The display (weight 1) sits over the panel switcher (weight 4).
  - The display shows 40 dp white text, right-aligned, with a blinking cursor and no field background (`setBackgroundDrawable(null)`).
  - The simple pad starts with a blank gradient cell (weight 3) and **CLEAR** (localized, e.g. "MINDENT TÖRÖL").
  - Below are the 7–9 / 4–6 / 1–3 / . 0 rows on `blue_button` (#071622 → #253541), and ÷ × − = + on `button` (#000 → #333). Columns have 1 dp left margins.
- **Text sizes.** `adjustFontSize` scales by 480 / 320, so 40 dp keys render at 51.75 px, the advanced sin/cos/tan/ln/log keys (30 dp) at 38.8 px, and CLEAR (15 dp) at 19.4 px.
- **Feedback.** ColorButton's "magic flame" is a 2 px white outline while pressed that fades over 350 ms after release.
- **Behavior.** Tapping CLEAR deletes one character, or clears the display after a result or an error (`Logic.onDelete`). A long press clears everything.
  - Swiping (or Menu → Advanced panel / Basic panel) slides between the pads in 400 ms. Back returns to the basic pad.
  - Menu: Clear history, Advanced panel or Basic panel.

Checks: headless Chrome covered 12×3+4 = 40, the menu items, switching to the advanced panel and back, and delete after a result. No JavaScript errors.

## Clock (DeskClock) — 2026-10-02

References: DeskClock 2.3.6 from aosp-mirror-neo (`desk_clock.xml`, `desk_clock_time_date.xml`, `desk_clock_buttons.xml`, `alarm_clock.xml`, `alarm_time.xml`, `xml/alarm_prefs.xml`, `set_alarm.xml`, `alarm_alert.xml`, `DeskClock.doDim`, `DigitalClock` with `assets/fonts/Clockopia.ttf`, `Alarms.formatToast`, `menu/*.xml`), framework `time_picker.xml` / `number_picker.xml` with the `timepicker_*` 9-patches. Strings and the `alarm_set` array come from `docs/gb-strings.py deskclock` (plus the framework "Set"). Assets: `gb-dc-*`, `fonts/Clockopia.ttf`.

- **Desk clock.** Theme.Wallpaper.NoTitleBar: the (live) wallpaper shows through FLAG_DIM_BEHIND 0.4.
  - The next alarm sits top left ("Sat 7:00 AM" with `ic_lock_idle_alarm`), with the round night-mode button at the right.
  - The time is 106 sp Clockopia with a bold AM/PM, above the "Friday, October 2" date. Everything has the #C0000000 shadow.
  - The `btn_strip_trans` strip at the bottom holds Alarms, Gallery, Music and Home.
  - Night mode fades in the #CC000000 tint over a 0.8 dim; a tap restores it.
  - Menu: Alarms, Add alarm, Dock settings.
- **Alarms.** "Add alarm" in the 68 dip left column, then the rows: the clock icon with the green or gray indicator bar (tapping it toggles the alarm), a divider, the 28 sp Clockopia time with AM/PM, the label right-aligned in tertiary bold, and the days ("Mon, Wed", "every day").
  - The bottom strip has the desk clock button and a 48 sp Clockopia clock.
  - A long press opens Turn alarm on/off, Edit alarm, Delete alarm.
  - Menu: Desk clock, Add alarm, Settings.
- **Set alarm.** The preference list: Turn alarm on, Time, Repeat (Never / days), Ringtone (the OriginalAudio alarms, Alarm Classic by default on crespo, or Silent), Vibrate, Label. The Done / Revert / Delete ButtonBar follows.
  - A new alarm opens the TimePickerDialog right away. Its title is the picked time, with two NumberPickers (+ / 30 sp field / −), the AM/PM button, and Set / Cancel.
  - Saving an enabled alarm shows the "This alarm is set for 2 days, 18 hours, and 45 minutes from now." toast. Back saves too.
- **Alert.** The alarm dialog shows the label (or "Alarm"), the 64 sp Clockopia time, and Snooze ("Snoozing for 10 minutes.") / Dismiss.

Checks: `gb-deskclock.test.cjs` covers the time and day formats, all toast variants, the face, list and SetAlarm markup, the menus and every dialog. Headless Chrome covered the face on the live wallpaper, night mode, the alarm list, a new alarm through the time picker, Repeat and Label, saving with the toast, and the updated list. No JavaScript errors.

## Music — 2026-10-02

References: Music 2.3.6 (`layout-finger/audio_player.xml`, `audio_player_common.xml`, `track_list_item_common.xml`, `MediaPlaybackActivity` / `TrackBrowserActivity` / `ArtistAlbumBrowserActivity` menus and context menus, `drawable-hdpi(-finger)`), framework `MediaButton` and the `ic_media_*` icons. Strings come from `docs/gb-strings.py music`.

- The inherited library and player already used the pre-Holo Music app. The ICS and GB `music-*` drawables are identical, so only the framework media button icons were replaced with the 2.3.6 versions.
- **Song rows** (track_list_item) show the duration (12 sp, textColorTertiary) at the top right. They have no overflow button: a long press (or right click) opens the context menu titled with the song: Play, Add to playlist, Remove from playlist (inside a playlist), Use as phone ringtone, Delete, Search.
  - **Add to playlist** lists Current playlist, New and the saved playlists. New asks for the name, prefilled with "New playlist 1", with Save / Cancel.
- **Player:** the audio_player layout ends with the seek bar on #5a5a5a. The simulator's "Demo tracks" note and the library button are gone; Menu → Library returns to the browser.
  - Shuffle and repeat show the Music toasts ("Shuffle is on.", "Repeating all songs.", ...).
- **Menus.** Browser tabs: Party shuffle / Party shuffle off, Shuffle all. Player: Library, Party shuffle, Add to playlist, Use as phone ringtone, Delete.

Checks: headless Chrome covered both menus, the song context menu, Add to playlist → New → Save (playlist stored), and the player. No JavaScript errors.

## Browser — 2026-10-02

References: Browser 2.3.6 (`title_bar.xml`, `TitleBar.java`, `browser_find.xml`, `bookmark_thumbnail.xml`, `history_item.xml`, `history_header.xml`, `tab_view.xml`, `tab_view_add_tab.xml`, `active_tabs.xml`, `browser_add_bookmark.xml`, `page_info.xml`, `menu/browser.xml`, `BrowserBookmarksPage.java`), framework `search_bar.xml` and `progress_horizontal.xml`. Strings come from `docs/gb-strings.py browser`; 9-patch slices were read from the 2.3.6 `.9.png` guides.

- **Title bar** on `search_plate_browser`: the 5 dip yellow progress bar (invisible but keeping its space when idle), the title field on `textfield_search_empty_default` with the black / white framed favicon and the 18 sp black title, and the bookmarks button on `btn_search_dialog_voice`.
  - While a page loads (0.8 s), the field switches to `textfield_search_default` with the address and the `search_spinner`, and the stop button replaces the bookmarks button.
- **Search dialog** (tap the title or the Search key): `search_plate_global`, the Browser icon, `textfield_search`, the go button and the microphone while empty, the dimmed page, and white suggestion rows from bookmarks and history with the green URL.
- **Find on page** sits at the bottom on `bottom_bar`: previous / next, the field with the match count, and close.
- **Bookmarks / Most visited / History** use the framework tabs. Bookmarks is a thumbnail grid (`browser_thumbnail` size, 8 / 14 dip spacing) with the "Add" holder over the current page first. Menu switches it to a list. History has the "Today" group and `btn_star` rows.
  - A long press opens the bookmark or history context menu: Open, Open in new window, Copy link URL, Remove, Set as homepage, and Add bookmark from history.
- **Windows** (ActiveTabsPage): the window title bar, New window (up to TabControl.MAX_TABS = 8), and rows with the framed favicon, the #313431 divider and the close button.
- **Menu:** New window, Bookmarks, Windows, Refresh / Stop, Forward, and More (Add bookmark, Find on page, Select text, Page info, Share page, Downloads, Settings). Add bookmark opens the Name / Location dialog; Page info shows the title and address.
- The demo pages were moved to 2011 and Android 2.3 / Nexus S.

Checks: `gb-browser.test.cjs` covers the title bar states, suggestions, find bar, grid, list, history, Most visited, Windows and the tab limit, the menus, the dialogs and the translations. Headless Chrome covered loading, the search dialog with suggestions, the menu and More, find with highlighting, the bookmark grid, history and Windows. No JavaScript errors.

## Owner feedback: dock panels and Nexus pulses — 2026-10-02

- **Hotseat:** the phone, all apps and browser buttons sit on `hotseat_bg_left` / `hotseat_bg_center` / `hotseat_bg_right` (HotseatButton, 12 dip padding, 4 dip outer margins). The panels never showed, because a more specific `.screen button{border:…}` rule reset `border-image`. The selectors now carry `.screen .gbl-cluster`.
- **Nexus live wallpaper:** `nexus.rs` works in device pixels (14 px cells, 40-cell trails, 64 px glow). The canvas port drew those numbers in CSS pixels, so the pulses were 480 / 276 ≈ 1.74× too wide on the Nexus S, and 2.35× on the Galaxy Nexus. The scene now runs in panel pixels (480 on 2.3.6) and is scaled to the canvas; taps are converted the same way. The fix is in the shared `live-wallpapers.js`, so 4.0.4 and 4.3 get it too.
- **Status bar icons** were checked against `packages/SystemUI/res/drawable-hdpi` at android-2.3.6_r1: the files are byte-identical, and StatusBarService adds each one in a 25 × 25 dip box (`new LinearLayout.LayoutParams(mIconSize, mIconSize)`), which is where the gaps around the narrow battery come from.
  - The owner pointed out that the icons did not fit. `max-width:100%` resolved inside the grid cell but `max-height:100%` did not, so each icon was drawn at a different scale: the battery and the alarm clock at almost their full 38 px, overflowing the 25 dip bar. Now every icon uses FIT_CENTER in the 21.56 px square (absolute max-width / max-height), so the 38 px tall hdpi icons all scale by the same 0.567.
- **Nexus taps:** NexusRS.onCommand adds `xOffset * (960 − width)` to the tap x before nexus.rs uses it, because the scene scrolls with the home screens. The port skipped this, so on the middle screen the burst appeared half a screen to the left. It now starts under the finger on every page.
