# Android Simulator

An interactive browser simulator inspired by classic Android releases. Choose a version on the landing page. **Android 4.0.4 Ice Cream Sandwich** is available, and **Android 4.3 Jelly Bean** is in progress. Planned versions are Gingerbread 2.3.7, KitKat 4.4.4, and Lollipop 5.1.1.

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
- Drag to rearrange home screen and dock icons. The original item hides while dragged, a blue outline marks where it will land, and it settles into place when released. Hold a dragged item at a screen edge to change pages, or drop it on Remove to delete its shortcut. Long-press an app drawer icon to add a home screen shortcut, or drop it on App info to open its Settings page. The Home button returns to the center page; swiping and the mouse wheel change pages without a 3D transition.
- Create folders by dragging one app shortcut onto another, on the home screen or in the dock. Tap a folder to open it, edit its name at the bottom, reorder its icons, or drag an icon outside to extract it. While an icon is dragged inside an open folder, the other icons slide aside in real time. Folders hold up to 16 shortcuts; extracting the penultimate icon restores the remaining app as a standalone shortcut. Names, contents and positions persist. Existing Google folders migrate automatically.
- Long-press an empty home-screen cell to choose from eleven original AOSP wallpapers or a Gallery image. The widget drawer includes the original analog clock artwork, a working 4 × 1 Power control widget, and source-based Calendar, Music and Photo Gallery widgets. Calendar lists the next seven days with day headers, all-day rows and the current event highlighted; tapping the header opens Calendar and an event opens its details. Music shows the current song with play/pause and next. Photo Gallery asks for one picture, an album or all pictures shuffled; stacks change with a vertical swipe, the mouse wheel or arrow keys, and tapping a picture opens it in Gallery. The event list and photo stack keep long-press for moving the widget. Widgets and shortcuts occupy the same 4 × 4 grid. Existing customized layouts are preserved when upgrading.
- Lock screen with camera on the left and unlock on the right. As on ICS, the handle moves freely inside the ring and snaps onto a target. Chevrons point toward unlock, and the handle glides back when released elsewhere. While Music is active, the keyguard's album-art transport controls replace the clock. The notification shade uses the AOSP black tracking color, a carrier label, and a bottom drag handle. Notifications and recent apps follow horizontal dismissal gestures. Recent apps resume their previous subpage.
- Settings with simulated Wi-Fi network connection, addition and forgetting, Bluetooth discovery, pairing and device naming, switches, brightness, and wallpaper selection. Grab and drag the Settings list with a mouse to scroll it; a short click still opens a row. Tap **Settings → About phone → Android version** three times within half a second to open the easter egg, then hold the Android figure: as in PlatLogoActivity it jumps to 1.25×, 2×, 3.25× and 5×, then Nyandroid starts, with 20 flying androids sized by depth over twinkling pixel stars. Tap **Build number** seven times to reveal Developer options (a requested deviation from ICS, where these options were visible by default).
- Additional Settings screens for saved volume/ringtone/silent-mode choices, touch feedback preferences, font size and sleep timeout. The visible simulator locks after the selected idle interval. Data usage, storage and battery pages display illustrative statistics and drill-downs. Apps has Downloaded/Running/All tabs, per-app information, simulated cache clearing, force stop and confirmed local data reset.
- Date/time settings with automatic or manual time, time zone, 12/24-hour clock and date format. The simulated clock drives the status bar, lock screen, clock widgets, DeskClock and in-page alarms. Owner text and None/Slide/Pattern/PIN/Password lock selection are saved.
- Under **Settings → Security → Screen lock**, choose a pattern, PIN or password and confirm it twice. Changing an existing lock requires its current code. Patterns fill skipped middle dots; PINs use 4–16 digits; passwords use 4–16 printable ASCII characters including a letter. Five incorrect attempts pause entry for 30 seconds. Credentials are stored as salted hashes, and configured locks remain active after reload. This is a local demo lock, not protection for browser data; use test codes. The header reset button remains available if a code is forgotten and clears all simulator data. Credential setup requires HTTPS or localhost for Web Crypto.
- Hotspot configuration, Bluetooth tethering state, saved VPN demo profiles, APN editing/selection, network-operator selection and Wi-Fi sleep preference. No real connections are created and entered network passwords are discarded.
- Offline Browser with an ICS-style phone toolbar, tab overview, independent back/forward histories, persistent tabs, bookmarks, saved sample pages and find-on-page highlighting. Linked fictional articles expand the local demo web.
- People with Groups, All contacts and Favorites tabs, alphabetic lists, search, contact details, creation/editing/deletion, group membership and simulated call/message/email actions. Contact removal preserves conversations under the phone number.
- A 2012-inspired Play Store demo with eight sample listings, categories, search, charts, app details, previews, and locally saved star ratings. Open it from the app drawer, its Shop shortcut, or the Google folder. Existing simulator apps open directly; fictional games provide previews. Nothing is downloaded or installed.
- DeskClock with the original AndroidClock font, wallpaper-backed clock face, dim mode, dark alarm list and Holo checkboxes. Edit alarm time, weekdays, ringtone choice, vibration preference and label; save or cancel edits. In-page alerts support dismissal and a ten-minute snooze while the simulator is running. Ringtone and vibration choices are stored demo settings; there is no sound/vibration playback or closed-tab alarm service.
- Camera with original ICS shutter/control artwork, full-screen preview, simulated front/back cameras, focus feedback, zoom, white balance and exposure. Captures are local vector illustrations; no camera permission or hardware access is used.
- Dark Gallery albums, image grid, filmstrip, mouse/touch swiping, keyboard navigation, zoom, slideshow, persistent rotation, details, confirmed deletion, wallpaper selection and sharing into a local Messaging draft. Existing photos remain compatible.
- Calendar with a light ICS action bar, Day/Week/Month/Agenda views, date navigation and mouse/touch swiping. Create, edit, search and delete local events, including all-day and multi-day entries, location and notes. Events can repeat daily, on weekdays, weekly, monthly (by date or by Nth weekday) or yearly. Repeating events can be changed or deleted for one occurrence, for that occurrence and later ones, or for the whole series. A reminder posts a Calendar notification while the simulator is open; tapping it opens the event. Overlapping timed events use separate columns. Data and the chosen view persist.
- AOSP Music library with Artists, Albums, Songs and Playlists, original artwork, a local queue, seeking, shuffle and repeat modes. Custom playlists and playback preferences persist. Sample tracks have no audio.
- Email with an ICS light action bar, Inbox/Starred/Drafts/Sent/Trash folders, read/unread status, selection, stars and search. Drafts autosave; local reply/forward supports Cc/Bcc and Gallery pictures. Sending only moves the message into the local Sent folder. Trash is recoverable.
- Sample functionality for Phone, People, Messaging and Calculator.
- **Live wallpapers** from the Galaxy Nexus AOSP build: Galaxy, Grass, Nexus, Polar clock (with its settings and colour palettes), Water, and the music visualizations Waveform, Spectrum, VU meter and Many. The visualizations react while the Music app plays and show their idle animations otherwise. They are redrawn from their RenderScript sources: WebGL for Galaxy and Water, canvas for the others. Choose them under *Live Wallpapers* in the wallpaper chooser, preview them, and set them. They follow the home-screen scroll, and taps on Nexus and Water start pulses and ripples.
- On a first run (or after a reset) the launcher shows its original **clings**: "Make yourself at home" with the circle around the all apps button, "Choose some apps" with the hand in the drawer, and "Organize your apps with folders" in the first opened folder. Touches inside the circle or the folder still go through.
- Volume keys (the speaker buttons in the header or the side rocker on the phone) open the volume panel for the ringer, for music while it plays, or for the call. Drag its slider; lowering the ringer past the last step switches to vibrate.
- Hold the power button (the ⏻ key in the header or the side key on the phone) for the **power menu**: Power off, Airplane mode and the Ringer off / vibrate / on row. Powering off shows "Shutting down…", and pressing power again plays the AOSP ANDROID boot animation. The status bar shows the vibrate, silent and alarm icons.
- Customization and sample data are saved in `localStorage`. The reset button in the upper-right corner clears the simulator's local state.
- Opening and closing apps, moving within an app, switching tasks, opening the app drawer, unlocking and opening folders use the original Android 4.0.4 animation timings. **Settings → Developer options** has the ICS window and transition animation scales, including Animation off.
- English, Hungarian, German, French, and Spanish UI. On first launch, the simulator uses the browser language when supported and falls back to English otherwise. Change the language in the header or under **Settings → Language & input**.

