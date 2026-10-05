# Android Simulator

![Android Time Machine: the Nexus S, Galaxy Nexus, Nexus 4 and Nexus 5, each running its own Android version](assets/og-cover.jpg)

**Live demo:** [android.levente.net](https://android.levente.net/)

An interactive browser simulator of classic Android releases, each on its own Nexus phone and rebuilt from AOSP sources, the phones' factory images and period screenshots. Choose a version on the landing page:

| Version | Phone | Store |
| --- | --- | --- |
| [Android 2.3.6 Gingerbread](docs/visual-audit-2.3.md) | Nexus S | Android Market 3 |
| [Android 4.0.4 Ice Cream Sandwich](docs/features-4.0.4.md) | Galaxy Nexus | Google Play Store 3.8 |
| [Android 4.3 Jelly Bean](docs/features-4.3.md) | Nexus 4 | Google Play Store 4.2 |
| [Android 4.4.4 KitKat](docs/features-4.4.4.md) | Nexus 5 (Google apps) | Google Play Store 4.8 |
| [Android 5.1.1 Lollipop](docs/features-5.1.1.md) | Nexus 6 (Google apps) | Google Play Store 5.2 |

## Getting started

**Live demo:** [android.levente.net](https://android.levente.net/), served as a static site from a checkout of `main`. A mirror runs on [GitHub Pages](https://szabolevi98.github.io/android-simulator/).

GitHub Pages publishes the repository root from the `main` branch automatically after each push. The `.nojekyll` file keeps this plain static site out of Jekyll processing. Deployment progress is available in the repository's **Actions** tab, and the publishing source is configured under **Settings → Pages**.

The project uses static HTML, CSS, and JavaScript. No installation or build step is required. Open `index.html`, or start a local server from the project root:

```bash
php -S 127.0.0.1:8090 -t .
```

Then visit `http://127.0.0.1:8090/`. With XAMPP, place the repository in `htdocs/android-simulator`.

## Features per version

What each version does, screen by screen:

- [Android 2.3.6 Gingerbread](docs/visual-audit-2.3.md) on the Nexus S (the audit doubles as its feature list)
- [Android 4.0.4 Ice Cream Sandwich](docs/features-4.0.4.md) on the Galaxy Nexus
- [Android 4.3 Jelly Bean](docs/features-4.3.md) on the Nexus 4
- [Android 4.4.4 KitKat](docs/features-4.4.4.md) on the Nexus 5, with the stock Google apps
- [Android 5.1.1 Lollipop](docs/features-5.1.1.md) on the Nexus 6, as its LMY48Y factory image ships it

## Social preview image

`assets/og-cover.jpg` (1200 × 630) is the `og:image` of every page. Its source is `docs/og-cover.html`, which lays out the phones from each version's frame and `landing-home.jpg`. To redraw it after a change, for example when a new version gets a landing shot, run the command below. It needs only Node and a local Chrome, or set `CHROME` to point at one. Then bump the `?v=` of `og-cover.jpg` in the `og:image` tags.

The portfolio card on levente.net uses a 1600 × 960 variant with an English headline, from `docs/portfolio-cover.html` (render it at 1200 × 720 with a 4/3 device pixel ratio).

```bash
node docs/make-og-cover.mjs
```

## Adding a version

1. Create a `versions/<version>/` directory with its own `index.html`, CSS, JavaScript, and assets.
2. Add an entry to `versions/catalog.js` with `status: 'available'` and a `url` pointing to the new directory.

Each version keeps its interface and saved state separate, so adding a release does not change the ICS simulation.

## Checks

Every test runs with plain Node, without packages:

```bash
for f in tests/*.test.cjs; do node "$f"; done
```

For AOSP asset sources and licenses, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Comparisons with the original interfaces and the remaining differences are in the visual audits: [2.3](docs/visual-audit-2.3.md), [4.0.4](docs/visual-audit.md), [4.3](docs/visual-audit-4.3.md) and [4.4](docs/visual-audit-4.4.md).

## License

Copyright © 2026 Levente Szabó (szabolevi98).

The project's original source code is licensed under the **GNU Affero General Public License, Version 3 only** (`AGPL-3.0-only`). See [LICENSE](LICENSE) for the full terms.

If you make a modified version available to users over a network, you must prominently offer those users free access to that version's complete corresponding source code, as required by section 13. The source code is available in this [repository](https://github.com/szabolevi98/android-simulator).

Third-party code, artwork, fonts and other assets remain subject to their own licenses and terms; they are not relicensed under the AGPL. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [third_party/](third_party/). Android and Google trademarks remain with their respective owners.
