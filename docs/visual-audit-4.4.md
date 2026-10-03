# Android 4.4.4 KitKat on the Nexus 5 — visual audit

Target: Android 4.4.4 (KTU84P, AOSP tag `android-4.4.4_r1`) on the Nexus 5 (LG-D821, hammerhead), mid-2014. Device overlays come from `device/lge/hammerhead` at the same tag.

## Frame — 2026-10-02

`docs/device-frames.py` traces the outline from Google's front render ([Wikimedia Commons "Nexus 5 Front View.png"](https://commons.wikimedia.org/wiki/File:Nexus_5_Front_View.png), CC BY 2.5, Google Android).
- The render's display is exactly 1080 × 1920 at (304, 436).
- The 4.95" panel next to the 4.65" Galaxy Nexus is 580 px tall, so the window is 326.25 × 580 (1 dp = 0.906 px).
- Features: the front camera, the round earpiece grille, the proximity / light sensors, power on the right, volume on the left.
- The render's drop shadow under the bottom edge is kept out of the outline (alpha threshold 235).

## System bars — 2026-10-02

From SystemUI `BarTransitions`, `PhoneStatusBarTransitions`, `NavigationBarTransitions`, `BatteryMeterView` and `res/values` at `android-4.4.4_r1`:
- **Sizes:** a 25 dp status bar and a 48 dp navigation bar.
- **In apps:** opaque black bars, with the status icons and clock at 75 % (`status_bar_icon_drawing_alpha`).
- **On the launcher and keyguard:** translucent mode. The content runs under the bars, which draw the `status_background` / `nav_background` black gradients, with the icons at full alpha.
- **Icons:** the white xxhdpi status icons (18 dp) and the 16 dp white clock.
- **Battery:** the BatteryMeterView, a 10.5 × 16 dp #66FFFFFF frame with a white level that turns #FF3300 at 15 % or below.
- **Navigation keys:** the `ic_sysbar_*` keys.

## Launcher3 — 2026-10-02

From Launcher3 `DynamicGrid`, `DeviceProfile`, `CellLayout`, `Workspace`, `PageIndicatorMarker`, `AppsCustomizeTabHost`, `Cling` / `LauncherClings` and `res/` at `android-4.4.4_r1` (the hammerhead tree has no Launcher3 overlay):
- **Grid:** the "Nexus 5" profile: 4 × 4 cells, 60 dp icons, 13 sp Roboto Condensed labels, 5 hotseat cells with 56 dp icons.
- **Layout:**
  - A 48 dp `search_frame` search bar, 12 dp below the status bar, with the Google logo and the microphone.
  - The workspace has 60 dp of padding at the top and 108 dp at the bottom, and its cells have no gaps.
  - The page indicator row is 24 dp, and the hotseat is 84 dp.
  - `workspace_bg` darkens the top and bottom ~100 dp.
- **Default desktop:** `default_workspace.xml` places the power control on page 0, the analog clock with Camera on page 1, and Gallery and Settings on page 2. There is no Google folder. The default page is 0.
- **Dynamic pages:**
  - Dragging adds an empty page, marked with the `ic_pageindicator_add` dot.
  - Empty pages are removed after the drop.
  - The page indicator dots fade and grow over 175 ms.
- **Wallpaper:** the hammerhead `default_wallpaper.jpg` is two screens wide. It pans with the pages over at least three page gaps (`MIN_PARALLAX_PAGE_SPAN`). A live wallpaper spans exactly the pages.
- **All apps:**
  - There is no tab bar, and the market button is disabled (`DISABLE_MARKET_BUTTON`).
  - The pane is 65 % black over the wallpaper.
  - The 4 × 5 app pages run straight into the widget pages, under one indicator.
- **Folders:** the 72 dp `portal_ring_inner_holo` icon carries three previews at FolderIcon's perspective offsets. The folder opens as a white `portal_container_holo` card with #333 labels and a #777 name hint.
- **Overview mode:**
  - A long press on the background opens it.
  - The pages scale to 0.573 and show `screenpanel`; the bar is 20 % of the height.
  - The bar holds Wallpapers and Widgets. Settings is hidden because `hasSettings()` is false in AOSP.
  - Back from the widget pages returns to overview mode.
