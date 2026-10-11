# Sources and regeneration

Every version is rebuilt from its own factory image. The images and their unpacked `/system` stay out of Git (`_aosp/` is
ignored: they are large and Google's); the tools, the commands and the generated files are in the repository. This page
says what to fetch, how to unpack it and how to rebuild and check the generated files.

## Factory images

| Folder | Version | Phone | Build | Fingerprint | Factory package |
| --- | --- | --- | --- | --- | --- |
| `_aosp/crespo` | 2.3.6 | Nexus S | GRK39F | google/soju/crespo:2.3.6/GRK39F/189904 | `soju-grk39f-factory-5ab09c98.tgz` |
| `_aosp/maguro` | 4.0.4 | Galaxy Nexus | IMM76I | google/yakju/maguro:4.0.4/IMM76I/330937 | `yakju-imm76i-factory-8001e72f.tgz` |
| `_aosp/mako` | 4.3 | Nexus 4 | JWR66Y | google/occam/mako:4.3/JWR66Y/776638 | `occam-jwr66y-factory-74b1deab.tgz` |
| `_aosp/hammerhead` | 4.4.4 | Nexus 5 | KTU84P | google/hammerhead/hammerhead:4.4.4/KTU84P/1227136 | `hammerhead-ktu84p-factory-35ea0277.tgz` |
| `_aosp/shamu` | 5.1.1 | Nexus 6 | LMY48Y | google/shamu/shamu:5.1.1/LMY48Y/2364368 | `shamu-lmy48y-factory-505ed306.zip` |

The packages come from Google's factory image page (`https://dl.google.com/dl/android/aosp/<package>`); the hash in a
package name is the first eight digits of its SHA-1. Google no longer serves the Nexus S package; the copy used here is the
Wayback Machine's capture of the same Google URL (2013-11-13), and its SHA-1 matches the name.

## Unpacking and indexing

Python 3.10+ with `androguard`, `loguru`, `ext4` and `Pillow`; Node 20+ for the `.mjs` tools; headless Chrome for the
runtime checks.

1. `python docs/extract-image.py _aosp/<device> _aosp/<device>/<factory package>` — package → `system.raw.img` → `system/`
   (app, priv-app, framework with the odex files, media, fonts, build.prop).
2. `python docs/image-index.py _aosp/<device>` — `strings-index.json`: every string resource of the image's APKs
   (English → APK, resource name, hu / de / fr / es), which the text generators read.

## Generated files

- Texts: `node docs/texts.mjs` reruns every text generator with its arguments (the list is in the script);
  `node docs/texts.mjs --check` fails when an output differs from the committed one. The tables are in the named form
  `strings.js` reads (`{res | own | src, hu, de, fr, es, en?}`); `res` names the image resource of each row.
  `docs/image-strings-<version>.res` fixes which shared rows a version takes from its image.
- Launcher icons: `python docs/image-icons.py _aosp/<device> <density> <version> <id>=<APK>[:<activity>] …` (2.3.6 hdpi,
  4.0.4 xhdpi, 4.3 xhdpi, 4.4.4 xxhdpi, 5.1.1 xxxhdpi).
- Drawables of an app module: each module's header names the APK and density its `assets/<prefix>-*` files come from;
  compiled nine-patches are copied as stored (the APK keeps their padding and stretch areas in the npTc chunk).
- Boot animations, sounds, fonts and the other data generators: see each `docs/*.py` header.
- Asset inventory: `python docs/asset-inventory.py [version…]` traces every file of `versions/<v>/assets` (and
  `assets/audio`) to its image — APK or system file, resource path, density, transformation (copy, same pixels,
  resized, converted, rotated, nine-patch border removed, vector drawn as SVG, transcoded sound, generated sprite sheet)
  and both hashes — into `docs/assets/<version>.tsv`, with a summary in `docs/asset-inventory.md`. Files no image file
  matches take their source from `docs/asset-sources.tsv`; the rest are listed for review.
  `python docs/asset-inventory.py --check` (`npm run regenerate:assets`) is the trial regeneration: every traced file is
  rebuilt from its source and compared, the boot animation sheets by rerunning `docs/bootanimation.py`.

## Checks

- `node --test tests/*.cjs` — the module tests, including `text-tables`, `text-entries`, `strings` and `assets`.
- `node docs/text-survey.mjs --md docs/text-survey.md` — the inventory of the text tables (audit point 10).
- `node docs/text-check.mjs` — every app of every version opened in hu / de / fr / es; missing keys → `docs/text-check.md`.
- `node tests/asset-inventory.test.cjs` (in `npm test`) — the inventory lists exactly the asset files, with their hashes.
- `node docs/asset-unused.mjs` — asset files no code, page, test or built-up path uses (a list to check by hand before
  deleting; empty after the 2026-10 cleanup).
- `node docs/asset-check.mjs` — stylesheet url()s and literal asset paths (case-sensitive), failed requests while every
  app opens, and the asset folders' inventory → `docs/asset-check.md`.

The runtime checks need a server for the repository root (`php -S localhost:8090 -t .`, or `BASE=…`).
