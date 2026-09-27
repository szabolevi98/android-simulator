# Android 4.0.4 vizuális összevetés

Az etalon a **gyári AOSP/Galaxy Nexus Android 4.0.x**, nem a Samsung TouchWiz. Az összevetés forrásai:

- A beszélgetésben küldött korabeli Beállítások és Akkumulátor képernyőkép
- A beszélgetésben küldött Galaxy Nexus kezdőképernyő-fotó
- [Google Android 4.0 bemutató, képernyőképek és funkcióleírás](https://developer.android.com/about/versions/android-4.0-highlights)
- [AOSP android-4.0.4_r2.1 forráskód](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-4.0.4_r2.1)

## Ellenőrzött képernyők

| Képernyő | Megállapítás | Állapot |
| --- | --- | --- |
| Beállítások főoldal | A korábbi világos felület hibás volt. Sötét Holo háttér, kék elválasztó, kis fehér ikonok, korabeli kapcsolóforma és csoportok kerültek be. | Jelentősen javítva; a sorok mérete és néhány ikon még nem pixelpontos. |
| Akkumulátor | A korábbi egyetlen töltöttségcsík nem hasonlított a mintára. Fogyasztási grafikon és részletezett alkalmazáslista került be. | A mellékelt kép elrendezéséhez közelít; a számok mintadatok. |
| Értesítési panel | Az eredeti ICS nem a későbbi Android gyorsbeállítás-csempéit használta. A csempék kikerültek, a panel sötét, dátumot és beállítási ikont mutat, az értesítések oldalra húzhatók. | Funkció és korszak helyesebb; a betűméretek és térközök tovább finomítandók képernyőkép alapján. |
| Alkalmazásfiók | A sötét háttér, APPS/WIDGETS fülek, kék aktív csík és AOSP ikonok megvannak. | Hiányos: az eredeti gyári alkalmazáskészlet nagyobb és több soros; a sorrend is eltér. |
| Legutóbbi alkalmazások | Az Android 4.0 valódi alkalmazás-előnézeteket mutatott. A sima ikonlista helyére kicsinyített nézetek kerültek. | A megoldás közelebb áll az eredeti működéshez; az animáció és kártyaméret még hozzávetőleges. |
| Kezdőképernyő | A fotóhoz igazodó sötét Google kereső, analóg pontóra, Camera és Google mappa, dokk feletti vonal, AOSP Chroma háttérkép és gyári navigációs ikonok kerültek be. Az öt lap működik. | A mappa tartalma és a pontos méretezés további egyeztetést igényel. |
| Zárolt képernyő | Óra, feloldás, kameraindítás és értesítések elérhetők. | Hiányos: a feloldó gyűrű és a gesztus visszajelzése stilizált. |
| Telefon, üzenetek, kamera, galéria és többi alkalmazás | Az alap műveletek mintadatokkal működnek. | Ezek még nem kaptak teljes, képernyőnkénti vizuális egyeztetést; több nézet saját demonstrációs elrendezést használ. |

Az öt nyelv a kezelőfelület fő szövegeit fedi le. A szimulált levelek, kapcsolatok, weboldalak és egyes magyarázó szövegek továbbra is angol mintatartalmak. A következő vizuális körben a még hiányos képernyőkhöz konkrét Android 4.0.4 referenciafotót vagy AOSP felületforrást kell párosítani, és az alapján javítani a kinézetet. Nem tekintjük a mostani megjelenést teljesen hitelesnek.
