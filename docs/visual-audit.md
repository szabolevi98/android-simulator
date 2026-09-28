# Android 4.0.4 visual and behavior audit

Audit date: 2026-09-28. Target: stock **Android 4.0.4 / Galaxy Nexus**, using AOSP tag `android-4.0.4_r2.1` and the historical screenshots supplied by the project owner. Nexus 4 / Android 4.2 references are not the target.

**Result: the simulator is not yet a complete, visually faithful ICS reproduction.** The system shell has received substantial source-based corrections. Most application interiors still need a dedicated reconstruction. Launching successfully is not evidence of visual fidelity.

![Launcher, Settings and notification shade after the audit](screenshots/ics-shell-audit.png)

## Corrected in this audit

| Area | Evidence and changes | Remaining limits |
| --- | --- | --- |
| Settings background | Uses the original framework `background_holo_dark.png`, fixed behind the scrolling list. The action bar remains at the top. Settings previews in Recents also receive this background. | Font sizes, row heights and dialogs are browser approximations, not a pixel-exact Android density rendering. |
| Settings controls | Original Holo checkboxes, Settings/up icons and Bluetooth device artwork replace improvised symbols. Wi-Fi/Bluetooth retain the single-piece, one-sided-slant switch thumb from the previous fix. | Switch shape is CSS; exact Android pressed/disabled animations are not reproduced. |
| Wi-Fi | Header switch and overflow menu, scan/add/advanced actions, connected network ordering, network-strength icons, connecting/forgetting and saved custom SSIDs. Passwords are discarded. | Networks and security are simulated; scanning does not use hardware. Advanced settings remain limited. |
| Bluetooth | Header switch/menu, device name and visibility row, original phone/headset/config icons, discovery, pairing confirmation, unpairing, renaming and empty received-file list. | One paired device is stored. Visibility has no original timeout selector/countdown. No real Bluetooth or file transfer. |
| Notification shade | A single status bar stays above the shade. Header/date/actions, dark notification rows, carrier label and original close-handle artwork added. Tracking background uses AOSP ARGB `#d8000000`, equivalent to CSS `#000000d8`: 216/255 opacity, approximately 85%. Dragging follows the pointer; notifications move sideways before removal. Clearing the last notification closes the panel. | Expansion/fling timing, icon tint and shadows remain approximate. Telekom is a dummy carrier; airplane mode uses localized “No service.”, not a complete SIM-state model. |
| Home screens | Fixed icon auto-placement: all 16 cells now have explicit coordinates, so widgets cannot shift shortcuts into implicit rows. Five adjacent pages move in a continuous horizontal track. The Home button returns to page 2 (the third page). The five persistent dots were replaced by a temporary thin page marker. | No live wallpaper engine, arbitrary folder creation, Android drag-outline feedback or automatic neighboring-icon rearrangement. |
| Default workspace | AOSP layout: blank page 0; Power control on page 1; analog clock and Camera on page 2; Gallery and Settings on page 3; blank page 4. Google folder retained from the supplied Galaxy Nexus photo. | The Google folder is an explicit Google/Nexus-style addition to the AOSP base. Its contents are limited to simulated apps. |
| Widgets | Actual DeskClock dial and hand images; minute/hour positions update. Working Power control uses original icons, frame and indicators. Grid collision detection supports 2×2, 2×3 and 4×1 spans. Widgets preserve the grab offset when moving; edge hovering changes pages. | Calendar, Music and Photo frame contents are functional browser approximations. There are no resize handles or per-widget configuration screens. Old customized digital/weather widgets are preserved for compatibility but are no longer offered as stock widgets. |
| Shortcut dragging | Fixed the stale drawer selector that prevented dragging an app to the desktop. New drawer shortcuts cannot overwrite occupied cells. Mouse long-press and vertical dragging work; fast horizontal gestures page the workspace. | An occupied-cell drop is rejected rather than creating a folder. |
| App drawer | Labels are sorted in the selected language. Original app icons, Apps/Widgets tabs, 4×5 app grid, widget span labels and two widget pages. | Only 12 apps are implemented, so Apps has one page. Widget previews and drawer transitions remain approximations; Apps paging across multiple pages has not been exercised. |
| Recents | Existing swipe movement checked. Returning to a recent app restores its subpage and outer scroll position. Empty panel dismisses on tap. | Previews are scaled DOM copies, not Android screenshots; nested scroll positions and every app's state are not fully captured. |
| Lock screen | Corrected to camera on the **left**, unlock on the **right**, matching the framework target array. A tap shows the targets without unlocking. Carrier text matches the shade. | Ripple/target animations, music controls and secure lock methods are incomplete. |
| Easter egg and toast | Original toast frame resource replaces the improvised translucent rounded panel. Android-version activation is three taps within 500 ms, as in `DeviceInfoSettings.java`. Original platlogo/Nyandroid artwork remains. | Nyandroid motion/hold timing is a browser approximation. Long-press animation was not reverified in this audit's browser input tests. |
| Languages and landing preview | New labels translated into EN/HU/DE/FR/ES. Calendar uses locale-specific month/weekdays and local dates. Landing-page clock now uses the same original images as the launcher. CSS/JS cache versions advanced. | Sample messages, mail, contacts and offline pages contain English demo content. This is not a complete import of Android's translation resources. |

