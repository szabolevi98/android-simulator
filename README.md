# Android Simulator

An interactive browser simulator inspired by classic Android releases. Choose a version on the landing page; **Android 4.0.4 Ice Cream Sandwich** is currently available. Planned versions are Gingerbread 2.3.7, Jelly Bean 4.3, KitKat 4.4.4, and Lollipop 5.1.1.

## Getting started

The project uses static HTML, CSS, and JavaScript. No installation or build step is required. Open `index.html`, or start a local server from the project root:

```bash
php -S 127.0.0.1:8090 -t .
```

Then visit `http://127.0.0.1:8090/`. With XAMPP, place the repository in `htdocs/android-simulator`.

## Ice Cream Sandwich features

- Five home screens with mouse and touch swiping, a paged Apps/Widgets drawer, and a dock. Shortcuts and widgets share an invisible grid.
- Drag to rearrange home screen and dock icons. Drop an icon on a page indicator to move it to another page, or on the Remove target to delete its shortcut. Long-press an app drawer icon to add a home screen shortcut.
- Long-press an empty home-screen cell to choose from the eleven original AOSP wallpapers or a Gallery image. Add, drag, and remove 2 × 2 widgets from the Widgets drawer.
- Lock screen, notification shade, swipe-away recent apps with previews, and the three on-screen navigation buttons.
- Settings with simulated Wi-Fi networks, Bluetooth devices, switches, brightness, and wallpaper selection. Grab and drag the Settings list with a mouse to scroll it; a short click still opens a row. Tap **Settings → About phone → Android version** five times to open the period-correct easter egg, then hold the Android figure to start Nyandroid. Tap **Build number** seven times to reveal Developer options.
- Offline sample pages and search in the browser, with tabs, bookmarks, and history.
- Sample functionality for Phone, People, Messaging, Camera, Gallery, Calendar, Clock, Calculator, Music, and Email.
- Customization and sample data are saved in `localStorage`. The reset button in the upper-right corner clears the simulator's local state.
- English, Hungarian, German, French, and Spanish UI. On first launch, the simulator uses the browser language when supported and falls back to English otherwise. Change the language in the header or under **Settings → Language & input**.

This is a browser simulation, not an Android runtime. It cannot run APKs. Calls, web pages, camera, music, and email use local demo content and do not connect to real services.

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
```

For AOSP asset sources and licenses, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). For comparisons with the original Android interface and remaining visual differences, see [docs/visual-audit.md](docs/visual-audit.md).
