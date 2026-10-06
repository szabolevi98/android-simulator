# Audit munkaterv – 2026. október

Forrás: `android-szimulator-audit-2026-10-04.md` (a tulajdonos külön sessionben készült auditja, a `c2f0c49` állapotra).
Egyeztetve: 2026-10-05. A Play/Market verzióeltérések és a KitKat Gmail 4.6.1 / 4.7 verziókérdése egyelőre kimarad.

Szabályok: minden lépés a gyári képből (`_aosp/<device>`) dolgozik, nem tippből. Lépésenként tesztek, commit és push;
élesítés (VPS) csak a legvégén. A kész tételek mellé a commit azonosítója kerül.

**Állapot:** a 4.5. ponton vagyok (közös fájlok tételenként): 10 / 30 kész.

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

**Állás: 10 / 30 kész.**

- [x] Email 4.0.4 és 4.3 (`email.js`, `email.css`): AOSP Email a saját EmailGoogle.apk-jából, Galéria-választó a csatoláshoz – 08bbd0e
- [x] Kamera 4.3 / 4.4.4 (`camera.css`): azonos erőforrások, a 4.4 rögzítési animációja – 48347e4
- [x] Fejlesztői beállítások 4.3 / 4.4.4 / 5.1.1 (`devopts.js`): képenként a `development_prefs.xml`-ből – 07973b4
- [x] Navigációs keresőpanel 4.3 / 4.4.4 / 5.1.1 (`search.js`): LP SearchPanelCircleView, Google Now indítás – 5a69717
- [x] Recents 4.3 / 4.4.4 (`recents.js`): KK bg_protect – 5a69717
- [x] Kezdőképernyő átrendezés 4.3 / 4.4.4 (`launcher.js`): Launcher3 időzítés – 8fa6eb5
- [x] BeanBag 4.3 / 4.4.4 (`beanbag.js`): a 4.4.4-ből kivéve, a képben nincs – 56aff7d
- [x] Nyandroid 2.3.6 / 4.0.4 (`nyandroid.js`): a 2.3.6-ból kivéve, a GB-ben nincs – df6c518
- [x] Indító-tippek 2.3.6 / 4.0.4 / 4.3 (`launcher-clings.js`, `.css`): a 2.3.6-ból kivéve, 4.0.4 / 4.3 ellenőrizve – e38ebd3, ec87102
- [x] GB mappák (`launcher-folders.css` 2.3.6): a felülíró ICS-stílus kivéve – ec87102
- [ ] Mappák 4.0.4 / 4.3 és 4.4.4 / 5.1.1 (`launcher-folders.js`, `launcher-folders.css`)
- [ ] Email modell 2.3.6 / 4.4.4 / 5.1.1 (`email.js`, `email.css`: csak a postafiók-modell és egy régi párbeszédablak él belőlük)
- [ ] Naptár 4.3 / 4.4.4 (`calendar.js`)
- [ ] Hangouts 4.4.4 / 5.1.1 (`hangouts.css`; a 4.4.4 most képernyőképek alapján készült, a képben Hangouts 2.0.303 van)
- [ ] Galéria 4.4.4 / 5.1.1 (`gallery.js`, `gallery.css`; a KK most a 4.3-as Galéria, az LP képben nincs Galéria)
- [ ] Letöltések 4.4.4 / 5.1.1 (`downloads.js`, `downloads.css`; az LP most a 4.4-es DocumentsUI)
- [ ] Kikapcsoló menü 2.3.6–5.1.1 (`global-actions.js`, `global-actions.css`)
- [ ] Hangerőpanel 2.3.6–5.1.1 (`volume-panel.js`, `volume-panel.css`)
- [ ] Zárolóképernyő 2.3.6–5.1.1 (`lockscreen.js`, `lockscreen.css`)
- [ ] Média (Kamera / Galéria közös rajzolás) 2.3.6–5.1.1 (`media.js`, `media.css`)
- [ ] Üzenetek 2.3.6 / 4.0.4 / 4.3 / 4.4.4 (`messaging.js`, `messaging.css`)
- [ ] People 2.3.6–5.1.1 (`people.js`, `people.css`)
- [ ] Hívásképernyő 2.3.6 / 4.0.4 / 4.3 (`phone-call.js`, `phone-call.css`)
- [ ] AOSP Zene 4.0.4–5.1.1 (`music.js`, `music.css`)
- [ ] Widgetek 2.3.6–5.1.1 (`widgets.js`, `widgets.css`)
- [ ] Beállítások aloldalai (`settings-system.js`, `settings-system.css`, `settings-detail.css`)
- [ ] Élő háttérképek 4.0.4 / 4.3 (`live-wallpapers.css`)
- [ ] Play Store stílus 2.3.6–5.1.1 (`play-store.css`)
- [ ] Böngésző stílus 2.3.6–5.1.1 (`browser.css`)
- [ ] Óra stílus 2.3.6–5.1.1 (`desk-clock.css`)

