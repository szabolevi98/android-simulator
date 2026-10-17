/* Android 6.0.1 people data shared by Phone, Contacts and Messenger: the saved contacts and the call log, and the
   helpers their lists draw with.
   - The contacts and the used phone's call log (yesterday's call with Mom, then a missed call from Alex and the call back)
     are the simulator's own sample data, saved with the phone (MM.defaults).
   - LetterTileDrawable (ContactsCommon in Google Dialer 2.21 / Contacts 1.2): the colour is letter_tile_colors[|hash| %
     14] of the identifier's Java String.hashCode (letter_tile_default_color #cccccc without one), the letter the display
     name's first character upper-cased in sans-serif-medium white at letter_to_tile_ratio 67 % of the tile; a name that
     does not start with an English letter draws ic_person_white_120dp instead.
   - PhoneNumberUtils.formatNumber / the dialpad's PhoneNumberFormattingTextWatcher for the image's US SIM: NANP numbers
     as (202) 555-0148, typed digits as 555-0148 / (202) 555-01… while they are entered.
   - DateUtils.getRelativeTimeSpanString(time, now, MINUTE_IN_MILLIS, FORMAT_ABBREV_RELATIVE) (libcore's ICU
     RelativeDateTimeFormatter, short style): "5 min. ago", "2 hr. ago", "Yesterday", "3 days ago", then the abbreviated
     date. */
(() => {
  'use strict';
  const H = 3600000;
  MM.defaults.contacts = [
    {id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com'},
    {id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com'},
    {id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com'},
    {id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com', starred: true}
  ];
  MM.defaults.calls = [
    {id: 1, number: '202-555-0107', time: Date.now() - 26 * H, duration: 754, type: 'incoming'},
    {id: 2, number: '202-555-0148', time: Date.now() - 3 * H, duration: 0, type: 'missed'},
    {id: 3, number: '202-555-0148', time: Date.now() - 2.6 * H, duration: 132, type: 'outgoing'}
  ];

  const COLORS = ['#db4437', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#4285f4', '#039be5', '#0097a7', '#009688', '#0f9d58', '#689f38', '#ef6c00', '#ff5722', '#757575'];
  const javaHash = s => { let h = 0; for (const ch of String(s)) { for (let i = 0; i < ch.length; i++) h = (Math.imul(h, 31) + ch.charCodeAt(i)) | 0; } return h; };
  const digits = n => String(n || '').replace(/[^0-9+*#,;]/g, '');
  const same = (a, b) => { const x = digits(a).replace(/^\+?1(?=\d{10}$)/, ''), y = digits(b).replace(/^\+?1(?=\d{10}$)/, ''); return !!x && x === y; };

  function format(n) {
    const d = digits(n);
    if (/^\d{10}$/.test(d)) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (/^1\d{10}$/.test(d)) return `1 ${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
    if (/^\d{7}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return n;
  }
  // As-you-type (AsYouTypeFormatter for US): 555-01 up to seven digits, (202) 555-01 up to ten.
  function typing(d) {
    if (!/^\d+$/.test(d) || d.length > 10 || d[0] === '1' || d[0] === '0') return d;
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  function tile(c, person, cls = '', circle = true) {
    const name = person?.name || '', ch = name.charAt(0);
    const color = name ? COLORS[Math.abs(javaHash(person.lookup || name)) % COLORS.length] : '#cccccc';
    const inner = /^[A-Za-z]$/.test(ch) ? `<b>${c.safe(ch.toUpperCase())}</b>` : '<img src="assets/gd-ic_person_white_120dp.png" alt="">';
    return `<span class="mmpp-tile${circle ? ' round' : ''} ${cls}" style="background:${color}" aria-hidden="true">${inner}</span>`;
  }

  function relative(c, time, now = Date.now()) {
    const loc = c.locale(), diff = Math.max(0, now - time);
    const cap = s => s.charAt(0).toLocaleUpperCase(loc) + s.slice(1);
    const rtf = new Intl.RelativeTimeFormat(loc, {style: 'short', numeric: 'always'});
    if (diff < H) return rtf.format(-Math.floor(diff / 60000), 'minute');
    if (diff < 24 * H) return rtf.format(-Math.floor(diff / H), 'hour');
    const d0 = new Date(now), d1 = new Date(time);
    const days = Math.round((new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()) - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / 864e5);
    if (days < 7) return cap(new Intl.RelativeTimeFormat(loc, {numeric: 'auto'}).format(-days, 'day'));
    return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric', ...(d1.getFullYear() !== d0.getFullYear() ? {year: 'numeric'} : {})}).format(d1);
  }

  MM.people = {
    COLORS, javaHash, digits, same, format, typing, tile, relative,
    list: c => c.data.contacts || (c.data.contacts = JSON.parse(JSON.stringify(MM.defaults.contacts))),
    calls: c => c.data.calls || (c.data.calls = JSON.parse(JSON.stringify(MM.defaults.calls))),
    byNumber: (c, n) => MM.people.list(c).find(p => same(p.phone, n)) || null,
    byId: (c, id) => MM.people.list(c).find(p => p.id === +id) || null,
    sorted: (c, list = MM.people.list(c)) => [...list].sort((a, b) => a.name.localeCompare(b.name, c.locale())),
    // ContactsContract.CommonDataKinds.Phone.getTypeLabel for TYPE_MOBILE (the only kind the sample contacts have).
    typeLabel: () => MM.text('phone').t('phoneTypeMobile'),
    log(c, entry) { const calls = MM.people.calls(c); calls.push({id: Math.max(0, ...calls.map(x => x.id)) + 1, ...entry}); c.save(); }
  };
})();
