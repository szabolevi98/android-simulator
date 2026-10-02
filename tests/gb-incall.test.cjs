const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['gb-strings-contacts.js','gb-strings-phone.js','gb-phone.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const P=context.window.GBPhone,person={id:1,name:'Mom',phone:'1'};
const call=(o={})=>({number:'1',started:0,connected:1500,mute:false,speaker:false,hold:false,keypad:false,digits:'',...o});
const ctx=(o={})=>({lang:'en',t:k=>k,person,bluetoothAvailable:false,now:5000,...o});
// Call states: DIALING until connected, ACTIVE / HOLDING, then DISCONNECTING and DISCONNECTED after a hang-up.
assert.equal(P.callState(call(),1000),'dialing');assert.equal(P.callState(call(),2000),'active');assert.equal(P.callState(call({hold:true}),2000),'holding');
assert.equal(P.callState(call({endedAt:9000}),9000+P.HANGING_UP-1),'hanging');assert.equal(P.callState(call({endedAt:9000}),9000+P.HANGING_UP),'ended');
assert.equal(P.elapsedText(call(),1500+65000),'1:05');assert.equal(P.elapsedText(call({endedAt:1500+7000}),99999),'0:07');
// Dialing: gray gradient, "Dialing" title, no elapsed time, Add call and Dialpad disabled, no Hold button.
let html=P.inCall(call(),ctx({now:1000}));
assert.match(html,/gbic gbic-unidentified/);assert.match(html,/gbic-title">Dialing</);assert.match(html,/gbic-elapsed"><\/span>/);
assert.match(html,/data-action="gbp-add-call" disabled/);assert.match(html,/data-id="keypad" disabled/);assert.doesNotMatch(html,/gbic-hold/);
assert.match(html,/gbic-name">Mom</);assert.match(html,/<span>Mobile<\/span><span>1<\/span>/);
// Active: green gradient, no upper title, elapsed time, Hold button, toggles reflect state; Bluetooth only with a headset.
html=P.inCall(call({speaker:true}),ctx());
assert.match(html,/gbic-connected/);assert.match(html,/gbic-title"><\/div>/);assert.match(html,/gbic-elapsed">0:03</);assert.match(html,/round_hold\.png/);
assert.match(html,/data-id="speaker" aria-pressed="true"/);assert.match(html,/data-id="bluetooth" aria-pressed="false" disabled/);
assert.match(P.inCall(call({bluetooth:true}),ctx({bluetoothAvailable:true})),/gbic-bluetooth/);
// Holding: orange, "On hold" in the elapsed widget, Unhold, Mute disabled.
html=P.inCall(call({hold:true}),ctx());assert.match(html,/gbic-on_hold/);assert.match(html,/gbic-elapsed">On hold</);assert.match(html,/Unhold/);assert.match(html,/data-id="mute" aria-pressed="false" disabled/);
// DTMF dialpad replaces the call card and the Hold button; the Dialpad button becomes Hide.
html=P.inCall(call({keypad:true,digits:'12#'}),ctx());assert.doesNotMatch(html,/gbic-card/);assert.doesNotMatch(html,/gbic-hold/);
assert.equal((html.match(/class="gbic-key"/g)||[]).length,12);assert.match(html,/<output>12#<\/output>/);assert.match(html,/dialpad_close/);assert.match(html,/<span>Hide<\/span>/);
// Hang-up: "Hanging up", then red "Call ended" without the touch controls.
assert.match(P.inCall(call({endedAt:5000}),ctx({now:5100})),/Hanging up/);
html=P.inCall(call({endedAt:5000}),ctx({now:5000+P.HANGING_UP}));assert.match(html,/gbic-ended/);assert.match(html,/Call ended/);assert.doesNotMatch(html,/gbic-touch/);
// Unknown numbers show the number as the name; translations come from the Phone app.
html=P.inCall(call(),ctx({person:null,lang:'hu',now:1000}));assert.match(html,/gbic-name">1</);assert.doesNotMatch(html,/gbic-number/);assert.match(html,/Tárcsázás/);assert.match(html,/Befejezés/);
// Dialtacts during a call: the dialpad chooser, or the dial pad for Add call.
const dt={lang:'en',locale:'en',t:k=>k,now:0,tab:'dialpad',dial:'',calls:[],contactOf:()=>null,people:[]};
html=P.render({...dt,callActive:true});assert.deepEqual([...html.matchAll(/gbp-choice" data-action="([a-z-]+)"/g)].map(m=>m[1]),['gbp-dtmf','gbp-return-call','gbp-add-call']);
assert.match(html,/Return to call in progress/);assert.match(P.render({...dt,callActive:true,addCall:true}),/gbp-dialer/);
console.log('gb-incall ok');
