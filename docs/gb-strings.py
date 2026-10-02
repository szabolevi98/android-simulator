"""Generates versions/2.3.6/gb-strings-<app>.js from AOSP android-2.3.6_r1 string resources (en, hu, de, fr, es).
Each output defines window.GBStrings[<app>] = {strings: {key: {en, hu, de, fr, es}}, arrays: {key: {en: [...], ...}}}.
Usage: python docs/gb-strings.py contacts   (see APPS below for the sources and keys)."""
import re, sys, json, html, urllib.request

LANGS = ['', '-hu', '-de', '-fr', '-es']
APPS = {
    'contacts': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''dialerIconLabel recentCallsIconLabel contactsIconLabel contactsFavoritesLabel favoritesFrquentSeparator noContacts noContactsHelpText
noFavoritesHelpText recentCalls_empty recentCalls_callNumber recentCalls_editNumberBeforeCall recentCalls_addToContact recentCalls_removeFromRecentList
recentCalls_deleteAll clearCallLogConfirmation_title clearCallLogConfirmation type_incoming type_outgoing type_missed callBack callAgain returnCall
callDetailTitle call_mobile call_home call_work call_other sms_mobile sms_home sms_work sms_other menu_search menu_newContact menu_displayGroup menu_accounts
menu_import_export menu_addStar menu_removeStar menu_editContact menu_deleteContact menu_share menu_call menu_sendSMS menu_sendEmail add_2sec_pause
add_wait searchHint viewContactTitle starredList frequentList dialer_addAnotherCall dialer_useDtmfDialpad dialer_returnToInCallScreen
callDetailsDurationFormat menu_viewContact email_home email_work email_other email email_custom'''.split(),
    },
    'phone': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_phone/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''card_title_dialing card_title_in_progress card_title_call_ended card_title_on_hold card_title_hanging_up onscreenAddCallText
onscreenEndCallText onscreenShowDialpadText onscreenHideDialpadText onscreenMuteText onscreenSpeakerText onscreenBluetoothText onscreenHoldText
onscreenUnholdText unknown onHold notification_on_hold notification_ongoing_call_format contactPhoto'''.split(),
    },
    'mms': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_mms/android-2.3.6_r1/res/values%s/strings.xml'],
        'array_sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_mms/android-2.3.6_r1/res/values%s/arrays.xml'],
        'keys': '''app_label new_message create_new_message has_draft messagelist_sender_self sent_on type_to_compose_text_enter_to_send to_hint
send sending_message menu_compose_new menu_delete_all menu_preferences menu_call menu_view_contact add_subject add_attachment menu_insert_smiley
delete_thread discard all_threads menu_add_to_contacts message_options menu_forward copy_message_text view_message_details delete_message menu_lock
delete confirm_dialog_title confirm_delete_conversation confirm_delete_all_conversations confirm_delete_message no subject_hint menu_view menu_delete
message_details_title message_type_label text_message multimedia_message from_label to_address_label sent_label received_label search_hint
attach_image attach_take_photo attach_video attach_record_video attach_sound attach_record_sound attach_slideshow select_link_title
search_empty view replace_image remove inline_subject menu_unlock'''.split(),
        'arrays': ['default_smiley_names', 'default_smiley_texts'],
    },
    'calculator': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_calculator/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': 'app_name error del clear basic advanced clear_history'.split(),
    },
    'deskclock': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'array_sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_deskclock/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''app_label alarm_list_title add_alarm menu_desk_clock menu_edit_alarm delete_alarm enable_alarm disable_alarm delete_alarm_confirm
label default_label set_alarm alarm_vibrate alarm_repeat alert time alarm_alert_dismiss_text alarm_alert_snooze_text alarm_alert_snooze_set day days
hour hours minute minutes every_day never day_concat settings done revert delete alarm_button_description gallery_button_description
music_button_description nightmode_button_description home_button_description desk_clock_button_description menu_item_dock_settings
silent_alarm_summary date_time_set'''.split(),
        'arrays': ['alarm_set'],
    },
    'music': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_music/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''goto_start party_shuffle party_shuffle_off delete_item shuffle_all nowplaying_title artists_title albums_title tracks_title
playlists_title search_title no_tracks_title ringtone_menu play_selection add_to_playlist queue new_playlist new_playlist_name_template
create_playlist_create_text remove_from_playlist shuffle_on_notif shuffle_off_notif repeat_all_notif
repeat_current_notif repeat_off_notif emptyplaylist'''.split(),
    },
    'browser': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_browser/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'keys': '''new_tab active_tabs tab_bookmarks tab_most_visited tab_history added_to_bookmarks removed_from_bookmarks title_bar_loading page_info
page_info_address stop reload back forward location name save_to_bookmarks edit_bookmark open_bookmark remove_bookmark bookmark_needs_title
delete_bookmark open_in_new_window goto_dot find_dot select_dot tab_picker_title tab_picker_remove_tab bookmarks history menu_view_download
copy_page_url share_page menu_preferences clear_history empty_history add_bookmark_short search_hint
bookmark_page switch_to_thumbnails switch_to_list set_as_homepage contextmenu_openlink contextmenu_openlink_newwindow contextmenu_sharelink
contextmenu_copylink remove_history_item create_shortcut_bookmark'''.split(),
    },
}


def clean(value):
    value = re.sub(r'<xliff:g[^>]*>(.*?)</xliff:g>', r'\1', value, flags=re.S)
    value = re.sub(r'<[^>]+>', '', value).strip()
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    value = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), value)
    value = value.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
    return html.unescape(re.sub(r'[ \t]*\n[ \t]*', '\n', value))


def build(name):
    app, out = APPS[name], {}
    for lang in LANGS:
        code = lang[1:] or 'en'
        for source in app['sources']:
            try:
                text = urllib.request.urlopen(source % lang).read().decode('utf-8')
            except Exception:
                continue
            for key in app['keys']:
                m = re.search(r'<string name="%s"(?: product="default")?[^>]*>(.*?)</string>' % re.escape(key), text, re.S)
                if m and code not in out.get(key, {}):
                    out.setdefault(key, {})[code] = clean(m.group(1))
    arrays = {}
    for lang in LANGS:
        code = lang[1:] or 'en'
        for source in app.get('array_sources', []):
            try:
                text = urllib.request.urlopen(source % lang).read().decode('utf-8')
            except Exception:
                continue
            for key in app.get('arrays', []):
                m = re.search(r'<string-array name="%s"[^>]*>(.*?)</string-array>' % re.escape(key), text, re.S)
                if m:
                    arrays.setdefault(key, {})[code] = [clean(item) for item in re.findall(r'<item[^>]*>(.*?)</item>', m.group(1), re.S)]
    missing = [k for k in app['keys'] if k not in out] + [k for k in app.get('arrays', []) if k not in arrays]
    js = ('/* Generated by docs/gb-strings.py from AOSP android-2.3.6_r1 strings (values, -hu, -de, -fr, -es). Do not edit. */\n'
          'window.GBStrings = window.GBStrings || {};\n'
          'window.GBStrings[%s] = %s;\n' % (json.dumps(name), json.dumps({'strings': out, **({'arrays': arrays} if arrays else {})}, ensure_ascii=False, indent=0)))
    open('D:/xampp/htdocs/android-simulator/versions/2.3.6/gb-strings-%s.js' % name, 'w', encoding='utf-8').write(js)
    print(name, 'keys', len(out), 'missing', missing)


if __name__ == '__main__':
    for name in sys.argv[1:] or APPS:
        build(name)
