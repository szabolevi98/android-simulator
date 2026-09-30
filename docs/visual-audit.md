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
| App drawer | Labels are sorted in the selected language. Original app icons, Apps/Widgets tabs, 4×5 app grid, widget span labels and two widget pages. | There are 13 apps including the Play demo, so Apps has one page. Widget previews and drawer transitions remain approximations; Apps paging across multiple pages has not been exercised. |
| Recents | Existing swipe movement checked. Returning to a recent app restores its subpage and outer scroll position. Empty panel dismisses on tap. | Previews are scaled DOM copies, not Android screenshots; nested scroll positions and every app's state are not fully captured. |
| Lock screen | Corrected to camera on the **left**, unlock on the **right**, matching the framework target array. A tap shows the targets without unlocking. Carrier text matches the shade. | Ripple/target animations, music controls and secure lock methods are incomplete. |
| Easter egg and toast | Original toast frame resource replaces the improvised translucent rounded panel. Android-version activation is three taps within 500 ms, as in `DeviceInfoSettings.java`. Original platlogo/Nyandroid artwork remains. | Nyandroid motion/hold timing is a browser approximation. Long-press animation was not reverified in this audit's browser input tests. |
| Languages and landing preview | New labels translated into EN/HU/DE/FR/ES. Calendar uses locale-specific month/weekdays and local dates. Landing-page clock now uses the same original images as the launcher. CSS/JS cache versions advanced. | Sample messages, mail, contacts and offline pages contain English demo content. This is not a complete import of Android's translation resources. |

Existing user-customized desktops are preserved. Only an exact match for the previous untouched demo layout is migrated to the corrected default. Legacy saved widgets retain their previous spans so the update does not silently enlarge them over shortcuts.

## Application interiors: still requiring reconstruction

Every listed app was opened in the browser and checked for missing images, horizontal overflow and console errors. These checks passed. Visual inspection found the following gaps:

| App | Current mismatch / next required work |
| --- | --- |
| Phone | Dialpad now uses original key images, texture, tabs and bottom actions with the source 20/65/15 proportions. Search, add-to-contact handoff and persistent outgoing call log work. Favorites/contact list, log details and the in-call screen remain simplified; voicemail, pause/wait dialing and full call settings are not implemented. |
| People | Replaced with source-informed lists, tabs and photo header; see the People and Browser section below. Favorites now use photo tiles; custom contact photos, multi-value fields and account synchronization remain incomplete. |
| Messaging | Reconstructed from the Mms layouts; see the Messaging section below. Browser typography, menus and attachment selection remain approximations; no group messages, delivery reports or Android keyboard. |
| Browser | Phone toolbar and tab/library controls reconstructed; see below. Tab previews now render inert scaled copies of the bundled page content; the web content remains fictional. |
| Camera | Viewfinder and controls are generic placeholders. Match original Camera controls while keeping a local mock preview and capture result. |
| Gallery | Uses a generic white grid of demo pictures rather than the original album/filmstrip/detail navigation. |
| Clock | Reconstructed clock face, alarm list and preferences; see the DeskClock follow-up below. Sound/vibration playback, full alarm settings and background/closed-tab delivery remain unimplemented. |
| Calendar | Localized month grid works, but the original action bar, day/week/month/agenda modes and event editor are incomplete. |
| Calculator | Rebuilt basic and advanced portrait panels from original XML, including original key frames, DEL/CLR row and display proportions. Drag paging, menu switching, expression precedence, radians, powers, factorials, roots, keyboard deletion and persisted history work. Numeric precision uses JavaScript with 12 significant digits rather than the original Arity engine; history navigation uses keyboard Up/Down rather than the Android display gesture. |
| Music | Generic artwork/control layout; library tabs, queue and original player view remain missing. The widget is also an approximation. |
| Email | Letter avatars, floating compose action and generic message/list layout need original Email action bars and list/detail views. |
| Settings detail pages | Data usage, battery chart, storage, installed-app management, volumes/ringtone/sleep and several security/accessibility options remain simplified. Some rows are informational placeholders. About-phone baseband/kernel values are illustrative and have not been verified against a specific factory image. |

The seven-tap Build-number Developer-options unlock is retained **at the owner's explicit request**. Stock ICS exposes Developer options by default; hiding it behind Build-number taps belongs to later Android releases.

## Phone and Calculator follow-up

![Phone and both Calculator panels](screenshots/ics-phone-calculator.png)