- **Clings:**
  - First run: "Welcome" on a #64b1ea circle with a radius of 110 dp, over a #cc000000 scrim.
  - Then the workspace cling: a 60 dp ring at half alpha with a 50 dp hole, 30 dp above the centre. A long press dismisses it into overview mode.
  - The folder cling.
  - While a cling shows, the launcher sets `SYSTEM_UI_FLAG_LOW_PROFILE`: the nav keys turn into the lights-out dots, and the battery and clock drop to 50 %.
- **Icons:** the 4.4.4 `mipmap-xxhdpi` launcher icons. Gallery ships only xhdpi and Music only hdpi.

## Keyguard — 2026-10-02

The 4.4 keyguard moved to `frameworks/base/packages/Keyguard`. Compared with 4.3:
- **Status view:** one centred `TextClock` in `widget_big_thin` (80 dp sans-serif-thin), in `h:mm` / `kk:mm` with no AM/PM.
- **Status area:** the date and the next alarm, centred, in `widget_label` (14 dp bold condensed caps). The alarm is #80ffffff with `ic_alarm_small`.
- **Glow pad:** unchanged; it holds the unlock target only.
- **Window:** the keyguard draws under the translucent bars, and its content stays inside them.
- **Navigation bar:** `KeyguardViewMediator` disables Recents, and Back stays hidden until the bouncer opens, so only Home shows.

## Notification panel and drawables — 2026-10-02

4.3 shipped no xxhdpi SystemUI resources, so the framework, SystemUI and Keyguard drawables inherited from 4.3 were redrawn from the 4.4.4 xxhdpi files (scratchpad `kk_swap_assets.py`; assets keep their pixel size, and the quick settings icons are stored at full resolution).
- **Accents:** white replaces holo blue in the quick settings icons and in the `status_bar_close_on` handle. The add-widget pressed state is grey.
- **Header:** the flip button is `ic_notify_quicksettings`, and `ic_notify_open` returns to the notifications.
- **Quick settings (`QuickSettings` 4.4):**
  - The battery tile is a 22 × 32 dp BatteryMeterView.
  - Location is a permanent tile after Bluetooth ("Location" / "Location off"), and it opens the location settings.
  - The alarm tile is temporary.

## Settings, About phone and the easter egg — 2026-10-02

- **Headers:** `settings_headers.xml` 4.4 adds Tap & pay after Apps (NFC), renames Location, and adds Printing after Accessibility. Home appears only with a second launcher.
- **Icons:** the Settings icons are xhdpi except About, Location and Tap & pay, which are xxhdpi. Printing uses the framework `ic_print`.
- **Location:**
  - The master switch is in the action bar.
  - Mode: High accuracy, Battery saving or Device only.
  - Recent location requests shows "No apps have requested location recently".
  - The location services category is removed when it is empty, as it is in AOSP.
- **Tap & pay / Printing:** the empty states of `PaymentSettings` and `PrintSettingsFragment`.
- **More…:** Default SMS app (Messaging) sits after Airplane mode, in the 4.4 `wireless_settings.xml` order.
- **About phone:** Nexus 5, 4.4.4, baseband M8974A-2.0.50.1.16, kernel 3.4.0-gd59db4e (Mar 17 2014), KTU84P, SELinux Enforcing.
- **PlatLogoActivity:**
  - A fullscreen window with the white "K" (Build.ID), which spins on tap.
  - After six taps or a long press, the #ed1d24 panel and the KitKat platlogo appear with "ANDROID 4.4.4".
  - A long press on the logo opens the Dessert Case.
- **DessertCaseView:**
  - Immersive 48 dp tiles, each a random hue with a white mask: the image's red channel becomes the alpha.
  - The desserts come in rarity tiers, and tiles span 1–4 cells and turn in quarter turns.
  - Tiles juggle every 2 s; an edge swipe shows the bars.

