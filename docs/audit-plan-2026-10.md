# Audit munkaterv – 2026. október

Forrás: `android-szimulator-audit-2026-10-04.md` (a tulajdonos külön sessionben készült auditja, a `c2f0c49` állapotra).
Egyeztetve: 2026-10-05. A Play/Market verzióeltérések és a KitKat Gmail 4.6.1 / 4.7 verziókérdése egyelőre kimarad.

Szabályok: minden lépés a gyári képből (`_aosp/<device>`) dolgozik, nem tippből. Lépésenként tesztek, commit és push;
élesítés (VPS) csak a legvégén. A kész tételek mellé a commit azonosítója kerül.

**Állapot:** a 4.5. pont kész (32 / 32); az 5. lépésen vagyok.

## 1. Szöveges ikonok cseréje (becslés: 1–1,5 óra)

- [x] ICS YouTube: Like / Dislike és a többi akcióikon a YouTube 3.5.5 APK-ból — közben kiderült, hogy a YouTube 3.5.5 világos témájú (`Theme.Holo.Light.DarkActionBar`), ezért az egész app a gyári elrendezést kapta (18f9838)
- [x] ICS Google-appok közös `icon()` segédje: a jelekből rajzolt ikonok (Google+ új bejegyzés, Talk hozzáadás, Books tartalomjegyzék, Latitude bejelentkezés stb.) cseréje appokként a saját APK ikonjára; a Talk sötét akciósávot kapott (a gyári téma szerint), overflow menük a menü-XML-ek alapján, a Google+ kezdőrács, a Kereső és a Voice Dialer jelei is lecserélve (18f9838)
- [x] News & Weather frissítés: célkereszt helyett a gyári menü verziónként (4.0.4: overflow-ban; 4.3 / 4.4: `navigation_refresh`; 5.1: Search, Add section, overflow) (18f9838)

## 2. Rendszeresen látható, nem Android-eredetű vezérlők (3–4 óra)

- [x] Naptár dátum- és időválasztó verziónként: 4.0.4 a keretrendszer görgetős DatePickerDialog / TimePickerDialog-ja (5786aa8); 4.3 / 4.4 / 5.1 a gyári Naptár `com.android.datetimepicker` könyvtára (naptárrács, évlista, kerek óralap) (5c4ee69)
- [x] Naptár saját alsó sávjának (Previous / nézet / Next) kivétele; lapozás húzással, Today ugrik vissza (4.0.4: 5786aa8; 4.3, 4.4: 5c4ee69)
- [x] ICS Óra időválasztó: az eredeti ICS TimePickerDialog (Holo sötét) (5786aa8)

## 3. Egyszerűsített fontos oldalak (4–5 óra)

- [x] ICS Language & input a gyári hierarchiával (helyesírás, személyes szótár, beviteli módok, hangbevitel, TTS, mutatósebesség) (ac61964)
- [x] People szerkesztő 4.x (4.0.4, 4.3, 4.4): bővíthető, típusozható mezők, több telefonszám és e-mail, fotóválasztás (5c88248)
- [x] AOSP Music (ICS / JB): gyári menük és navigáció (hosszú nyomás helyi menü, régi menügomb a navigációs sávban, Recently added); a „Demo tracks—no audio” szöveg kikerült (fee85ca)

## 4. Közös sablonok leválasztása és APK-nkénti átnézése (8–12 óra)

Minden főképernyő a saját gyári APK-ja alapján: akciósáv (szín, magasság), betű, ikonok, elrendezés, üres állapot, menü.

- [x] A StockApps, Play- és extra appok megmaradt „‹” vissza-jeleinek cseréje (az 1. lépésből ide került) – 48e59a4
- [x] `stock-apps.js` – 4.3 (JWR66Y): Google/Now, Voice Search, Maps 6.14, Keep 1.0, YouTube 4.5, Google+ 4.0, Earth, News & Weather, Google Settings (71d403f)
- [x] `stock-apps.js` – 4.4.4 (KTU84P): ugyanezek a KitKat-kép verzióival (3c730d4)
- [x] `stock-apps.js` – 5.1.1 (LMY48Y): Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google, Google Settings (579af40)
- [x] `play-apps.js` – 4.3: Play Music 5.0, Movies 2.5.4, Books 2.8 (most a Books 3 kinézete), Games (a 4.3-as képen nincs Play Games) – bc3daf0
- [x] `play-apps.js` – 4.4.4: Play Music, Movies, Books, Games – ff79528
- [x] `play-apps.js` – 5.1.1: Play Music, Movies, Books, Games – 31611fa
- [x] Extra appok – 4.0.4 és 4.3: Messenger, Navigation, Local, Currents, Magazines, Wallet, Movie Studio – 46b0155
- [x] Extra appok – 4.4.4: Newsstand, Quickoffice, Wallet – 9a989a1
- [x] Extra appok – 5.1.1: Docs, Sheets, Slides, Fit, Newsstand, Wallet – 854ff90
- [x] Fájlnevek rendbetétele (pl. a 4.0.4-es `jb-extra-apps.js` → `ics-extra-apps.js`): 25 fájl kapta meg a saját verziója előtagját; a rétegzett párok (pl. 4.4.4 `jb-deskclock.js` + `kk-deskclock.js`) a következő pontban olvadnak össze – ccc3156
- [x] Örökölt és felülírt CSS-párok összevonása (a `play-apps.css` 4.4 és 5.1 alatt bájtra azonos, LP-n `lp-play.css` írja felül): a Lollipop saját stíluslapot kap. A 4.4.4 hét, az 5.1.1 tizenegy rétegzett párja egy-egy saját fájl lett (pl. 5.1.1 `kk-launcher.css` + `jb-launcher.css` + `lp-launcher.css` → `lp-launcher.css`), az LP Play-appok szabályai a saját `play-apps.css`-be kerültek; HEAD és munkapéldány computed style-összevetése minden appon és egy szint mély vezérlőn: eltérés nélkül (közben a 4.4.4 `kk-launcher.css` a helyén maradt, az 5.1.1-ben egy holt KitKat-deklaráció kikerült) – 6d1889f
- [x] Teszt: két verzió alkalmazásfájlja ne lehessen bájtra azonos (`tests/version-files.test.cjs`): idegen korszak-előtag nem lehet a verziómappában, és új bájtazonos pár nem jöhet létre. A bevezetéskor meglévő 54 csoport (pl. `email.js` mind az öt verzióban, a 4.3/4.4/5.1 Gallery és Search) egy csak szűkülő listán van; ezek APK-nkénti átnézése külön tétel lett lent – 6d1889f
- [x] A listán maradt közös fájlok átnézése verziónként: tételenként a **4.5. pontba** került

## 4.5. Közös fájlok átnézése tételenként

