"""Writes versions/<v>/maps-route.js and maps-route.css (Google Maps 6.x directions and Navigation's drive) from
docs/maps6-route.template.js / .css for the images with Maps 6: the Galaxy Nexus (4.0.4) and the Nexus 4 (4.3).
    python docs/maps6-route.py"""
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
VERSIONS = {'4.0.4': ('6.4.0', 'maguro IMM76I', '.85'), '4.3': ('6.14.4', 'mako JWR66Y', '.8516')}
for ext in ('js', 'css'):
    template = open(f'{ROOT}docs/maps6-route.template.{ext}', encoding='utf-8').read()
    for v, (maps, image, dp) in VERSIONS.items():
        out = template.replace('__MAPS__', maps).replace('__IMAGE__', image).replace('__DP__', dp)
        open(f'{ROOT}versions/{v}/maps-route.{ext}', 'w', encoding='utf-8', newline='\n').write(out)
        print(v, ext, maps)
