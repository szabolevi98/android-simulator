/* Google Now on the Nexus 6: the Google Now Launcher's left-most pane and the Google app, both Google Search 4.1.29
   (Velvet.apk of the LMY48Y image). now_client_cards_view.xml: GelNavigationDrawerLayout around GelNowCardsView on
   activity_background #eeeeee; the time-of-day picture (context_header_bg_*, a 2562 x 500 strip, cropped to the
   96 dp header) under the translucent status bar; the search plate (search_bg) with ic_hamburger, ic_google_small_dark and
   ic_mic_dark; the cards 24 dp below on card_background with Velvet's styles (unchanged from 3.3); load_more_card.xml
   ("More", italic qp_h2 on card_bg_training). There is no in_app_footer any more: Reminders and Customize moved into
   navigation_menu.xml (Reminders, Customize, a #1f000000 divider, Settings, Help & feedback; 48 dp rows, icons 16 dp in,
   14 sp sans-serif-medium text 72 dp in). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Velvet's own texts from stock-strings.js, else i18n.
  const S = (t, locale, key) => { const row = window.StockStrings?.google?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : t(key); };
  // The weather pictures come from the web in Google Now; these stand in for them.
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
  const CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
  const period = hour => hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'daylight' : hour >= 17 && hour < 20 ? 'dusk' : 'twilight';
  const menu = s => `<button class="gnow-card-menu" data-action="sa-unsupported" aria-label="${e(s('Card menu'))}"><img src="assets/vn4-ic_more_horz.png" alt=""></button>`;
  // weather_card.xml: the title, the 96 dp picture with the 90 dp temperature beside it, the description, wind and
  // precipitation under the picture, then weather_forecast_column.xml's label, icon, bold high and light low.
  function weather(now, t, locale, s) {
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const days = temps.map((_, i) => new Date(now.getTime() + i * 864e5).toLocaleDateString(locale, {weekday: 'short'}));
    return `<section class="gnow-card gnow-weather"><h3>Mountain View</h3>${menu(s)}<div class="gnow-weather-now"><span class="gnow-weather-icon">${CLOUD}</span><b>${temps[0][0]}°</b></div><div class="gnow-weather-cond"><p>${e(t('Partly cloudy'))}</p><p><img src="assets/vn4-ic_weather_wind.png" alt="">13 km/h</p><p><img src="assets/vn4-ic_weather_umbrella.png" alt="">10%</p></div><div class="gnow-week">${temps.map(([hi, lo], i) => `<div><span>${e(days[i])}</span>${i % 2 ? SUN : CLOUD}<b>${hi}°</b><small>${lo}°</small></div>`).join('')}</div></section>`;
  }
  function render({data, t, locale, now}) {
    const s = key => S(t, locale, key);
    const today = now.toISOString().slice(0, 10);
    const event = (data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    // next_appointment_card.xml: the title, appt_time in CardText.Large, then the View in Calendar button.
    const when = event ? `${new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'})}${event.time ? ', ' + event.time : ''}` : '';
    const eventCard = event ? `<section class="gnow-card gnow-appt"><h3>${e(event.title)}</h3>${menu(s)}<p class="gnow-appt-time">${e(when)}</p>${event.location ? `<p>${e(event.location)}</p>` : ''}<button class="gnow-action" data-action="open-app" data-app="calendar">${e(s('View in Calendar'))}</button></section>` : '';
    return `<div class="gnow-page" data-gnow><div class="gnow-scroll"><div class="gnow-header" style="background-image:url('assets/vn4-context_header_bg_${period(now.getHours())}.jpg')"></div><div class="gnow-plate"><button class="gnow-plate-menu" data-action="gnow-drawer" aria-label="${e(t('Menu'))}"><img src="assets/vn4-ic_hamburger.png" alt=""></button><button class="gnow-plate-logo" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/vn4-ic_google_small_dark.png" alt="Google"></button><button class="gnow-plate-mic" data-action="open-app" data-app="voice-search" aria-label="${e(s('Tap to speak'))}"><img src="assets/vn4-ic_mic_dark.png" alt=""></button></div><div class="gnow-cards">${weather(now, t, locale, s)}${eventCard}<button class="gnow-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(s('More'))}</button></div></div><div class="gnow-drawer"><button class="gnow-drawer-scrim" data-action="gnow-drawer" aria-label="${e(t('Close'))}"></button><nav>${[['Reminders', 'ic_reminder', 'toast'], ['Customize', 'ic_customize', 'toast']].map(([key, icon, action]) => `<button data-action="${action}" data-id="${e(s(key))}"><img src="assets/vn4-${icon}.png" alt="">${e(s(key))}</button>`).join('')}<hr>${[['Settings', 'ic_settings', 'gel-overview-settings'], ['Help & feedback', 'ic_help_and_feedback', 'toast']].map(([key, icon, action]) => `<button data-action="${action}" data-id="${e(s(key))}"><img src="assets/vn4-${icon}.png" alt="">${e(s(key))}</button>`).join('')}</nav></div></div>`;
  }
  window.GELNow = {render};
})();
