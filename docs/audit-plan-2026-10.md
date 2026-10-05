# Audit munkaterv – 2026. október

Forrás: `android-szimulator-audit-2026-10-04.md` (a tulajdonos külön sessionben készült auditja, a `c2f0c49` állapotra).
Egyeztetve: 2026-10-05. A Play/Market verzióeltérések és a KitKat Gmail 4.6.1 / 4.7 verziókérdése egyelőre kimarad.

Szabályok: minden lépés a gyári képből (`_aosp/<device>`) dolgozik, nem tippből. Lépésenként tesztek, commit és push;
élesítés (VPS) csak a legvégén. A kész tételek mellé a commit azonosítója kerül.

**Állapot:** a 4. lépésben vagyok: a 4.3-as és a 4.4.4-es StockApps kész; 5.1.1-en Google Settings kész, következik a többi 5.1.1 StockApps (Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google, Voice Search).

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

- [ ] A StockApps, Play- és extra appok megmaradt „‹” vissza-jeleinek cseréje (az 1. lépésből ide került)
- [x] `stock-apps.js` – 4.3 (JWR66Y): Google/Now, Voice Search, Maps 6.14, Keep 1.0, YouTube 4.5, Google+ 4.0, Earth, News & Weather, Google Settings (71d403f)
- [x] `stock-apps.js` – 4.4.4 (KTU84P): ugyanezek a KitKat-kép verzióival (3c730d4)
- [ ] `stock-apps.js` – 5.1.1 (LMY48Y): Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google, Google Settings
- [ ] `play-apps.js` – 4.3: Play Music 5.0, Movies 2.5.4, Books 2.8 (most a Books 3 kinézete), Games
- [ ] `play-apps.js` – 4.4.4: Play Music, Movies, Books, Games
- [ ] `play-apps.js` – 5.1.1: Play Music, Movies, Books, Games
- [ ] Extra appok – 4.0.4 és 4.3: Messenger, Navigation, Local, Currents, Magazines, Wallet, Movie Studio
- [ ] Extra appok – 4.4.4: Newsstand, Quickoffice, Wallet
- [ ] Extra appok – 5.1.1: Docs, Sheets, Slides, Fit, Newsstand, Wallet
- [ ] Fájlnevek rendbetétele (pl. a 4.0.4-es `jb-extra-apps.js` → `ics-extra-apps.js`)
- [ ] Örökölt és felülírt CSS-párok összevonása (a `play-apps.css` 4.4 és 5.1 alatt bájtra azonos, LP-n `lp-play.css` írja felül): a Lollipop saját stíluslapot kap
- [ ] Teszt: két verzió alkalmazásfájlja ne lehessen bájtra azonos

## 5. Kis ráfordítású funkciók (6–8 óra)

- [ ] Helyi keresés: Play Music és médiaappok, Keep, Drive, YouTube, GB Talk / Voice, Photos, dokumentumlisták
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
- [ ] Photos (KK / LP) szerkesztő és oldalmenü bekötése
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