Existing user-customized desktops are preserved. Only an exact match for the previous untouched demo layout is migrated to the corrected default. Legacy saved widgets retain their previous spans so the update does not silently enlarge them over shortcuts.

## Application interiors: still requiring reconstruction

Every listed app was opened in the browser and checked for missing images, horizontal overflow and console errors. These checks passed. Visual inspection found the following gaps:

| App | Current mismatch / next required work |
| --- | --- |
| Phone | White dial pad, generic title bar and round green call button are not the ICS dialer. Rebuild from Contacts' dialpad layouts and assets, including tabs and bottom actions. |
| People | Letter circles, generic header, floating add button and contact detail layout need replacement with the original People lists/tabs/profile presentation. |
| Messaging | Floating add button, circular avatars and bubble conversation styling are not the original Mms layouts. Original source has separate sent/received row layouts. |
| Browser | Toolbar, tab overview, menus and bookmark controls are simplified. Offline web content is intentionally dummy; the surrounding browser chrome still needs matching. |
| Camera | Viewfinder and controls are generic placeholders. Match original Camera controls while keeping a local mock preview and capture result. |
| Gallery | Uses a generic white grid of demo pictures rather than the original album/filmstrip/detail navigation. |
| Clock | The digital screen, white alarm list, modern pill toggles and floating add button need the original DeskClock/alarm layouts. |
| Calendar | Localized month grid works, but the original action bar, day/week/month/agenda modes and event editor are incomplete. |
| Calculator | Current C/±/% key arrangement and colored operator column are not an ICS reproduction. Reconstruct the original basic/scientific panels. |
| Music | Generic artwork/control layout; library tabs, queue and original player view remain missing. The widget is also an approximation. |
| Email | Letter avatars, floating compose action and generic message/list layout need original Email action bars and list/detail views. |
| Settings detail pages | Data usage, battery chart, storage, installed-app management, volumes/ringtone/sleep and several security/accessibility options remain simplified. Some rows are informational placeholders. About-phone baseband/kernel values are illustrative and have not been verified against a specific factory image. |

The seven-tap Build-number Developer-options unlock is retained **at the owner's explicit request**. Stock ICS exposes Developer options by default; hiding it behind Build-number taps belongs to later Android releases.

## Browser verification performed