## Dialer — 2026-10-03

The 4.4 Dialer (`packages/apps/Dialer`) replaces the dark 4.3 tabs with `DialtactsTheme` on Holo Light:
- **Main screen:**
  - A #eee background.
  - A white `search_bg` box, 41 dp, with "Type a name or phone number" and voice search.
  - The most recent call as a card.
  - The "Speed Dial" row with the grey ALL CONTACTS button.
- **Tiles:**
  - Starred contacts come first, then frequently called ones, in two columns at 67 % height.
  - Each tile shows the photo or a `LetterTileDrawable` (8 colours chosen by `abs(String.hashCode) % 8`, a white light letter at 67 %), the name over `shadow_contact_photo`, and the overflow thumbnail.
- **Bottom bar:** a 60 dp #3B77E7 fake action bar with history, dialpad and overflow. The dial button replaces the dialpad button while the pad is up.
- **Dialpad:** a white panel with 36 sp light digits and 56 dp keys. Numbers are 40 sp light #3B77E7, letters are 13 sp #8b8b8b. Typing filters the list above.
- **History:** a blue action bar with the light ALL / MISSED tab strip.
- **Back order:** Back closes the dialpad, then the search, then the sub-screens.

## In-call screen — 2026-10-03

The 4.4 InCallUI (`packages/apps/InCallUI`) changes the following:
- **Call banner:** 80 dp on #A0000000.
- **End button:** flat #f22121 (#ff4e4e when pressed), 60 dp, with `ic_in_call_phone_hangup`.
- **Button row:** a 76 dp black row with the xxhdpi InCallUI icons.
- **DTMF dialpad:** the white Dialer pad with light #3B77E7 digits.

## People — 2026-10-03

The 4.4 Contacts app (`PeopleTheme` on Holo Light) differs from 4.3 as follows:
- **Bars:** the action bar, tab bar and split bar use the flat #e6e6e6 `action_bar_tab`. Text is #363636.
- **Tabs:** icon tabs in the order Favorites, All, Groups. `ActionBarAdapter` shows icons on phones; the selected tab uses `ic_menu_*_dk` and the others `_lt`.
- **Section headers:** #363636 with a #D0D0D0 underline.
- **Avatars:** 64 dp `LetterTileDrawable` avatars (ContactPhotoManager `DEFAULT_AVATAR`) on the rows, the favourites and the detail header.
- **Action icons:** dark `ic_search_dk` / `ic_add_person_dk` actions, the star from `ic_favorite_on/off_lt`, and `ic_menu_back` for Up.

## Clock and Messaging — 2026-10-03

- **DeskClock tabs:** Alarm, Clock, Timer, Stopwatch (`ALARM_TAB_INDEX` 0). The tabs are icons without an underline.
- **Alarm cards (`alarm_time.xml`):**
  - 48 sp light time and an on/off switch.
  - Collapsed: an expand strip with the label and days.
  - Expanded: Label, red Repeat checkbox, Sunday-first day toggles with the 2 dp `toggle_underline`, ringtone, Vibrate, and the trash can.
  - The footer has the 56 dp #606060 round add button.
- **Time picker:** `AlarmUtils` opens the dark RadialTimePicker. It has a #363636 header, a #404040 dial and the #ff3333 selection. In 24 h mode 00 and 13–23 sit outside and 1–12 inside. The picker moves on to minutes after an hour is picked.
- **Clock footer:** the round Cities (`ic_globe`) button and the overflow.
- **Messaging:** 4.4 Mms only adds `banner_sms_promo`, which shows when Messaging is not the default SMS app, so the 4.3 screens stay.

## Downloads — 2026-10-03

In 4.4 the Downloads launcher entry (`DownloadList.onCreate`) trampolines into DocumentsUI with `ACTION_MANAGE_ROOT` for the Downloads root (Theme.Holo.Light).
- **Action bar:** `ic_root_download` with "Downloads", plus Search and Sort by (By name / By date modified / By size).
- **Overflow:** Grid view / List view.
- **Rows:** `item_doc_list` rows.
- **Empty state:** "No items".

