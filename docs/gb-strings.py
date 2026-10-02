"""Generates versions/2.3.6/gb-strings-<app>.js from AOSP android-2.3.6_r1 string resources (en, hu, de, fr, es).
Each output defines window.GBStrings[<app>] = {strings: {key: {en, hu, de, fr, es}}, arrays: {key: {en: [...], ...}}}.
Usage: python docs/gb-strings.py contacts   (see APPS below for the sources and keys)."""
import re, sys, json, html, urllib.request

LANGS = ['', '-hu', '-de', '-fr', '-es']
APPS = {
    'contacts': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_contacts/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'keys': '''contactsList search_settings_description account_phone nameLabelsGroup name_given name_family name_prefix name_middle name_suffix phoneLabelsGroup emailLabelsGroup
organizationLabelsGroup ghostData_company ghostData_title label_notes edit_secondary_collapse menu_done menu_doNotSave editContact_title_edit
editContact_title_insert contactSavedToast deleteConfirmation deleteConfirmation_title selectLabel postalLabelsGroup phoneTypeMobile phoneTypeHome
phoneTypeWork phoneTypeOther emailTypeHome emailTypeWork emailTypeOther emailTypeMobile
dialerIconLabel recentCallsIconLabel contactsIconLabel contactsFavoritesLabel favoritesFrquentSeparator noContacts noContactsHelpText
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
        'keys': '''search_label search_hint search_setting_description app_label new_message create_new_message has_draft messagelist_sender_self sent_on type_to_compose_text_enter_to_send to_hint
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
        'keys': '''musicbrowserlabel search_hint search_settings_description goto_start party_shuffle party_shuffle_off delete_item shuffle_all nowplaying_title artists_title albums_title tracks_title
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
    'email': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_email/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''app_name compose_title send_action reply_action reply_all_action delete_action forward_action discard_action save_draft_action
read_unread_action favorite_action set_star_action remove_star_action refresh_action add_account_action deselect_all_action compose_action
search_action open_action folders_action accounts_action mark_as_read_action mark_as_unread_action add_cc_bcc_action add_attachment_action
choose_attachment_dialog_title mailbox_name_display_inbox mailbox_name_display_outbox mailbox_name_display_drafts mailbox_name_display_trash
mailbox_name_display_sent account_folder_list_separator_accounts account_folder_list_summary_inbox account_folder_list_summary_starred
account_folder_list_summary_drafts account_folder_list_summary_outbox mailbox_list_title message_compose_to_hint message_compose_cc_hint
message_compose_bcc_hint message_compose_subject_hint message_compose_body_hint message_compose_reply_header_fmt message_compose_quoted_text_label
message_compose_error_no_recipients message_compose_error_invalid_email message_view_to_label message_view_cc_label message_discarded_toast
message_saved_toast notification_new_title okay_action cancel_action read_action unread_action status_network_error
account_settings_action'''.split(),
        'plurals': ['message_deleted_toast'],
    },
    'gallery': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_gallery3d/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''app_name camera delete confirm_delete cancel share more select_all deselect_all slideshow menu details album_selected item_selected
albums_selected items_selected album location location_unknown title type taken_on added_on show_on_map rotate_left rotate_right crop set_as
set_as_wallpaper item items date_unknown details_ok no_items wallpaper camera_setas_wallpaper pick pick_prompt'''.split(),
    },
    'camera': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_camera/android-2.3.6_r1/res/values%s/strings.xml'],
        'array_sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_camera/android-2.3.6_r1/res/values%s/arrays.xml'],
        'keys': '''camera_label video_camera_label confirm_restore_title confirm_restore_message switch_camera_id pref_camera_id_title
pref_camera_id_entry_back pref_camera_id_entry_front pref_camera_recordlocation_title pref_camera_recordlocation_entry_off
pref_camera_recordlocation_entry_on pref_video_quality_title pref_camera_settings_category pref_camcorder_settings_category
pref_camera_picturesize_title pref_camera_jpegquality_title pref_camera_focusmode_title pref_camera_flashmode_title
pref_camera_whitebalance_title pref_camera_coloreffect_title pref_camera_scenemode_title pref_restore_title pref_restore_detail
pref_exposure_title zoom_control_title switch_to_camera_lable switch_to_video_lable camera_gallery_photos_text'''.split(),
        'arrays': ['pref_camera_picturesize_entries', 'pref_camera_jpegquality_entries', 'pref_camera_focusmode_entries', 'pref_camera_flashmode_entries',
                   'pref_camera_whitebalance_entries', 'pref_camera_coloreffect_entries', 'pref_camera_scenemode_entries', 'pref_video_quality_entries',
                   'pref_camera_video_flashmode_entries'],
    },
    'framework': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'keys': 'recent_tasks_title no_recent_tasks'.split(),
    },
    'settings2': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'keys': '''manageapplications_settings_title runningservices_settings_title filter_apps_all filter_apps_third_party filter_apps_running
