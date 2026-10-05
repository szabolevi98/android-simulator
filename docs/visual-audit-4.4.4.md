# KitKat 4.4.4 visual audit

## Google apps checked against the KTU84P APKs (audit step 4) — 2026-10-05

`stock-strings.js` now also loads on 4.4.4 (generated from the Nexus 5 image); `stock-apps.js` reads it through `S()`.
- **News & Weather 1.3.11 (GenieWidget):** the same layouts as on 4.3 at the KitKat scale: the app's TabView tabs, `news_item_layout.xml` rows, and the weather panel with the APK's weather icons and strings.
- **Earth 7.1.3:**
  - The overlay action bar replaces the search box and the "‹" button: Search and Reset to north in the bar, the rest in the overflow (as on 4.3; `EarthActivity` and `max_action_buttons` are the same).
  - The bar sits at the top of the app view. `--sb` there is the global status bar height and had pushed it down a second time.
- **Google Settings (Google Play services 4.3.23):**
  - `common_settings.xml` is one container without section headers, so the invented SERVICES / APPS headers are gone.
  - The rows follow `GoogleSettingsActivity.onCreate` for the intents that resolve on the image: Connected apps, Google+, Play Games, Location, Search & Now, Ads, Verify apps, Android Device Manager, Drive apps.
  - Maps 7.5 no longer handles `LOCATION_SETTINGS`, so there is no Maps & Latitude.
  - The bar is `common_settings_bg` (xxhdpi).
- **Google Now (Google Search 3.3.11, launcher pane and Google app):**
  - `gel-now.js` follows `now_client_cards_view.xml` and matches shot 013 of GSMArena's Nexus 5 UI review.
  - The page is #eeeeee. Velvet's time-of-day picture (`context_header_bg_*`) runs full width under the translucent status bar; it replaces a drawn SVG header.
  - The `search_bg` plate sits 12 dp below the status bar with `ic_google_small_dark` and `ic_mic_dark`; the microphone opens Voice Search.
  - The cards use `card_background` with Velvet's styles and the card menu dots: the weather card per `weather_card.xml` / `weather_forecast_column.xml`, and the next appointment with its View in Calendar button.
  - `load_more_card.xml`'s italic "More" closes the list. `in_app_footer.xml` shows Reminders, Train Google Now and Menu with the APK's icons.
  - The "Just say Ok Google" tip card is gone: Velvet 3.3 has no such card (only the launcher's search bar hint).
