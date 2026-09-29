/* Offline People presentation inspired by the AOSP ICS Contacts layouts. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function list(data, tab, query, group, locale) {
    const members = data.contactGroups.find(g=>g.id===group)?.members || [];
    return data.contacts.filter(p=>(tab!=='favorites'||p.favorite) && (!group || members.includes(p.id)))
      .filter(p=>`${p.name} ${p.phone} ${p.email}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .sort((a,b)=>a.name.localeCompare(b.name,locale));
  }
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
  const button = (action,label,file,id='') => `<button type="button" data-action="${action}" data-id="${e(id)}" aria-label="${label}"><img src="assets/${file}" alt=""></button>`;
  function render(data,ui,t,locale) {
    const person=data.contacts.find(p=>p.id===ui.selectedContact);
    const editing=['new','edit'].includes(ui.sub), detail=ui.sub==='detail';
    const group=data.contactGroups.find(g=>g.id===ui.peopleGroup);
    const title=editing ? t(ui.sub==='new'?'New contact':'Edit contact') : detail ? t('People') : ui.sub==='group' ? group?.name || t('Groups') : t('People');
    const header=`<header class="people-header">${button(ui.sub?'back':'home','Back','people.png')}<h2>${e(title)}</h2>${detail&&person?`<button data-action="people-star" aria-label="Favorites" aria-pressed="${!!person.favorite}" class="people-star">${person.favorite?'★':'☆'}</button>${button('people-menu','More options','ic_menu_overflow.png')}`:''}${editing?'<button type="submit" form="people-editor" class="people-done">Done</button>':''}</header>`;
    if(editing) {
      const draft=ui.peopleDraft||{};
      return `<div class="app-view people-app">${header}<form id="people-editor" class="people-scroll people-editor" data-form="people-save"><div class="people-account"><img src="assets/people-ic_contact_picture_holo_light.png" alt=""><span>${e(t('Phone contact'))}</span></div>${[['name','Name','text',50],['phone','Phone','tel',30],['email','Email','email',80],['company','Company','text',80],['notes','Notes','text',500]].map(([key,label,type,max])=>`<label>${e(t(label))}<input name="${key}" type="${type}" maxlength="${max}" ${key==='name'?'required':''} value="${e(draft[key]||'')}"></label>`).join('')}<fieldset><legend>${e(t('Groups'))}</legend>${data.contactGroups.map(g=>`<label class="people-membership"><input type="checkbox" name="groups" value="${e(g.id)}" ${draft.groups?.includes(g.id)?'checked':''}>${e(t(g.name))}</label>`).join('')}</fieldset><button type="button" data-action="back" class="people-cancel">Cancel</button></form></div>`;
    }
    if(detail) {
      if(!person) return `<div class="app-view people-app">${header}<p class="empty-note">Contact not found</p></div>`;
      return `<div class="app-view people-app">${header}<div class="people-scroll"><div class="people-portrait"><img src="assets/people-ic_contact_picture_180_holo_light.png" alt=""><h3>${e(person.name)}</h3></div><h4 class="people-section">${e(t('Contact details'))}</h4>${person.phone?`<div class="people-detail-row"><button data-action="contact-call" data-id="${person.id}">${e(person.phone)}<small>${e(t('Mobile'))}</small></button>${button('contact-message','Message','stat_notify_sms.png',person.id)}</div>`:''}${person.email?`<div class="people-detail-row"><button data-action="contact-email" data-id="${person.id}">${e(person.email)}<small>${e(t('Email'))}</small></button></div>`:''}${['company','notes'].filter(k=>person[k]).map(k=>`<div class="people-note"><small>${e(t(k==='company'?'Company':'Notes'))}</small><p>${e(person[k])}</p></div>`).join('')}<div class="people-note"><small>${e(t('Groups'))}</small><p>${data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>e(t(g.name))).join(', ') || e(t('None'))}</p></div><button class="people-delete" data-action="people-delete">Delete contact</button></div></div>`;
    }
    const tab=ui.peopleTab||'all';
    const tabs=ui.sub==='group'?'':`<nav class="people-tabs">${[['groups','Groups'],['all','All contacts'],['favorites','Favorites']].map(([key,label])=>`<button role="tab" aria-selected="${tab===key}" data-action="people-tab" data-id="${key}">${e(t(label))}</button>`).join('')}</nav>`;
    const toolbar=`<footer class="people-actions">${button('people-search','Search contacts','mms-ic_menu_search_holo_dark.png')}${button(tab==='groups'?'people-new-group':'new-contact',tab==='groups'?'New group':'Add contact',tab==='groups'?'people-ic_groups_holo_dark.png':'people-ic_menu_add_contact_holo_light.png')}${ui.sub==='group'?'<button data-action="people-edit-group">Edit group</button>':''}</footer>`;
    if(tab==='groups' && ui.sub!=='group') return `<div class="app-view people-app">${header}${tabs}<div class="people-scroll">${data.contactGroups.map(g=>`<button class="people-group" data-action="people-group" data-id="${e(g.id)}"><strong>${e(t(g.name))}</strong><small>${g.members.filter(id=>data.contacts.some(p=>p.id===id)).length} ${e(t('contacts'))}</small></button>`).join('')||'<p class="empty-note">No groups</p>'}</div>${toolbar}</div>`;
    const items=list(data,tab,ui.peopleQuery||'',ui.sub==='group'?ui.peopleGroup:'',locale);
    let initial='';
    const rows=items.map(p=>{const first=p.name.slice(0,1).toLocaleUpperCase();const separator=first!==initial?`<h4 class="people-section">${e(first)}</h4>`:'';initial=first;return `${separator}<button class="people-row" data-action="contact" data-id="${p.id}"><span>${e(p.name)}</span><img src="assets/people-ic_contact_picture_holo_light.png" alt=""></button>`;}).join('');
    return `<div class="app-view people-app">${header}${tabs}${ui.peopleSearching?`<form class="people-search" data-form="people-search"><input name="query" type="search" aria-label="Search contacts" placeholder="Search contacts" value="${e(ui.peopleQuery||'')}"><button type="submit">Search</button></form>`:''}<div class="people-scroll ${tab==='favorites'?'people-favorites':''}">${rows||`<p class="empty-note">${e(t(tab==='favorites'?'No favorites yet':'No contacts found'))}</p>`}</div>${toolbar}</div>`;
  }
  window.ICSPeople={render,list,remove};
})();
