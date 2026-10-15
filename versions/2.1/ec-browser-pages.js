/* Android 2.1 Browser: the simulator's own small offline web of early 2010, made up (the other versions have theirs in
   the same spirit): the Google mobile home page and its results, www.android.com with Eclair, a Wikipedia article (and
   the Maps Wikipedia layer's places), a tech news site and "the 2010 Web". Any other address is what the WebView shows
   for a site it cannot reach (nodomain.html, ec-webpages.js). EC.browserPages.page(url) → {title, html} or null. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const link = (url, text) => `<a class="ecbw-a" data-action="ecbr-open" data-url="${esc(url)}">${esc(text)}</a>`;
  const result = (url, title, snippet) => `<div class="ecbw-result">${link(url, title)}<div class="ecbw-snip">${esc(snippet)}</div><div class="ecbw-url">${esc(url.replace(/^http:\/\//, '').replace(/\/$/, ''))}</div></div>`;
  const ANDROID = 'http://www.android.com/', WIKI = 'http://en.m.wikipedia.org/wiki/Android_(operating_system)', NEWS = 'http://news.example/', RETRO = 'http://retro.example/';
  const logo = '<div class="ecbw-logo"><span style="color:#2756c4">G</span><span style="color:#d6281c">o</span><span style="color:#f2b600">o</span><span style="color:#2756c4">g</span><span style="color:#1e9a37">l</span><span style="color:#d6281c">e</span></div>';
  const searchForm = (q = '') => `<form class="ecbw-search" data-form="ecbw-search"><input name="q" value="${esc(q)}" autocomplete="off" spellcheck="false" aria-label="Search"><button type="submit">Search</button></form>`;
  const isGoogle = u => /^http:\/\/www\.google\.[a-z.]+\/(m\b|search|$)/.test(u) || /^http:\/\/(www\.)?google\.com\/?$/.test(u);
  const query = u => { const m = /[?&]q=([^&]*)/.exec(u); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };
  function google(u) {
    const q = query(u);
    if (!q) return {title: 'Google', html: `<div class="ecbw-google">${logo}${searchForm()}<div class="ecbw-tabs"><b>Web</b> · <span>Images</span> · <span>Local</span> · <span>News</span> · <span>more »</span></div>
      <div class="ecbw-tiles">${[[ANDROID, 'Android'], [WIKI, 'Wikipedia'], [NEWS, 'Tech News'], [RETRO, 'The 2010 Web']].map(([url, text]) => link(url, text)).join('')}</div>
      <div class="ecbw-foot">Offline demo pages · 2010</div></div>`};
    const words = q.toLocaleLowerCase();
    const list = [[ANDROID, 'Android – Android 2.1, Eclair', 'Quick Contact, voice input in every text field, live wallpapers and a new 3D gallery.'],
      [WIKI, 'Android (operating system) – Wikipedia', 'Android is a mobile operating system based on the Linux kernel, developed by Google and the Open Handset Alliance.'],
      [NEWS, 'Tech News – phones, apps and the mobile web', `Stories about ${q} and the latest in mobile.`],
      [RETRO, 'The 2010 Web', 'A small time capsule from the early smartphone era.']];
    const ranked = list.map(r => ({r, hit: `${r[1]} ${r[2]}`.toLocaleLowerCase().split(/\W+/).filter(w => w && words.includes(w)).length})).sort((a, b) => b.hit - a.hit).map(x => x.r);
    return {title: `${q} - Google Search`, html: `<div class="ecbw-results">${logo.replace('ecbw-logo', 'ecbw-logo small')}${searchForm(q)}<div class="ecbw-count">Web results for <b>${esc(q)}</b></div>${ranked.map(r => result(...r)).join('')}</div>`};
  }
  const article = (title, body) => `<div class="ecbw-wiki"><div class="ecbw-wbar">W<span>ikipedia</span></div><h1>${esc(title)}</h1><p class="ecbw-from">From Wikipedia, the free encyclopedia</p>${body}</div>`;
  function wiki(u) {
    const name = decodeURIComponent(u.replace(/^.*\/wiki\//, '')).replace(/_/g, ' ');
    if (/^Android/.test(name)) return {title: 'Android (operating system) - Wikipedia, the free encyclopedia', html: article('Android (operating system)', `<p><b>Android</b> is a mobile operating system based on a modified version of the Linux kernel. It was first developed by Android Inc., bought by Google in 2005, and later by the Open Handset Alliance.</p>
      <h2>Versions</h2><ul><li>1.5 Cupcake</li><li>1.6 Donut</li><li>2.0 / 2.1 Eclair</li></ul><p>Android 2.1 brought live wallpapers, a 3D photo gallery and voice input wherever there is a keyboard.</p><p>${link(ANDROID, 'Official website')}</p>`)};
    const place = EC.maps?.WIKI?.find(w => w.name === name);
    if (place) return {title: `${place.name} - Wikipedia, the free encyclopedia`, html: article(place.name, `<p><b>${esc(place.name)}</b>: ${esc(place.text)}</p><p>${link(WIKI, 'Android (operating system)')}</p>`)};
    return null;
  }
  function page(u) {
    if (!u) return null;
    if (isGoogle(u)) return google(u);
    if (/wikipedia\.org\/wiki\//.test(u)) return wiki(u);
    if (/^http:\/\/(www\.)?android\.com/.test(u)) return {title: 'Android.com - Android 2.1', html: `<div class="ecbw-android"><div class="ecbw-alogo">android</div><h2>Android 2.1, Eclair</h2>
      <p>The newest version of Android: Quick Contact for all your contacts, voice input in every text field, live wallpapers that move under your home screen and a new photo gallery in 3D.</p>
      <div class="ecbw-hero">Eclair</div><h3>Google Maps Navigation (Beta)</h3><p>Turn-by-turn, voice-guided directions, free on your phone.</p><p>${link(WIKI, 'Learn about Android')}</p></div>`};
    if (/^http:\/\/news\.example\/nexus/.test(u)) return {title: 'A month with the Nexus One - Tech News', html: `<article class="ecbw-article"><h2>A month with the Nexus One</h2><time>February 2, 2010 · Demo archive</time>
      <p>A bright 3.7-inch screen, a trackball that lights up for new messages and four touch keys under the glass. The phone is thin, the menus are quick, and the new live wallpapers keep moving behind your icons.</p>
      <h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple dark look. Swipe between five home screens, open the 3D app drawer, and pull down the notification shade.</p>
      <h3>Make it yours</h3><p>Pick a live wallpaper, add the power control widget and keep your favourite contacts one tap away. This small offline archive is a made-up snapshot of the early smartphone era.</p><p>${link(NEWS, 'Back to Tech News')}</p></article>`};
    if (/^http:\/\/news\.example/.test(u)) return {title: 'Tech News', html: `<div class="ecbw-news"><h2>Tech News</h2><p class="ecbw-date">Tuesday, February 2, 2010</p><hr>
      <h3>${link('http://news.example/nexus-one', 'A month with the Nexus One')}</h3><p>Living with Android 2.1: live wallpapers, voice input and the 3D gallery.</p>
      <h3>Maps you can star</h3><p>Starred places now follow you from your computer to your phone.</p><h3>Apps in your pocket</h3><p>The Market passes twenty thousand apps; here are ten worth a try.</p><p>${link(RETRO, 'Visit the 2010 Web')}</p></div>`};
    if (/^http:\/\/retro\.example/.test(u)) return {title: 'The 2010 Web', html: `<div class="ecbw-news"><h2>Welcome to the 2010 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>
      <p>${link(NEWS, 'Read Tech News')}</p><p>${link('http://www.google.com/m?client=ms-android-google&source=android-home', 'Back to Google')}</p></div>`};
    return null;
  }
  EC.browserPages = {page, query, isGoogle};
})();