## Play Store — 2026-10-03

The Play Store is closed source. The 4.4.4 simulator shows Play Store 4.8.22, the version on Nexus 5 phones in July 2014, before 4.9 brought the Material details pages. It is rebuilt from Android Police captures of 4.4.21 (October 2013), 4.6.16 (March 2014) and 4.8.19 / 4.8.22 (July 2014).
- **Navigation:** the slide-out drawer replaces the 4.3 overflow menu. It sits under the action bar and holds the account header, Store home / My apps / My wishlist (the current one in bold), then small-caps Redeem, Settings and Help. It opens from the drawer indicator or a swipe from the left edge.
- **Store home:** "Play Store" on the #666 bar and the six striped tiles. Magazines became Newsstand. Below them sit the green "We've simplified app permissions." note, then the clusters with MORE buttons and Roboto Light titles (no italics): New + Updated Games, See What's Trending (one wide card), Recommended, Albums and Free classics. Installed items show a green round check.
- **Details:** share sits left of search. INSTALL is in the section colour, OPEN / UNINSTALL are white. 4.8 also has bigger buttons, the centred "Rate this app" row and the new Additional information block with Permission details.
- **Permissions:** the 4.8 grouped dialog ("needs access to", group rows with chevrons, the Google play wordmark, ACCEPT). The full network access row is gone. Permission texts use the AOSP 4.4.4 `permlab_*` strings.
- **My apps:** the drawer-indicator bar, INSTALLED / ALL, and the "Recently updated" and "Installed" groups.
- **Settings:** Notifications, Auto-update apps, Add icon to Home screen, Clear search history, Content filtering, "Require password for purchases" (For all purchases… / Every 30 minutes / Never), and Version: 4.8.22.

## Wallpaper picker — 2026-10-03

The "Wallpapers" button in the overview opens Launcher3's 4.4 `WallpaperPickerActivity` (WallpaperPicker/, `Theme.WallpaperPicker`).
- **Window:** fullscreen with the wallpaper showing through. The `#88000000` overlay action bar holds a single custom button: `ic_actionbar_accept` and "Set wallpaper".
- **Strip:** 106.5 × 94.5 dp tiles between 2 dp `tile_shadow_top/bottom`, in source order:
  - Pick image: the latest photo under `#66000000` with `ic_images`.
  - Images picked in this session.
  - The KitKat default wallpaper tile (`getBuiltInDrawable`).
  - Saved images.
  - Live wallpapers, sorted by label, with the translucent label bar.
- **No bundled wallpapers:** the AOSP `wallpapers` array is empty, so the 4.3 Launcher2 wallpapers are no longer offered.
- **Selection:** `wallpaper_tile_fg` gives a 2 dp white frame over a #4dffffff wash. A selected tile previews full screen; tapping the preview hides or shows the strip. With nothing selected, Set wallpaper just closes the picker.
- **Delete CAB:** a long press on a picked or saved image starts the CAB ("%d selected", Delete).
- **Pick image:** sends `ACTION_GET_CONTENT image/*`. 4.4 answers it with DocumentsUI "Open from" on the Recent root: grid cards with the images. A picked image becomes a selected tile, and setting it saves it into the strip.
- **Live tiles:** tapping one opens the live wallpaper preview. Back from the preview returns to the picker.

## Email, Camera, Gallery, Calendar, Browser — 2026-10-03

