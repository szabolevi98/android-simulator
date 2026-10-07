/* Gingerbread's Contacts are gb-phone.js and gb-contact-editor.js; this keeps the address book removal they share with
   Messaging: the contact's conversations and drafts stay under its number. */
(() => {
  'use strict';
  function remove(data,id) {
    const person = data.contacts.find(p=>p.id===id);
    if (!person) return;
    // Keep existing conversations when their contact card is removed.
    const key = 'tel:' + String(person.phone || person.id).replace(/[\s().-]/g,'');
    data.messages.forEach(m=>{if(String(m.contact)===String(id)) m.contact=key;});
    if(data.messageDrafts?.[id]) { data.messageDrafts[key] ||= data.messageDrafts[id]; delete data.messageDrafts[id]; }
    data.contacts = data.contacts.filter(p=>p.id!==id);
    data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);});
  }
  window.ICSPeople = {remove};
})();
