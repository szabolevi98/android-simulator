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
- **Voice Search (Google Search 3.3.11):**
  - The screen was a centred red circle on white. It is now the search plate's voice mode: the #eeeeee shield, a `search_bg` panel 260 dp tall with `ic_google_medium_dark`, the 68 dp mic 8 dp from the right, and "Speak now" in 20 sp sans-serif-light.
  - The mic shows `vs_micbtn_rec` while listening and `vs_micbtn_on` after a timeout, with Velvet's `no_match` text.
  - `SoundLevels` (#dbdbdb, 34 to 100 dp, a 1 dp guide) is drawn in CSS, as the APK draws it in code.
- **Maps 7.5.0:**
  - `base_main_internal.xml`: the floating omnibox (`omnibox.9`, 44 dp, 10 dp in) with "Search" in 17 sp sans-serif-light and the directions button after a #dedede divider; the "Google" watermark at the bottom left; the my-location button (`ic_location` on the `button` 9-patch) at the bottom right; the side tab `views_entry_point_flipped` on the right edge.
  - The tab opens `layers_menu_content.xml` from the right (`LayersContent`: gravity right, 300 dp, `layers_background` tiled): the Traffic, Public transit, Bicycling and Satellite toggles (selected: `layers_selected_background` and the `_selected` icon), Google Earth (opens Earth), then Settings, Help and Send feedback.
  - Placement is set in code. The tab's height on the right edge is my choice; one July 2013 report (MobileSyrup) puts the menu at the bottom left, but 7.5's resources (gravity right, the flipped tab) open it from the right.
- **Keep 2.0.51:**
  - MemoryAppTheme overlays the `ab_solid` action bar (#dce1e3 at 90%) on #dce1e3, with the drawer toggle (`ic_drawer`).
  - `drawer_fragment.xml`: 300 dp on #f5f5f5, the account, then the items `DrawerFragment` adds (per the dex): Notes, Archive, Reminders, with blue icons and #cc33b5e5 text when active. The section headers in the APK are not used. The Reminders view shows "Create a reminder".
  - Quick edit, add items bar and notes come from Keep 2.0's own drawables.
  - `browse_fragment_menu.xml` no longer lists Archived notes; the editor has Note color… and Add picture in the bar.
- **YouTube 5.2.27:**
  - Theme.Home: #ededed under the ActionBar style (`action_bar_background`, a light gradient). It shows `action_bar_logo` and no title (displayOptions 3), after the guide toggle `ic_action_bar_drawer`. Search is in the bar; Settings, Feedback and Help are in the overflow.
  - The Guide follows `GuideFragment` (dex order): the account; Uploads, History, Favorites, Playlists, Watch later; the Subscriptions label with What to watch and My subscriptions; Browse channels; the From YouTube label with Recommended and Trending. It uses `guide_entry.xml` / `guide_section.xml` on #434343 with the `ic_drawer_*` icons.
  - Feed items are `video_feed_item.xml` on `card_frame`: thumbnail and duration badge, 18 sp title, 14 sp channel and views, the menu anchor.
  - The watch page shows the player, `watch_info_card.xml` with `like_dislike_panel.xml`, and `watch_suggested_card.xml` (`detailed_video_item_body.xml` rows, "More").
- **Drive 1.2.484:**
  - CakemixTheme's ActionBar (`action_bar_background`: #dddddd over a 3 dp grey base, #333 text) with the navigation toggle `ic_drawer`.
  - `menu_doclist_activity.xml` under ActionMenuPresenter's three slots: Search and View as Grid in the bar; Add new, Refresh, Filter by, Sort by, Settings and Product Tour in the overflow.
  - The navigation panel (`navigation_sliding_panel.xml`, #eeeeee) lists the account, then the `iM` enum's entries in the dex: My Drive, Shared with me, Starred, Recent, Offline, Uploads.
  - Files are `doc_entry_row.xml` rows (60 dp, the `ic_type_*` icon on #f0f0f0, "Modified: …", the info button) under Drive's own time range titles (Today, Yesterday, Earlier this Week, Earlier this Month, Older).
