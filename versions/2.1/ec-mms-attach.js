/* Android 2.1 Messaging attachments (Mms.apk, read from Mms.odex): what Attach and the slideshow screens add to a message.
   - Attach (AttachmentTypeSelectorAdapter): Pictures / Videos open Gallery3D's picker (GET_CONTENT image/* or video/*),
     Capture picture / video the Camera (IMAGE_CAPTURE, VIDEO_CAPTURE), Audio the ringtone picker over every sound
     (MessageUtils.selectAudio: no Default, no Silent, "Select audio"), Record audio Sound Recorder (GET_CONTENT
     audio/amr), Slideshow the slideshow editor. One attachment at a time; it makes the message MMS.
   - AttachmentEditor under the message list (attachment_editor_bg, 5 dp right padding): image_attachment_view (the
     picture 150 dp high, View / Replace / Remove 100 x 50 dp), video_attachment_view (the thumbnail with
     ic_gallery_video_overlay), audio_attachment_view (ic_launcher_record_audio, the name, album and artist; Play /
     Replace / Remove), slideshow_attachment_view (the first slide in a 240 x 180 dp picture_frame with mms_play_btn;
     Edit / Send 80 x 50 dp; the text editor goes away: a slideshow's text is in its slides).
   - In the message list (mms_layout_view, 7 dp above and below): the picture in picture_frame, mms_play_btn over video,
     sound and slideshow; it plays in SlideshowActivity ("Slideshow": each slide's picture with its text at the top or
     bottom for its duration).
   - SlideshowEditActivity "Edit slideshow": slideshow_edit_item rows (the 60 dp picture or ic_launcher_slideshow_default_sms,
     "Slide n" in textAppearanceLarge, the text and "n secs" in secondary medium) and the "Add slide" row ("Select to create
     new slide."). Menu: Add slide, Remove slide, Discard slideshow.
   - SlideEditorActivity "Part n/N" (edit_slide_activity.xml on editbox_background: the picture in picture_frame 20 / 10 dp
     in, or the sound with ic_mms_music; the previous / next, Preview, Replace picture and Remove slide buttons 50 dp high;
     under it the text, 15 sp, "Type to compose text, or leave blank", and Done). Menu (onPrepareOptionsMenu): Preview,
     Remove text, Remove / Add picture, Capture picture, Remove / Add music (Audio, Record audio), Remove / Add video,
     Add slide, Duration (n sec), Layout (bottom / top). Duration: "Duration for slide n/N" with 1-10 seconds; Layout:
     "Slideshow layout n/N" with Text on top / Text on bottom. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('mms');
  const DURATION = 5;   // SlideModel's default, 5000 ms
  const btn = (action, label, w) => `<button type="button" class="ecui-button ecma-btn"${w ? ` style="width:calc(${w} * var(--dp))"` : ''} data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  const soundTitle = file => { const s = EC.sounds?.list || {}; return (s.ringtones?.[file] || s.notifications?.[file] || s.alarms?.[file] || [file])[0]; };
  const att = c => c.ui.smsAttach;

  // The pickers: each gives back {image | video | audio} for a message or a slide.
  function pick(c, type, onDone) {
    switch (type) {
      case 'image': EC.galleryPick(c, {onPick: p => onDone({image: p})}); break;
      case 'video': EC.galleryPick(c, {video: true, onPick: p => onDone({video: p})}); break;
      case 'take-photo': EC.cameraCapture(c, {onDone: p => onDone({image: p})}); break;
      case 'record-video': EC.cameraCapture(c, {video: true, onDone: p => onDone({video: p})}); break;
      case 'sound': EC.ringtonePicker(c, {cat: 'all', title: M().t('select_audio'), current: undefined, showDefault: false, showSilent: false,
        onPick: file => file && onDone({audio: {file, title: soundTitle(file)}})}); break;
      case 'record-sound': EC.recordSound(c, s => onDone({audio: {title: s.title, artist: s.artist, album: s.album, length: s.length}})); break;
    }
  }
  // WorkingMessage.correctAttachmentState: a slideshow of one slide is that slide's attachment.
  function fromSlides(c, slides) {
    if (!slides.length) { c.ui.smsAttach = null; return; }
    if (slides.length > 1) { c.ui.smsAttach = {type: 'slideshow', slides, layout: att(c)?.layout || 'bottom'}; return; }
    const s = slides[0];
    if (s.text) c.ui.smsDraft = s.text;
    c.ui.smsAttach = s.image ? {type: 'image', ...s} : s.video ? {type: 'video', ...s} : s.audio ? {type: 'audio', ...s} : null;
  }
  const slidesOf = a => a?.type === 'slideshow' ? a.slides : a ? [{image: a.image, video: a.video, audio: a.audio, text: a.text || '', duration: a.duration || DURATION}] : [];
  function attach(c, type) {
    if (type === 'slideshow') { editSlideshow(c); return; }
    pick(c, type, part => {
      const was = EC.mmsNeeds(c);
      c.ui.smsAttach = {type: part.image ? 'image' : part.video ? 'video' : 'audio', ...part, duration: DURATION};
      if (!was) c.toast(M().t('converting_to_picture_message'));
      c.render();
    });
  }
  function editSlideshow(c) {
    const a = att(c);
    if (a?.type !== 'slideshow') {
      const slides = slidesOf(a);
      if (!slides.length) slides.push({text: '', duration: DURATION});
      // The text goes into the first slide.
      if (c.ui.smsDraft) { slides[0].text = c.ui.smsDraft; c.ui.smsDraft = ''; }
      const was = EC.mmsNeeds(c);
      c.ui.smsAttach = {type: 'slideshow', slides, layout: 'bottom'};
      if (!was) c.toast(M().t('converting_to_picture_message'));
    }
    c.open('mms-slides');
  }
  EC.mmsAttach = attach;

  // Views ------------------------------------------------------------------------------------------------------------------
  const picture = (p, cls = '') => p ? `<img class="${cls}" src="${EC.media.url(p, 320)}" alt="">` : '';
  EC.mmsAttachEditor = c => {
    const a = att(c);
    if (!a) return '';
    const frame = inner => `<div class="ecma npp-mm-attachment_editor_bg"><i class="ec-bg np-mm-attachment_editor_bg"></i>${inner}</div>`;
    const three = (first, play) => `<div class="ecma-btns">${btn(play ? 'ecma-play' : 'ecma-view', M().t(play ? 'play' : 'view'), 100)}${btn('ecma-replace', M().t('replace'), 100)}${btn('ecma-remove', M().t('remove'), 100)}</div>`;
    if (a.type === 'image') return frame(`<div class="ecma-media">${picture(a.image)}</div>${three()}`);
    if (a.type === 'video') return frame(`<div class="ecma-media">${picture(a.video)}<img class="ecma-overlay" src="assets/mm-ic_gallery_video_overlay.png" alt=""></div>${three()}`);
    if (a.type === 'audio') return frame(`<div class="ecma-audio"><img src="assets/mm-ic_launcher_record_audio.png" alt=""><span>${esc(a.audio.title)}</span>${a.audio.album ? `<span>${esc(a.audio.album)}</span>` : ''}${a.audio.artist ? `<span>${esc(a.audio.artist)}</span>` : ''}</div>${three(null, true)}`);
    const s = a.slides[0];
    return frame(`<div class="ecma-show"><div class="ecma-showframe npp-fw-picture_frame"><i class="ec-bg np-fw-picture_frame"></i><div class="ecma-showbody${a.layout === 'top' ? ' top' : ''}">${picture(s.image || s.video, 'ecma-showimg')}${s.text ? `<span>${esc(s.text)}</span>` : ''}</div>
      <button type="button" class="ecma-playbtn" data-action="ecma-show"><img src="assets/mm-mms_play_btn.png" alt=""></button></div></div><div class="ecma-btns two">${btn('ecma-edit', M().t('edit'), 80)}${btn('ecma-send', M().t('send'), 80)}</div>`);
  };
  // The message list's mms_layout_view.
  EC.mmsRowView = m => {
    const a = m.attach;
    if (!a) return '';
    const first = a.type === 'slideshow' ? a.slides[0] : a, shot = first.image || first.video;
    const play = a.type !== 'image';
    return `<div class="ecma-row">${shot ? `<span class="ecma-rowpic npp-fw-picture_frame"><i class="ec-bg np-fw-picture_frame"></i>${picture(shot)}</span>` : `<img class="ecma-rowicon" src="assets/mm-ic_mms_music.png" alt="">`}${play ? `<button type="button" class="ecma-playbtn" data-action="ecma-rowplay" data-id="${m.id}"><img src="assets/mm-mms_play_btn.png" alt=""></button>` : ''}</div>`;
  };

  // SlideshowActivity -------------------------------------------------------------------------------------------------------
  let showTimer = 0;
  function play(c, slides, layout) { c.ui.mmsShow = {slides, layout, at: 0}; c.open('mms-slideshow'); }
  EC.register('mms-slideshow', {
    title: 'Messaging',
    render(c) {
      const sh = c.ui.mmsShow, s = sh?.slides[sh.at];
      if (!s) return '';
      const media = s.image || s.video ? picture(s.image || s.video) : s.audio ? `<div class="ecma-playing"><img src="assets/mm-ic_mms_music.png" alt=""><span>${esc(s.audio.title)}</span></div>` : '';
      return c.window(M().t('slideshow_activity'), `<div class="ecma-slide${sh.layout === 'top' ? ' top' : ''}"><div class="ecma-slidemedia">${media}</div>${s.text ? `<div class="ecma-slidetext">${esc(s.text)}</div>` : ''}</div>`);
    },
    mount(c) {
      clearTimeout(showTimer);
      const sh = c.ui.mmsShow, s = sh?.slides[sh.at];
      if (!s) return;
      if (s.audio?.file) { const item = EC.sounds?.list && Object.values(EC.sounds.list).map(l => l[s.audio.file]).find(Boolean); if (item) { const a = new Audio(`../../assets/audio/${item[1]}.webm`); a.play().catch(() => {}); setTimeout(() => a.pause(), (s.duration || DURATION) * 1000); } }
      showTimer = setTimeout(() => { if (c.ui.view !== 'mms-slideshow') return; if (sh.at + 1 < sh.slides.length) { sh.at++; c.render(); } else c.back(); }, (s.duration || DURATION) * 1000);
    },
    back(c) { clearTimeout(showTimer); c.ui.mmsShow = null; return false; }
  });

  // SlideshowEditActivity -----------------------------------------------------------------------------------------------------
  const slides = c => att(c)?.slides || [];
  function slidesRender(c) {
    const rows = slides(c).map((s, i) => {
      const shot = s.image || s.video, name = s.audio ? s.audio.title : '';
      return `<button type="button" class="ecma-srow" data-action="ecma-open" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${shot ? `<span class="ecma-sthumb">${picture(shot)}</span>` : '<img class="ecma-sthumb" src="assets/mm-ic_launcher_slideshow_default_sms.png" alt="">'}
        <span class="ecma-stext"><span class="ecma-snum">${esc(M().fmt('slide_number', c.lang, i + 1))}</span><span class="ecma-sline">${s.text ? `<span class="ecma-sprev">${esc(s.text)}</span>` : ''}${name ? `<span class="ecma-sname">${esc(name)}</span>` : ''}<span class="ecma-sdur">${esc(M().plural('slide_duration', s.duration, c.lang, s.duration))}</span></span></span></button><i class="ecph-div"></i>`;
    }).join('');
    return c.window(M().t('edit_slideshow_activity'), `<div class="ecma-slides">${rows}<button type="button" class="ecma-srow" data-action="ecma-addslide"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img class="ecma-sthumb" src="assets/mm-ic_launcher_slideshow_add_sms.png" alt=""><span class="ecma-stext"><span class="ecma-snum">${esc(M().t('add_slide'))}</span><span class="ecma-sline"><span class="ecma-sprev">${esc(M().t('add_slide_hint'))}</span></span></span></button><i class="ecph-div"></i></div>`);
  }
  // MmsConfig's message size allows a handful of slides (SlideshowModel.checkMessageSize); the image keeps it at 10.
  const addSlide = c => { if (slides(c).length >= 10) { c.toast(M().t('cannot_add_slide_anymore')); return false; } slides(c).push({text: '', duration: DURATION}); return true; };
  const discard = c => { c.ui.smsAttach = null; if (!EC.mmsNeeds(c)) c.toast(M().t('converting_to_text_message')); };
  EC.register('mms-slides', {
    title: 'Messaging',
    render: slidesRender,
    action(name, el, event, c) {
      if (name === 'ecma-open') { c.ui.mmsSlide = Number(el.dataset.index); c.open('mms-slide'); return true; }
      if (name === 'ecma-addslide') { if (addSlide(c)) c.render(); return true; }
      return false;
    },
    menu(c) {
      c.menu([{label: M().t('add_slide'), icon: 'mm-ic_menu_add_slide.png', action: () => { if (addSlide(c)) c.render(); }},
        {label: M().t('remove_slide'), icon: 'fw-ic_menu_delete.png', action: () => {}},
        {label: M().t('discard_slideshow'), icon: 'mm-ic_menu_delete_played.png', action: () => { discard(c); c.back(); }}]);
      return true;
    },
    back(c) { if (c.ui.smsAttach?.type === 'slideshow') fromSlides(c, slides(c)); return false; }
  });

  // SlideEditorActivity ---------------------------------------------------------------------------------------------------------
  function slideRender(c) {
    const list = slides(c), i = c.ui.mmsSlide ?? 0, s = list[i];
    if (!s) return '';
    const media = s.image || s.video ? `<span class="ecma-epic npp-fw-picture_frame"><i class="ec-bg np-fw-picture_frame"></i>${picture(s.image || s.video)}</span>` : '<span class="ecma-epic npp-fw-picture_frame"><i class="ec-bg np-fw-picture_frame"></i></span>';
    const audio = s.audio ? `<div class="ecma-eaudio"><img src="assets/mm-ic_mms_music.png" alt=""><span>${esc(s.audio.title)}</span></div>` : '';
    const small = (action, inner, on = true) => `<button type="button" class="ecui-button ecma-small" data-action="${action}"${on ? '' : ' disabled'}><i class="ec-bg np-fw-btn_default_${on ? 'normal' : 'normal'}"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i>${inner}</button>`;
    return c.window(M().fmt('slide_show_part', c.lang, i + 1, list.length), `<div class="ecma-editor"><div class="ecma-epanel npp-fw-editbox_background_normal"><i class="ec-bg np-fw-editbox_background_normal"></i>
        <div class="ecma-eleft">${media}${audio}</div>
        <div class="ecma-ectl"><div class="ecma-enav">${small('ecma-prev', '<img src="assets/mm-ic_maps_back.png" alt="">', i > 0)}${small('ecma-next', '<img src="assets/mm-ic_maps_next.png" alt="">', i < list.length - 1)}</div>
          ${small('ecma-preview', `<span>${esc(M().t('preview'))}</span>`)}${small('ecma-replaceimg', `<span>${esc(M().t('replace_image'))}</span>`)}${small('ecma-removeslide', `<span>${esc(M().t('remove_slide'))}</span>`)}</div></div>
      <div class="ecma-ebottom"><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input ecma-etext" value="${esc(s.text || '')}" placeholder="${esc(M().t('type_to_compose_text_or_leave_blank'))}" autocomplete="off"></span>${btn('ecma-done', M().t('done'))}</div></div>`);
  }
  const removeSlide = c => {
    const list = slides(c), i = c.ui.mmsSlide ?? 0;
    list.splice(i, 1);
    if (!list.length) { c.back(); return; }
    c.ui.mmsSlide = Math.max(0, i - 1); c.render();
  };
  EC.register('mms-slide', {
    title: 'Messaging',
    render: slideRender,
    mount(c, root) { const input = root.querySelector('.ecma-etext'); input?.addEventListener('input', () => { slides(c)[c.ui.mmsSlide].text = input.value; }); },
    action(name, el, event, c) {
      const list = slides(c), i = c.ui.mmsSlide ?? 0, s = list[i];
      switch (name) {
        case 'ecma-prev': if (i > 0) { c.ui.mmsSlide = i - 1; c.render(); } return true;
        case 'ecma-next': if (i < list.length - 1) { c.ui.mmsSlide = i + 1; c.render(); } return true;
        case 'ecma-preview': play(c, list, att(c).layout); return true;
        case 'ecma-replaceimg': pick(c, 'image', part => { delete s.video; Object.assign(s, part); c.render(); }); return true;
        case 'ecma-removeslide': removeSlide(c); return true;
        case 'ecma-done': c.back(); return true;
      }
      return false;
    },
    menu(c) {
      const list = slides(c), i = c.ui.mmsSlide ?? 0, s = list[i], a = att(c), set = part => { Object.assign(s, part); c.render(); };
      const items = [{label: M().t('preview_slideshow'), icon: 'fw-ic_menu_play_clip.png', action: () => play(c, list, a.layout)}];
      if (s.text) items.push({label: M().t('remove_text'), icon: 'mm-ic_menu_remove_text.png', action: () => { s.text = ''; c.render(); }});
      if (s.image) items.push({label: M().t('remove_picture'), icon: 'mm-ic_menu_remove_picture.png', action: () => { delete s.image; c.render(); }});
      else if (!s.video) items.push({label: M().t('add_picture'), icon: 'mm-ic_menu_picture.png', action: () => pick(c, 'image', set)}, {label: M().t('attach_take_photo'), icon: 'mm-ic_menu_picture.png', action: () => pick(c, 'take-photo', set)});
      if (s.audio) items.push({label: M().t('remove_music'), icon: 'mm-ic_menu_remove_sound.png', action: () => { delete s.audio; c.render(); }});
      else if (!s.video) items.push({label: M().t('add_music'), icon: 'mm-ic_menu_add_sound.png', action: () => setTimeout(() => c.dialog({title: M().t('add_music'), icon: null, items: [M().t('attach_sound'), M().t('attach_record_sound')], onItem: n => setTimeout(() => pick(c, n ? 'record-sound' : 'sound', set), 0)}), 0)});
      if (s.video) items.push({label: M().t('remove_video'), icon: 'mm-ic_menu_remove_video.png', action: () => { delete s.video; c.render(); }});
      else if (!s.image && !s.audio) items.push({label: M().t('add_video'), icon: 'mm-ic_menu_movie.png', action: () => pick(c, 'video', set)});
      items.push({label: M().t('add_slide'), icon: 'mm-ic_menu_add_slide.png', action: () => { if (addSlide(c)) { c.ui.mmsSlide = slides(c).length - 1; c.render(); } }});
      items.push({label: M().fmt('duration_sec', c.lang, s.duration), icon: 'mm-ic_menu_duration.png', action: () => setTimeout(() => {
        const opts = M().t('select_dialog_items');
        c.dialog({title: `${M().t('duration_selector_title')}${i + 1}/${list.length}`, icon: 'mm-ic_mms_duration.png', items: opts, onItem: n => { if (n < 10) { s.duration = n + 1; c.render(); } }});
      }, 0)});
      items.push({label: M().t(a.layout === 'top' ? 'layout_bottom' : 'layout_top'), icon: 'mm-ic_mms_layout.png', action: () => setTimeout(() => c.dialog({title: `${M().t('layout_selector_title')}${i + 1}/${list.length}`, icon: 'mm-ic_mms_layout.png', rows: 'iconlist',
        items: [{label: M().t('select_top_text'), icon: 'mm-ic_mms_text_top.png'}, {label: M().t('select_bottom_text'), icon: 'mm-ic_mms_text_bottom.png'}], onItem: n => { a.layout = n ? 'bottom' : 'top'; c.render(); }}), 0)});
      c.menu(items);
      return true;
    }
  });

  // The compose screen's attachment buttons.
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('messaging'), base = m.action;
    m.action = (name, el, event, c) => {
      const a = att(c);
      switch (name) {
        case 'ecma-view': case 'ecma-play': case 'ecma-show': play(c, slidesOf(a), a?.layout); return true;
        case 'ecma-replace': pick(c, a.type === 'image' ? 'image' : a.type === 'video' ? 'video' : 'sound', part => { c.ui.smsAttach = {type: part.image ? 'image' : part.video ? 'video' : 'audio', ...part, duration: DURATION}; c.render(); }); return true;
        case 'ecma-remove': discard(c); c.render(); return true;
        case 'ecma-edit': c.open('mms-slides'); return true;
        case 'ecma-send': return base('ecms-send', el, event, c);
        case 'ecma-rowplay': { const msg = (c.data.sms || []).find(x => x.id === Number(el.dataset.id)); if (msg?.attach) play(c, slidesOf(msg.attach), msg.attach.layout); return true; }
      }
      return base(name, el, event, c);
    };
  });
})();
