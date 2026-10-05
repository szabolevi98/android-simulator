# Lollipop 5.1.1 visual audit

## Google apps checked against the LMY48Y APKs (audit step 4) — 2026-10-05

`stock-strings.js` now loads on 5.1.1 too. The image's apps are precompiled (odex), so their code is read from the dex embedded in each odex (extracted from `system.raw.img`, checksum restored).
- **Google Settings (Google Play services 6.7.79):**
  - `common.Theme.GoogleSettings` (v21): a blue grey 900 toolbar and teal 500 accent, replacing the Holo bar.
  - `GoogleSettingsActivity` builds two categories (Body2, teal): Account with Google+ and Account History (the UDC flag defaults on), and Services with Ads, Connected apps, Google Fit, Play Games, Data management, Search & Now and Security. Location is appended to Services when the reporting service connects.
  - Android Device Manager now lives under Security, and Maps 9.3 no longer offers Maps & Latitude.
- **Earth 8.0.1:**
  - `common.xml`'s AppCompat Toolbar sits on `actionbar_gradient` (#cc000000 to transparent) over the globe, with the drawer toggle and "Earth". It replaces the white search box and the "‹" button.
  - `menu/main.xml` uses the app namespace: Search (always, "Example: Pizza"), My location and Share (ifRoom) fill AppCompat's three slots at 411 dp, with no overflow. After a search, Clear map takes the free slot and the other two move to the overflow.
  - The compass and Pegman sit under the bar.
  - `main.xml`'s drawer shows the account switcher (147 dp; the cover comes from the account), then the `fm` adapters' items in the dex: Maps Gallery, Google+ Photos, Layers; Settings, Feedback, Help, Tutorial.
- **News & Weather 2.2 (PrebuiltNewsWeather):**
  - AppThemeLight: the Toolbar is the #f5f5f5 window colour with 4 dp elevation, status bar #9e9e9e, accent #3367d6. It replaces the old dark Holo bar and tabs; the 5.1.1 status and Overview colours were corrected to match.
  - The bar holds Search and Add section. The overflow is what `NewsActivity.onPrepareOptionsMenu` leaves visible on Headlines (per the dex): Refresh, Edit weather display…, Change editions…, Manage sections…, Switch to dark theme. Migrate settings needs old widget settings, and Remove this section only applies to removable sections.
  - Sections are cards on `card_background_single_light`: `item_section_header.xml` and `item_story_collapsed.xml` rows with 80 dp photos, then the "More stories from …" footer.
  - Headlines opens with `item_weather.xml`: the condition picture is web-loaded, so a stand-in is used; then the temperature and the Temp. / Precip. / Wind / Humidity chart tabs.
  - The drawer lists the sections, "Add and remove sections…" and "Help & feedback".
- **Keep 3.0.03 (PrebuiltKeep):**
  - KeepAppTheme: #ffcc3f toolbar, #e59900 status bar, #e6e6e6 window. The Toolbar has the drawer toggle and Search (always); the column switch and Refresh are in the overflow.
  - `quick_edit.xml` is a floating toolbar under the bar ("Add quick note" and the four new-note buttons). Notes sit on `note_shadow`.
  - DrawerFragment adds, per the dex, Notes, Reminders, Archive and Trash, then the Help & feedback link.
  - The editor has Share, Change color, Add picture and Archive in the bar (all "always"), and Delete note, Make a copy, Send and Show checkboxes in the overflow.
- **Maps 9.3.0:**
  - `base_main_internal.xml` (v17): the search box on `omnibox.9` with the menu grabber, "Search" and the mic; the my-location button and the blue (#4285f4) directions FAB at the bottom right; the watermark at the bottom left. It replaces the KitKat-era floating search card.
  - The grabber opens `layers_menu_container.xml` from the left (white, the account switcher): Your places; Traffic, Public transit, Bicycling, Satellite, Terrain; Google Earth; Settings, Help, Send feedback.
  - The search box itself is built in code, so its icons are the APK's `ic_qu_*` drawables.
