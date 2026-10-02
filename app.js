const versions = window.ANDROID_VERSIONS || [];
const list = document.querySelector('#version-list');
const i18n = window.AndroidI18n;
document.querySelector('#language-select').value = i18n.language;
document.querySelector('#language-select').addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
document.querySelector('#version-count').textContent = `${versions.filter(version => version.status === 'available').length} ${i18n.t('AVAILABLE')}`;

for (const version of versions) {
  const card = document.createElement('article');
  if (version.status === 'planned') {
    card.className = 'planned-card';
    card.innerHTML = `<div class="planned-number">${version.id}</div><div><span class="planned-badge">${i18n.t('PLANNED')}</span><h3>${version.name}</h3><p>${version.version} · ${version.year}</p></div><span class="planned-lock" aria-hidden="true">↗</span>`;
  } else {
    const assets = `${version.url}assets/`;
    const art = version.art || {wallpaper: 'wallpaper_chroma.jpg', search: 'ics'};
    card.className = 'version-card';
    card.innerHTML = `
    <div class="version-art" aria-hidden="true">
      <div class="mini-phone">
        <span class="mini-earpiece"></span><span class="mini-camera"></span>
        <div class="mini-screen" style="background-image:url('${assets}${art.wallpaper}')">
          <div class="mini-status"><img src="${assets}stat_notify_sms.png" alt=""><span class="mini-status-right"><img src="${assets}stat_sys_wifi_signal_4_fully.png" alt=""><img src="${assets}stat_sys_signal_4_fully.png" alt=""><img src="${assets}stat_sys_battery_71.png" alt="">4:04</span></div>
          <div class="mini-search mini-search-${art.search}"><span>Google</span><img src="${assets}${art.search === 'jb' ? 'launcher-ic_home_voice_search_holo.png' : 'ic_btn_speak_now.png'}" alt=""></div>
          <div class="mini-clock"><img src="${assets}appwidget_clock_dial.png" alt=""><img src="${assets}appwidget_clock_hour.png" style="transform:rotate(122deg)" alt=""><img src="${assets}appwidget_clock_minute.png" style="transform:rotate(24deg)" alt=""></div>
          <div class="mini-shortcuts"><img src="${assets}camera.png" alt=""><span class="mini-google"><img src="${assets}browser.png" alt=""><img src="${assets}email.png" alt=""><img src="${assets}calendar.png" alt=""><img src="${assets}gallery.png" alt=""></span></div>
          <div class="mini-dock"><img src="${assets}phone.png" alt=""><img src="${assets}people.png" alt=""><img src="${assets}apps.png" alt=""><img src="${assets}messaging.png" alt=""><img src="${assets}browser.png" alt=""></div>
          <div class="mini-nav"><img src="${assets}nav-back.png" alt=""><img src="${assets}nav-home.png" alt=""><img src="${assets}nav-recent.png" alt=""></div>
        </div>
      </div>
    </div>
    <div class="version-details">
      <div class="version-meta"><span class="badge">${i18n.t('AVAILABLE')}</span><span>${version.year}</span></div>
      <h3>${version.version}</h3>
      <h4>${version.name}</h4>
      <p>${version.description}</p>
      <div class="version-bottom"><span>${version.device}</span><a class="launch" href="${version.url}">${i18n.t('Launch simulator')} <span aria-hidden="true">↗</span></a></div>
    </div>`;
  }
  list.append(card);
}
i18n.translateDOM(document.body);

// Header orbit: every release in the catalogue, oldest first (planned ones dimmed); the newest available is shown first,
// and with reduced motion it stays.
const orbitCore = document.querySelector('.orbit-core');
const numeric = id => id.split('.').map(Number).reduce((sum, part, i) => sum + part / 100 ** i, 0);
const releases = [...versions].sort((a, b) => numeric(a.id) - numeric(b.id)).map(version => ({label: version.id.split('.').slice(0, 2).join('.'), planned: version.status !== 'available'}));
if (orbitCore && releases.length) {
  const available = releases.filter(release => !release.planned);
  let index = releases.indexOf(available[available.length - 1] || releases[releases.length - 1]);
  const show = () => { orbitCore.textContent = releases[index].label; orbitCore.classList.toggle('planned', releases[index].planned); };
  show();
  if (releases.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => {
    orbitCore.classList.add('switching');
    setTimeout(() => { index = (index + 1) % releases.length; show(); orbitCore.classList.remove('switching'); }, 350);
  }, 3500);
}

// Header: the span of releases in the catalogue; footer: the current year.
const sortedIds = [...versions].map(version => version.id).sort((a, b) => numeric(a) - numeric(b)).map(id => id.split('.').slice(0, 2).join('.'));
if (sortedIds.length) document.querySelector('#edition-range').textContent = `Android ${sortedIds[0]} – ${sortedIds[sortedIds.length - 1]}`;
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
