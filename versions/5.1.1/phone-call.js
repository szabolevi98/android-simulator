/* Local outgoing-call state; no telephony or audio hardware is used. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const duration=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const start=(number,now=Date.now())=>({number,started:now,connected:now+1500,mute:false,speaker:false,hold:false,keypad:false,digits:''});
  const elapsed=(call,now=Date.now())=>Math.max(0,Math.floor((now-call.connected)/1000));
  const finish=(call,now=Date.now())=>({number:call.number,time:call.started,duration:elapsed(call,now),connected:now>=call.connected});
  const image=name=>`<img src="assets/phone-${name}.png" alt="">`;
  /* InCallUI 5.1 (Google Dialer, call_card_content.xml at sw360dp): the #0288D1 call card (5 dp elevation, 16 dp top
     padding, 24 dp sides, 122 dp minimum) with the 22 sp call state at 70 %, the 45 dp sans-serif-light name, the
     18 sp #CCFFFFFF number and label with the elapsed time at the end, then the 48 dp call buttons (Audio, Mute,
     Dialpad, Hold, Add call; white icons, a #0277BD disc when on). The photo, or img_no_image, fills the rest; the
     72 dp red end-call FAB sits 8 dp above the bottom; the DTMF dialpad slides up white over the photo. */
  const KEYS=[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
  const stateLabel=(call,now=Date.now())=>now<call.connected?'Dialing':call.hold?'On hold':'';
  function render(call,person,t,now=Date.now()) {
    const dialing=now<call.connected;
    const buttons=[['speaker','Speaker','ic_toolbar_speaker_on'],['mute','Mute','ic_toolbar_mic_off'],['keypad','Dialpad','ic_toolbar_dialpad'],['hold','Hold','ic_toolbar_hold']];
    const pad=call.keypad?`<div class="lpc-dialpad"><output>${e(call.digits)}</output><div class="lpc-keys">${KEYS.map(([digit,letters])=>`<button class="lpd-key${digit==='*'?' star':digit==='#'?' pound':''}" data-action="incall-digit" data-id="${digit}" aria-label="${digit}"><span class="lpd-key-num">${digit}</span>${letters?`<span class="lpd-key-letters">${letters}</span>`:''}</button>`).join('')}</div></div>`:'';
    return `<div class="app-view lpc-app"><div class="lpc-card"><div class="lpc-info"><div class="lpc-state incall-state">${e(t(stateLabel(call,now)))}</div><div class="lpc-name">${e(person?.name||call.number)}</div><div class="lpc-sub"><span>${e(person?call.number:'')}</span><span>${person?e(t('Mobile')):''}</span><time class="incall-elapsed">${dialing?'':duration(elapsed(call,now))}</time></div></div><div class="lpc-buttons">${buttons.map(([id,label,icon])=>`<button class="lpc-button${call[id]?' on':''}" data-action="incall-toggle" data-id="${id}" aria-pressed="${!!call[id]}" aria-label="${e(t(label,'Phone'))}"><img src="assets/gd-${icon}.png" alt=""></button>`).join('')}<button class="lpc-button" data-action="toast" data-id="${e(t('Add call'))}" aria-label="${e(t('Add call'))}"><img src="assets/gd-ic_toolbar_add_call.png" alt=""></button></div></div><div class="lpc-photo"><img src="assets/gd-img_no_image.png" alt=""></div>${pad}<button class="lpc-end" data-action="hangup" aria-label="${e(t('End'))}"><img src="assets/gd-fab_ic_end_call.png" alt=""></button></div>`;
  }
  /* CallDetailActivity 5.1 (call_detail.xml): under the blue action bar ("Call details", the ic_delete_wht_24dp
     "Delete from call history" action and the overflow with "Edit number before call") the white caller_information
     strip (36 dp top, 32 dp bottom, 16 dp start, 0.5 dp elevation): the 40 dp photo 3 dp down, then 16 dp in the 16 sp
     name and the 14 sp "<number type> <number>" line (UpdateContactDetailsTask; an unknown number is the name and the
     line goes). Below, on #F9F9F9, CallDetailHistoryAdapter: the "Calls list" header (14 sp medium, 20 dp / 9 dp) and
     one call_detail_history_item per call (13 dp padding): the call type arrow with its 16 sp text, the date
     (formatDateRange: time, weekday, date and year) and the duration as "%s min %s sec", hidden for missed calls. */
  function details(call,person,t,locale) {
    if(!call)return '';
    const type=call.type==='missed'?'missed':call.type==='incoming'?'incoming':'outgoing';
    const tile=window.LPDialer?LPDialer.letterTile(person||{name:''},'lpd-photo lpc-detail-photo'):'';
    const date=new Date(call.time).toLocaleString(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});
    const seconds=call.duration||0, length=t('%s min %s sec').replace('%s',Math.floor(seconds/60)).replace('%s',seconds%60);
    const bar=`<header class="lpd-toolbar"><button data-action="phone-log-back" aria-label="${e(t('Navigate up'))}"><img src="assets/gd-ic_arrow_back_24dp.png" alt=""></button><h2>${e(t('Call details'))}</h2><button class="lpd-toolbar-more" data-action="lpd-remove-call" aria-label="${e(t('Delete from call history'))}" title="${e(t('Delete from call history'))}"><img src="assets/gd-ic_delete_wht_24dp.png" alt=""></button><button data-action="phone-menu" data-id="detail" aria-label="${e(t('More options'))}"><img src="assets/gd-ic_overflow_menu.png" alt=""></button></header>`;
    const head=`<div class="lpc-detail-head">${tile}<span><strong>${e(person?.name||call.number)}</strong>${person?`<small>${e(`${t('Mobile')} ${call.number}`)}</small>`:''}</span></div>`;
    const item=`<div class="lpc-detail-item"><span class="lpc-detail-type"><i class="lpd-arrow ${type}" aria-hidden="true"></i>${e(t({missed:'Missed call',incoming:'Incoming call',outgoing:'Outgoing call'}[type]))}</span><small>${e(date)}</small>${type==='missed'?'':`<small>${e(length)}</small>`}</div>`;
    return `<div class="app-view lpd-app lpc-details">${bar}${head}<div class="lpc-detail-list"><h3>${e(t('Calls list'))}</h3>${item}</div></div>`;
  }
  window.ICSPhoneCall={start,elapsed,finish,duration,render,details,stateLabel};
})();