filter_apps_onsdcard no_applications sort_order_alpha sort_order_size internal_storage sd_card_storage service_background_processes
service_foreground_processes no_running_services running_processes_item_description_s_s running_processes_item_description_s_p
running_processes_item_description_p_s running_processes_item_description_p_p application_info_label storage_label total_size_label
application_size_label data_size_label clear_user_data_text cache_header_label cache_size_label clear_cache_btn_text auto_launch_label
auto_launch_disable_text clear_activities permissions_label security_settings_desc force_stop uninstall_text version_text computing_size
force_stop_dlg_title force_stop_dlg_text clear_data_dlg_title clear_data_dlg_text dlg_ok dlg_cancel move_app_to_sdcard
power_usage_summary_title battery_since_unplugged battery_stats_on_battery details_title details_subtitle controls_subtitle packages_subtitle
power_screen power_wifi power_bluetooth power_cell power_phone power_idle usage_type_cpu usage_type_cpu_foreground usage_type_wake_lock
usage_type_on_time usage_type_no_coverage battery_action_stop battery_action_app_details battery_action_display battery_action_wifi
process_kernel_label legal_information settings_license_activity_title settings_license_activity_loading master_clear_title
master_clear_desc erase_external_storage erase_external_storage_description master_clear_button_text master_clear_final_desc
master_clear_final_button_text master_clear_gesture_explanation'''.split(),
    },
    'accounts': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_accountsandsyncsettings/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-2.3.6_r1/core/res/res/values%s/strings.xml'],
        'keys': '''sync_settings background_data background_data_summary background_data_dialog_title background_data_dialog_message sync_automatically
sync_automatically_summary sync_menu_sync_now sync_menu_sync_cancel sync_one_time_sync sync_calendar sync_contacts header_manage_accounts
header_general_sync_settings sync_enabled sync_disabled add_account_label header_data_and_synchronization remove_account_label header_add_an_account
really_remove_account_title really_remove_account_message remove_account_failed sync_item_title ok cancel'''.split(),
    },
    'search': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_quicksearchbox/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''app_name corpus_selection_heading corpus_selection_edit_items corpus_label_global corpus_label_web corpus_description_web
corpus_label_apps corpus_description_apps corpus_hint_apps menu_settings search_settings web_search_category_title system_search_category_title
search_sources search_sources_summary clear_shortcuts clear_shortcuts_summary clear_shortcuts_prompt agree disagree google_search_label
google_search_hint google_search_settings google_show_web_suggestions google_show_web_suggestions_summary_enabled
google_show_web_suggestions_summary_disabled'''.split(),
    },
    'wallpapers': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_wallpapers_livepicker/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_wallpapers_basic/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_wallpapers_musicvisualization/android-2.3.6_r1/res/values%s/strings.xml',
                    'https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_wallpapers_musicvisualization/android-2.3.6_r1/res/values%s/cube.xml',
                    'https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_wallpapers_magicsmoke/android-2.3.6_r1/res/values%s/strings.xml'],
        'keys': '''live_wallpaper_picker_title live_wallpaper_preview_title configure_wallpaper wallpaper_instructions live_wallpaper_empty
live_wallpaper_loading wallpaper_grass wallpaper_grass_desc wallpaper_galaxy wallpaper_galaxy_desc wallpaper_fall wallpaper_fall_desc wallpaper_clock
wallpaper_clock_desc wallpaper_nexus wallpaper_nexus_desc clock_settings show_seconds variable_line_width palette palette_gray palette_violet
palette_matrix palette_white_c palette_black_c palette_halloween palette_zenburn palette_oceanic author wallpaper_vis2 wallpaper_vis3 wallpaper_vis4
wallpaper_vis5 vis2_desc vis3_desc vis4_desc vis5_desc wallpaper_magicsmoke magicsmoke_desc taptochange ok'''.split(),
    },
    'calendar': {
        'sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_calendar/android-2.3.6_r1/res/values%s/strings.xml'],
        'array_sources': ['https://raw.githubusercontent.com/aosp-mirror-neo/platform_packages_apps_calendar/android-2.3.6_r1/res/values%s/arrays.xml'],
        'keys': '''app_label what_label where_label timezone_label attendees_label repeats_label no_title_label show_agenda_view show_day_view agenda_view
day_view week_view month_view event_view event_create event_edit event_delete goto_today menu_select_calendars menu_preferences calendars_title
event_edit_title hint_what hint_where hint_description hint_attendees creating_event saving_event event_info_title add_new_reminder
edit_event_to_label edit_event_from_label edit_event_all_day_label edit_event_calendar_label edit_event_show_extra_options edit_event_hide_extra_options
description_label presence_label privacy_label reminders_label view_event_calendar_label view_event_organizer_label view_event_timezone_label
view_event_response_label agenda_today loading show_older_events show_newer_events delete_label delete_event_label save_label discard_label
does_not_repeat daily every_weekday weekly monthly_on_day_count monthly yearly_plain monthly_on_day yearly modify_event modify_all
modify_all_following delete_this_event_title delete_title preferences_title synced_visible alert_title'''.split(),
        'arrays': ['reminder_minutes_labels', 'reminder_minutes_values', 'availability', 'visibility', 'ordinal_labels', 'delete_repeating_labels'],
    },
}


