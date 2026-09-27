# Android Simulator

Klasszikus Android-verziókat felidéző, böngészőben futó interaktív szimulátor. A kezdőlapon kiválasztható a verzió; jelenleg az **Android 4.0.4 Ice Cream Sandwich** használható. A következő tervezett verziók: Gingerbread 2.3.7, Jelly Bean 4.3, KitKat 4.4.4 és Lollipop 5.1.1.

## Indítás

A projekt tisztán statikus HTML, CSS és JavaScript, telepítés és build nélkül. Nyisd meg az `index.html` fájlt, vagy indíts helyi szervert a projekt gyökerében:

```bash
php -S 127.0.0.1:8090 -t .
```

Ezután nyisd meg a `http://127.0.0.1:8090/` címet. XAMPP alatt a mappa a `htdocs/android-simulator` helyre kerülhet.

## ICS funkciók

- Öt kezdőképernyő egérrel vagy érintéssel húzható lapozással, alkalmazásfiók, widgetek és alsó dokk.
- Ikonok húzással rendezhetők a kezdőképernyőn és a dokkon; az oldalpöttyre húzva másik oldalra kerülnek, a Remove célpontra húzva eltűnnek. Az alkalmazásfiók ikonjának nyomva tartása új parancsikont tesz a kezdőképernyőre.
- Zárolás és feloldás, értesítési sáv, alkalmazás-előnézetes legutóbbi alkalmazások és három szoftveres navigációs gomb.
- A Beállítások listája egérrel megfogva is görgethető; a sorok rövid kattintással továbbra is megnyílnak. Kapcsolók, fényerő és háttérválasztó is működik. A **Settings → About phone → Android version** sor ötszöri megnyomása megnyitja a korabeli easter egget; a figurát nyomva tartva indul a nyandroid animáció.
- Offline mintalapokat és keresést tartalmazó böngésző, lapok, könyvjelzők és előzmények.
- Telefon, névjegyek, üzenetek, kamera, galéria, naptár, óra, számológép, zene és e-mail mintafunkciók.
- A személyre szabás és a mintadatok `localStorage`-ban maradnak. A jobb felső visszaállítás gomb törli a szimulátor helyi állapotát.
- Angol, magyar, német, francia és spanyol kezelőfelület. Első indításkor a böngésző nyelvét követi; más nyelvnél az angol az alap. A nyelv a fejlécben és a Beállítások → Nyelv és bevitel alatt váltható.

A szimulátor nem futtat Androidot vagy APK-fájlokat. A hívások, weboldalak, kamera, zene és e-mail helyi demonstrációk, nem kapcsolódnak valódi szolgáltatásokhoz.

## Új verzió hozzáadása

1. Hozz létre egy új `versions/<verzió>/` mappát saját `index.html`, CSS, JavaScript és eszközfájlokkal.
2. Vegyél fel egy bejegyzést a `versions/catalog.js` fájlba `status: 'available'` értékkel és a mappára mutató `url` mezővel.

A verziók felülete és mentett állapota külön marad, ezért egy későbbi kiadás nem módosítja az ICS viselkedését.

## Ellenőrzés

```bash
node --check app.js
node --check i18n.js
node --check versions/catalog.js
node --check versions/4.0.4/simulator.js
```

Az AOSP eszközfájlok eredetét és licencét a [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) írja le.
Az eredeti Android felülettel végzett összevetés, valamint a fennmaradó eltérések a [docs/visual-audit.md](docs/visual-audit.md) fájlban vannak.