The follow-up uses the [Contacts dialpad layout](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/layout/dialpad.xml), [dialpad dimensions](https://android.googlesource.com/platform/packages/apps/Contacts/+/refs/tags/android-4.0.4_r2.1/res/values/dimens.xml), and Calculator's [portrait main layout](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/layout-port/main.xml), [basic pad](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/layout-port/simple_pad.xml), [advanced pad](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/layout-port/advanced_pad.xml) and [styles](https://android.googlesource.com/platform/packages/apps/Calculator/+/refs/tags/android-4.0.4_r2.1/res/values/styles.xml).

Verified in the browser: entering a phone number, ending a simulated call, history persistence across reload, formatted-number contact matching, returning a history number to the pad, and searching contacts. Calculator: `2+3×4=14`, dragging to the advanced panel, `sin(π÷2)=1` with an omitted closing parenthesis, Back returning to the basic panel, Backspace deleting rather than exiting, and Up recalling the last expression. The Calculator menu was also checked in all five languages with no horizontal overflow, and the add-to-contact editor handoff was exercised. No captured JavaScript errors. The isolated evaluator tests cover 19 valid expressions and 8 invalid inputs.

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

## Mobile browser gesture correction

- Suppress the browser image/context menu inside the simulated screen, with editable fields retaining their normal text menus. Images no longer receive pointer targeting; their parent buttons handle interaction.
- Give the status/navigation bars and launcher/drawer custom gesture ownership with `touch-action: none`. Keep native vertical scrolling in application lists and contain scroll chaining. A scoped, non-passive touchmove fallback protects simulator-owned gestures on WebKit.
- Capture an active icon drag on the persistent screen before replacing the drawer DOM.
- Remove the desktop minimum workspace height from the mobile layout, keep the page within the dynamic viewport, and suppress document overscroll.
- Browser verification at 390×844 and 390×650: document height equals viewport height; shade drag opens while page scroll stays zero; icon context-menu action stays inside the simulator; Settings can still be dragged to its bottom (scrollTop 292) without moving the document. JavaScript syntax and whitespace checks passed.

These are desktop browser checks at mobile viewport sizes. Physical Android/iOS long-press and browser pull-to-refresh were not directly exercised by the available input tool.

## Play Store demo — 2026-09-29

The storefront uses the early Play era's dark textured header, lime accents, compact light lists and promotional tiles. Historical context comes from [Google's March 2012 launch announcement](https://android.googleblog.com/2012/03/introducing-google-play-all-your.html); the My apps list was visually compared with the [contemporary Play 3.5.15 screenshot](https://www.droid-life.com/2012/03/15/new-google-play-store-3-5-15-rolling-out-shows-up-to-date-apps-previous-installs-and-more/).

This is an approximate, interactive storefront, not a pixel-exact reconstruction of Google's proprietary app. Eight sample listings include six existing simulator apps and two fictional games with illustration previews. Ratings, reviews, sizes and download counts are sample data. There is no account, purchase, installation or external catalog access. Personal star ratings are saved locally; existing apps can be opened directly.

Browser checks passed for the drawer icon and Shop shortcut, category filtering, localized search, an escaped no-result query, preview paging/back navigation, rating persistence after reload, My apps, opening Calculator, and returning to its Play detail through Recents. The Games category header was corrected during testing. Mouse dragging scrolls the nested Play content without opening a row or moving the document.

At a 390×650 viewport, all five language variants showed translated tabs, no horizontal content overflow, no document overflow, and no broken storefront images. Desktop and mobile-size views were visually inspected; browser error logs were empty. Physical touch-device behavior was not tested.

![Play storefront and sample app detail](screenshots/ics-play-store.png)

## Messaging reconstruction — 2026-09-29

Sources at AOSP tag `android-4.0.4_r2.1`:

- [Manifest](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/AndroidManifest.xml) and [styles](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/values/styles.xml): Holo.Light.DarkActionBar and the conversation list's split action bar on narrow screens.
- [Conversation list item](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/layout/conversation_list_item.xml), [list menu](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/menu/conversation_list_menu.xml), [compose layout](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/layout/compose_message_activity.xml), and the sent/received row sources linked above.
- [Colors](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/values/colors.xml), [dimensions](https://android.googlesource.com/platform/packages/apps/Mms/+/refs/tags/android-4.0.4_r2.1/res/values/dimens.xml) and `QuickContactDivot.java`: gray history background, white message blocks, 64dp square message avatars and the original small pointers over the avatars.

The floating compose button, round letter avatars and colored bubbles were replaced. Original compose/search/call/attachment/send icons and default contact pictures are included. Functional additions include recipient suggestions, arbitrary phone numbers, conversation search, persistent drafts, GSM/Unicode segment counts, sample picture attachments, forwarding, details, smileys and confirmed deletion. Existing numeric contact references and saved messages remain readable. Recents restores the nested message scroll container; desktop mouse dragging also scrolls it.

Browser checks covered draft persistence after reload, sending to an existing contact and a new phone number, invalid recipient handling, picture-only sending, message deletion, searching message text and returning to search, forwarding, Unicode counting, details, right-click options, simulated calling and returning through Recents. All five languages were checked at 390×650: translated input labels, no horizontal/document overflow, no broken images or logged browser errors. Unit checks cover segment boundaries, extended GSM characters, Unicode/emoji, contact normalization, legacy numeric/string thread references, draft sorting, search and HTML escaping.

Limits: menus expose a functional subset of Mms; attachments use the simulator's illustrated Gallery, and a tap also opens message options as a mouse/keyboard convenience. No group messages, real transport, delivery reports, video/audio attachments, contact photo editing or replica Android keyboard. Physical touch-device long-press and keyboard resizing were not tested. This is a source-informed browser approximation, not a pixel-exact Android rendering.

![Messaging conversation list and thread](screenshots/ics-messaging.png)

## People and Browser — 2026-09-29

Primary layout references at AOSP tag `android-4.0.4_r2.1`:

- [Contacts people_activity.xml](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-4.0.4_r2.1/res/layout/people_activity.xml), [contact detail rows](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-4.0.4_r2.1/res/layout/contact_detail_list_item.xml), and [photo header](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-4.0.4_r2.1/res/layout/carousel_about_tab.xml).
- [Browser phone navigation bar](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_browser/android-4.0.4_r2.1/res/layout/title_bar_nav.xml) and [tab card](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_browser/android-4.0.4_r2.1/res/layout/nav_tab_view.xml).

People now uses a cyan header, three tabs, alphabetic white lists, original square placeholder photos, a photo detail header and a bottom action bar. Contacts can be searched, created, edited, starred and deleted; groups can be created and edited. Changes persist locally. Removing a contact preserves its messages under the phone number. The contact overflow menu exposes editing and deletion.

Browser uses the phone address bar, original tab/close icons, an overflow menu and a tab overview. Each tab has an independent navigation stack that persists across reloads. Bookmarks, history, saved sample pages and find-on-page highlighting work with the offline site collection. Two linked fictional articles were added. Saving a page stores a reference to bundled content, not a snapshot of an external website.

Checks: contact creation, editing, favorites and persistence; group creation, membership editing and persistence; independent browser histories, tab selection/closing and persistence; bookmarks and saved-page persistence; find-on-page counts and linked article navigation. Both apps were inspected at 390×650 in all five languages: no document/content horizontal overflow or broken images; browser error logs were empty. The contact editor was also visually checked at this size. Unit tests cover filtering, conversation retention, tab-history branching, closing and restore. JavaScript syntax and whitespace checks passed.

Remaining differences: People has a simplified favorites list, single phone/email fields, default photos and no Updates/account synchronization. Browser tab previews are text summaries rather than captured page thumbnails; menus expose a subset of the Android app. Font metrics, animation and browser rendering are approximations. Physical touch devices and their keyboards were not exercised.

![People and Browser](screenshots/ics-people-browser.png)

## DeskClock, favorites and browser previews — 2026-09-30

Sources were checked against `android-4.0.4_r2.1`, using the AOSP mirror when Gitiles was unavailable:

- [DeskClock layout](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/layout/desk_clock.xml), [time/date](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/layout/desk_clock_time_date.xml), [dimensions](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/values/dimens.xml) and [DeskClock.java](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/src/com/android/deskclock/DeskClock.java): right-aligned time/date over dimmed wallpaper, next-alarm entry and dimming.
- [Alarm list](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/layout/alarm_clock.xml), [alarm row](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/layout/alarm_time.xml), [editor](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/layout/set_alarm.xml) and [preferences](https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-4.0.4_r2.1/res/xml/alarm_prefs.xml): add row above the list, a separate left checkbox column, dark Holo preferences and bottom Cancel/Delete/OK actions.
- [Contacts favorite tile](https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-4.0.4_r2.1/res/layout/contact_tile_starred.xml): square photo and translucent bottom name strip.

The previous combined clock/alarm screen, white list, pill switches and floating add action were replaced. Original AndroidClock font and DeskClock icons are included. Existing saved alarms remain compatible. The editor supports time, repeat days, label, ringtone choice and vibration preference, with draft cancellation and confirmed deletion. A local scheduler displays an in-page alert, suppresses duplicate delivery in the same minute, disables completed one-shot alarms and supports ten-minute snoozing. The clock shows the next enabled occurrence.

People favorites now use photo tiles. Browser tab previews render the actual bundled page markup at reduced size; previews are inert and the outer card handles pointer/keyboard activation. These supersede the earlier simplified-favorites and text-preview limitations documented above.

Verified: create/edit/save an alarm with repeat days, label and ringtone, persistence after reload, cancel without changing the saved alarm, time decrement wrap, in-page alarm delivery and ten-minute snooze, and disabling the test alarm. A null-draft exception found during the delivery test was fixed and covered by a regression check. Tests cover legacy defaults, invalid times, weekday normalization, next-day/week rollover, snooze timing, duplicate suppression and HTML escaping. At 390×650, the alarm editor and repeat dialog were checked in all five languages without document/dialog overflow or broken images. Favorites and scaled browser previews were visually inspected.

Limits: ringtone/vibration are saved choices only; no sound or device vibration is emitted. Delivery runs only while this page is executing and is subject to browser timer throttling; it is not a real alarm service. The alert dialog and time spinner are browser approximations. Dock settings, a moving screensaver, volume/snooze-duration settings and Android's full alarm-notification behavior remain outside this implementation. Physical touch-device behavior was not tested.

![DeskClock, alarms and alarm editor](screenshots/ics-desk-clock.png)
