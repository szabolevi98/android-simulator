/* The Nexus S Email's local mailbox (2.3.6): the messages, folders, drafts, trash and sending that gb-email.js draws.
   No network transport. */
(() => {
  'use strict';
  const account='demo@example.com';
  function restore(saved,samples=[],sent=[]) {
    if(Array.isArray(saved))return saved.map(item=>({...item,id:String(item.id),body:String(item.body||''),subject:String(item.subject||''),to:String(item.to||''),cc:String(item.cc||''),bcc:String(item.bcc||''),read:!!item.read,starred:!!item.starred}));
    return [...samples.map((item,i)=>({...item,id:'inbox-'+item.id,address:['android@example.com','alex@example.com','calendar@example.com'][i]||'hello@example.com',to:account,folder:'Inbox',read:false,starred:false})),...sent.map(item=>({...item,id:'sent-'+item.id,from:account,address:account,folder:'Sent',read:true,starred:false}))];
  }
  function list(mail,folder='Inbox',query='') {const search=query.toLocaleLowerCase();return mail.filter(item=>(folder==='Starred'?item.starred&&item.folder!=='Trash':item.folder===folder)&&(!search||[item.from,item.to,item.subject,item.body].join(' ').toLocaleLowerCase().includes(search)));}
  function recipients(value) {return String(value||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);}
  function validRecipients(draft) {const to=recipients(draft.to),all=[...to,...recipients(draft.cc),...recipients(draft.bcc)];return to.length>0&&all.every(x=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(x));}
  function draft(source,forward=false,now=Date.now()) {
    return {id:'draft-'+now,folder:'Drafts',from:account,address:account,to:source&&!forward?(source.folder==='Sent'?source.to:source.address):'',cc:'',bcc:'',subject:source?`${forward?'Fwd':'Re'}: ${source.subject.replace(/^(Re|Fwd):\s*/i,'')}`:'',body:source?`\n\n${source.from}:\n${source.body}`:'',read:true,starred:false,created:now,...(forward&&source?.attachment?{attachment:JSON.parse(JSON.stringify(source.attachment))}:{})};
  }
  function trash(items,ids) {for(const item of items)if(ids.includes(item.id)&&item.folder!=='Trash'){item.previousFolder=item.folder;item.folder='Trash';}}
  function untrash(item) {item.folder=['Inbox','Drafts','Sent'].includes(item.previousFolder)?item.previousFolder:'Inbox';delete item.previousFolder;}
  function send(item,now=Date.now()) {if(!validRecipients(item))return false;item.folder='Sent';item.read=true;item.created=now;delete item.previousFolder;return true;}
  window.ICSEmail={account,restore,list,recipients,validRecipients,draft,trash,untrash,send};
})();
