# Android Simulator

An interactive browser simulator inspired by classic Android releases. Choose a version on the landing page; **Android 4.0.4 Ice Cream Sandwich** is currently available. Planned versions are Gingerbread 2.3.7, Jelly Bean 4.3, KitKat 4.4.4, and Lollipop 5.1.1.

## Getting started

**Live demo:** [Android Simulator on GitHub Pages](https://szabolevi98.github.io/android-simulator/).

GitHub Pages publishes the repository root from the `main` branch automatically after each push. The `.nojekyll` file keeps this plain static site out of Jekyll processing. Deployment progress is available in the repository's **Actions** tab, and the publishing source is configured under **Settings → Pages**.

The project uses static HTML, CSS, and JavaScript. No installation or build step is required. Open `index.html`, or start a local server from the project root:

```bash
php -S 127.0.0.1:8090 -t .
```

Then visit `http://127.0.0.1:8090/`. With XAMPP, place the repository in `htdocs/android-simulator`.

## Ice Cream Sandwich features

- Five home screens with mouse and touch swiping, a paged Apps/Widgets drawer, and a dock. Shortcuts and widgets share an invisible grid.
- Drag to rearrange home screen and dock icons. Hold a dragged item at a screen edge to change pages, or drop it on Remove to delete its shortcut. Long-press an app drawer icon to add a home screen shortcut. The Home button returns to the center page; swiping and the mouse wheel change pages without a 3D transition.
- Long-press an empty home-screen cell to choose from eleven original AOSP wallpapers or a Gallery image. The widget drawer includes the original analog clock artwork, a working 4 × 1 Power control widget, and simplified Calendar, Music, and Photo frame widgets. Widgets and shortcuts occupy the same 4 × 4 grid. Existing customized layouts are preserved when upgrading.
- Lock screen with camera on the left and unlock on the right. The notification shade uses the AOSP black tracking color, a carrier label, and a bottom drag handle. Notifications and recent apps follow horizontal dismissal gestures. Recent apps resume their previous subpage.
- Settings with simulated Wi-Fi network connection, addition and forgetting, Bluetooth discovery, pairing and device naming, switches, brightness, and wallpaper selection. Grab and drag the Settings list with a mouse to scroll it; a short click still opens a row. Tap **Settings → About phone → Android version** three times within half a second to open the easter egg, then hold the Android figure to start Nyandroid. Tap **Build number** seven times to reveal Developer options (a requested deviation from ICS, where these options were visible by default).
- Additional Settings screens for saved volume/ringtone/silent-mode choices, touch feedback preferences, font size and sleep timeout. The visible simulator locks after the selected idle interval. Data usage, storage and battery pages display illustrative statistics and drill-downs. Apps has Downloaded/Running/All tabs, per-app information, simulated cache clearing, force stop and confirmed local data reset.
- Date/time settings with automatic or manual time, time zone, 12/24-hour clock and date format. The simulated clock drives the status bar, lock screen, clock widgets, DeskClock and in-page alarms. Owner text and None/Slide lock selection are saved.
- Hotspot configuration, Bluetooth tethering state, saved VPN demo profiles, APN editing/selection, network-operator selection and Wi-Fi sleep preference. No real connections are created and entered network passwords are discarded.
- Offline Browser with an ICS-style phone toolbar, tab overview, independent back/forward histories, persistent tabs, bookmarks, saved sample pages and find-on-page highlighting. Linked fictional articles expand the local demo web.
- People with Groups, All contacts and Favorites tabs, alphabetic lists, search, contact details, creation/editing/deletion, group membership and simulated call/message/email actions. Contact removal preserves conversations under the phone number.
- A 2012-inspired Play Store demo with eight sample listings, categories, search, charts, app details, previews, and locally saved star ratings. Open it from the app drawer, its Shop shortcut, or the Google folder. Existing simulator apps open directly; fictional games provide previews. Nothing is downloaded or installed.
- DeskClock with the original AndroidClock font, wallpaper-backed clock face, dim mode, dark alarm list and Holo checkboxes. Edit alarm time, weekdays, ringtone choice, vibration preference and label; save or cancel edits. In-page alerts support dismissal and a ten-minute snooze while the simulator is running. Ringtone and vibration choices are stored demo settings; there is no sound/vibration playback or closed-tab alarm service.
- Camera with original ICS shutter/control artwork, full-screen preview, simulated front/back cameras, focus feedback, zoom, white balance and exposure. Captures are local vector illustrations; no camera permission or hardware access is used.
- Dark Gallery albums, image grid, filmstrip, mouse/touch swiping, keyboard navigation, zoom, slideshow, persistent rotation, details, confirmed deletion, wallpaper selection and sharing into a local Messaging draft. Existing photos remain compatible.
- Calendar with a light ICS action bar, Day/Week/Month/Agenda views, date navigation and mouse/touch swiping. Create, edit, search and delete local events, including all-day and multi-day entries, location and notes. Overlapping timed events use separate columns. Data and the chosen view persist.
- AOSP Music library with Artists, Albums, Songs and Playlists, original artwork, a local queue, seeking, shuffle and repeat modes. Custom playlists and playback preferences persist. Sample tracks have no audio.
- Email with an ICS light action bar, Inbox/Starred/Drafts/Sent/Trash folders, read/unread status, selection, stars and search. Drafts autosave; local reply/forward supports Cc/Bcc and Gallery pictures. Sending only moves the message into the local Sent folder. Trash is recoverable.
- Sample functionality for Phone, People, Messaging and Calculator.
- Customization and sample data are saved in `localStorage`. The reset button in the upper-right corner clears the simulator's local state.
- English, Hungarian, German, French, and Spanish UI. On first launch, the simulator uses the browser language when supported and falls back to English otherwise. Change the language in the header or under **Settings → Language & input**.

This is a browser simulation, not an Android runtime. It cannot run APKs. Calls, web pages, camera, music, and email use local demo content and do not connect to real services.

The simulator is **not yet a complete visual reproduction**. The launcher and SystemUI have been compared against Android 4.0.4 sources; several app interiors still use demo layouts. The [visual audit](docs/visual-audit.md) lists the verified changes, remaining differences, and browser checks. The default simulated carrier is Telekom; airplane mode displays the localized “No service.” label. Wi-Fi passwords are not saved.

## Adding a version

1. Create a `versions/<version>/` directory with its own `index.html`, CSS, JavaScript, and assets.
2. Add an entry to `versions/catalog.js` with `status: 'available'` and a `url` pointing to the new directory.

Each version keeps its interface and saved state separate, so adding a release does not change the ICS simulation.

## Checks

```bash
node --check app.js
node --check i18n.js
node --check versions/catalog.js
node --check versions/4.0.4/simulator.js
node --check versions/4.0.4/play-store.js
node --check versions/4.0.4/messaging.js
node tests/messaging.test.cjs
node tests/people-browser.test.cjs
node tests/desk-clock.test.cjs
node tests/media.test.cjs
node tests/calendar.test.cjs
node tests/music.test.cjs
node tests/email.test.cjs
node tests/settings-detail.test.cjs
node tests/phone-call.test.cjs
node tests/settings-system.test.cjs
```

For AOSP asset sources and licenses, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). For comparisons with the original Android interface and remaining visual differences, see [docs/visual-audit.md](docs/visual-audit.md).

