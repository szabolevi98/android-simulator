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
    card.className = 'version-card';
    card.innerHTML = `
    <div class="version-art" aria-hidden="true">
      <div class="mini-phone">
        <span class="mini-earpiece"></span><span class="mini-camera"></span>
        <div class="mini-screen">
          <div class="mini-status"><img src="versions/4.0.4/assets/stat_notify_sms.png" alt=""><span class="mini-status-right"><img src="versions/4.0.4/assets/stat_sys_wifi_signal_4_fully.png" alt=""><img src="versions/4.0.4/assets/stat_sys_signal_4_fully.png" alt=""><img src="versions/4.0.4/assets/stat_sys_battery_71.png" alt="">4:04</span></div>
          <div class="mini-search"><span>Google</span><img src="versions/4.0.4/assets/ic_btn_speak_now.png" alt=""></div>
          <div class="mini-clock"><img src="versions/4.0.4/assets/appwidget_clock_dial.png" alt=""><img src="versions/4.0.4/assets/appwidget_clock_hour.png" style="transform:rotate(122deg)" alt=""><img src="versions/4.0.4/assets/appwidget_clock_minute.png" style="transform:rotate(24deg)" alt=""></div>
          <div class="mini-shortcuts"><img src="versions/4.0.4/assets/camera.png" alt=""><span class="mini-google"><img src="versions/4.0.4/assets/browser.png" alt=""><img src="versions/4.0.4/assets/email.png" alt=""><img src="versions/4.0.4/assets/calendar.png" alt=""><img src="versions/4.0.4/assets/gallery.png" alt=""></span></div>
          <div class="mini-dock"><img src="versions/4.0.4/assets/phone.png" alt=""><img src="versions/4.0.4/assets/people.png" alt=""><img src="versions/4.0.4/assets/apps.png" alt=""><img src="versions/4.0.4/assets/messaging.png" alt=""><img src="versions/4.0.4/assets/browser.png" alt=""></div>
          <div class="mini-nav"><img src="versions/4.0.4/assets/nav-back.png" alt=""><img src="versions/4.0.4/assets/nav-home.png" alt=""><img src="versions/4.0.4/assets/nav-recent.png" alt=""></div>
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
