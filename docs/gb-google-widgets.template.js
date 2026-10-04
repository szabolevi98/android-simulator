/* More home screen widgets of the Nexus S image (GRK39F), from their providers' layouts and drawables:
   - Latitude (Maps.apk FriendsAppWidgetProvider, 4 x 2; layout-port/friends_appwidget.xml): the dark friends_appwidget_top_bg
     header with the reporting dot, your location (14 dp bold white), Check in and Refresh split by 1 dip lines; the white
     friends_appwidget_content_bg with the Latitude watermark and two 46 dip rows (picture, 14 dp bold #3c5a98 name, 11 dp
     #7e7d7d distance, 14 dp black location); the 10 dp footer with the account and "Last Updated: {0}".
   - Traffic (Maps.apk TrafficAppWidget, 1 x 1; traffic_appwidget.xml): the 41 dip traffic light (#339900 / #ffcc00 /
     #cc0000, 10 dip corners) with the minutes to the destination, and the 13 dp title on #b2191919.
   - Google Voice Inbox and Google Voice Settings (googlevoice.apk, 3 x 1; widget_inbox_layout.xml and
     widget_settings_layout.xml): the title, the arrows and the message preview on widget_inbox_background; the Inbox,
     Compose, Call settings and Do not disturb buttons over the balance and call-setting bar.
   - Calendar (CalendarProvider.apk agenda_appwidget.xml, 2 x 2): the next event under the blue appwidget_calendar_bgtop_blue
     date (17 sp day, 30 sp date), "when" in 14 sp #666666, the 14 sp title, the 11 sp place, "1 more event", or
     "No upcoming calendar events".
   Texts are the APKs' (docs/apk-strings.py); friends and places are the Maps module's made-up ones. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({
    "Latitude": "LATITUDE_APP_NAME", "Traffic": "TRAFFIC_WIDGET_NAME", "Last Updated: {0}": "LATITUDE_WIDGET_FRIENDS_LAST_UPDATED_TIME_ABSOLUTE",
    "Unknown location": "LATITUDE_WIDGET_FRIENDS_LOCATION_UNKNOWN", "Google Voice Inbox": "googlevoice:widget_inbox_label",
    "Google Voice Settings": "googlevoice:widget_settings_label", "Google Voice": "googlevoice:widget_inbox_title_no_messages",
    "Google Voice (%1$d unread)": "googlevoice:widget_inbox_title_unread", "Missed call from %1$s": "googlevoice:widget_inbox_preview_missed_call",
    "%1$s: %2$s": "googlevoice:widget_inbox_preview_text_message_in", "No messages in your inbox.": "googlevoice:widget_inbox_preview_no_messages",
    "Do not disturb on": "googlevoice:widget_settings_do_not_disturb_enabled_notification", "Do not disturb off": "googlevoice:widget_settings_do_not_disturb_disabled_notification",
    "Calendar": "CalendarProvider:gadget_title", "No upcoming calendar events": "CalendarProvider:gadget_no_events",
    "1 more event": "CalendarProvider:@plurals/gadget_more_events:one", "%d more events": "CalendarProvider:@plurals/gadget_more_events:other"
  });
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const T = (lang, key) => { const i = LANGS.indexOf(lang), row = STRINGS[key]; return row ? (i >= 0 ? row[i] : row[4]) || key : key; };
  // Widget providers as AppWidgetPickActivity lists them (minWidth / minHeight: 294 x 146 dip = 4 x 2, 72 x 72 = 1 x 1,
  // 220 x 72 = 3 x 1, 146 x 146 = 2 x 2).
  const PROVIDERS = [
    {type: 'calendar', label: 'Calendar', app: 'calendar', width: 2, height: 2},
    {type: 'gvoice-inbox', label: 'Google Voice Inbox', app: 'google-voice', width: 3, height: 1},
    {type: 'gvoice-settings', label: 'Google Voice Settings', app: 'google-voice', width: 3, height: 1},
    {type: 'latitude', label: 'Latitude', app: 'latitude', width: 4, height: 2},
    {type: 'traffic', label: 'Traffic', app: 'maps', width: 1, height: 1}
  ];
  const ago = (lang, at) => new Date(at).toLocaleTimeString(lang === 'en' ? 'en-US' : lang, {hour: 'numeric', minute: '2-digit'});
  function latitude(ctx) {
    const {lang} = ctx, maps = window.GBMaps, friends = (maps?.FRIENDS || []).slice(0, 2), me = {fx: .5, fy: .52};
    const row = f => `<button class="gbw-lat-row" data-action="gbw-latitude" data-id="${e(f.id)}"><img src="assets/mp-avatar_unknown.png" alt=""><span><span class="gbw-lat-top"><b>${e(f.name)}</b><small>${e(maps.distance(lang, maps.km(me, f)))}</small></span><span class="gbw-lat-loc">${e(f.place)}</span></span></button>`;
    return `<div class="gbw-lat"><div class="gbw-lat-head"><button class="gbw-lat-me" data-action="gbw-latitude" data-id="me"><img src="assets/mp-friends_appwidget_blue_dot.png" alt=""><b>${e(ctx.data.latitudeCheckin || 'Riverside Park')}</b></button><i></i><button data-action="gbw-latitude" data-id="checkin" aria-label="Check in"><img src="assets/mp-friends_appwidget_checkin_btn.png" alt=""></button><i></i><button data-action="gbw-latitude" data-id="refresh" aria-label="Refresh"><img src="assets/mp-friends_appwidget_refresh_btn.png" alt=""></button></div><div class="gbw-lat-body">${friends.map(row).join('')}<div class="gbw-lat-foot"><span>${e(ctx.account)}</span><span>${e(T(lang, 'Last Updated: {0}').replace('{0}', ago(lang, ctx.data.latitudeUpdated || ctx.now - 12e4)))}</span></div></div></div>`;
  }
  // The traffic light: minutes to the destination at the rush-hour pace of the drawn city.
  function traffic(ctx) {
    const hour = new Date(ctx.now).getHours(), slow = hour >= 7 && hour < 10 || hour >= 16 && hour < 19, minutes = slow ? 19 : 12;
    const color = minutes > 15 ? 'yellow' : 'green';
    return `<button class="gbw-traffic" data-action="gbw-traffic"><span class="gbw-traffic-light ${color}">${minutes}</span><span class="gbw-traffic-title">${e(ctx.t('Home'))}</span></button>`;
  }
  function voiceInbox(ctx) {
    const {lang} = ctx, list = (window.GBExtraApps?.gvStore(ctx.data) || ctx.data.gvoice || []).filter(c => c.label === 'inbox'), unread = list.filter(c => !c.read).length;
    const i = ((ctx.ui.gbwVoice || 0) % Math.max(1, list.length) + list.length) % Math.max(1, list.length), c = list[i];
    const preview = !c ? T(lang, 'No messages in your inbox.') : c.kind === 'missed' ? T(lang, 'Missed call from %1$s').replace('%1$s', c.name) : T(lang, '%1$s: %2$s').replace('%1$s', c.name).replace('%2$s', c.items.at(-1)?.text || '');
    return `<div class="gbw-gvi"><div class="gbw-gvi-title">${e(unread ? T(lang, 'Google Voice (%1$d unread)').replace('%1$d', unread) : T(lang, 'Google Voice'))}</div><div class="gbw-gvi-row"><button class="gbw-gvi-arrow" data-action="gbw-voice-step" data-id="-1" aria-label="‹"><img src="assets/gv-widget_inbox_arrow_left_default.png" alt=""></button><button class="gbw-gvi-preview" data-action="gbw-voice-open" data-id="${e(c?.id || '')}"><img src="assets/gv-widget_inbox_default_contact_photo.png" alt=""><span>${e(preview)}</span></button><button class="gbw-gvi-arrow" data-action="gbw-voice-step" data-id="1" aria-label="›"><img src="assets/gv-widget_inbox_arrow_right_default.png" alt=""></button></div></div>`;
  }
  function voiceSettings(ctx) {
    const dnd = !!ctx.data.gvoiceDnd;
    const btn = (action, img, pos, label) => `<button class="gbw-gvs-btn ${pos}" data-action="${action}" aria-label="${e(label)}"><img src="assets/gv-widget_settings_${img}.png" alt=""></button>`;
    return `<div class="gbw-gvs"><div class="gbw-gvs-row">${btn('gbw-voice-open', 'inbox', 'l', 'Inbox')}${btn('gbw-voice-compose', 'compose', 'c', 'Compose')}${btn('gbw-voice-open', 'call_settings', 'c', 'Call settings')}${btn('gbw-voice-dnd', dnd ? 'do_not_disturb_on' : 'do_not_disturb_off', 'r', 'Do not disturb')}</div><div class="gbw-gvs-bar"><img src="assets/gv-widget_settings_info_bar_balance.png" alt=""><span>$0.00</span><img src="assets/gv-widget_settings_info_bar_call_settings.png" alt=""><span>International</span></div></div>`;
  }
  // AgendaAppWidget: the next event that has not ended, with the count of the others starting at the same time
  // ("conflicting"); the agenda looks a week ahead (repeating events expanded by ICSCalendar).
  function calendar(ctx) {
    const {lang, locale, now} = ctx, start = new Date(now), iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const from = iso(start), to = iso(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7));
    const list = window.ICSCalendar ? ICSCalendar.expand(ctx.events || [], from, to) : (ctx.events || []).filter(ev => ev.date >= from && ev.date <= to);
    const upcoming = list.map(ev => ({ev, at: new Date(`${ev.date}T${ev.allDay || !ev.time ? '00:00' : ev.time}`)})).filter(x => x.ev.allDay || !x.ev.time ? x.ev.date >= from : x.at.getTime() + 36e5 > now).sort((a, b) => a.at - b.at);
    if (!upcoming.length) return `<button class="gbw-cal empty" data-action="open-app" data-app="calendar"><span>${e(T(lang, 'No upcoming calendar events'))}</span></button>`;
    const {ev, at} = upcoming[0], more = upcoming.filter(x => +x.at === +at).length - 1;
    const when = ev.time ? at.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24}) : '';
    return `<button class="gbw-cal" data-action="open-app" data-app="calendar"><span class="gbw-cal-top"><b class="dow">${e(at.toLocaleDateString(locale, {weekday: 'long'}).toUpperCase())}</b><b class="dom">${at.getDate()}</b></span><span class="gbw-cal-when">${e(when)}</span><span class="gbw-cal-title">${e(ev.title)}</span>${more ? `<span class="gbw-cal-more">${e(T(lang, more === 1 ? '1 more event' : '%d more events').replace('%d', more))}</span>` : ''}<span class="gbw-cal-where">${e(ev.location || '')}</span></button>`;
  }
  window.GBGoogleWidgets = {PROVIDERS, T, latitude, traffic, voiceInbox, voiceSettings, calendar};
})();
