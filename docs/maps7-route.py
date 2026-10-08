"""Writes versions/<v>/maps-route.js and maps-route.css (Google Maps 7.5 / 9.3 directions and navigation) from
docs/maps7-route.template.js / .css for the Nexus 5 (4.4.4, Maps 7.5.0) and the Nexus 6 (5.1.1, Maps 9.3.0).
    python docs/maps7-route.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = {
    '4.4.4': {'__MAPS__': '7.5.0', '__IMAGE__': 'hammerhead KTU84P', '__DP__': '.906', '__LP__': 'false',
              '__MODEICONS__': 'ic_directions_car / _transit / _bicycling / _walking, _active when chosen', '__STARTICON__': 'ic_start',
              '__HEADER__': "da_header_green_p", '__MODEOFF__': '1', '__MODEON__': 'transparent', '__LINK__': '#33b5e5', '__LINKCASE__': 'none',
              '__CHECK__': '#33b5e5', '__NAVHEAD__': "border:0 solid transparent;border-image:url('assets/mp7r-da_header_green_p.png') 16 0 20 7 fill / calc(8*var(--dp)) 0 calc(10*var(--dp)) calc(3.5*var(--dp)) stretch"},
    '5.1.1': {'__MAPS__': '9.3.0', '__IMAGE__': 'shamu LMY48Y', '__DP__': '.906', '__LP__': 'true',
              '__MODEICONS__': 'ic_omni_box_car / _transit / _bicycling / _walking, the chosen one underlined in qu_google_blue_500', '__STARTICON__': 'ic_start_footer',
              '__HEADER__': 'green_nav (#006c4a)', '__MODEOFF__': '.55', '__MODEON__': '#4285f4', '__LINK__': '#4285f4', '__LINKCASE__': 'uppercase',
              '__CHECK__': '#4285f4', '__NAVHEAD__': 'background:#006c4a'}}
for ext in ('js', 'css'):
    template = open(f'{ROOT}docs/maps7-route.template.{ext}', encoding='utf-8').read()
    for v, subs in VERSIONS.items():
        out = template
        for k, val in subs.items(): out = out.replace(k, val)
        open(f'{ROOT}versions/{v}/maps-route.{ext}', 'w', encoding='utf-8', newline='\n').write(out)
        print(v, ext, subs['__MAPS__'])
