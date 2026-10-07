/* The local call record behind Gingerbread's in-call screen (GBPhone.inCall) and call log: start, connect after 1.5 s,
   finish with the elapsed seconds. No telephony or audio hardware is used. */
(() => {
  'use strict';
  const start=(number,now=Date.now())=>({number,started:now,connected:now+1500,mute:false,speaker:false,hold:false,keypad:false,digits:''});
  const elapsed=(call,now=Date.now())=>Math.max(0,Math.floor((now-call.connected)/1000));
  const finish=(call,now=Date.now())=>({number:call.number,time:call.started,duration:elapsed(call,now),connected:now>=call.connected});
  window.ICSPhoneCall={start,elapsed,finish};
})();
