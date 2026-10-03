/* Google Now as the Google Now Launcher's left-most pane on the stock Nexus 5 (Android Quick Start Guide 4.4: "On
   Nexus 5, you can also swipe to the leftmost Home screen"; "To dismiss a card on Nexus 5, swipe from left to right").
   A day/night header picture under the translucent status bar, the white Google search box (grey Google logo and
   microphone), cards in the guide's style (white, light 22 sp titles with the key figure in red, grey summaries,
   blue actions) on #e5e5e5, and the Reminders, Customize and Menu icons at the bottom. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  function header(hour) {
    const night = hour < 6 || hour >= 20, dusk = !night && (hour < 8 || hour >= 18);
    const sky = night ? ['#0d1b33', '#24365a'] : dusk ? ['#f39c6b', '#6d8fc7'] : ['#5aa8e8', '#bfe2f7'];
    const hills = night ? ['#1b2a3e', '#13202f'] : dusk ? ['#5c6f7a', '#3f4f58'] : ['#7fb069', '#5b8c4a'];
    return `<svg class="gnow-art" viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="gnow-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="360" height="150" fill="url(#gnow-sky)"/>${night ? '<circle cx="292" cy="38" r="13" fill="#f4f1de"/><circle cx="286" cy="34" r="12" fill="url(#gnow-sky)"/>' + [[40, 30], [90, 52], [150, 22], [205, 46], [250, 18], [330, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff" opacity=".8"/>`).join('') : `<circle cx="292" cy="46" r="${dusk ? 20 : 16}" fill="${dusk ? '#ffd27a' : '#fff6c9'}" opacity=".95"/>`}<path d="M0 118 C60 86 110 96 170 108 S290 84 360 102 V150 H0Z" fill="${hills[0]}"/><path d="M0 132 C80 112 150 124 220 132 S320 118 360 126 V150 H0Z" fill="${hills[1]}"/></svg>`;
  }
  function weather(hour, t) {
    const days = [0, 1, 2, 3].map(i => new Date(Date.now() + i * 86400000));
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
    const cloud = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
    return `<div class="gnow-card gnow-weather"><div class="gnow-weather-now"><div><div class="gnow-big">${temps[0][0]}°C</div><div class="gnow-sub">${e(t('Partly cloudy'))}</div><div class="gnow-sub">Mountain View</div></div><div class="gnow-weather-icon">${cloud}</div></div><div class="gnow-forecast">${days.map((d, i) => `<div><span>${e(d.toLocaleDateString(t.locale, {weekday: 'short'}))}</span>${i % 2 ? sun : cloud}<span><b>${temps[i][0]}°</b> ${temps[i][1]}°</span></div>`).join('')}</div></div>`;
  }
  function render({data, t, locale, now}) {
    t.locale = locale;
    const hour = now.getHours();
    const today = now.toISOString().slice(0, 10);
    const event = (data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    const eventCard = event ? `<div class="gnow-card"><div class="gnow-title"><em>${e(event.time || '')}</em> ${e(event.title)}</div><div class="gnow-sub">${e(new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'}))}</div><button class="gnow-action" data-action="open-app" data-app="calendar">${e(t('View in Calendar'))}</button></div>` : '';
    const tip = `<div class="gnow-card gnow-tip"><img src="assets/gnow-mic.png" alt=""><div><div class="gnow-title">${e(t('Just say “Ok Google”'))}</div><div class="gnow-sub">${e(t('Say “Ok Google” on a Home screen to search or tell your phone what to do.'))}</div></div></div>`;
    return `<div class="gnow-page" data-gnow><div class="gnow-scroll"><div class="gnow-header">${header(hour)}<button class="gnow-search" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/l3-ic_home_google_logo_normal_holo.png" alt="Google"><span></span><img class="gnow-search-mic" src="assets/gnow-mic.png" alt=""></button></div><div class="gnow-cards">${weather(hour, t)}${eventCard}${tip}<button class="gnow-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(t('More'))}</button></div><div class="gnow-bar"><button data-action="toast" data-id="${e(t('Reminders'))}" aria-label="${e(t('Reminders'))}"><img src="assets/gnow-reminders.png" alt=""></button><button data-action="toast" data-id="${e(t('Customize'))}" aria-label="${e(t('Customize'))}"><img src="assets/gnow-customize.png" alt=""></button><button data-action="toast" data-id="${e(t('Settings'))}" aria-label="${e(t('More options'))}"><img src="assets/gnow-menu.png" alt=""></button></div></div></div>`;
  }
  window.GELNow = {render};
})();
