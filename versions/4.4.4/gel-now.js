/* Google Now on the stock Nexus 5: the Google Now Launcher's left-most pane and the Google app, both Google Search
   3.3.11 (Velvet.apk of the KTU84P image). now_client_cards_view.xml: activity_background #eeeeee; the context header
   picture for the time of day (context_header_bg_dawn / _daylight / _dusk / _twilight) full width under the translucent
   status bar; velvet_search_plate.xml on search_bg (12 dp of shadow margin) with ic_google_small_dark and ic_mic_dark;
   the cards 12 dp below the picture on card_background, 10 dp apart (CardTitle 25 sp sans-serif-light #707070 with the
   card menu's ic_training_dots_normal, CardText 14 sp #8d8d8d, CardGridText 14 sp sans-serif-condensed, action buttons
   16 sp #4285f4 over card_action_button_bg_normal); load_more_card.xml ("More", italic #777 on
   card_background_tutorial); in_app_footer.xml: Reminders, Train Google Now and Menu, 56 dp each, spread by spaces.
   GSMArena's Nexus 5 review (shot 013 of the UI page) shows the same pane. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Velvet's own texts from stock-strings.js, else i18n.
  const S = (t, locale, key) => { const row = window.StockStrings?.google?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : t(key); };
  // The weather pictures come from the web in Google Now; these stand in for them.
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
  const CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
  const period = hour => hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'daylight' : hour >= 17 && hour < 20 ? 'dusk' : 'twilight';
  const menu = s => `<button class="gnow-card-menu" data-action="sa-unsupported" aria-label="${e(s('Card menu'))}"><img src="assets/vn3-ic_training_dots_normal.png" alt=""></button>`;
  // weather_card.xml: the title, the 96 dp picture with the 90 dp temperature beside it, the description, wind and
  // precipitation under the picture, then weather_forecast_column.xml's label, icon, bold high and light low.
  function weather(now, t, locale, s) {
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const days = temps.map((_, i) => new Date(now.getTime() + i * 864e5).toLocaleDateString(locale, {weekday: 'short'}));
    return `<section class="gnow-card gnow-weather"><h3>Mountain View</h3>${menu(s)}<div class="gnow-weather-now"><span class="gnow-weather-icon">${CLOUD}</span><b>${temps[0][0]}°</b></div><div class="gnow-weather-cond"><p>${e(t('Partly cloudy'))}</p><p><img src="assets/vn3-ic_weather_wind.png" alt="">13 km/h</p><p><img src="assets/vn3-ic_weather_umbrella.png" alt="">10%</p></div><div class="gnow-week">${temps.map(([hi, lo], i) => `<div><span>${e(days[i])}</span>${i % 2 ? SUN : CLOUD}<b>${hi}°</b><small>${lo}°</small></div>`).join('')}</div></section>`;
  }
  function render({data, t, locale, now}) {
    const s = key => S(t, locale, key);
    const today = now.toISOString().slice(0, 10);
    const event = (data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    // next_appointment_card.xml: the title, appt_time in CardText.Large, then the View in Calendar button.
    const when = event ? `${new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'})}${event.time ? ', ' + event.time : ''}` : '';
    const eventCard = event ? `<section class="gnow-card gnow-appt"><h3>${e(event.title)}</h3>${menu(s)}<p class="gnow-appt-time">${e(when)}</p>${event.location ? `<p>${e(event.location)}</p>` : ''}<button class="gnow-action" data-action="open-app" data-app="calendar">${e(s('View in Calendar'))}</button></section>` : '';
    const foot = (action, key, src, id = '') => `<button data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(s(key))}"><img src="assets/vn3-${src}.png" alt=""></button>`;
    return `<div class="gnow-page" data-gnow><div class="gnow-scroll"><div class="gnow-header" style="background-image:url('assets/vn3-context_header_bg_${period(now.getHours())}.jpg')"></div><div class="gnow-plate"><button class="gnow-plate-logo" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/vn3-ic_google_small_dark.png" alt="Google"></button><button class="gnow-plate-mic" data-action="open-app" data-app="voice-search" aria-label="${e(s('Tap to speak'))}"><img src="assets/vn3-ic_mic_dark.png" alt=""></button></div><div class="gnow-cards">${weather(now, t, locale, s)}${eventCard}<button class="gnow-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(s('More'))}</button></div><div class="gnow-bar">${foot('toast', 'Reminders', 'ic_endoflist_reminders_normal', s('Reminders'))}<i></i>${foot('toast', 'Train Google Now', 'ic_magic_wand_normal', s('Train Google Now'))}<i></i>${foot('gel-overview-settings', 'Menu', 'ic_menu_moreoverflow_normal')}</div></div></div>`;
  }
  window.GELNow = {render};
})();