A `tests/version-files.test.cjs` `SHARED` listáján maradt fájlok (két vagy több verzióban bájtra azonos) appok és témák
szerint. Minden tételnél: melyik verzió használja ténylegesen, egyezik-e a saját gyári képével, és ha nem, javítás vagy
újraépítés a képből; a halott másolat kikerül. A felület nélküli `calculator-engine.js`, `browser-session.js` és a
`play-store.js` katalógus marad közös, ezek nem tételek.

**Állás: 24 / 32 kész.** A tételek a becsült munka szerint nőnek; a nyitottaknál zárójelben a becslés.

- [x] Kezdőképernyő átrendezés 4.3 / 4.4.4 (`launcher.js`): Launcher3 időzítés – 8fa6eb5
- [x] Óra stílus 2.3.6–5.1.1 (`desk-clock.css`): a 2.3.6 / 4.4.4 / 5.1.1 csak a riasztás-ablakok szabályait tartja meg, a 4.3 a képben még meglévő AlarmClock / SetAlarm képernyőét – 9a0dc35
- [x] Böngésző stílus 2.3.6–5.1.1 (`browser.css`): a 4.0.4 AOSP Böngészőé marad, a 2.3.6-ból kivéve, 4.3 / 4.4.4 / 5.1.1-en a `chrome.css` elejére került (4.4.4 / 5.1.1-en így a Chrome saját szövegszíne és sötét lapváltója érvényesül) – 7e8e992
- [x] BeanBag 4.3 / 4.4.4 (`beanbag.js`): a 4.4.4-ből kivéve, a képben nincs – 56aff7d
- [x] Nyandroid 2.3.6 / 4.0.4 (`nyandroid.js`): a 2.3.6-ból kivéve, a GB-ben nincs – df6c518
- [x] Play Store stílus 2.3.6–5.1.1 (`play-store.css`): a régi, 2012-es általános boltstílus egyik verzióban sem élt (mindegyiknek saját korabeli boltja van), kivéve; a célverziók kérdése a 7. pontban – e7adeeb
- [x] Élő háttérképek 4.0.4 / 4.3 (`live-wallpapers.css`): a 4.0.4-es listasorok alá került a háttérképek leírása (a 4.0.4 `live_wallpaper_entry.xml`-je szerint, a képben lévő fordításokkal); a 4.3-as sorban nincs leírás – 5b0c6ef
- [x] Recents 4.3 / 4.4.4 (`recents.js`): KK bg_protect – 5a69717
- [x] Indító-tippek 2.3.6 / 4.0.4 / 4.3 (`launcher-clings.js`, `.css`): a 2.3.6-ból kivéve, 4.0.4 / 4.3 ellenőrizve – e38ebd3, ec87102
- [x] Email modell 2.3.6 / 4.4.4 / 5.1.1 (`email.js`, `email.css`): az `email.js` csak a postafiók-modell; GB elvetés értesítéssel (MessageCompose.onDiscard), KK / LP „Discard this message?” megerősítés, KK írómenü a compose_menu.xml szerint (Attach video, Send feedback), LP csatolás-almenü és Cc/Bcc nyíl; a KK UnifiedEmail írónézetét felülíró régi `email.css` kikerült – e7adeeb
- [x] Mappák 4.0.4 / 4.3 és 4.4.4 / 5.1.1 (`launcher-folders.js`, `launcher-folders.css`): a két Launcher2 mappa-erőforrásai egyeznek (ellenőrizve, képenként felcímkézve); KK / LP-n az alap a saját GEL-stílus elejére került (KitKat fehér portal_container, Lollipop quantum_panel) – 869831a
- [x] Kamera 4.3 / 4.4.4 (`camera.css`): azonos erőforrások, a 4.4 rögzítési animációja – 48347e4
- [x] GB mappák (`launcher-folders.css` 2.3.6): a felülíró ICS-stílus kivéve – ec87102
- [x] Média (Kamera / Galéria közös rajzolás) 2.3.6–5.1.1 (`media.js`, `media.css`): csak a képillusztrációk, a szerkesztő-hatások és a Megosztás / Részletek ablak maradt; a halott ICS Galéria- és Kamera-képernyő kikerült (a két ablak gyári pontosítása a Galéria tételnél) – f95e6bc
- [x] AOSP Zene 4.0.4–5.1.1 (`music.js`, `music.css`): a 4.0.4 / 4.3 a saját AOSP-tagjéből (ellenőrizve, felcímkézve); a 4.4.4 / 5.1.1-ben (a képben csak Play Music van) csak a lejátszási állapot maradt, a halott AOSP-képernyők és a `music.css` kikerültek – c96f1ad
- [x] Hangerőpanel 2.3.6–5.1.1 (`volume-panel.js`, `volume-panel.css`): a 2.3.6 a saját Gingerbread hangerő-toastját kapta (2.3.6 VolumePanel / volume_adjust.xml: nem érinthető Toast a képernyő tetején, szöveg, nagy csengő- vagy kis stream-ikon, sárga progress_horizontal sáv; a 2.3-as csengőlépések; a Nexus S framework-res grafikái); a 4.0.4 / 4.3 / 4.4.4 kódja azonos marad (4.0.4–4.4 között a VolumePanel elrendezése, időzítése és csengőlépései egyeznek), az ikonok és a SeekBar a saját kép framework-res-éből (4.4: *_am bitmapek); az 5.1.1-ben a megmaradt Holo-alap az `lp-dialogs.css`-be került – 548be6f
- [x] Kikapcsoló menü 2.3.6–5.1.1 (`global-actions.js`, `global-actions.css`): verziónként saját fájl; a 2.3.6-ban csak a gombnyomás, leállítás és indítás (a lista GBUI-ablak); a 4.0.4 saját listasora, csökkentett mód és hibajelentés nélkül; a 4.3 / 4.4.4 a saját kép xhdpi / xxhdpi grafikáival; az 5.1.1 önálló Material CSS-t kapott (22 sp sor, 0,6 sötétítés, jobbra igazított gombok, nincs Holo-vonal) és ic_lock_bugreport ikont – e5d8357. Mind az öt verzió a saját gyári `bootanimation.zip`-jét játssza le a movie() szabályai szerint (`docs/bootanimation.py`) – 7abd7d0
- [x] Beállítások: fölösleges elválasztó vonal egy csoport utolsó sora alatt, a következő kategóriafejléc felett (pl. KitKat: More… alatt / Device felett, Backup & reset alatt / Accounts felett) – a tulajdonos jelezte 2026-10-06; ICS / JB / LP-n is megnézni, a gyári APK szerint javítani. Kész: a ListView nem húz vonalat nem engedélyezett elem (kategóriafejléc) mellé, a helyét megtartja; Beállítások és Play-beállítások, 2.3.6–5.1.1 – 0a8856f
- [x] Navigációs keresőpanel 4.3 / 4.4.4 / 5.1.1 (`search.js`): LP SearchPanelCircleView, Google Now indítás – 5a69717
- [x] Fejlesztői beállítások 4.3 / 4.4.4 / 5.1.1 (`devopts.js`): képenként a `development_prefs.xml`-ből – 07973b4
- [x] Zárolóképernyő 2.3.6–5.1.1 (`lockscreen.js`, `lockscreen.css`): a Beállítások képernyőzár-beállítása képenként a Settings.apk elrendezései és szövegei szerint (`docs/lock-strings.py`); 4.x: choose / confirm_lock_pattern és _password (fejléc, code_lock_top / bottom, password_field_default, tiltott Continue / OK); 5.1.1: Material (Theme.Material.Settings, „Swipe”, 12 dp #37474F pöttyök, teal / #F4511E állapot, Cancel / Next); a 2.3.6-ból 30 halott szabály kikerült – f0c3454
- [x] (~2–3 óra) Billentyűzet KK / LP: a saját LatinImeGoogle (KK 2.0 KLP, LP 4.0 LXX Light), nyelvenkénti kiosztás (QWERTY / QWERTZ / AZERTY / Ñ), szimbólumok, PIN-hez a jelszavas számbillentyűzet, Kész / Tovább akciógomb; LP keyguardon alul, teljes szélességben (7b71bc1)
- [x] Widgetek 2.3.6–5.1.1 (`widgets.js`, `widgets.css`): a 4.4.4 / 5.1.1 zene-widgetje a saját Music2.apk Play Music widgetje (KK widget_nowplaying_small, LP music_widget_small), a tálcában a previewImage; a 2.3.6-ban csak a GB saját widgetjei és a képlista-segéd maradt; halott CSS kivéve; `docs/widget-providers.py` – 1b0f554
- [x] Beállítások aloldalai (`settings-system.js`, `settings-system.css`, `settings-detail.css`): 4.0.4 / 4.3 / 4.4.4 / 5.1.1 a `docs/settings-system.template.js`-ből generálva, a saját kép XML-jei és szövegei szerint (dátum, biztonság, eszközkezelők, megosztás, speciális Wi-Fi, VPN, mobilhálózat, szolgáltatók, APN); KK „Widgetek engedélyezése” (alapból ki, a zárképernyő widgetoldalait is ez kapcsolja); a 2.3.6-ból az elérhetetlen ICS-oldalak kikerültek – 29f1e9d
- [x] Hívásképernyő 2.3.6 / 4.0.4 / 4.3 (`phone-call.js`, `phone-call.css`): a 2.3.6 hívásnapló-részlete a GB saját CallDetailActivity-je (a Holo-oldal helyett), a GB-ből a halott ICS-telefonkód és CSS kikerült; a 4.0.4 / 4.3 a saját Phone.apk xhdpi grafikáival, a 4.3 vége-gombja ic_dial_end_call az end_call_background textúrán – dfdd809
- [x] (~2 óra) Csörgő ébresztő 2.3.6–5.1.1: GB AlarmAlert (saját `dialog` 9-patch, ButtonBar), 4.0.4 Holo AlarmAlert, 4.3 / 4.4 AlarmAlertFullScreen GlowPad (4.3: félkövér óra, vékony „:mm”), 5.1 Material AlarmActivity (óraszín, húzás, kör-felfedés, „Elhalasztva / Riasztás ki” szöveg); szövegek a képek DeskClock-jából (`docs/alarm-strings.py`), a sávok a témák szerint (83af141)
- [x] (~2 óra) Üzenetek 2.3.6 / 4.0.4 / 4.3 / 4.4.4: 4.0.4 / 4.3 saját messaging.js és Mms-szövegek (mms-strings.js), menük, smiley-lista, üzenetmenü (zárolással), törlés- és részletek-ablak a saját kódjuk szerint; GB-ből a halott ICS-overlay és CSS kiment; a KK mms-* stílusait a Hangouts használja, azt a Hangouts-tétel rendezi. Nyitott: a 4.3 címzettmezőjének chipjei (0a70456)
- [x] (~2 óra) Letöltések 4.4.4 / 5.1.1: az LP saját Material DocumentsUI 5.1.1-et kapott (Toolbar, ikonok, sorok, rács, popupok), a KK a saját MIME-ikonjait; nyitott: az LP háttérképválasztó még két KK DocumentsUI-ikont használ (bb5efa6)
- [x] (~2–3 óra) Naptár 4.3 / 4.4.4: a két kép Naptára szinte azonos verzió; a calendar.js képenként generált a saját szövegekkel (docs/calendar-jb.template.js), a túlcsordulás a forrás sorrendjében, a 4.3 „Egész nap” címkéje -8 dp (39a1072)
- [x] (~2–3 óra) People 2.3.6–5.1.1: képenkénti szövegek (people-strings.js), a részletek- és listamenük a forrás szerint, kitalált törlésgomb ki, törlés-megerősítés képenként (ICS címmel, 4.3/4.4 csak üzenet, LP Material, GB saját); GB halott ICS-ágak és people.css ki; a 4.0.4 és 4.3 people.js forrás szerint azonos maradt (f4f1d65)
- [x] Email 4.0.4 és 4.3 (`email.js`, `email.css`): AOSP Email a saját EmailGoogle.apk-jából, Galéria-választó a csatoláshoz – 08bbd0e
- [x] (~3 óra) Hangouts 4.4.4 / 5.1.1: a KK a Hangouts 2.0.303 saját grafikáival (ikonok, alapértelmezett avatar, SMS-jelvény), menük a forrás szerint; az LP nem tölti többé a KK hangouts.css-t, a néhány használt szabály az lp-hangouts.css-be került (e80b337)
- [x] (~3 óra) Galéria 4.4.4 / 5.1.1: a KK GalleryGoogle a 4.3-assal lényegében azonos, a különbség a fotómenü „Nyomtatás” eleme (felvéve); az LP képben nincs Galéria, a lp-gallery.js csak a Photos csoportosítását tartja, a halott Gallery2-kód és CSS kiment (39142dc)

## 5. Kis ráfordítású funkciók (6–8 óra)

- [x] Helyi keresés: Play Music és médiaappok, Keep, Drive, YouTube, GB Talk / Voice, Photos, dokumentumlisták – Play Music 5.0/5.2/5.8 (367edd9), Movies és Books (ca9c6f9), YouTube 4.5/5.2/10.03 (66c8a24), Keep 3.0 (82345f3), Drive 1.2/2.1 (7eda159), GB Talk (1384048) és Voice (6006173), Docs/Sheets/Slides (bced687). Nincs keresés a gyári menükben: Keep 1.0/2.0, Quickoffice 6.3 kezdőlap; a 4.3-as képben nincs Drive. A Photos (4.4/5.1) még nem APK-alapú, a keresése a 6. lépés Photos-átdolgozásával készül
- [x] Gmail csatolmány (GB, ICS) a galériából: a Galéria választó módja visszaadja a képet a nyitott piszkozatnak; GB image_attachment.xml, ICS attachment.xml a saját grafikákkal (3cc1c79)
- [x] Világóra városválasztással (JB / KK / LP): a képek saját cities.xml-je (dc-cities.js), CitiesActivity verziónként (JB betűfejlécek; KK/LP kiválasztottak elöl és rendezés), világóra-sorok a főóra alatt (8e4ea20)
- [x] GB Óra beállításai: SettingsActivity (néma mód, ébresztési hangerő, szundi hossza, hangerőgombok) – a szundi és a hangerőgombok valóban így működnek (dde691b)
- [x] GB kézi dátum, idő és időzóna (55ddac4)
- [x] Keep: jelölőnégyzetes lista és kép – Keep 1.0 / 2.0 / 3.0 listajegyzet (3.0-n „Checked” rész), jelölőnégyzetek ki-be, fotó készítése / választása (DocumentsUI), képtörlés (67bf0bc)
- [x] Google Now emlékeztetők és kártyabeállítások (4.4.4, 5.1.1) – Emlékeztetők lista, szerkesztő a Velvet napszak- és napválasztójával, emlékeztetőkártyák törléssel, időjárás-kártya hátoldala Celsius / Fahrenheit váltással (0bab781). Nincs még: „Dátum / Idő beállítása…”, Hely, „Időnként”; a 4.3 (Velvet 2.5.9) kártyabeállításai (predictive_cards_preferences) és emlékeztetői (ott hanggal / kereséssel készültek)
- [x] Chrome: böngészési adatok törlése és a beállítások – Chrome 27 / 32 / 40 beállításfejlécei, Adatvédelem oldal (jelölők, listák), „Böngészési adatok törlése” párbeszédablak (az előzmények valóban törlődnek), A Chrome névjegye (35cf603). A többi fejléc (keresőmotor, automatikus kitöltés, tartalombeállítások stb.) még üzenetet ad
- [x] E-mail / Gmail helyi beállításai (aláírás, értesítések, kategóriák) – Gmail 4.5.1 / 4.6.1 / 5.0.2 beállításai a képek XML-jeiből, működő beérkező-kategóriákkal és aláírással (068b09e); az AOSP E-mail 4.1 / 6.2 / 7.0 beállításai generátorral (docs/email-prefs.py), aláírással (675216f). A csengőhang, a gyors válaszok és a szerverbeállítások még üzenetet adnak
- [x] Beállítások kisebb aloldalai: választók és mentett állapot; az érintési késleltetésnek és a nagyításnak (háromszori koppintás) valódi hatása is legyen – Érintés és tartás késleltetése (a szimulátor összes hosszú érintése igazodik), Nagyítási kézmozdulatok (háromszoros koppintás, 2×, keret, pásztázás, csippentés), Hozzáférési gyorskombináció oldal (8374fb0)

## 6. Összetettebb helyi folyamatok (8–12 óra)

- [x] Naptár szerkesztő: az Ismétlődés és az Emlékeztetők legördülői még böngészős `<select>`-ek; a gyári Holo / GC5 spinner-párbeszédablakok kellenek (a 2. lépésből ide került); a 5.1-en az „All day” kapcsoló (Switch) is – Holo spinner + legördülő lista (4.0.4–4.4.4), GC5 párbeszédablak és kapcsoló (5.1.1) (24fbcd0)

- [x] People mezők teljes kezelése — a 3. lépéssel együtt elkészült (5c88248)
- [x] Naptár: résztvevők, elérhetőség, időzóna – Vendégek, Megjelenítés így / Adatvédelem (5.1: Láthatóság), az esemény időzónája a 4.0.4-es Naptár zónalistájával, a részletekben is (e04dc86). Az időzóna még nem számítja át a nézetek idejét
- [x] Photos (KK / LP) szerkesztő és oldalmenü bekötése – előbb az egész Photos a Google+ 4.2 / 4.9 APK-ból (a mostani a GSMArena-leírásból készült, „‹” jellel), benne a fotókeresés (host_photo_tile_search_activity, „Search for photos”) – KK: G+ 4.2.3 (a25b62a; a Szerkesztés a Galéria szerkesztőjét nyitja), LP: G+ 4.9.0 fiókkal (40c7f5f). Nincs még: az LP-n a G+ saját fotószerkesztője, a nem „Fotók” nézetek tartalma (Albumok, Automatikus szuperség, Videók, Rólad, Kuka)
- [x] Galéria-kivágás (GB / ICS) – GB: Gallery3D CropImage (narancs HighlightView, szimmetrikus átméretezés, Mentés / Elvetés, „Kép mentése…”); ICS: Gallery2 CropImage (kék CropView, élenkénti átméretezés, Mégse / Körülvágás az action baron), a vágott másolat az eredeti mellé kerül (f29faaf). Nincs még: a CropImageView / AnimationController ráközelítése a kis kijelölésre, arcfelismerés
- [x] Books: betűbeállítások, háttér, fejezetválasztás – mind az öt verzió a saját Books APK-ja szerint: GB eBooks 1.2.2 ReadingPreferenceActivity (előnézet, szövegméret, betűkép, sortávolság, igazítás, Nappal / Éjszaka, fényerő) és fejezetlista (b8137cf); ICS 2.3.6 felső beállításpanel és Tartalom-popup (2b22746); JB 2.8.91 és KK 3.1.33 Megjelenítési beállítások-popup és TableOfContentsActivity (b3ff3e0, d4b79d4); LP 3.3.15 kártya és kék ContentsView (471539b). Az APK-k saját betűtípusai, valódi témák, lépésközök és képernyő-tompítás; a mintakönyvek új fejezeteket kaptak. Nincs még: könyvjelzők, jegyzetek, felolvasás
- [x] Hangouts: archiválás, szundi, kép- és demóhely-megosztás – JB 1.0.2, KK 2.0.303, LP 2.5 a saját APK-juk menüivel: archiválás / visszaállítás és Archivált lista (újabb üzenet visszahozza), Értesítések elhalasztása 1–72 órára a narancs / piros sávval és Folytatással, KK-n ShareLocationActivity, LP-n a csatolás gomb Fotó / Hely menüje (demóhely üzenetként); JB 1.0.2-ben nincs helymegosztás, ott a gomb kikerült (f951097, 833a4bb, f7e7b37). Nincs még: a szundi hatása értesítésekre (a szimulátorban nem érkezik új üzenet), visszavonás (undo)
- [x] News & Weather: cikkoldal, frissítés, beállítások (GB beállítások is) – GenieWidget 1.3.04 / 1.3.11 (GB, ICS, JB, KK) Preferences közös sablonból verziónként generálva (docs/news-prefs.py): időjárás (hely, metrikus), témák (egyéni is), előtöltés, automatikus frissítés, gyakoriság, állapot – valódi hatással; cikkoldal megosztással, frissítés; ICS-en a menügomb a navigációs sávban (7ddddfd, f087cb2). LP: News & Weather 2.2 kibontható hírek, cikkoldal, időjárás-menü dialógusai, sötét téma, frissítés. Nincs még: kiadások, szakaszok kezelése (LP)
- [x] GB hálózati képernyők és mentett profilok (Hotspot, VPN, APN, szolgáltató) – a Nexus S Settings / Phone APK-ja szerint: hotspot-beállítás (WifiApDialog, WPA2 jelszószabály, Wi-Fi ki / vissza, értesítés), tethering-súgó a kép HTML-jéből (magyar oldal nincs a képen: angolul jelenik meg); VPN-típusválasztó, PPTP / L2TP / IPSec PSK / CRT szerkesztő hibaüzenetekkel, kapcsolódási ablak, „VPN csatlakoztatva” értesítés, hosszú érintéses menü; a titkos kulcsot igénylő profilok előtt a tanúsítványtároló (jelszó beállítása / feloldás / törlés, 4 próbálkozás) – ez a Biztonság oldalon is működik; APN-lista az apns-conf.xml 216 30 soraiból, APN-szerkesztő ellenőrzéssel, Új APN / Alaphelyzet; szolgáltatókeresés, idegen hálózat elutasítva, saját vagy automatikus regisztráció; adatbarangolás figyelmeztetéssel (aa86503). Nincs még: telepíthető tanúsítványok (a CRT-profil így nem menthető, mint a gyáriban tanúsítvány nélkül)
- [x] GB Névjegyek: megjelenítési beállítások, fiókok demó; import / export demó „SD-kártyára” – a Nexus S Contacts / Phone APK-ja szerint: Megjelenítési beállítások (csak telefonszámmal, rendezés és névsorrend, a Google-fiók csoportjai, szinkroncsoport hozzáadása / eltávolítása, Kész / Visszaállítás) valódi hatással a listára; Fiókok → Fiókok és szinkronizálás; Importálás/exportálás: SIM-import (3 demó névjegy, egyenként vagy mind), exportálás az USB-tárra (a kép „nosdcard” változat: /sdcard/00001.vcf…), importálás onnan (nincs fájl / egy / több / mind), folyamatjelzők; a látható névjegyek és egy névjegy megosztása (eddig semmit sem csinált) Gmailbe .vcf csatolmánnyal (8dd7fb6). Nincs még: Bluetooth-, E-mail- és SMS/MMS-megosztás (üzenetet adnak)
- [x] Talk: barát hozzáadása, keresés – GB Talk 1.3: a két menü a gyári buddy_list_menu.xml / chat_screen_menu.xml sorrendjében (eddig nem az volt), Barát hozzáadása (AddBuddyScreen; @gmail.com kiegészítés, ahogy a kód), Meghívások lista, Letiltottak, Legnépszerűbbek / Minden barát, Névjegy megtekintése; ICS Talk 4.0: SearchView a javaslatsorokkal („Csevegési előzmények keresése…”, „Meghívó küldése…”), „Chats matching” találatok, Barát hozzáadása CANCEL / DONE sávval és „Invitation sent.” üzenettel, a túlcsorduló menü a gyári szerint. A két sablon (docs/gb-talk.template.js, docs/ics-google-apps.template.js) le volt maradva a generált fájlok mögött; előbb visszaszinkronizálva (6bad3cd). Nincs még: Talk beállítások, kijelentkezés, csoportos csevegés
- [x] Maps-útvonalak és -opciók; Navigation demóútvonal – GB: a Navigation útvonal-opciói (autópályák / útdíjak elkerülése, hatással az útvonalra) és az Útvonalterv-lista (3776d67); ICS / JB Maps 6.4 / 6.14: útvonaltervező panel (módok, elkerülések), útvonallista lépésekkel, útvonal a térképen sávval, Navigation demóút (zöld kanyarsáv, döntött térkép, állapotsor, kilépés-megerősítés), a Navigation „Cél begépelése” csempéje is (3c1a464); KK / LP Maps 7.5 / 9.3: útvonal-kezdőoldal (módok, honnan / hova, csere, útvonal-opciók), útvonalkártya kis térképpel, Útvonal-opciók párbeszédablak (LP-n kompok is), lépéslista, navigáció zöld fejléccel és alsó sávval (2051400). Az ICS/JB Maps 6.x szerverről jövő szövegei (Avoid highways, Honnan / Hova) a KK Maps 7.5 fordításaiból jönnek. Nincs még: tömegközlekedési útvonalak, több útvonal-alternatíva, hangos navigáció
- [x] Quickoffice / Docs / Sheets / Slides: létrehozás, átnevezés, törlés, megnyitás (szerkesztés nélkül) – a Drive fájllistája mentett, közös lista lett (Drive, Quickoffice, szerkesztők); KK Quickoffice 6.3.1: Új fájl (Dokumentum / Táblázat / Bemutató), üres „Még nincs mentve” lap, Mentés a Legutóbbi fájlok közé, hosszú érintésre Átnevezés / Törlés; LP Docs / Sheets / Slides 1.4: „+” Névtelen dokumentum (táblázat / bemutató), fájlonkénti műveletmenü a gyári menu_doclist_context szerint, Átnevezés és Eltávolítás megerősítéssel (327d08d). Nincs még: a többi menüpont (megosztás, áthelyezés, nyomtatás) csak üzenetet ad
- [ ] LP Interruptions / Downtime
- [ ] LP képernyőrögzítés (screen pinning)
- [ ] LP kamerabeállítások
- [ ] Videófelvétel a galériába (4.3+)
- [ ] Panoráma demóeredménnyel
- [ ] Google Settings aloldalai
- [ ] LP biztonsági aloldalak (demóállapot)
- [ ] GB Google Voice keresés és beállítások
- [ ] Csengő- és ébresztőhang-előnézet, ébresztés nyitott oldalon
- [ ] Fejlesztői beállítások: választók és mentett állapot

## 7. Megbeszélés (az audit utolsó pontja)

- [ ] Play Store / Market verzióeltérések megtárgyalása (2.3.6 Market 3.x, 4.0.4 Play 3.8.17, 4.4.4 Play 4.8.22, 5.1.1 Play 4.8.22 felirat az 5.2-es kinézet mellett), utána a döntés szerinti javítás
- [ ] KitKat Gmail: a gyári kép 4.6.1, a szimulátor 4.7-es képernyőképek alapján – megtárgyalni
- [x] Boot képernyők (a tulajdonos ötlete, 2026-10-06): verziónként a gyári bootanimáció, ami alatt az assetek betöltődhetnek; kattintásra azonnal továbblép. Döntés 2026-10-08: fix idő helyett az animáció nem vágódik el, legalább egy teljes kör lemegy; fülenként (verziónként) egyszer, frissítéskor nincs; utána a zárképernyő. Kész: a rendszer akkor „indult el”, ha az oldal és a betűk betöltődtek (legfeljebb 12 s), és ez mindig az ismétlődő rész egy körének végén történik (a bekapcsológombos újraindításnál is); érintés vagy billentyű átugorja, csökkentett mozgásnál kimarad. Gyors netnél 2.3.6 / 4.0.4 kb. 3,2 s, 4.4.4 3,6 s, 4.3 4,6 s, 5.1.1 8 s – 65d64c9

## 8. Keresőmotorok (a tulajdonos kérése, 2026-10-08; az audit legvégén)

- [x] `sitemap.xml` a gyökérben: a kezdőoldal és a verziók oldalai (android.levente.net), `lastmod` értékkel – statikus fájl, a `docs/make-sitemap.mjs` generálja a `versions/catalog.js` elérhető verzióiból, a `lastmod` az oldalt utoljára módosító commit dátuma; oldalváltozás után újra kell futtatni (README: Search engines); `tests/sitemap.test.cjs` – 8b6e6bd
- [x] Megengedő `robots.txt` (mindent enged), `Sitemap: https://android.levente.net/sitemap.xml` sorral – 8b6e6bd

## Nem csináljuk meg

- Valódi háttérműködés: hívás, SMS, szinkron, fizetés, hardveres rádiók, Face Unlock, titkosítás, valódi visszajelzés-küldés (a képernyőik és demóállapotuk igen)
- Irodai dokumentumszerkesztés
- Photo Sphere és Lens Blur
- LP több felhasználó és vendégmód (a gyári képernyők és párbeszédablakok igen)
- Movie Studio új projekt folyamata
- Messenger és Local mélyebb folyamatai
- Talk csoportos beszélgetés
- A fejlesztői beállítások vizuális hatásai (GPU-sávok, másodlagos kijelző)
- A mutatósebesség hatása
- Ébresztés bezárt böngészőnél

## Későbbi megbeszélésre

- Play / Market célverziók (2.3.6 Market 3.x, 4.0.4 Play 3.8.17, 4.4.4 Play 4.8.22, 5.1.1 Play 4.8.22 felirat az 5.2-es kinézet mellett)
- KitKat Gmail: a gyári kép 4.6.1, a szimulátor 4.7-es képernyőképek alapján

## Napló

| Dátum | Lépés | Commit |
| --- | --- | --- |
| 2026-10-05 | Munkaterv rögzítve | 800e107 |
| 2026-10-05 | 1. lépés: szöveges ikonok cseréje | 18f9838 |
| 2026-10-05 | 2. lépés, 4.0.4: Naptár From / To választók, alsó sáv nélkül; Óra TimePickerDialog | 5786aa8 |
| 2026-10-05 | 2. lépés, 4.3 / 4.4 / 5.1: Naptár datetimepicker, alsó sáv nélkül | 5c4ee69 |
| 2026-10-05 | 3. lépés: ICS Language & input | ac61964 |
| 2026-10-05 | 3. lépés: People szerkesztő (4.0.4, 4.3, 4.4) | 5c88248 |
| 2026-10-05 | 3. lépés: AOSP Music menük (4.0.4, 4.3) | fee85ca |
| 2026-10-05 | 4. lépés: 4.3 Keep 1.0, YouTube 4.5; stock-strings.js; a „‹” jel helyett keretrendszer-nyíl a StockApps-ban | 5d6e97d |
| 2026-10-05 | 4. lépés: 4.3 Maps 6.14 (menük, alkalmazásválasztó, rétegek, térképgombok) | 519de57 |
| 2026-10-05 | 4. lépés: 4.3 Google+ 4.0 (sáv, értesítésszám, menü, compose sáv) és Earth 7.1 (átlátszó sáv, menü) | 91548d3 |
| 2026-10-05 | 4. lépés: 4.3 Google Search 2.5.9 / Google Now a Velvet.apk-ból (velvet-now.js a KitKatos gel-now.js helyett) | 7d1270b |
| 2026-10-05 | 4. lépés: 4.3 Voice Search a Velvet speak_now.xml-jéből | 2a71725 |
| 2026-10-05 | 4. lépés: 4.3 News & Weather a GenieWidget.apk-ból; 44 hibás `.851.6px` hossz javítva a 4.3 CSS-ében + teszt | e0eb0b6 |
| 2026-10-05 | 4. lépés: 4.3 Google Settings a PrebuiltGmsCore-ból (sáv, a dex sorrendje); stock-strings.py aapt2-vel olvassa a kihagyott APK-kat | 71d403f |
| 2026-10-05 | 4. lépés: Earth akciósáv a max_action_buttons szerint (4.3 javítás); 4.4.4: S() + stock-strings.js, News & Weather, Earth 7.1.3, Google Settings (GMS 4.3.23) | 630f9c5 |
| 2026-10-05 | 4. lépés: 4.4.4 Google Now a Velvet 3.3.11-ből (fejléckép, keresőmező, kártyák, More, lábléc) | 86a2beb |
| 2026-10-05 | 4. lépés: 4.4.4 Voice Search a Velvet 3.3.11 keresőmezőjének hangmódjából | c1c9596 |
| 2026-10-05 | 4. lépés: 4.4.4 Maps 7.5 (omnibox, vízjel, saját hely, oldalfül és rétegmenü) | adc394c |
| 2026-10-05 | 4. lépés: 4.4.4 Keep 2.0 (fiók, átfedő sáv, menük) | 1e5d0d2 |
| 2026-10-05 | 4. lépés: 4.4.4 YouTube 5.2 (logós sáv, Guide a dex sorrendjében, kártyák, nézőoldal) | a831eae |
| 2026-10-05 | 4. lépés: 4.4.4 Drive 1.2 (sáv, menü, navigációs panel, dokumentumsorok időcsoportokkal) | 392811a |
| 2026-10-05 | 4. lépés: 4.4.4 Google+ 4.2 (csengő, menü a dex szerint, compose sáv) – a 4.4.4 StockApps kész | (3c730d4) |
| 2026-10-05 | 4. lépés: 5.1.1 S() + stock-strings.js; Google Settings a GMS 6.7 odex-kódjából (kategóriák, sorrend) | 671e106 |
| 2026-10-05 | 4. lépés: 5.1.1 Earth 8.0.1 (gradiens Toolbar, AppCompat-menü, iránytű, Pegman, fiók) | 418fd1b |
| 2026-10-05 | 4. lépés: 5.1.1 News & Weather 2.2 (világos Toolbar, menü a dex szerint, szekciókártyák, időjárás, fiók; állapotsor-szín) | 717cfb5 |
| 2026-10-05 | 4. lépés: 5.1.1 Keep 3.0 (sárga Toolbar, lebegő gyorsjegyzet, fiók a dex szerint, szerkesztő menü) | 1ad9c1d |
| 2026-10-05 | 4. lépés: 5.1.1 Maps 9.3 (keresőmező, FAB, saját hely, oldalmenü) | f9bc37d |
| 2026-10-05 | 4. lépés: 5.1.1 Drive 2.1 (szürke sáv, menü, dokumentumsorok, navigációs panel a dex szerint) | 157103c |
| 2026-10-05 | 4. lépés: 5.1.1 YouTube 10.03 (piros Toolbar, listás feed, Guide a dex szerint, állapotsor-szín) | 30a9e8f |
| 2026-10-05 | 4. lépés: 5.1.1 Google+ 4.9 (piros Toolbar, értesítések, kártyák, FAB) | 9aa69e4 |
| 2026-10-05 | 4. lépés: 5.1.1 Google Now a Velvet 4.1.29-ből (fejléc, hamburger, navigációs fiók, nincs alsó sáv) | 297450b |
| 2026-10-05 | 4. lépés: 5.1.1 Voice Search a Velvet 4.1 hangmódjából – az 5.1.1 StockApps kész | (579af40) |
| 2026-10-05 | 4. lépés: 4.3 Play Books 2.8.91 (FlatBlue sáv, oldalfiók a dex szerint, Recent kártyák, szűrő, világos menü, olvasó sávja) | 87b0518 |
| 2026-10-05 | 4. lépés: 4.3 Play Movies 2.5.4 (sötét Holo, csíkos háttér, „Google Play” sáv, fülek, panelek, menük a dex szerint) | 22ca636 |
| 2026-10-05 | 4. lépés: 4.3 Play Music 5.0 (odex a rendszerképből; sáv, fiók a HomeMenu szerint, fülek, Instant Mixes, menü, kártyák) | bc3daf0 |
| 2026-10-05 | 4. lépés: 4.4.4 Play Music 5.2 (sáv, fiók a HomeMenu szerint, fülek, Instant Mixes, világos menü, kártyák) + S()/menu() a 4.4.4 Play-appokhoz | 4242d30 |
| 2026-10-05 | 4. lépés: 4.4.4 Play Movies 3.0 (piros nav_bar, fiók a VideosDrawerHelper szerint On Device-szal, menük, szekciócímek) | 125efcf |
| 2026-10-05 | 4. lépés: 4.4.4 Play Books 3.1 (FlatBlue sáv, fiók a dex szerint Settings/Help sorokkal, menü, olvasó sávja) | c386e55 |
| 2026-10-05 | 4. lépés: 4.4.4 Play Games 1.1 (zöld sáv, fiók, menü, APK-szövegek) – a 4.4.4 Play-appok kész | ff79528 |
| 2026-10-05 | 4. lépés: 5.1.1 Play Music 5.8 (Toolbar, PlayDrawer profilfejléccel és ikonokkal, fejlécfülek, csak Search) + közös LP Play-alapok | 9fbd894 |
| 2026-10-06 | 4. lépés: 5.1.1 Play Movies 3.6 (PlayDrawer a VideosDrawerHelper szerint, csak Search, My Library fülek, Watch Now, Wishlist, állapotsor-szín) | 70f037a |
| 2026-10-06 | 4. lépés: 5.1.1 Play Books 3.3 (PlayDrawer, Search/Sort ikonok, Refresh menü, szűrőfülek, olvasó sávja) | a0ba6e1 |
| 2026-10-06 | 4. lépés: 5.1.1 Play Games 2.2 (zöld Toolbar, PlayDrawer, Settings menü, Play Now szekciók, Inbox, Explore fülek) – az 5.1.1 Play-appok kész | 31611fa |
| 2026-10-06 | 4. lépés: 4.3 Navigation (Maps 6.14 DestinationActivity: fekete Holo, lapcímsor, csempék) | 3b4a987 |
| 2026-10-06 | 4. lépés: 4.3 Local (Maps 6.14 Places: világos fejléc, helysáv, kategóriarács térképháttérrel) | 41eb4f7 |
| 2026-10-06 | 4. lépés: 4.3 Messenger (Google+ 4.0 host bar, New conversation gomb, menü, beszélgetéssorok) | d5a4909 |
| 2026-10-06 | 4. lépés: 4.3 Currents 2.1 (kategóriamenü a csúszó panel alatt, csempék, menü) | 154fa92 |
| 2026-10-06 | 4. lépés: 4.3 Play Magazines 2.0 (lila sáv, fiók, menü, kártyarács) | e79485b |
| 2026-10-06 | 4. lépés: 4.3 Wallet 1.6 (dashboard_activity gombjai) | fc9f643 |
| 2026-10-06 | 4. lépés: 4.3 Movie Studio (AOSP ProjectPickerAdapter új projekt csempéje) – a 4.3 extra appok kész, teszttel | d949245 |
| 2026-10-06 | 4. lépés: 4.0.4 Navigation (Maps 6.4 régi fejléce + csempék), Places, Movie Studio; 4.0.4 stock-strings.js | c9dbdb1 |
| 2026-10-06 | 4. lépés: 4.0.4 Messenger (Google+ 2.4 EsActionBar, menü, sorok) – a 4.0.4 és 4.3 extra appok kész | 46b0155 |
| 2026-10-06 | 4. lépés: 4.4.4 extra appok (Newsstand fiók + menük, Quickoffice fiókjel nélkül, Wallet fiók) | 9a989a1 |
| 2026-10-06 | 4. lépés: 5.1.1 Docs/Sheets/Slides (app_name cím, Search + Add new, menü, Drive típusikonok, nincs FAB) | 0afba8e |
| 2026-10-06 | 4. lépés: 5.1.1 Fit (nincs fiók/keresés, menü), Newsstand (PlayDrawer, csak Search), Wallet (nincs menü) – az extra appok kész | 854ff90 |
| 2026-10-06 | 4. lépés: „‹” jelek: 4.0.4 Earth 6.1 sávja az APK-ból, 4.0.4 StockApps bar() csak felfelé lépve, Play-appok holt ágai | 48e59a4 |
| 2026-10-06 | 4. lépés (kiegészítés): 4.0.4 Maps 6.4 a map_view_default menüvel, funkcióváltóval, rétegekkel | 22ed243 |
| 2026-10-06 | 4. lépés (kiegészítés): 4.0.4 News & Weather 1.3.04 (nincs action bar, 1.3.11-es elrendezések, IMM76I-grafikák) | ef96563 |
| 2026-10-06 | 4. lépés: fájlnevek – 25 idegen előtagú fájl átnevezve (4.0.4 ics-extra-apps, 4.3 jb-email, 4.4.4 kk-camera/gallery/shade/…, 5.1.1 lp-gallery/downloads/gel/play/…); az image-strings kimenete változatlan | ccc3156 |
| 2026-10-06 | 4. lépés: rétegzett párok összevonva (4.4.4: 7, 5.1.1: 11 fájl), LP Play-appok saját `play-apps.css`; `tests/version-files.test.cjs` (korszak-előtag, bájtazonosság csak szűkülő listán) | 6d1889f |
| 2026-10-06 | 5. lépés: helyi keresés – Play Music, Movies, Books, YouTube, Keep, Drive, GB Talk és Voice, Docs/Sheets/Slides az APK-k keresőfelületével | bced687 |
| 2026-10-06 | 4. lépés, közös fájlok: AOSP Email 4.0.4 és 4.3 az EmailGoogle.apk-ból, Galéria-választó a csatoláshoz | 08bbd0e |
| 2026-10-06 | 4. lépés, közös fájlok: KK kamera-animáció, Fejlesztői beállítások képenként, LP keresőpanel, KK Recents/Launcher, halott másolatok (BeanBag, Nyandroid, GB clings és mappastílus) | ec87102 |
| 2026-10-06 | 4.5. pont: hangerőpanel verziónként (GB hangerő-toast, 4.x saját framework-res grafikák) | 548be6f |
| 2026-10-06 | Célzott javítás: navigációs sáv gombjai középen (4.0.4 / 4.3 / 4.4.4, navigation_bar.xml) | 7ef6ef5 |
| 2026-10-06 | Célzott javítás: KitKat Recents a rendszersávok alatt is (LAYOUT_FULLSCREEN, örökölt áttetszőség) | 5a06436 |
| 2026-10-06 | 4.5. pont: Kikapcsoló menü verziónként (párbeszédablakok a saját képből, LP Material) és a gyári bootanimációk | e5d8357, 7abd7d0 |
| 2026-10-06 | 4.5. pont: Zárolóképernyő – a képernyőzár-beállítás képenként (4.x Holo, 5.1.1 Material), saját szövegekkel | f0c3454 |
| 2026-10-06 | 4.5. pont: Widgetek – KK / LP Play Music widget a saját APK-ból, GB tisztítás | 1b0f554 |
| 2026-10-07 | 4.5. pont: Beállítások aloldalai képenként (generált, saját XML és szövegek), KK zárképernyő-widgetek kapcsolója | 29f1e9d |
| 2026-10-07 | 4.5. pont: Hívásképernyő – GB CallDetailActivity, 4.x saját Phone-grafikák | dfdd809 |
| 2026-10-07 | 4.5. pont: Csörgő ébresztő képenként (GB / ICS AlarmAlert, JB / KK GlowPad, LP AlarmActivity) | 83af141 |
| 2026-10-07 | 4.5. pont: KK / LP rendszer-billentyűzet a saját LatinImeGoogle-ből (KLP, LXX Light) | 7b71bc1 |
| 2026-10-07 | 4.5. pont: Üzenetek képenként (Mms-szövegek, menük, smiley, zárolás, párbeszédablakok; GB tisztítás) | 0a70456 |
| 2026-10-07 | 4.5. pont: Letöltések – LP saját Material DocumentsUI, KK MIME-ikonok | bb5efa6 |
| 2026-10-07 | 4.5. pont: Naptár 4.3 / 4.4.4 képenként generálva, túlcsordulás-menü a forrás szerint | 39a1072 |
| 2026-10-07 | 4.5. pont: People képenként (szövegek, menük, törlés-ablakok; GB tisztítás) | f4f1d65 |
| 2026-10-07 | 4.5. pont: Hangouts – KK saját APK-grafikák, LP KK-stíluslap nélkül | e80b337 |
| 2026-10-07 | 4.5. pont: Galéria – KK Nyomtatás menüpont, LP Gallery2-maradványok ki | 39142dc |
| 2026-10-07 | 5. lépés: Gmail csatolmány a galériából (GB, ICS) | 3cc1c79 |
| 2026-10-07 | 5. lépés: Világóra városválasztással (JB / KK / LP) | 8e4ea20 |
| 2026-10-07 | 5. lépés: GB Óra beállításai | dde691b |
| 2026-10-07 | 5. lépés: GB kézi dátum, idő és időzóna | 55ddac4 |
| 2026-10-07 | 5. lépés: Keep listák és képek | 67bf0bc |
| 2026-10-07 | 5. lépés: Google Now emlékeztetők és kártyabeállítások | 0bab781 |
| 2026-10-07 | 5. lépés: Chrome beállítások és böngészési adatok törlése | 35cf603 |
| 2026-10-07 | 5. lépés: Gmail beállítások (kategóriák, aláírás) | 068b09e |
| 2026-10-07 | 5. lépés: E-mail beállítások (generált, aláírás) | 675216f |
| 2026-10-07 | 5. lépés: Kisegítő lehetőségek: érintés-késleltetés, nagyítás | 8374fb0 |
| 2026-10-08 | 6. lépés: Naptár-szerkesztő spinnerek, 5.1 Egész nap kapcsoló | 24fbcd0 |
| 2026-10-08 | 6. lépés: Naptár vendégek, elérhetőség, időzóna | e04dc86 |
| 2026-10-08 | 6. lépés: Photos újraépítve a G+ 4.2.3 / 4.9.0 APK-ból | a25b62a, 40c7f5f |
| 2026-10-08 | 6. lépés: Galéria-kivágás (GB, ICS) | f29faaf |
| 2026-10-08 | 6. lépés: Books olvasóbeállítások és tartalomjegyzék (GB, ICS, JB, KK, LP) | b3ff3e0, d4b79d4, 471539b, 2b22746, b8137cf |
| 2026-10-08 | 6. lépés: Hangouts archiválás, szundi, hely- és képmegosztás (JB, KK, LP) | f951097, 833a4bb, f7e7b37 |
| 2026-10-08 | 6. lépés: News & Weather beállítások, cikkoldal, frissítés (mind az öt verzió) | 7ddddfd, f087cb2, f8d01f2 |
| 2026-10-08 | 6. lépés: GB hálózati képernyők (hotspot, VPN, tanúsítványtároló, APN, szolgáltató) | aa86503 |
| 2026-10-08 | 6. lépés: GB Névjegyek megjelenítési beállításai, fiókok, importálás/exportálás, megosztás | 8dd7fb6 |
| 2026-10-08 | 6. lépés: Talk barát hozzáadása, keresés (GB, ICS) | 6bad3cd |
| 2026-10-08 | 6. lépés: Maps útvonalak, opciók és Navigation demóútvonal (mind az öt verzió) | 3776d67, 3c1a464, 2051400 |
| 2026-10-08 | 6. lépés: Quickoffice / Docs / Sheets / Slides fájlkezelés (KK, LP) | 327d08d |
| 2026-10-08 | 8. lépés: sitemap.xml (generált, statikus) és robots.txt | 8b6e6bd |
| 2026-10-08 | Célzott javítás: KitKat Óra ébresztőlista be/ki kapcsolója (a csúszka a sávban, gyári thumbTextPadding) | 05c939e |
| 2026-10-08 | 7. lépés: boot új fülben, a gyári animáció legalább egy teljes körével, utána zárképernyő | 65d64c9 |
