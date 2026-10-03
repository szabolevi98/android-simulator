/* Offline, fictional catalog in a 2012 Google Play inspired storefront. */
(() => {
  'use strict';
  const catalog = [
    {id:'camera',name:'Camera',developer:'Android Demo',category:'Photography',rating:4.6,size:'2.4 MB',description:'Capture a little piece of your day.',app:'camera',art:'photo'},
    {id:'orbit',name:'Orbit Hopper',developer:'Moonlight Studio',category:'Games',rating:4.8,size:'12 MB',description:'A small adventure among the stars.',art:'orbit'},
    {id:'blocks',name:'Pixel Blocks',developer:'Pocket Pixels',category:'Games',rating:4.5,size:'8.6 MB',description:'Bright blocks, simple shapes, endless possibilities.',art:'blocks'},
    {id:'calendar',name:'Calendar',developer:'Android Demo',category:'Productivity',rating:4.2,size:'1.8 MB',description:'Make room for the things that matter.',app:'calendar',art:'calendar'},
    {id:'clock',name:'Clock',developer:'Android Demo',category:'Tools',rating:4.1,size:'1.2 MB',description:'A familiar clock and alarms for your day.',app:'clock',art:'clock'},
    {id:'calculator',name:'Calculator',developer:'Android Demo',category:'Tools',rating:4.7,size:'0.8 MB',description:'Everyday sums and scientific discoveries.',app:'calculator',art:'calculator'}
  ];
  const categories = ['Games','Photography','Communication','Music & audio','Productivity','Tools'];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const initial = () => ({page:'home',tab:'featured',category:'',query:'',selected:'camera',preview:0});
  const icon = item => item.app ? `<img class="play-app-icon" src="assets/${item.app}.png" alt="">` : `<span class="play-app-icon play-icon-${item.art}" aria-hidden="true">${item.art === 'orbit' ? '◌' : '▦'}</span>`;
  function filtered(state, t) {
    const query = state.query.trim().toLocaleLowerCase();
    return catalog.filter(item => state.page !== 'my-apps' || item.app)
      .filter(item => !state.category || item.category === state.category)
      .filter(item => state.page !== 'search' || `${t(item.name)} ${item.name} ${item.developer} ${t(item.category)}`.toLocaleLowerCase().includes(query))
      .sort((a,b) => state.tab === 'top-free' ? b.rating - a.rating : 0);
  }
  function artwork(item, page = 0) {
    return `<div class="play-art play-art-${item.art} variation-${page}" aria-hidden="true"><span class="play-orbit-ring"></span><span class="play-art-symbol">${({photo:'◎',orbit:'✦',web:'www.',blocks:'▦',music:'♫',calendar:'12',clock:'◷',calculator:'2+2'})[item.art]}</span><span class="play-art-caption">${escape(item.name)}</span></div>`;
  }
  function render(state, ratings, t) {
    const item = catalog.find(entry => entry.id === state.selected) || catalog[0];
    const heading = state.page === 'my-apps' ? t('My apps') : state.page === 'search' ? t('Search') : state.page === 'list' ? t(state.category) : state.page === 'home' ? 'Google Play' : t(item.name);
    const header = `<header class="play-header"><button data-action="back" aria-label="Back"><span class="play-up">‹</span><img src="assets/play-store.svg?v=3" alt=""></button><h2>${escape(heading)}</h2><button data-action="play-search" aria-label="Search"><img src="assets/ic_dial_action_search.png" alt=""></button><button data-action="play-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></header>`;
    const tabs = state.page === 'home' ? `<nav class="play-tabs">${[['categories','Categories'],['featured','Featured'],['top-free','Top free']].map(([id,title]) => `<button data-action="play-tab" data-id="${id}" aria-pressed="${state.tab===id}">${escape(t(title))}</button>`).join('')}</nav>` : '';
    const row = (entry, index) => `<button class="play-row" data-action="play-detail" data-id="${entry.id}">${state.tab === 'top-free' ? `<span class="play-rank">${index+1}</span>` : ''}${icon(entry)}<span class="play-row-copy"><strong>${escape(t(entry.name))}</strong><small>${escape(entry.developer)}</small><span class="play-stars">★★★★<span>★</span> <small>${entry.rating.toFixed(1)}</small></span></span><span class="play-price">${escape(t(state.page === 'my-apps' ? 'Installed' : 'Free'))}</span></button>`;
    let body;
    if (state.page === 'preview') {
      body = `<div class="play-preview">${artwork(item,state.preview)}<div class="play-preview-controls"><button data-action="play-preview-step" data-id="-1" aria-label="Previous">‹</button><span>${state.preview+1} / 3</span><button data-action="play-preview-step" data-id="1" aria-label="Next">›</button></div><p>${escape(t('Sample preview'))}</p></div>`;
    } else if (state.page === 'detail') {
      body = `<div class="play-detail"><div class="play-product">${icon(item)}<div><h3>${escape(t(item.name))}</h3><p>${escape(item.developer)}</p><small>${escape(t(item.category))}</small></div></div><div class="play-product-actions"><span class="play-stars">★★★★<span>★</span> ${item.rating.toFixed(1)}</span><button data-action="${item.app ? 'play-open' : 'play-preview'}" data-id="${item.id}">${escape(t(item.app ? 'Open app' : 'Preview'))}</button></div><p class="play-demo-note">${escape(t('Demo catalog · sample data'))}</p><div class="play-screenshots">${[0,1,2].map(index=>`<button data-action="play-preview" data-id="${item.id}" data-preview="${index}" aria-label="${escape(t('Preview'))} ${index+1}">${artwork(item,index)}</button>`).join('')}</div><section class="play-section"><h3>${escape(t('Description'))}</h3><p>${escape(t(item.description))}</p><p>${escape(t('An offline demo you can explore right here.'))}</p></section><section class="play-section"><h3>${escape(t('Rate this app'))}</h3><div class="play-rating" role="group" aria-label="${escape(t('Rate this app'))}">${[1,2,3,4,5].map(star=>`<button data-action="play-rate" data-id="${star}" aria-label="${star} / 5" aria-pressed="${(ratings[item.id] || 0)===star}" class="${star<=(ratings[item.id]||0)?'rated':''}">★</button>`).join('')}</div>${ratings[item.id] ? `<small>${escape(t('Your rating'))}: ${ratings[item.id]} / 5</small>` : ''}</section><section class="play-section"><h3>${escape(t('Reviews'))}</h3><strong>Alex · ★★★★★</strong><p>${escape(t('Simple, fun and full of memories.'))}</p><strong>Sam · ★★★★☆</strong><p>${escape(t('A lovely little demo.'))}</p></section><dl class="play-metadata"><div><dt>${escape(t('Version'))}</dt><dd>1.0</dd></div><div><dt>${escape(t('Size'))}</dt><dd>${item.size}</dd></div><div><dt>${escape(t('Downloads'))}</dt><dd>10,000+</dd></div></dl></div>`;
    } else if (state.page === 'home' && state.tab === 'categories' && !state.category) {
      body = `<div class="play-category-list">${categories.map(category=>`<button data-action="play-category" data-id="${category}"><span>${escape(t(category))}</span><span>›</span></button>`).join('')}</div>`;
    } else if (state.page === 'home' && state.tab === 'featured' && !state.category) {
      body = `<div class="play-featured"><button class="play-feature-banner" data-action="play-detail" data-id="camera">${artwork(catalog[0])}<span>${escape(t('Capture the moment'))}</span><small>${escape(t('Camera'))}</small></button><div class="play-feature-tiles"><button data-action="play-tab" data-id="top-free"><span>★</span>${escape(t('Staff picks'))}</button><button data-action="play-category" data-id="Games"><span>✚</span>${escape(t('Games'))}</button><button data-action="play-detail" data-id="orbit">${artwork(catalog[1])}<strong>Orbit Hopper</strong></button><button data-action="play-detail" data-id="blocks">${artwork(catalog[3])}<strong>Pixel Blocks</strong></button></div><h3 class="play-list-heading">${escape(t('Recommended for you'))}</h3>${catalog.slice(4).map(row).join('')}</div>`;
    } else {
      const items = filtered(state,t);
      body = `${state.page === 'search' ? `<form class="play-search" data-form="play-search"><input name="query" type="search" aria-label="Search apps" placeholder="Search apps" value="${escape(state.query)}" maxlength="80"><button type="submit" aria-label="Search">⌕</button></form>` : ''}<h3 class="play-list-heading">${escape(t(state.page === 'my-apps' ? 'Installed' : state.page === 'search' ? 'Search results' : state.category || 'Top free'))}</h3>${items.length ? items.map(row).join('') : `<p class="play-empty">${escape(t('No apps found'))}</p>`}`;
    }
    return `<div class="app-view play-store">${header}${tabs}<div class="play-content">${body}</div></div>`;
  }
  window.ICSPlayStore = {catalog, initial, render, filtered};
})();
