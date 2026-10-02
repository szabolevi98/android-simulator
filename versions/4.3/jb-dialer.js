/* Android 4.3 Dialer smart dial (packages/apps/Dialer: SmartDialNameMatcher, SmartDialAdapter, dialpad_fragment.xml). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const KEYS = {a: '2', b: '2', c: '2', d: '3', e: '3', f: '3', g: '4', h: '4', i: '4', j: '5', k: '5', l: '5', m: '6', n: '6', o: '6', p: '7', q: '7', r: '7', s: '7', t: '8', u: '8', v: '8', w: '9', x: '9', y: '9', z: '9'};
  // SmartDialNameMatcher.remapAccentedChar: letters are folded to ASCII before mapping to keys.
  const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const digitOf = ch => /[0-9]/.test(ch) ? ch : KEYS[ch] || '';

  /* A query matches a name when its digits spell the start of one word, possibly running on into the starts of
     the following words, or the initials. Returns the matched character positions in the original name. */
  function matchName(name, query) {
    if (!query || /[^0-9]/.test(query)) return null;
    const folded = fold(name), words = [];
    folded.replace(/[a-z0-9]+/g, (word, at) => { words.push({word, at}); return word; });
    const run = (w, q, hits) => {
      if (!q.length) return hits;
      if (w >= words.length) return null;
      const {word, at} = words[w];
      let i = 0;
      while (i < word.length && i < q.length && digitOf(word[i]) === q[i]) i++;
      for (let take = i; take >= 1; take--) {
        const next = take === q.length ? hits.concat(range(at, take)) : run(w + 1, q.slice(take), hits.concat(range(at, take)));
        if (next) return next;
      }
      return null;
    };
    const range = (at, n) => Array.from({length: n}, (_, k) => at + k);
    for (let w = 0; w < words.length; w++) { const hits = run(w, query, []); if (hits) return {positions: hits, start: w}; }
    return null;
  }
  // Number matches are prefix matches on the digits, with or without the country code.
  function matchNumber(number, query) {
    const digits = String(number || '').replace(/[^0-9+]/g, ''), plain = digits.replace(/^\+/, '');
    if (!query) return null;
    if (plain.startsWith(query)) return {start: 0, length: query.length, digits: plain};
    const national = plain.replace(/^(36|1|44|49|33|34)/, '');
    if (national !== plain && national.startsWith(query)) return {start: plain.length - national.length, length: query.length, digits: plain};
    return null;
  }
  // Ranking: name matches first (earlier words better), then number matches; favourites break ties.
  function suggestions(contacts, query, limit = 3) {
    if (!query) return [];
    const found = [];
    for (const person of contacts) {
      const name = matchName(person.name, query), number = matchNumber(person.phone, query);
      if (!name && !number) continue;
      found.push({person, name, number, score: (name ? 100 - name.start * 10 : 0) + (number ? 20 : 0) + (person.favorite ? 5 : 0)});
    }
    return found.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  // SmartDialAdapter: the best match sits in the middle slot, the second on the left and the third on the right.
  const SLOT_ORDER = [1, 0, 2];
  function highlight(text, positions) {
    const set = new Set(positions);
    return [...text].map((ch, i) => set.has(i) ? `<b>${e(ch)}</b>` : e(ch)).join('');
  }
  function render(contacts, query, t) {
    const list = suggestions(contacts, query), slots = [null, null, null];
    list.forEach((item, rank) => { slots[SLOT_ORDER[rank]] = item; });
    return `<div class="jb-smartdial" role="list" aria-label="${e(t('Suggestions'))}">${slots.map(item => {
      if (!item) return '<span class="jb-smartdial-item empty" aria-hidden="true"></span>';
      const phone = item.person.phone || '';
      const number = item.number ? (() => { let seen = 0, out = ''; for (const ch of phone) { const digit = /[0-9]/.test(ch); const lit = digit && seen >= item.number.start && seen < item.number.start + item.number.length; if (digit) seen++; out += lit ? `<b>${e(ch)}</b>` : e(ch); } return out; })() : e(phone);
      return `<button type="button" class="jb-smartdial-item" role="listitem" data-action="smartdial-call" data-id="${e(phone)}"><span class="jb-smartdial-name">${item.name ? highlight(item.person.name, item.name.positions) : e(item.person.name)}</span><span class="jb-smartdial-number">${number}</span></button>`;
    }).join('')}</div>`;
  }
  window.JBDialer = {KEYS, fold, matchName, matchNumber, suggestions, render, SLOT_ORDER};
})();
