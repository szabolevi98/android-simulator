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
- Offline sample pages and search in the browser, with tabs, bookmarks, and history.
- A 2012-inspired Play Store demo with eight sample listings, categories, search, charts, app details, previews, and locally saved star ratings. Open it from the app drawer, its Shop shortcut, or the Google folder. Existing simulator apps open directly; fictional games provide previews. Nothing is downloaded or installed.
- Sample functionality for Phone, People, Messaging, Camera, Gallery, Calendar, Clock, Calculator, Music, and Email.
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
```

For AOSP asset sources and licenses, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). For comparisons with the original Android interface and remaining visual differences, see [docs/visual-audit.md](docs/visual-audit.md).

### Phone and Calculator

The Phone dialpad uses original ICS assets and includes contact search and a locally saved outgoing call log. The Calculator has the original basic/scientific key arrangements; drag horizontally or use its menu to switch panels. Functions use radians. Backspace deletes a character, Delete clears the display, and Up/Down recall saved expressions.

Run the expression checks with `node tests/calculator-engine.test.cjs`. Visual fidelity limits and browser verification are tracked in [the audit](docs/visual-audit.md).