**Email.** 4.4 is the first AOSP Email built on UnifiedEmail (`Email/Android.mk` pulls in `../UnifiedEmail`). The theme is `UnifiedEmailTheme` (Theme.Holo.Light). Changes from the 4.3 screens:
- **Action bar:** `MailActionBarView` shows the drawer indicator and the folder name over the account. Compose and Search are actions. Refresh, Sync options, Settings and Help sit in the overflow.
- **Drawer:** `FolderListFragment` (flat). The account row with its radio button and unread count comes first, then Inbox, Starred, Drafts, Outbox, Sent and Trash.
- **List rows:** `ConversationItemView` rows with 48 dp `LetterTileProvider` tiles (first letter, eight colours picked by the address hash). Each row has the 18 sp sender, the 12 sp date, the two-line 13 sp "subject — snippet" and the star. Unread rows are white `list_unread_holo`, read rows #eeeeee `list_read_holo`.
- **Selection:** touching a tile selects the conversation (`ic_avatar_check`) and opens the CAB.
- **Conversation:** Delete and Mark unread are promoted to the action bar. The subject header carries its star. The message header has the tile, the sender, "To: me", the date, Reply and an overflow with Reply all and Forward.
- **Compose:** From, To, optional Cc / Bcc, Subject and the "Compose email" body. Send is in the bar; Attach picture, Add Cc/Bcc, Save draft, Discard, Settings and Help are in the overflow.

**Camera.** 4.4 moves the camera into its own app (`packages/apps/Camera2`). Compared with 4.3 (Gallery2):
- `camera_controls.xml` changes only the class name (`ModuleSwitcher`) and the `preview_thumb` view.
- `PhotoMenu` and `VideoMenu` build the same pie. The only addition, HDR+, appears only with Google's GCam module.

The 4.3 camera screens therefore stay.

**Gallery, Calendar, Browser.** Their `res/values/strings.xml` differ from 4.3 by at most three strings (Gallery: "Switch to Refocus"; Calendar: the RSVP "Responded yes/maybe/no"; Browser: none). These apps stay as they are.

## Five-language sweep and release — 2026-10-03

- **Sweep method:** every app, its overflow menu, every Settings page, the drawer and the notification panel were captured headlessly in English and in Hungarian, German, French and Spanish, and every line left unchanged was reviewed.
- **Fixes:** the remaining gaps were the switch labels and the Hungarian / Spanish Daydream title. They now use the AOSP `capital_on/off` (Be/Ki, AN/AUS, OUI/NON, SÍ/NO) and `screensaver_settings_title` (Álmodozás, Salvapantallas) strings.
- **Intentionally English:** sample content (names, mail, catalog titles), product names, and words that read the same in the target language (Bluetooth, Display, Apps, Widgets, Normal).
- **Release:** the catalog entry drops "Work in progress", and the landing thumbnail was refreshed.

## Review fixes — 2026-10-03

- **Settings scale:** the screens were still at the Nexus 4 size. `kk-settings.css` sets the Nexus 5 dp values:
  - Header rows: 48 dp high, a 28 dp icon column with 32 dp icons, titles at 18 sp, summaries at 14 sp in #bebebe, and 16 dp side margins.
  - Category headers: 14 sp bold #bebebe on the 2 dp `list_section_divider_holo_dark` line.
  - Action bar: 48 dp.
- **Add account:** uses `ic_menu_add_dark`.
- **Cast screen:** the 4.4 `WifiDisplaySettings` page with "No nearby devices were found." The wireless display switch moved to the checkable "Enable wireless display" overflow item. The quick settings tile reads "Cast Screen".
- **Browser demo pages:** moved to 2014 and KitKat ("Android 4.4.4 arrives on the Nexus 5", the 2014 Web). The Nexus 5 safety text and the KitKat reset prompt are updated too.
- **Settings action bar:** `Theme.Settings` 4.4 sets `Widget.Holo.ActionBar.Solid`. The bar is `ab_solid_dark_holo`: a #393939 top edge, #222 body and #1b1b1b foot, with no holo blue underline.
- **Switches:** they are drawn with the real 4.4 Holo nine-patches (`switch_bg_holo_dark` track, `switch_thumb(_activated/_pressed/_disabled)_holo_dark` thumb). They are about 106 dp wide and 28 dp high, with 14 sp ON / OFF in #bebebe; the old slanted CSS imitation is replaced.

## Stock Nexus 5 (Google Now Launcher) — 2026-10-03

The owner chose the stock Nexus 5 experience over pure AOSP.

