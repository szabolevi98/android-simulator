# Visual audit – Android 4.0.4 (Galaxy Nexus, IMM76I)

## Extra launcher apps checked against the IMM76I APKs (audit step 4) — 2026-10-06

- **Navigation (Maps 6.4.0):** `DestinationActivity.onCreate` uses `da_destination_activity` on SDK 11+ (the redesign layout exists but is not used): the `da_actionBar` header (`da_action_bar_background`, #f3f3f3 to #dcdcdc between #d5d5d5 and #ababab lines) with the feature switcher (`ic_feature_navigation`, `switcher_dropdown_triangle`), "Navigation" in 16 dp bold and the Map button (`da_btn_show_map`), over Theme.Holo's black. Class `aa`'s four tiles (Speak destination, Type destination, Contacts, Starred places) use `da_action_button_normal` and the 320 dpi `da_picker_*` icons. The old white list with drawn icons is gone.
- **Places (Maps 6.4.0, `placesv2.xml`):** `places2_wizard_header` ("Places") and `places2_location_selector` on `secondary_background` (the #748389 texture), the default categories in rows of four 54 dp `places_cat_icon_*` tiles on `primary_background` (the light texture). The place name is the simulator's demo location.
- **Movie Studio (VideoEditorGoogle 1.1, AOSP VideoEditor android-4.0.4_r2.1):** `ProjectPickerAdapter` is the same as 4.3's: the 300 × 150 dp new-project bitmap (`add_video_project_big` on black, the 28 dp half-black overlay with "Create New Project") under the logo-only overlay action bar on `activity_background`.
- 4.0.4 now has `versions/4.0.4/stock-strings.js` (from `docs/stock-strings.json`, section 4.0.4) for these texts.