def clean(value):
    value = re.sub(r'<xliff:g[^>]*>(.*?)</xliff:g>', r'\1', value, flags=re.S)
    value = re.sub(r'<[^>]+>', '', value).strip()
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    # aapt collapses raw whitespace (line breaks and indentation in the XML) to single spaces; only escapes add breaks.
    value = re.sub(r'[ \t\r\n]+', ' ', value)
    value = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), value)
    value = value.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
    return html.unescape(re.sub(r' *\n *', '\n', value))


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
    arrays, string_cache = {}, {}
    for lang in LANGS:
        code = lang[1:] or 'en'
        for source in app.get('array_sources', []):
            # Untranslated arrays.xml (entries that are @string references) only exist in values/; resolve them per language.
            try:
                text = urllib.request.urlopen(source % lang).read().decode('utf-8')
            except Exception:
                try:
                    text = urllib.request.urlopen(source % '').read().decode('utf-8')
                except Exception:
                    continue
                if '@string/' not in text:
                    continue
            # Items may point at strings (@string/key): resolve them in the same language, falling back to English.
            def resolve(item, code=code):
                if not item.startswith('@string/'):
                    return item
                ref = item[8:]
                for src in app['sources']:
                    for variant in ([lang, ''] if lang else ['']):
                        try:
                            body = string_cache.setdefault(src % variant, urllib.request.urlopen(src % variant).read().decode('utf-8'))
                        except Exception:
                            continue
                        m2 = re.search(r'<string name="%s"[^>]*>(.*?)</string>' % re.escape(ref), body, re.S)
                        if m2:
                            return clean(m2.group(1))
                return item
            for key in app.get('arrays', []):
                m = re.search(r'<string-array name="%s"[^>]*>(.*?)</string-array>' % re.escape(key), text, re.S)
                if m:
                    arrays.setdefault(key, {})[code] = [resolve(clean(item)) for item in re.findall(r'<item[^>]*>(.*?)</item>', m.group(1), re.S)]
    for lang in LANGS:
        code = lang[1:] or 'en'
        for source in app['sources'] if app.get('plurals') else []:
            try:
                text = urllib.request.urlopen(source % lang).read().decode('utf-8')
            except Exception:
                continue
            for key in app['plurals']:
                m = re.search(r'<plurals name="%s"[^>]*>(.*?)</plurals>' % re.escape(key), text, re.S)
                if not m:
                    continue
                for quantity, value in re.findall(r'<item quantity="(\w+)"[^>]*>(.*?)</item>', m.group(1), re.S):
                    if quantity in ('one', 'other') and code not in out.get(f'{key}_{quantity}', {}):
                        out.setdefault(f'{key}_{quantity}', {})[code] = clean(value)
    missing = [k for k in app['keys'] if k not in out] + [k for k in app.get('arrays', []) if k not in arrays]
    js = ('/* Generated by docs/gb-strings.py from AOSP android-2.3.6_r1 strings (values, -hu, -de, -fr, -es). Do not edit. */\n'
          'window.GBStrings = window.GBStrings || {};\n'
          'window.GBStrings[%s] = %s;\n' % (json.dumps(name), json.dumps({'strings': out, **({'arrays': arrays} if arrays else {})}, ensure_ascii=False, indent=0)))
    open('D:/xampp/htdocs/android-simulator/versions/2.3.6/gb-strings-%s.js' % name, 'w', encoding='utf-8').write(js)
    print(name, 'keys', len(out), 'missing', missing)


if __name__ == '__main__':
    for name in sys.argv[1:] or APPS:
        build(name)
