/* SMS/MMS demo presentation, based on AOSP Mms android-4.0.4_r2.1. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = number => String(number).replace(/[\s().-]/g, '');
  function recipient(value, contacts) {
    const raw = String(value).trim();
    const person = contacts.find(p => p.name.toLocaleLowerCase() === raw.toLocaleLowerCase() || normalize(p.phone) === normalize(raw));
    if (person) return {key:String(person.id), name:person.name, phone:person.phone};
    const phone = normalize(raw);
    return /^\+?\d{3,20}$/.test(phone) ? {key:`tel:${phone}`, name:raw, phone:raw} : null;
  }
  function identity(key, contacts) {
    const person = contacts.find(p => String(p.id) === String(key));
    return person || {name:String(key).replace(/^tel:/,''),phone:String(key).replace(/^tel:/,'')};
  }
  const draftKey = ui => ui.sub === 'new' ? 'new' : String(ui.thread);
  function counter(body) {
    const basic = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
    const extended = '^{}\\[~]|€\f';
    let length = 0, unicode = false;
    for (const char of body) {
      if (basic.includes(char)) length++;
      else if (extended.includes(char)) length += 2;
      else { unicode = true; break; }
    }
    if (unicode) length = body.length;
    const single = unicode ? 70 : 160, segment = unicode ? 67 : 153;
    const count = length <= single ? 1 : Math.ceil(length / segment);
    return {remaining:(count === 1 ? single : count * segment) - length, count};
  }
  function threads(data, query = '') {
    const keys = new Set(data.messages.map(m=>String(m.contact)));
    for (const [key,draft] of Object.entries(data.messageDrafts || {})) if (key !== 'new' && (draft.body || draft.attachment)) keys.add(key);
    const q = query.trim().toLocaleLowerCase();
    return [...keys].map(key => {
      const messages = data.messages.filter(m=>String(m.contact)===key);
      const last = messages.at(-1), draft = data.messageDrafts?.[key];
      return {key,person:identity(key,data.contacts),messages,last,draft,order:Math.max(last?.timestamp || last?.id || 0,draft?.updated || 0)};
    }).filter(thread=>!q || [thread.person.name,thread.person.phone,...thread.messages.map(m=>m.body),thread.draft?.body].join(' ').toLocaleLowerCase().includes(q))
      .sort((a,b)=>b.order-a.order);
  }
  function photo(item) {
    if(window.ICSMedia)return `<div class="mms-photo media-attachment">${ICSMedia.art(item)}<span>${escape(item.name)}</span></div>`;
    const colors = item.colors.filter(c=>/^#[\da-f]{6}$/i.test(c));
    return `<div class="mms-photo" style="background:linear-gradient(150deg,${colors.join(',') || '#555,#aaa'})"><span>${escape(item.name)}</span></div>`;
  }
  window.ICSMessaging = {recipient,identity,draftKey,counter,threads,photo,escape};
})();