### Phone and Calculator

The Phone dialpad uses original ICS assets and includes contact search, favorite tiles and a locally saved outgoing call log with duration and call/message actions. Its simulated call screen has the original contact placeholder and controls, a running timer, keypad, mute, speaker and hold states. Home keeps the call active; its notification returns to the call. Reload ends the temporary call. There is no telephony, audio, conference calling or incoming-call simulation. The Calculator has the original basic/scientific key arrangements; drag horizontally or use its menu to switch panels. Functions use radians. Backspace deletes a character, Delete clears the display, and Up/Down recall saved expressions.

Run the expression checks with `node tests/calculator-engine.test.cjs`. Visual fidelity limits and browser verification are tracked in [the audit](docs/visual-audit.md).

### Messaging

The Messaging app follows the ICS Mms layout: a dark action bar, a bottom toolbar on the conversation list, square contact pictures, and white incoming/outgoing message rows. Search conversations, select a contact by name or enter a phone number, and send local sample messages. Drafts and messages survive reloads. The composer counts GSM/Unicode SMS segments and supports sample Gallery picture attachments.

Open message options by tapping, holding, or right-clicking a message to forward it, inspect its details, or delete it. The conversation menu also offers smileys, draft discard, and conversation deletion with confirmation. Calls open the simulator's Phone app. There is no real SMS/MMS transmission; group messaging, delivery reports and the original Android keyboard are not implemented.