This is a browser simulation, not an Android runtime. It cannot run APKs. Calls, web pages, camera, music, and email use local demo content and do not connect to real services.

The simulator is **not yet a complete visual reproduction**. The launcher and SystemUI have been compared against Android 4.0.4 sources; several app interiors still use demo layouts. The [visual audit](docs/visual-audit.md) lists the verified changes, remaining differences, and browser checks. The default simulated carrier is Telekom; airplane mode displays the localized “No service.” label. Wi-Fi passwords are not saved.

## Jelly Bean 4.3 (in progress)

`versions/4.3/` starts from the ICS simulator and is being converted to Android 4.3 (Galaxy Nexus build JWR66Y, AOSP tag `android-4.3_r1.1`). It keeps its own saved data, separate from ICS. Done so far:

- About phone reports Android 4.3, JWR66Y and a 4.3-era baseband/kernel (illustrative values).
- Developer options are hidden, as from Android 4.2. Tapping Build number counts down from the fourth tap (“You are now 3 steps away…”) and unlocks the menu on the seventh. Later taps reply “No need, you are already a developer.”
- The 4.3 easter egg: tap Android version three times quickly. The jelly bean (`platlogo_alt`) appears over the wallpaper; a tap shows the “Android 4.3 / JELLY BEAN” toast and the bean gets a face. Long-press opens the SystemUI **BeanBag**, with 40 color-tinted beans (and a rare candy cane) that drift and spin and can be grabbed and flung.

