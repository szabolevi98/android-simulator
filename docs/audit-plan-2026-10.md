# Audit munkaterv – 2026. október

Forrás: `android-szimulator-audit-2026-10-04.md` (a tulajdonos külön sessionben készült auditja, a `c2f0c49` állapotra).
Egyeztetve: 2026-10-05. A Play/Market verzióeltérések és a KitKat Gmail 4.6.1 / 4.7 verziókérdése egyelőre kimarad.

Szabályok: minden lépés a gyári képből (`_aosp/<device>`) dolgozik, nem tippből. Lépésenként tesztek, commit és push;
élesítés (VPS) csak a legvégén. A kész tételek mellé a commit azonosítója kerül.

**Állapot:** az 1. lépés kész. Következő: 2. lépés (Naptár dátum- és időválasztók).

## 1. Szöveges ikonok cseréje (becslés: 1–1,5 óra)

- [x] ICS YouTube: Like / Dislike és a többi akcióikon a YouTube 3.5.5 APK-ból — közben kiderült, hogy a YouTube 3.5.5 világos témájú (`Theme.Holo.Light.DarkActionBar`), ezért az egész app a gyári elrendezést kapta (COMMIT)
- [x] ICS Google-appok közös `icon()` segédje: a jelekből rajzolt ikonok (Google+ új bejegyzés, Talk hozzáadás, Books tartalomjegyzék, Latitude bejelentkezés stb.) cseréje appokként a saját APK ikonjára; a Talk sötét akciósávot kapott (a gyári téma szerint), overflow menük a menü-XML-ek alapján, a Google+ kezdőrács, a Kereső és a Voice Dialer jelei is lecserélve (COMMIT)
- [x] News & Weather frissítés: célkereszt helyett a gyári menü verziónként (4.0.4: overflow-ban; 4.3 / 4.4: `navigation_refresh`; 5.1: Search, Add section, overflow) (COMMIT)

## 2. Rendszeresen látható, nem Android-eredetű vezérlők (3–4 óra)

- [ ] Naptár dátum- és időválasztó verziónként (ICS / JB / KK görgetős, LP Material)
- [ ] Naptár saját alsó sávjának (Previous / nézet / Next) kivétele; gyári lapozás és nézetválasztó (4.0.4, 4.3, 4.4)
- [ ] ICS Óra időválasztó: az eredeti ICS TimePicker

## 3. Egyszerűsített fontos oldalak (4–5 óra)

- [ ] ICS Language & input a gyári hierarchiával (helyesírás, személyes szótár, beviteli módok, hangbevitel, TTS, mutatósebesség)
- [ ] People szerkesztő 4.x: bővíthető, típusozható mezők, több telefonszám és e-mail, fotóválasztás
- [ ] AOSP Music (ICS / JB): gyári menük és navigáció; a „Demo tracks—no audio” szöveg kikerül a telefon felületéről

## 4. Közös sablonok leválasztása és APK-nkénti átnézése (8–12 óra)

Minden főképernyő a saját gyári APK-ja alapján: akciósáv (szín, magasság), betű, ikonok, elrendezés, üres állapot, menü.

- [ ] A StockApps, Play- és extra appok megmaradt „‹” vissza-jeleinek cseréje (az 1. lépésből ide került)
- [ ] `stock-apps.js` – 4.3 (JWR66Y): Google/Now, Voice Search, Maps 6.14, Keep 1.0, YouTube 4.5, Google+ 4.0, Earth, News & Weather, Google Settings
- [ ] `stock-apps.js` – 4.4.4 (KTU84P): ugyanezek a KitKat-kép verzióival
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

- [ ] People mezők teljes kezelése
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
| 2026-10-05 | 1. lépés: szöveges ikonok cseréje | COMMIT |