## 5. Kis ráfordítású funkciók (6–8 óra)

- [x] Helyi keresés: Play Music és médiaappok, Keep, Drive, YouTube, GB Talk / Voice, Photos, dokumentumlisták – Play Music 5.0/5.2/5.8 (367edd9), Movies és Books (ca9c6f9), YouTube 4.5/5.2/10.03 (66c8a24), Keep 3.0 (82345f3), Drive 1.2/2.1 (7eda159), GB Talk (1384048) és Voice (6006173), Docs/Sheets/Slides (bced687). Nincs keresés a gyári menükben: Keep 1.0/2.0, Quickoffice 6.3 kezdőlap; a 4.3-as képben nincs Drive. A Photos (4.4/5.1) még nem APK-alapú, a keresése a 6. lépés Photos-átdolgozásával készül
- [ ] Gmail csatolmány (GB, ICS) a galériából
- [ ] Világóra városválasztással (JB / KK / LP)
- [ ] GB Óra beállításai
- [ ] GB kézi dátum, idő és időzóna
- [ ] Keep: jelölőnégyzetes lista és kép
- [ ] Google Now emlékeztetők és kártyabeállítások
- [ ] Chrome: böngészési adatok törlése és a beállítások
- [ ] E-mail / Gmail helyi beállításai (aláírás, értesítések, kategóriák)
- [ ] Beállítások kisebb aloldalai: választók és mentett állapot; az érintési késleltetésnek és a nagyításnak (háromszori koppintás) valódi hatása is legyen

## 6. Összetettebb helyi folyamatok (8–12 óra)

- [ ] Naptár szerkesztő: az Ismétlődés és az Emlékeztetők legördülői még böngészős `<select>`-ek; a gyári Holo / GC5 spinner-párbeszédablakok kellenek (a 2. lépésből ide került); a 5.1-en az „All day” kapcsoló (Switch) is

- [x] People mezők teljes kezelése — a 3. lépéssel együtt elkészült (5c88248)
- [ ] Naptár: résztvevők, elérhetőség, időzóna
- [ ] Photos (KK / LP) szerkesztő és oldalmenü bekötése – előbb az egész Photos a Google+ 4.2 / 4.9 APK-ból (a mostani a GSMArena-leírásból készült, „‹” jellel), benne a fotókeresés (host_photo_tile_search_activity, „Search for photos”)
- [ ] Galéria-kivágás (GB / ICS)
- [ ] Books: betűbeállítások, háttér, fejezetválasztás
- [ ] Hangouts: archiválás, szundi, kép- és demóhely-megosztás
- [ ] News & Weather: cikkoldal, frissítés, beállítások (GB beállítások is)
- [ ] GB hálózati képernyők és mentett profilok (Hotspot, VPN, APN, szolgáltató)
- [ ] GB Névjegyek: megjelenítési beállítások, fiókok demó; import / export demó „SD-kártyára”
- [ ] Talk: barát hozzáadása, keresés
- [ ] Maps-útvonalak és -opciók; Navigation demóútvonal
- [ ] Quickoffice / Docs / Sheets / Slides: létrehozás, átnevezés, törlés, megnyitás (szerkesztés nélkül)
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