- Opened all 12 app roots: no broken image, horizontal overflow or captured JavaScript error.
- Dragged between home pages; Home returned to the center page.
- Toggled Wi-Fi through Power control and verified persistence after reload.
- Dragged a drawer shortcut onto a free home cell and verified persistence.
- Moved the analog clock down one grid row and verified its saved coordinates after reload; restored the test position.
- Verified occupied-cell drops preserve the existing shortcut and reject the new one.
- Added a 4×1 Music widget, toggled playback, and removed it by dragging vertically onto Remove.
- Added a simulated protected Wi-Fi network and verified it remained connected after reload.
- Scanned Bluetooth devices, paired a headset and submitted the device-name dialog.
- Verified empty Recents dismisses on tap; a recent Settings task resumes its Wi-Fi subpage; horizontal dismissal removes its card.
- Dragged down the shade, dismissed one notification sideways, cleared the rest and verified closure, then closed the empty shade with the bottom handle.
- Verified a lock-handle tap leaves the phone locked; rightward drag unlocks; leftward drag opens Camera.
- Opened the Easter egg using a triple click and checked the toast frame.
- Opened the Wi-Fi add-network dialog in all five languages: translated labels and no horizontal overflow.
- Ran isolated language-selection checks: all five supported browser locales, unsupported-language English fallback, saved-language priority and invalid saved-language fallback.
- Verified migration of the untouched legacy layout, preservation of customized layouts/widget spans and other saved data, and idempotence of the migration.
- Verified the localized no-service carrier label in airplane mode.
- Ran JavaScript syntax checks and `git diff --check`.

Not claimed: exhaustive testing of every app action, real Android rendering equivalence, mobile touch-device testing, accessibility conformance, production deployment or complete ICS fidelity.

## Primary references

All AOSP references use tag `android-4.0.4_r2.1`.

- [Android 4.0 official feature overview](https://developer.android.com/about/versions/android-4.0-highlights) — historical UI and interaction context.
- [Launcher2 default workspace](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/res/xml/default_workspace.xml) and [portrait launcher](https://android.googlesource.com/platform/packages/apps/Launcher2/+/refs/tags/android-4.0.4_r2.1/res/layout-port/launcher.xml).
- [SystemUI colors](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/packages/SystemUI/res/values/colors.xml), [tracking layout](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/packages/SystemUI/res/layout/status_bar_tracking.xml), [expanded shade](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/packages/SystemUI/res/layout/status_bar_expanded.xml) and [PhoneStatusBar](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/packages/SystemUI/src/com/android/systemui/statusbar/phone/PhoneStatusBar.java).
- [CarrierLabel](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/packages/SystemUI/src/com/android/systemui/statusbar/policy/CarrierLabel.java) and [framework strings](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/core/res/res/values/strings.xml).
- [Lock-screen target arrays](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/core/res/res/values/arrays.xml) and [framework themes](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-4.0.4_r2.1/core/res/res/values/themes.xml).
- [Settings headers](https://android.googlesource.com/platform/packages/apps/Settings/+/refs/tags/android-4.0.4_r2.1/res/xml/settings_headers.xml), [Wi-Fi](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.0.4_r2.1/src/com/android/settings/wifi/WifiSettings.java), [Bluetooth](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.0.4_r2.1/src/com/android/settings/bluetooth/BluetoothSettings.java) and [Android-version tap handling](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-4.0.4_r2.1/src/com/android/settings/DeviceInfoSettings.java).
- [Calendar widget dimensions](https://android.googlesource.com/platform/packages/apps/Calendar/+/refs/tags/android-4.0.4_r2.1/res/xml/appwidget_info.xml), [Music widget dimensions](https://android.googlesource.com/platform/packages/apps/Music/+/refs/tags/android-4.0.4_r2.1/res/xml/appwidget_info.xml), [DeskClock widget](https://android.googlesource.com/platform/packages/apps/DeskClock/+/refs/tags/android-4.0.4_r2.1/res/xml/analog_appwidget.xml).
- [Contacts dialpad](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/layout/dialpad_fragment.xml), [Mms sent row](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/layout/message_list_item_send.xml), [Mms received row](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/layout/message_list_item_recv.xml), [DeskClock](https://android.googlesource.com/platform/packages/apps/DeskClock/+/refs/tags/android-4.0.4_r2.1/res/layout/desk_clock.xml).

Resource licenses and conversion notes are in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