**Step 1: desktop**
- **Layout:** one home pane with the Google folder (slot 12) and Play Store (slot 15), sourced from the Wikimedia Nexus 5 4.4.2 screenshot. GSMArena confirms two panes by default: Google Now and one home pane.
- **Dock:** Phone, Hangouts, all apps, Chrome, Camera.
- **Search bar:** the Google logo, the white condensed "Say “Ok Google”" hint and the microphone.
- **Icons:** Google icons from the Android 4.4 Quick Start Guide and the screenshot (see THIRD_PARTY_NOTICES).
- **Behaviour:**
  - Hangouts, Chrome, Gmail and Photos open the simulated Messaging, Browser, Email and Gallery for now.
  - The Play media apps and Google Settings show "This app is not part of the simulator."
- **Unverified:** the Google folder contents (Gmail, Play Movies & TV, Play Music, Play Books, Play Games, Photos). The screenshot only shows Gmail on top of a red icon.

**Step 1b: Google Now pane**

The Quick Start Guide says "On Nexus 5, you can also swipe to the leftmost Home screen". The pane follows `Workspace.updateStateForCustomContent`:
- **Movement:** a layer slides in with the finger while the workspace, hotseat, page indicator and search bar slide away. The Now marker leads the page indicator.
- **Content:**
  - A day/night header picture.
  - The white search box with the grey Google logo and microphone.
  - Cards in the guide's style (white, light titles with the key figure in red, grey summaries, blue actions): weather, the next calendar event and the "Ok Google" tip.
  - "More", then the Reminders / Customize / Menu icons taken from the guide.

**Step 1c: drawer and overview**

GSMArena notes the Google Now Launcher drawer has "no tabs and no widgets":
- **Drawer:** the All Apps drawer pages through apps only, and its indicator counts only app pages.
- **Widgets:** open only from the overview Widgets button. Back from there returns to the overview.
- **Overview:** keeps the launcher's third button, Settings (`Launcher.hasSettings`). It opens Google Search settings, which is not simulated, so it shows a toast.

**Step 2: Hangouts as the SMS app**

Sources: the Quick Start Guide ("Hangouts & SMS") and the GSMArena Nexus 5 review ("Phonebook, telephony, messaging"). The review notes that Google retired the old Messages app for Hangouts. Colours and sizes are measured from its screenshots.
- **Action bar:** light, #e5e5e5 with a 1 dp #d1d1d1 edge. It holds the green Hangouts icon and an 18 sp #505050 title.
  - Conversation list: + (New Hangout) and the overflow menu (Set mood…, Invites, Snooze notifications, Archived Hangouts, Settings, Send feedback, Help).
  - Conversation: the call button and the overflow menu. The title shows the contact name, an "SMS" subtitle and a spinner corner.
- **Conversation list:** #f9f9f9 background, 72 dp rows, 56 dp square avatars tagged "SMS", "You:" before your own last message, and the time on the right.
- **New Hangout:** the "Type a name, email, number, or circle" field filters the contact list (rows show the number and "Mobile"). A picked contact or a typed number opens its conversation. A draft shared from Gallery or Browser moves into it.
- **Conversation:**
  - White cards on #e5e5e5, with 48 dp avatars on the outer side.
  - A 48 dp white editor showing "Send an SMS message", with Location and Camera buttons. Send replaces them once there is text.
  - The camera button opens Take photo / Take video / Attach photo / Google+ albums. Only Attach photo is simulated.
- **System:**
  - Hangouts is its own app over the shared SMS data. Notifications, Gallery share and Browser share open it, since it is the default SMS app.
  - AOSP Messaging stays in the drawer with its own screens, as promised when the stock look was chosen.
  - The status bar shows a white Hangouts notification glyph drawn for the simulator.

**Step 3: Chrome**

GSMArena: "The Nexus 5 comes with Google Chrome as its solitary preinstalled browser." The build follows the review's Chrome 31 screenshots (`chrome.js`, `chrome.css`):
- **Toolbar:** 48 dp, #e1e1e1. A white 32 dp omnibox ("Search or type URL") holds the URL and the reload button, followed by the tab-count square and the overflow. Incognito tabs tint the toolbar #4f566c.
- **Menu:** Back / Forward / Bookmark icons on top, then New tab, New incognito tab, Bookmarks, Other devices, History, Share…, Print…, Find in page…, Request desktop site (check box), Settings and Help & feedback.
  - Print, Settings and Help show the simulator toast.
  - Share sends the link to Hangouts.