- Jelly Bean notification panel. The header has a large clock and date, Clear all (rows slide out one after another) and the settings button, which flips the panel to **Quick Settings** (also opened by pulling down with two fingers). Tiles: Me, Brightness (dialog with AUTO), Settings, Wi-Fi, mobile signal, battery, airplane mode, Bluetooth, plus Alarm and Location when relevant. Long-press Wi-Fi or Bluetooth to toggle them. Notifications expand and collapse with a two-finger swipe or a trackpad pinch. Calendar reminders offer **Snooze** (5 minutes).

- Jelly Bean slide lock: the AndroidClock clock, uppercase date and next alarm sit in a swipeable widget pager. Swipe right to the **+** page to add a Calendar or Digital clock widget (long-press a widget and drag it up to Remove), and swipe left to the camera page to open Camera. The GlowPad dot cloud glows around your finger; drag the lock to the ring in any direction to unlock, and a wave ripples out after a miss. While Music is active its transport becomes a page. Owner info appears in the message line above the ring.

- Jelly Bean pattern, PIN and password locks: the security panel slides up over the widget pager. Drag it down to see the full widget and pull it back with the lock handle; with the panel up, swipe from the screen edge to change widgets. The PIN pad shows the ABC…WXYZ letters, and wrong entries show “Wrong PIN” (or Pattern/Password) for five seconds. Tapping a widget or **+** while locked dims the pager, shrinks the widget and asks for the code first; once it is entered, the widget's action runs.

- Jelly Bean home screens. When you drag an icon or widget onto occupied cells, the items there slide aside after a quarter second. Dropping right on an icon's centre still makes a folder. Calendar and the new **Digital clock** widget (3 × 2) show the resize frame after being dropped; drag a handle to change the span in whole cells, and neighbours move out of the way. Spans are saved.

- The 4.2/4.3 **Clock** has Timer | Clock | Stopwatch tabs (tap or swipe). The Clock page shows bold hours with thin minutes, the date and the next alarm; the alarm button opens the existing alarm list. Timers are set on a keypad and counted down on the CircleTimerView (stop/start, +1 minute, delete, several timers); a finished timer posts “Time's up”. The stopwatch records laps and can share them to Messaging.

- Jelly Bean artwork: the 4.3 launcher icons (new Clock, Camera, Gallery and People icons), the Jelly Bean wallpaper set with the bokeh default, the translucent 4.3 search bar, and the 4.2 analog and digital clock widgets (bold hours, thin minutes).

- Jelly Bean animations: apps grow out of the icon you tap (home screen, dock, folders and the drawer), switching apps slides the windows past each other as shrinking cards, and screens inside an app zoom in from 0.8, using the Android 4.3 animation values.

