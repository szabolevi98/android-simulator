"""Builds versions/4.0.4/ics-gmail.js from docs/ics-gmail.template.js with Gmail 4.0.4's own texts: each English key
maps to the IMM76I image's Gmail.apk resource below, read in Hungarian, German, French and Spanish from the image's
string index (docs/image-index.py _aosp/maguro).
    python docs/ics-gmail-strings.py"""
import json, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
NAMES = {'Compose': 'compose', 'Search': 'search', 'Labels': 'labels', 'Refresh': 'refresh', 'Archive': 'archive', 'Delete': 'delete',
         'Mark unread': 'mark_unread', 'Add star': 'add_star', 'Remove star': 'remove_star', 'Reply': 'reply', 'Reply all': 'reply_all',
         'Forward': 'forward', 'Send': 'send', 'Subject': 'subject_hint', 'To': 'to', 'To:': 'to_heading', 'Cc': 'cc', 'Bcc': 'bcc',
         'Compose email': 'body_hint', 'me': 'me', 'Done': 'menu_done', 'Change labels': 'menu_change_labels', 'Settings': 'menu_preferences',
         '%d unread': 'unread', 'No conversations.': 'no_conversations', 'Save draft': 'save_draft', 'Discard': 'discard',
         'Inbox': 'label_inbox', 'Starred': 'label_starred', 'Sent': 'label_sent', 'Drafts': 'label_draft', 'Outbox': 'label_outbox',
         'All mail': 'label_all', 'Spam': 'label_spam', 'Trash': 'label_trash', 'Important': 'label_important', 'Chats': 'label_chat',
         'Priority Inbox': 'label_magic_inbox', 'Recent labels': 'recent_labels_heading', 'All labels': 'all_labels_heading',
         'Sending…': 'sending', 'Message saved as draft.': 'message_saved', 'Search mail': 'search_hint', 'Add Cc/Bcc': 'add_cc_label',
         'Attach file': 'add_file_attachment', 'Mark read': 'mark_read', 'Star': 'star', 'Mark important': 'mark_important',
         'Mark not important': 'mark_not_important', 'Mute': 'mute', 'Report spam': 'report_spam', 'Label settings': 'menu_label_options',
         'Help': 'help_and_info', 'Send feedback': 'feedback', 'Manage labels': 'menu_manage_labels', 'Show all labels': 'show_all_labels',
         'Recent': 'recent_labels', '%s — %s': 'subject_and_snippet'}
idx = json.load(open(ROOT + '_aosp/maguro/strings-index.json', encoding='utf-8'))
by = {name: (en, tr) for en, hits in idx.items() for apk, name, tr in hits if apk == 'Gmail'}
S = {}
def direct(name):
    # The index keeps one configuration per string; a tablet en-GB value (menu_label_options) is read from the APK instead.
    from loguru import logger; logger.remove()
    from androguard.core.apk import APK
    global RES
    if 'RES' not in globals(): RES = APK(ROOT + '_aosp/maguro/system/app/Gmail.apk').get_android_resources()
    rid = RES.get_res_id_by_key(RES.get_packages_names()[0], 'string', name)
    values = {cfg.get_qualifier(): v for cfg, v in RES.get_resolved_res_configs(rid)}
    return values[''], {l: values[l] for l in ('hu', 'de', 'fr', 'es') if l in values}
for key, name in NAMES.items():
    en, tr = by[name]
    if en != key and key != '%d unread': en, tr = direct(name)
    assert en == key or key == '%d unread', (key, en)
    S[key] = [tr.get(l, en) for l in ('hu', 'de', 'fr', 'es')]
    if key == '%d unread': S[key] = [v.replace('%d', '%d') for v in S[key]]
src = open(ROOT + 'docs/ics-gmail.template.js', encoding='utf-8').read()
open(ROOT + 'versions/4.0.4/ics-gmail.js', 'w', encoding='utf-8', newline='\n').write(src.replace('__STRINGS__', json.dumps(S, ensure_ascii=False, indent=4).replace('\n', '\n  ')))
print(len(S), 'strings')