- **Tab switcher:** black, with "+ New tab". Tabs are stacked cards with a tab label (globe, title, ×) at the top right.
- **New Tab page:**
  - The bottom bar switches between Most visited (chrome logo), Bookmarks (star) and Other devices. In an incognito tab it switches between Most visited, Incognito and Bookmarks.
  - Most visited shows the last six pages as thumbnails.
  - The incognito page shows the "You’ve gone incognito." card.
- **History:** `chrome://history` has a search field, "Clear browsing data…" and the day's pages.
- **Separate tabs:** Chrome keeps its own tabs (`data.chromeSession`, incognito tabs are not stored). The AOSP Browser stays in the drawer with its own tabs. Both browse the same offline demo pages, and normal Chrome tabs share the history.
- **Defaults:** the Google search bar and the search panel open Chrome.

**Step 4: Camera and Photos**

- **Camera:** stays as it is. GSMArena: "The camera app looks exactly the same as what we saw premiered on the Google Play Edition Samsung Galaxy S4 and HTC One in Android Jelly Bean 4.3", the arc quick settings that the simulator already has. Google Camera (April 2014) came later as a Play Store download.
- **Photos:** Google+ Photos, from the review's Gallery page (`photos.js`, `photos.css`):
  - Action bar: #dddddd, with the drawer mark, the pinwheel, "Photos", and the Auto Awesome movie, search and overflow buttons.
  - Tabs: CAMERA / HIGHLIGHTS with the blue indicator.
  - Camera tab: the camera roll three on a line, after the dimmed "Folders" tile.
  - Highlights tab: day headers with a share button over a mosaic with a large first picture.
  - Folders: albums with a thumbnail strip and a chevron.
  - Viewer: black, with share (to Hangouts), edit and Delete / Set as wallpaper / Details. Swipe between pictures; a tap hides the bar.
  - The AOSP Gallery stays in the drawer, which GSMArena confirms: "The old gallery ... is also on board".

**Step 5: catalog**

The landing page calls the version "Nexus 5" (no "· AOSP"), with a new description and a landing shot of the Google Now Launcher home.

**Step 6: Gmail**