- 4.3 **Wi-Fi** settings: WPS and Add network in the action bar, and WPS Pin Entry and **Wi-Fi Direct** in the overflow. The WPS dialog has its two-minute timeout bar. Advanced Wi-Fi adds Scanning always available, Avoid poor connections, the frequency band, Install certificates and Wi-Fi optimization.
- The 4.3 **power menu** adds the safe-mode reboot (hold Power off; the phone then boots with the *Safe mode* watermark) and, when Developer options → Power menu bug reports is on, a Bug report entry.
- The 4.3 **Dialer** smart dial: typing on the dialpad shows the three best matching contacts (by name on the letter keys or by number) above the keypad, and the call button spans the full width.
- The 4.3 **Developer options** list with its ON/OFF switch. Show layout bounds, Pointer location and Show CPU usage draw their overlays; the animation scales drive the window animations.

- Jelly Bean Recents over the wallpaper: the app shrinks into its thumbnail, a long press offers Remove from list and App info, and tasks open by growing out of their thumbnails. Swipe up from the navigation bar for the search ring and release on the target to search.

- The 4.2/4.3 **Gallery**: albums and pictures in sideways-scrolling grids, grouped by Albums, Locations, Times, People or Tags. In the photo view the bars fade away. Pinch (or Ctrl + scroll) into film mode, where a picture flung upwards is deleted (with UNDO). From the Camera, swipe into your newest shot and back. **Edit** opens the Photo Editor with ten looks, borders, rotate/mirror and colour sliders; saving keeps the original.

- The 4.2/4.3 **Camera**: hold the preview to open the arc-shaped pie menu (or tap the menu button in the corner) and drag or tap through Exposure, More options, Flash and the camera switch; More options holds location, countdown timer, picture size, white balance and scene mode. Tap to focus, scroll or pinch to zoom, and swipe left for Gallery. After a capture the photo shrinks to a thumbnail in the corner. The mode switcher offers photo, video (simulated recording) and panorama.

- 4.3 Settings: the 4.3 header order with **Location access** (master switch plus GPS and network sources) and an ACCOUNTS section. Display adds **Daydream** with Clock (a dimmed clock that moves each minute), Colors and Photo Frame, **Start now** and **When to daydream**. Security adds Verify apps and Notification access, and About phone shows the SELinux status.

The new screens have been checked in all five languages at phone sizes. The status bar icons were compared with SystemUI 4.3 and are byte-identical to the ICS ones, so they are kept. Progress and references are in [docs/visual-audit-4.3.md](docs/visual-audit-4.3.md).

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
node tests/launcher-folders.test.cjs
node tests/lockscreen.test.cjs
```

For AOSP asset sources and licenses, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). For comparisons with the original Android interface and remaining visual differences, see [docs/visual-audit.md](docs/visual-audit.md).

### Phone and Calculator

The Phone dialpad uses original ICS assets and includes contact search, favorite tiles and a locally saved outgoing call log with duration and call/message actions. Its simulated call screen has the original contact placeholder and controls, a running timer, keypad, mute, speaker and hold states. Home keeps the call active; its notification returns to the call. Reload ends the temporary call. There is no telephony, audio, conference calling or incoming-call simulation. The Calculator has the original basic/scientific key arrangements; drag horizontally or use its menu to switch panels. Functions use radians. Backspace deletes a character, Delete clears the display, and Up/Down recall saved expressions.

Run the expression checks with `node tests/calculator-engine.test.cjs`. Visual fidelity limits and browser verification are tracked in [the audit](docs/visual-audit.md).

### Messaging

The Messaging app follows the ICS Mms layout: a dark action bar, a bottom toolbar on the conversation list, square contact pictures, and white incoming/outgoing message rows. Search conversations, select a contact by name or enter a phone number, and send local sample messages. Drafts and messages survive reloads. The composer counts GSM/Unicode SMS segments and supports sample Gallery picture attachments.

Open message options by tapping, holding, or right-clicking a message to forward it, inspect its details, or delete it. The conversation menu also offers smileys, draft discard, and conversation deletion with confirmation. Calls open the simulator's Phone app. There is no real SMS/MMS transmission; group messaging, delivery reports and the original Android keyboard are not implemented.
