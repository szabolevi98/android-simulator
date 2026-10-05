# Lollipop 5.1.1 visual audit

## Google apps checked against the LMY48Y APKs (audit step 4) — 2026-10-05

`stock-strings.js` now loads on 5.1.1 too. The image's apps are precompiled (odex), so their code is read from the dex embedded in each odex (extracted from `system.raw.img`, checksum restored).
- **Google Settings (Google Play services 6.7.79):**
  - `common.Theme.GoogleSettings` (v21): a blue grey 900 toolbar and teal 500 accent, replacing the Holo bar.
  - `GoogleSettingsActivity` builds two categories (Body2, teal): Account with Google+ and Account History (the UDC flag defaults on), and Services with Ads, Connected apps, Google Fit, Play Games, Data management, Search & Now and Security. Location is appended to Services when the reporting service connects.
  - Android Device Manager now lives under Security, and Maps 9.3 no longer offers Maps & Latitude.