Gmail 4.7 (November 2013) is built on the same UnifiedEmail code as the AOSP Email. `kk-email.js` therefore takes options, and `gmail.js` / `gmail.css` add Gmail's parts, measured from the GSMArena screenshots:
- **Primary:**
  - The action bar shows "Primary" over the unread count.
  - The "Welcome to your new Inbox" and "You can enable and disable categories in settings" teasers show until a conversation is opened.
  - The Social and Promotions rows carry blue (#4880d7) and green (#13a864) "N New" badges.
- **Drawer:** the account, INBOX (Primary, Social, Promotions, Priority Inbox) and ALL LABELS (Starred, Important, Chats, Sent, Outbox, Drafts, All mail, Spam, Trash). The selected row is #33b5e5, and the category badges are coloured.
- **Personal level markers:** UnifiedEmail `ic_email_caret_*`. » means sent only to me, › means sent to me and others; yellow means important.
- **Archive:** in the conversation and selection bars. Archived mail stays in All mail.
- **Conversation:** the grey "Inbox" chip sits under the subject.
- **Separate account:** Gmail has its own offline mailbox (`data.gmailbox`, kitkat.demo@gmail.com) and keeps its own folder and conversation.
- **Photo tip:** the UnifiedEmail ConversationPhotoTeaserView ("Touch a sender image to select that conversation.", with AOSP translations and `ic_arrow` / `ic_cancel_holo_light`) now shows in both Gmail and Email until it is dismissed. The GSMArena Email screenshot shows it too.

**All apps top padding (owner feedback)**

A frame of a November 2013 Nexus 5 unboxing video shows the first drawer row about 28 dp under the status bar. Its icons sit at the top of their cells, because Launcher3's PagedViewCellLayout puts the free space between rows. The drawer page now starts 28 dp lower and aligns icons to the top of the cell.

**Step 7: Play Music, Play Movies & TV, Play Books, Play Games (owner request)**

The four Google Play media apps of late 2013 are rebuilt in `play-apps.js` / `play-apps.css`. They share the period's look:
- a coloured 48 dp action bar with the drawer mark and a white glyph;
- a white drawer;
- #e5e5e5 pages with light italic section titles and coloured chips;
- white cards with a title, a grey subtitle and overflow dots.

Sources and content per app:
- **Play Music 5 (GSMArena screenshots, #f4842e):**
  - Listen Now cards ("Recently played"), with a drawer of Listen Now / My Library / Playlists.
  - My Library tabs: GENRES / ARTISTS / ALBUMS / SONGS.
  - Album pages, a mini player, and Now playing with thumbs up / down, the orange seek bar, repeat / previous / play / next / shuffle and the queue.
  - It plays the simulator's own tracks through the shared music engine.
- **Play Movies & TV (Android Police, June 2013, #c74b46):**
  - Watch Now / My Movies / My TV Shows; poster cards with year and length and the pin button; "Recommended for You" with the red SHOP chip.
  - A black player that pans the poster, with the time bar.
- **Play Books 3 (Android Police, October 2013, #3f9fe0):**
  - Read Now with "Recent" and SEE ALL, pinned covers, and My Library.
  - A reader with the title bar, Aa and the page slider. Tap the sides to turn pages and the middle to hide the bars.
  - Books are public-domain openings: Carroll, Austen, Dumas and Doyle.
- **Play Games 1 (Droid Life, July 2013, #96aa39):**
  - The Play Now / My Games / My Activity / Players / Recommended Games / Shop drawer.
  - The striped "Welcome!" card, "My games" and "Players" with SEE MORE, and the FEATURED / POPULAR / POPULAR MULTIPLAYER list with FREE / PURCHASED.
  - A game page with achievements.
- **Art:** covers, posters and game icons are drawn by the simulator. Movies, shows and games are fictional.

**Default clock (owner request)**

The home screen starts with the DeskClock digital widget, 4 × 2 across the top two rows (layout revision 5). A saved desktop gets it only when those rows are still empty. The widget had shown a 12 px time, because the generic `.home-widget > button span` rule overrode it. It now uses DeskClock 4.4's sizes: `widget_big_font_size` 80 dp, scaled only below `min_digital_widget_width` 206 dp, and `widget_label_font_size` 14 sp for the date and next alarm.

**Step 8: the rest of the stock drawer (owner request)**

- **Google folder:** GSMArena's launch screenshot shows 11 apps: Gmail, Google+, Photos, Maps, People, Calendar, Keep, Drive, YouTube, Play Music, Play Games. Layout revision 6 switches an unedited folder to these.
- **New apps:** the owner's frame from a November 2013 unboxing video shows the drawer with Drive, Earth, Google, Google Settings, Google+, Keep, Maps and News & Weather. These, plus YouTube and Voice Search, now have icons drawn after their 2013 looks (`assets/*.svg`) and simple screens (`stock-apps.js`, `stock-apps.css`):
  - Google opens Google Now. The launcher overview's Settings button and Google Settings → Search & Now open the Google search settings (Google Now switch; Phone search, Voice, Accounts & privacy, Notifications, Help & feedback).
  - Voice Search shows "Speak now", then "Didn't catch that".
  - Maps (Maps 7) has a drawn map, the floating search card with a result card, and My location.
  - Drive shows My Drive with document previews.
  - Keep has the quick note bar and coloured cards. Notes can be added, edited and deleted.
  - YouTube has What to Watch, a player, likes and suggestions.
  - Google+ has the Home stream with +1.
  - Earth shows a turning globe in space.
  - News & Weather is Holo dark, with Weather, Top Stories, Technology and Sports.
  - Google Settings lists its services.
- **Content:** all of it is made up and offline.
