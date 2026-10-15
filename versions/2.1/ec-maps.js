/* Android 2.1 Google Maps 3.4.0 (Maps.apk, versionCode 3413, ERE27; the dark default theme) with a made-up city, offline.
   Google's map tiles, place data and routes cannot ship, so the map is our own drawing of a riverside city in the colours
   of Google's 2010 tiles (land, white streets, yellow arterials, the orange ring road, parks, the river), drawn on a
   canvas at Google's zoom levels; the places, friends, reviews and routes are made up.
   - MapsActivity (maps.xml): the map (AndroidView), the bubble (popup_pointer_button with the name and address),
     button_container.xml: btn_zoom_down / btn_zoom_up (58 / 65 x 40 dp) at the bottom right, shown when the map is touched;
     btn_list, btn_prev_down and btn_next_up at the bottom left while there are results or a route. Drag to move, double
     tap or pinch to zoom (Maps 3.4 brought multi-touch zoom).
   - The menu (MapsActivity.a(Menu), from the command list r.v): Search (ic_menu_search, s), Directions
     (ic_menu_directions, d), Layers (ic_menu_layers), My Location (ic_menu_mylocation, 0), Join Latitude / Latitude
     (ic_menu_latitude, l), then More: Clear Map (ic_menu_revert, c; enabled when there is something to clear), Starred
     Items, Help, Terms, Privacy & Notices. In a list the menu has Map (ic_menu_see_map, m).
   - Search: the search dialog of searchable.xml (the Maps icon, no hint, the voice button) with suggestions from the
     search history and the places (personalized suggestions came with 3.4); results as lettered markers
     (search_markers_android, letters_android A–J) with the first one's bubble.
   - The place page: tabs.xml (Address / Details / Reviews: address_*, details_*, reviews_*), list_header_pp.xml (the
     name, the address and the star: star_on_pp / star_off_pp) and list_item_pp.xml rows (Show on map, Get directions,
     Navigate, Call, Street view, Report a problem; pp_button_icons, sym_action_call).
   - Directions: directions_input_dialog.xml on bottombar_portrait_565 (My Location, "End point:", ic_input_get, the
     travel_type.xml radio buttons: driving, transit, walking; biking was not offered; Go), then the list
     (list_header_directions.xml on #828282, list_item_directions_step.xml rows) and the route on the map with
     directions_map_pins_android; previous / next walk through the steps.
   - Layers: the layers dialog (ic_dialog_menu_generic; layers_dialog_action_icons_android: traffic, satellite, Latitude,
     search results, directions, starred items, More Layers; the green check on the active ones) and More Layers (My
     Maps ▸, Wikipedia, Transit Lines, Favorite Places ▸, as in GSMArena's screenshot). The layer list came from Google's
     server (LAYERS_REQUEST); the Wikipedia, transit and Favorite Places icons were server images, so ours are drawn.
   - Latitude: joining (the introduction, Accept & share), then the friends on the map and their list.
   - Starred Items (synchronized starring came with 3.4: "the More menu on your phone").
   Maps 3.4 took most of its texts from a language file it downloaded (strings.dat); those rows of the [maps] table are
   marked own and name the screenshot they come from (docs/data/ec-own.tsv). Navigation (beta) and Street View 1.4 are
   in ec-maps-nav.js. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('maps');
  const t = k => M().t(k);
  const fmt = (c, k, ...args) => M().fmt(k, c.lang, ...args);
  const A = name => `assets/mp-${name}.png`;
  const DP = () => (document.querySelector('#viewport')?.clientWidth || 320) / 320;

  // ---------------------------------------------------------------------------------------------------------------
  // The city (metres; x east, y south). The river runs north to south; Ring Rd circles the centre.
  const RIVER = [[150, -5200], [320, -3000], [80, -1800], [260, -700], [420, 200], [260, 1100], [480, 2200], [380, 3200], [560, 5200]];
  const riverX = y => {
    for (let i = 1; i < RIVER.length; i++) {
      const [x0, y0] = RIVER[i - 1], [x1, y1] = RIVER[i];
      if (y <= y1) { const f = (y - y0) / (y1 - y0), s = f * f * (3 - 2 * f); return x0 + (x1 - x0) * s; }
    }
    return RIVER.at(-1)[0];
  };
  const along = (fn, y0, y1, step = 100) => { const pts = []; for (let y = y0; y <= y1; y += step) pts.push([fn(y), y]); return pts; };
  const ring = (rx, ry) => { const pts = []; for (let a = 0; a <= 64; a++) { const r = a / 64 * Math.PI * 2; pts.push([Math.round(Math.sin(r) * rx), Math.round(-Math.cos(r) * ry)]); } return pts; };
  // Named roads: hw = the ring road (orange), art = arterials (yellow), loc = named local streets (white).
  const ROADS = [
    {name: 'Ring Rd', kind: 'hw', pts: ring(2600, 2400)},
    {name: 'Market St', kind: 'art', pts: [[-3900, 260], [-1500, 240], [riverX(230) - 75, 230]]},
    {name: 'Bridge Rd', kind: 'art', pts: [[-3900, -170], [-1100, -175], [riverX(-180), -180], [1600, -150], [3900, -120]]},
    {name: 'Elm St', kind: 'art', pts: [[-3400, -900], [-1100, -905], [riverX(-900) - 75, -900]]},
    {name: 'Park Ave', kind: 'art', pts: [[-1100, -4200], [-1150, -1500], [-1100, 0], [-1080, 1500], [-1120, 4200]]},
    {name: 'River St', kind: 'art', pts: along(y => riverX(y) - 110, -3600, 3600)},
    {name: 'Harbor Rd', kind: 'art', pts: along(y => riverX(y) + 110, -3600, 3600)},
    {name: 'Station Rd', kind: 'art', pts: [[1650, -4200], [1600, -1500], [1640, 0], [1600, 1500], [1660, 4200]]},
    {name: 'Mill Rd', kind: 'art', pts: [[-3600, 1500], [-1080, 1480], [riverX(1500), 1500], [1600, 1520], [3900, 1550]]},
    {name: 'Hill St', kind: 'art', pts: [[riverX(800) + 110, 800], [1640, 790], [3900, 780]]},
    {name: 'North Ave', kind: 'art', pts: [[-3200, -2000], [-1150, -2000], [riverX(-2000) - 110, -2000]]},
    {name: 'Lake Rd', kind: 'art', pts: [[riverX(-2200) + 110, -2200], [1610, -2210], [3600, -2600]]},
    {name: 'Church St', kind: 'loc', pts: [[-1100, -520], [riverX(-520) - 110, -520]]},
    {name: 'Museum Sq', kind: 'loc', pts: [[-600, -720], [-300, -720]]},
    {name: 'Oak St', kind: 'loc', pts: [[-1100, 650], [riverX(650) - 110, 650]]},
    {name: 'Garden St', kind: 'loc', pts: [[-600, -905], [-600, 1480]]},
    {name: 'Union St', kind: 'loc', pts: [[1050, -1500], [1050, 1500]]}
  ];
  const PARKS = [
    {name: 'Riverside Park', pts: [[-1700, 900], [-1180, 880], [-1170, 1420], [-1720, 1430]]},
    {name: 'City Park', pts: [[-2500, -1500], [-1800, -1550], [-1750, -1050], [-2450, -1000]]},
    {name: 'Harbor Green', pts: [[700, -900], [1000, -910], [1000, -560], [720, -540]]},
    {name: 'Hill Park', pts: [[2000, 1700], [2600, 1650], [2700, 2200], [2050, 2250]]}
  ];
  const LAKE = {name: 'Mill Pond', cx: 2500, cy: -1500, rx: 420, ry: 260};
  const DISTRICTS = [['Old Town', -500, -350], ['Riverside', -1700, 600], ['Northside', -700, -2600], ['Harbor District', 1250, -750], ['Eastgate', 2500, 500], ['Southside', -400, 2500], ['Westfield', -3000, 300]];
  // Local streets: a grid each side of the river, slightly turned; their names.
  const GRIDS = [
    {side: -1, angle: -0.06, step: 135, ns: ['Pine St', 'Maple Ave', 'Cedar St', 'Walnut St', 'Chestnut St', 'Spruce St', 'Ash St', 'Birch St', 'Willow St', 'Poplar St'], ew: ['1st St', '2nd St', '3rd St', '4th St', '5th St', '6th St', '7th St', '8th St', '9th St', '10th St']},
    {side: 1, angle: 0.05, step: 125, ns: ['Dock St', 'Pier St', 'Wharf St', 'Anchor St', 'Sail St', 'Bay St', 'Cove St', 'Reef St', 'Tide St', 'Shore St'], ew: ['King St', 'Queen St', 'Duke St', 'Prince St', 'Bishop St', 'Earl St', 'Baron St', 'Knight St', 'Royal St', 'Crown St']}
  ];
  const CITY_R = 3300;
  // Places: [id, name, category, address, x, y, rating, phone, reviews].
  const PLACES = [
    ['p1', 'Riverside Grill', 'Restaurant', '14 River St', riverX(-300) - 150, -300, 4.5, '202-555-0131', 35], ['p2', 'Luigi’s Trattoria', 'Italian Restaurant', '220 Market St', -760, 215, 4, '202-555-0175', 22],
    ['p3', 'Golden Lotus', 'Chinese Restaurant', '8 Park Ave', -1070, -480, 3.5, '202-555-0190', 12], ['p4', 'Bean There Café', 'Coffee Shop', '31 Market St', -260, 210, 4.5, '202-555-0102', 41],
    ['p5', 'Morning Grind', 'Coffee Shop', '5 Bridge Rd', 660, -185, 4, '202-555-0143', 18], ['p6', 'The Anchor Pub', 'Bar', '77 Harbor Rd', riverX(600) + 145, 600, 4, '202-555-0155', 27],
    ['p7', 'Blue Note Lounge', 'Bar', '19 Elm St', -900, -875, 3.5, '202-555-0168', 9], ['p8', 'Harbor View Hotel', 'Hotel', '1 Harbor Rd', riverX(-1200) + 150, -1200, 4, '202-555-0111', 64],
    ['p9', 'Parkside Inn', 'Hotel', '60 Park Ave', -1040, 900, 3.5, '202-555-0124', 15], ['p10', 'City Museum', 'Museum', '2 Museum Sq', -450, -700, 4.5, '202-555-0109', 88],
    ['p11', 'Old Town Bridge', 'Landmark', 'Bridge Rd', riverX(-180), -195, 5, '', 51], ['p12', 'Riverside Park', 'Park', 'Park Ave', -1440, 1160, 4.5, '', 33],
    ['p13', 'First City Bank', 'Bank', '100 Market St', -450, 270, 3, '202-555-0181', 4], ['p14', 'Central Savings ATM', 'ATM', '9 Elm St', -620, -880, 3, '', 2],
    ['p15', 'Northside Fuel', 'Gas Station', '400 Ring Rd', 300, -2410, 3.5, '202-555-0162', 6], ['p16', 'Ring Road Gas', 'Gas Station', '18 Ring Rd', 1850, 1700, 3, '202-555-0198', 3],
    ['p17', 'Station Market', 'Supermarket', '12 Station Rd', 1680, -40, 4, '202-555-0137', 19], ['p18', 'Mill Pond Boathouse', 'Restaurant', 'Lake Rd', 2380, -1760, 4.5, '202-555-0149', 26]
  ].map(([id, name, cat, address, x, y, rating, phone, reviews]) => ({id, name, cat, address, x: Math.round(x), y: Math.round(y), rating, phone, reviews}));
  const WORDS = [[/restaurant|food|eat|dinner|lunch|pizza|grill|italian|chinese|étterem|ennivaló|essen|resto|comida/i, ['Restaurant', 'Italian Restaurant', 'Chinese Restaurant']],
    [/coffee|caf|kávé|kaffee/i, ['Coffee Shop']], [/\bbars?\b|pub|drink|kocsma|bár/i, ['Bar']], [/hotel|inn|szálló|szállás|hôtel/i, ['Hotel']],
    [/museum|múzeum|musée|museo|sight|látnivaló/i, ['Museum', 'Landmark']], [/park/i, ['Park']], [/atm|bank|geldautomat/i, ['Bank', 'ATM']],
    [/gas|fuel|benzin|tank|gasolin|essence/i, ['Gas Station']], [/super|grocer|market|bolt|élelmiszer/i, ['Supermarket']]];
  const ME = {x: -330, y: -40, acc: 120};
  // Latitude friends (made up), the Wikipedia layer's articles and the transit lines.
  const FRIENDS = [
    {id: 'f1', name: 'Alex Morgan', place: 'Riverside Park', x: -1380, y: 1100, minutes: 4},
    {id: 'f2', name: 'Sam Rivera', place: 'Market St', x: -820, y: 250, minutes: 12},
    {id: 'f3', name: 'Taylor Lee', place: 'Harbor Rd', x: riverX(500) + 130, y: 500, minutes: 38},
    {id: 'f4', name: 'Jordan Blake', place: 'Eastgate', x: 2450, y: 560, minutes: 95}];
  const WIKI = [
    {id: 'w1', name: 'Old Town Bridge', x: riverX(-180), y: -230, text: 'Stone arch bridge of 1871, the oldest crossing of the river.'},
    {id: 'w2', name: 'City Museum', x: -430, y: -740, text: 'Art and local history museum, opened in 1902 in the former town hall.'},
    {id: 'w3', name: 'Mill Pond', x: 2500, y: -1500, text: 'Artificial lake dug for the flour mills in the 18th century.'},
    {id: 'w4', name: 'Riverside Park', x: -1440, y: 1160, text: 'Public park laid out along the west bank in 1888.'},
    {id: 'w5', name: 'Harbor District', x: 1250, y: -780, text: 'Former river port, now a neighbourhood of shops and restaurants.'}];
  const LINES = [
    {name: 'Blue Line', color: '#2a63c8', stops: [['Westfield', -3000, 250], ['Park Ave', -1100, 245], ['Market Square', -450, 235], ['Old Town Bridge', riverX(-180), -180], ['Harbor', 1050, -160], ['Station Rd', 1630, -150], ['Eastgate', 2600, -130]]},
    {name: 'Green Line', color: '#2c9b48', stops: [['Northside', -1150, -2000], ['City Park', -1140, -1250], ['Elm St', -1110, -900], ['Bridge Rd', -1100, -175], ['Mill Rd', -1080, 1480], ['Riverside Park', -1100, 1000], ['Southside', -1110, 2600]].sort((a, b) => a[2] - b[2])}];

  // ---------------------------------------------------------------------------------------------------------------
  // State: the saved map (where it looked, the layers, the stars, the history, Latitude) and the screen stack.
  const st = c => c.data.maps ||= {x: ME.x, y: ME.y, z: 14, traffic: false, satellite: false, wiki: false, transit: false, favorites: false, starredLayer: true, starred: [], history: [], latitude: false, latitudeLayer: true};
  const ui = c => c.ui.mp ||= {stack: [], results: [], sel: -1, query: '', route: null, step: -1, me: false, zoomShown: false, loading: true, bubble: null};
  const top = c => ui(c).stack.at(-1) || {page: 'map'};
  const place = id => PLACES.find(p => p.id === id);

  // ---- units ----
  const imperial = c => t('da_distance_format_mode') === 'imperial';
  const num = (c, n, d = 1) => Number(n).toLocaleString(c.locale(), {minimumFractionDigits: d, maximumFractionDigits: d});
  function distance(c, m) {
    if (imperial(c)) {
      const mi = m / 1609.344;
      return mi < 0.1 ? t('da_distance_format_feet_abbreviated').replace('{0}', Math.max(10, Math.round(m * 3.28084 / 10) * 10)) : t('da_distance_format_miles_abbreviated').replace('{0}', num(c, mi));
    }
    return m < 1000 ? t('da_distance_format_meters_abbreviated').replace('{0}', Math.max(10, Math.round(m / 10) * 10)) : t('da_distance_format_kilometers_abbreviated').replace('{0}', num(c, m / 1000));
  }
  const minutes = (c, min) => { min = Math.max(1, Math.round(min)); return min >= 60 ? fmt(c, 'da_time_format_hours', Math.floor(min / 60), min % 60) : fmt(c, 'da_time_format_minutes', min); };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ---------------------------------------------------------------------------------------------------------------
  // The router: the named roads as a graph (split where they cross), Dijkstra between the nearest points.
  let graph = null;
  function buildGraph() {
    const segs = [];
    ROADS.forEach((r, ri) => { for (let i = 1; i < r.pts.length; i++) segs.push({ri, i, a: r.pts[i - 1], b: r.pts[i]}); });
    const cuts = ROADS.map(r => r.pts.map(() => []));
    const cross = (p, q, r, s) => {
      const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
      if (Math.abs(d) < 1e-9) return null;
      const u = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d, v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
      return u >= -0.02 && u <= 1.02 && v >= -0.02 && v <= 1.02 ? [Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v))] : null;
    };
    for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
      const s1 = segs[i], s2 = segs[j];
      if (s1.ri === s2.ri) continue;
      const hit = cross(s1.a, s1.b, s2.a, s2.b);
      if (!hit) continue;
      const pt = [s1.a[0] + (s1.b[0] - s1.a[0]) * hit[0], s1.a[1] + (s1.b[1] - s1.a[1]) * hit[0]];
      cuts[s1.ri][s1.i].push({f: hit[0], pt}); cuts[s2.ri][s2.i].push({f: hit[1], pt});
    }
    const nodes = new Map(), key = p => `${Math.round(p[0] / 4)}:${Math.round(p[1] / 4)}`;
    const node = p => { const k = key(p); if (!nodes.has(k)) nodes.set(k, {k, p, edges: []}); return nodes.get(k); };
    const chains = ROADS.map((r, ri) => {
      const pts = [];
      r.pts.forEach((p, i) => { if (i) cuts[ri][i].sort((a, b) => a.f - b.f).forEach(cut => pts.push({p: cut.pt, cut: true})); pts.push({p, cut: i === 0 || i === r.pts.length - 1}); });
      return pts;
    });
    chains.forEach((pts, ri) => {
      let last = node(pts[0].p), path = [pts[0].p];
      for (let i = 1; i < pts.length; i++) {
        path.push(pts[i].p);
        if (!pts[i].cut) continue;
        const n = node(pts[i].p), len = path.reduce((s, p, j) => j ? s + Math.hypot(p[0] - path[j - 1][0], p[1] - path[j - 1][1]) : 0, 0);
        if (n !== last && len > 0) { last.edges.push({to: n, ri, len, path: path.slice()}); n.edges.push({to: last, ri, len, path: path.slice().reverse()}); }
        last = n; path = [pts[i].p];
      }
    });
    return {nodes};
  }
  // The nearest point on a road (not the ring road for a start on foot).
  function snap(pt, walking) {
    let best = null;
    ROADS.forEach((r, ri) => {
      if (walking && r.kind === 'hw') return;
      for (let i = 1; i < r.pts.length; i++) {
        const a = r.pts[i - 1], b = r.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
        const f = Math.max(0, Math.min(1, ((pt.x - a[0]) * dx + (pt.y - a[1]) * dy) / l2)), p = [a[0] + dx * f, a[1] + dy * f], d = Math.hypot(p[0] - pt.x, p[1] - pt.y);
        if (!best || d < best.d) best = {ri, i, f, p, d};
      }
    });
    return best;
  }
  function route(from, to, mode) {
    graph ||= buildGraph();
    const walking = mode !== 'drive', a = snap(from, walking), b = snap(to, walking);
    // Temporary nodes where the start and the end meet their roads.
    const temp = [];
    const attach = s => {
      const r = ROADS[s.ri], n = {k: `t${temp.length}`, p: s.p, edges: []};
      // Join it to the graph nodes of its road on either side.
      const onRoad = [...graph.nodes.values()].filter(g => g.edges.some(e => e.ri === s.ri));
      const pos = p => { let acc = 0; for (let i = 1; i < r.pts.length; i++) { const q = r.pts[i - 1], w = r.pts[i], dx = w[0] - q[0], dy = w[1] - q[1], l = Math.hypot(dx, dy), l2 = l * l || 1, f = ((p[0] - q[0]) * dx + (p[1] - q[1]) * dy) / l2, d = Math.hypot(q[0] + dx * f - p[0], q[1] + dy * f - p[1]); if (f >= -0.01 && f <= 1.01 && d < 6) return acc + f * l; acc += l; } return Infinity; };
      const me = pos(s.p), sorted = onRoad.map(g => ({g, at: pos(g.p)})).filter(o => o.at !== Infinity);
      const before = sorted.filter(o => o.at <= me).sort((x, y) => y.at - x.at)[0], after = sorted.filter(o => o.at > me).sort((x, y) => x.at - y.at)[0];
      const slice = (u, v) => { const pts = [], lo = Math.min(u, v), hi = Math.max(u, v); let acc = 0; const out = []; for (let i = 0; i < r.pts.length; i++) { if (i) acc += Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]); pts.push([r.pts[i], acc]); }
        const at = d => { for (let i = 1; i < pts.length; i++) if (d <= pts[i][1] + 1e-6) { const f = (d - pts[i - 1][1]) / ((pts[i][1] - pts[i - 1][1]) || 1); return [pts[i - 1][0][0] + (pts[i][0][0] - pts[i - 1][0][0]) * f, pts[i - 1][0][1] + (pts[i][0][1] - pts[i - 1][0][1]) * f]; } return pts.at(-1)[0]; };
        out.push(at(lo)); pts.forEach(([p, d]) => { if (d > lo && d < hi) out.push(p); }); out.push(at(hi)); return u <= v ? out : out.reverse(); };
      for (const o of [before, after]) if (o) { const len = Math.abs(o.at - me); n.edges.push({to: o.g, ri: s.ri, len, path: slice(me, o.at)}); o.g.edges.push({to: n, ri: s.ri, len, path: slice(o.at, me), temp: true}); }
      temp.push(n); return n;
    };
    const start = attach(a), end = attach(b);
    // Both on the same stretch of road: straight along it.
    const dists = new Map([[start, 0]]), prev = new Map(), open = new Set([start]);
    while (open.size) {
      let cur = null; for (const n of open) if (!cur || dists.get(n) < dists.get(cur)) cur = n;
      open.delete(cur);
      if (cur === end) break;
      for (const e of cur.edges) {
        const nd = dists.get(cur) + e.len * (mode === 'drive' && ROADS[e.ri].kind === 'hw' ? 0.6 : 1);
        if (nd < (dists.get(e.to) ?? Infinity)) { dists.set(e.to, nd); prev.set(e.to, {from: cur, e}); open.add(e.to); }
      }
    }
    if (a.ri === b.ri) {
      // A direct edge along the same road wins when it is the shorter.
    }
    for (const n of graph.nodes.values()) n.edges = n.edges.filter(e => !e.temp);
    const legs = [];
    for (let n = end; prev.has(n); n = prev.get(n).from) legs.unshift(prev.get(n).e);
    if (!legs.length) return null;
    // Steps: the legs merged by road, each with its length and path.
    const steps = [];
    for (const e of legs) {
      const last = steps.at(-1);
      if (last && last.ri === e.ri) { last.len += e.len; last.path.push(...e.path.slice(1)); } else steps.push({ri: e.ri, len: e.len, path: e.path.slice()});
    }
    const path = [[from.x, from.y], ...steps.flatMap(s => s.path), [to.x, to.y]];
    const total = steps.reduce((s, x) => s + x.len, 0) + a.d + b.d;
    const speed = mode === 'walk' ? 80 : 520;   // metres a minute: 4.8 km/h walking, about 31 km/h in town
    return {mode, steps, path, total, min: total / speed + (mode === 'drive' ? 1 : 0), from, to};
  }
  const heading = (p, q) => { const a = Math.atan2(q[0] - p[0], -(q[1] - p[1])) * 180 / Math.PI; return ['north', 'east', 'south', 'west'][Math.round(((a + 360) % 360) / 90) % 4]; };
  function turnWord(prev, next) {
    const p = prev.path.at(-2) || prev.path[0], q = prev.path.at(-1), r = next.path[1] || next.path.at(-1);
    const ax = q[0] - p[0], ay = q[1] - p[1], bx = r[0] - q[0], by = r[1] - q[1];
    const cross = ax * by - ay * bx, dot = ax * bx + ay * by, ang = Math.atan2(cross, dot) * 180 / Math.PI;
    return Math.abs(ang) < 30 ? 'dir_continue' : ang > 0 ? 'dir_right' : 'dir_left';
  }
  // The step texts (Google's server sent them in the phone's language).
  function stepTexts(c, r) {
    const out = r.steps.map((s, i) => {
      const road = ROADS[s.ri].name;
      const text = i === 0 ? fmt(c, 'dir_head', t(heading(s.path[0], s.path[Math.min(s.path.length - 1, 2)])), road) : fmt(c, turnWord(r.steps[i - 1], s), road);
      return {text, len: s.len, at: s.path[0], icon: i === 0 ? 'head' : turnWord(r.steps[i - 1], s)};
    });
    out.push({text: fmt(c, 'dir_arrive', r.to.name), len: 0, at: [r.to.x, r.to.y], icon: 'arrive'});
    return out;
  }
  // Transit: walk to the nearest stop of a line that passes near the destination, ride, walk.
  function transitRoute(c, from, to) {
    let best = null;
    for (const line of LINES) {
      const stops = line.stops.map(([name, x, y], i) => ({name, x, y, i}));
      const on = stops.reduce((m, s) => dist(s, from) < dist(m, from) ? s : m), off = stops.reduce((m, s) => dist(s, to) < dist(m, to) ? s : m);
      if (on === off) continue;
      const walk = dist(on, from) + dist(off, to), ride = stops.slice(Math.min(on.i, off.i), Math.max(on.i, off.i) + 1);
      const rideLen = ride.reduce((s, p, i) => i ? s + dist(p, ride[i - 1]) : 0, 0);
      const cost = walk / 80 + rideLen / 400 + 4;
      if (!best || cost < best.cost) best = {line, on, off, ride: on.i < off.i ? ride : ride.reverse(), walk, rideLen, cost};
    }
    const direct = dist(from, to) / 80;
    if (!best || best.cost > direct) return null;
    const toward = best.on.i < best.off.i ? best.line.stops.at(-1)[0] : best.line.stops[0][0];
    const path = [[from.x, from.y], ...best.ride.map(s => [s.x, s.y]), [to.x, to.y]];
    const steps = [{text: fmt(c, 'dir_walk_to', best.on.name), len: dist(best.on, from), at: [from.x, from.y], icon: 'walk'},
      {text: fmt(c, 'dir_take', best.line.name, toward), len: best.rideLen, at: [best.on.x, best.on.y], icon: 'transit'},
      {text: fmt(c, 'dir_get_off', best.off.name), len: 0, at: [best.off.x, best.off.y], icon: 'transit'},
      {text: fmt(c, 'dir_walk_to', to.name), len: dist(best.off, to), at: [best.off.x, best.off.y], icon: 'walk'},
      {text: fmt(c, 'dir_arrive', to.name), len: 0, at: [to.x, to.y], icon: 'arrive'}];
    return {mode: 'transit', path, total: best.walk + best.rideLen, min: best.cost, from, to, texts: steps, line: best.line};
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Drawing the map.
  const STYLE = {
    map: {land: '#eae6dd', city: '#e8e4da', water: '#99b3cc', park: '#c5dea0', lake: '#99b3cc', loc: '#ffffff', locCase: '#cfcabe', art: '#fffb9c', artCase: '#d9cf6a', hw: '#fcc14f', hwCase: '#cf8e2c', text: '#3c3c3c', halo: '#ffffffd0', parkText: '#3f6b2a', waterText: '#3f5f8a'},
    sat: {land: '#4c5639', city: '#5d5d52', water: '#1f3447', park: '#3d5a2c', lake: '#203648', loc: '#a4a091', locCase: null, art: '#e6d36a', artCase: null, hw: '#f2b84b', hwCase: null, text: '#ffffff', halo: '#000000a0', parkText: '#ffffff', waterText: '#d6e4f5'}
  };
  const scale = (z, dp) => Math.pow(2, z) / 131072 * dp;   // px a metre: zoom 15 = 0.25 dp a metre
  let sat = null;
  function satTexture(dp) {
    if (sat && sat.dp === dp) return sat.c;
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'); let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#56603f'; g.fillRect(0, 0, 256, 256);
    const tones = ['#5d6152', '#6b6a5e', '#56603f', '#475536', '#7a7362', '#3f4a33', '#686d61', '#807b6c'];
    for (let i = 0; i < 900; i++) { g.fillStyle = tones[Math.floor(rnd() * tones.length)]; g.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 9, 2 + rnd() * 9); }
    sat = {dp, c: cv}; return cv;
  }
  function draw(c, canvas, view = st(c)) {
    const w = canvas.clientWidth, h = canvas.clientHeight, r = Math.min(2, window.devicePixelRatio || 1), dp = DP();
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * r) || canvas.height !== Math.round(h * r)) { canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); }
    const g = canvas.getContext('2d'), s = scale(view.z, dp), S = view.satellite ? STYLE.sat : STYLE.map;
    const X = x => (x - view.x) * s + w / 2, Y = y => (y - view.y) * s + h / 2;
    g.setTransform(r, 0, 0, r, 0, 0);
    if (ui(c).loading && !view.route) {
      // loading_tile_android: the grey grid while the tiles come.
      const img = canvas.parentNode.querySelector('.ecmp-tile');
      if (img?.complete) { g.fillStyle = g.createPattern(img, 'repeat'); g.save(); g.scale(dp / 1.5, dp / 1.5); g.fillRect(0, 0, w * 1.5 / dp, h * 1.5 / dp); g.restore(); } else { g.fillStyle = '#e5e2dd'; g.fillRect(0, 0, w, h); }
      return;
    }
    g.fillStyle = S.land; g.fillRect(0, 0, w, h);
    if (view.satellite) { g.save(); g.globalAlpha = 0.9; g.fillStyle = g.createPattern(satTexture(dp), 'repeat'); g.translate(X(0) % 256, Y(0) % 256); g.fillRect(-256, -256, w + 512, h + 512); g.restore(); }
    const poly = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.closePath(); g.fillStyle = fill; g.fill(); };
    const line = (pts, width, color) => { if (!color || width <= 0) return; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.stroke(); };
    // The built-up area, a shade lighter, inside the ring.
    if (!view.satellite) { g.fillStyle = S.city; g.beginPath(); g.ellipse(X(0), Y(0), CITY_R * s, CITY_R * 0.95 * s, 0, 0, Math.PI * 2); g.fill(); }
    for (const p of PARKS) poly(p.pts, S.park);
    g.fillStyle = S.lake; g.beginPath(); g.ellipse(X(LAKE.cx), Y(LAKE.cy), LAKE.rx * s, LAKE.ry * s, -0.2, 0, Math.PI * 2); g.fill();
    // Local streets: the two grids, clipped to their side of the river and the town.
    const z = view.z, px = m => m * s;
    const locW = z >= 17 ? px(12) : z >= 15 ? Math.max(2.2 * dp, px(10)) : 1.2 * dp;
    if (z >= 13) {
      for (const grid of GRIDS) {
        g.save(); g.beginPath();
        const side = along(riverX, -5200, 5200, 200);
        const edge = side.map(([x, y]) => [x + grid.side * 75, y]);
        const far = grid.side < 0 ? -6000 : 6000;
        [...edge, [far, 5200], [far, -5200]].forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)));
        g.closePath(); g.clip();
        g.beginPath(); g.ellipse(X(0), Y(0), CITY_R * s, CITY_R * 0.95 * s, 0, 0, Math.PI * 2); g.clip();
        const ca = Math.cos(grid.angle), sa = Math.sin(grid.angle), n = Math.ceil(CITY_R * 1.1 / grid.step);
        for (const pass of S.locCase && z >= 15 ? [[locW + 1.2 * dp, S.locCase], [locW, S.loc]] : [[locW, z >= 14 ? S.loc : '#ddd8cc']]) {
          g.strokeStyle = pass[1]; g.lineWidth = pass[0]; g.beginPath();
          for (let k = -n; k <= n; k++) {
            if (z < 14 && k % 2) continue;
            const d = k * grid.step, L = CITY_R * 1.2;
            // north-south lines and east-west lines of the turned grid
            g.moveTo(X(ca * d - sa * -L), Y(sa * d + ca * -L)); g.lineTo(X(ca * d - sa * L), Y(sa * d + ca * L));
            g.moveTo(X(-sa * d + ca * -L), Y(ca * d + sa * -L)); g.lineTo(X(-sa * d + ca * L), Y(ca * d + sa * L));
          }
          g.stroke();
        }
        g.restore();
      }
    }
    // The river.
    line(along(riverX, -5400, 5400, 100), 150 * s + 2, S.water);
    // Transit lines (More Layers) under the roads' names.
    // Named roads: casing, then fill; the ring road last.
    const order = ['loc', 'art', 'hw'], width = {loc: locW, art: Math.max(z >= 15 ? px(16) : 0, z >= 13 ? 3.6 * dp : 2.4 * dp), hw: Math.max(z >= 15 ? px(22) : 0, z >= 13 ? 5 * dp : 3.4 * dp)};
    for (const kind of order) {
      const roads = ROADS.filter(r => r.kind === kind);
      if (kind === 'loc' && z < 14) continue;
      const casing = S[`${kind}Case`];
      if (casing) for (const r of roads) line(r.pts, width[kind] + 1.6 * dp, casing);
      for (const r of roads) line(r.pts, width[kind], S[kind]);
    }
    // Traffic: green, yellow and red stretches along the arterials and the ring road.
    if (view.traffic) {
      let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (const r of ROADS.filter(x => x.kind !== 'loc')) {
        const pts = r.kind === 'hw' ? r.pts : r.pts.length < 6 ? r.pts.flatMap((p, i) => i ? [0.25, 0.5, 0.75, 1].map(f => [r.pts[i - 1][0] + (p[0] - r.pts[i - 1][0]) * f, r.pts[i - 1][1] + (p[1] - r.pts[i - 1][1]) * f]) : [p]) : r.pts;
        for (let i = 1; i < pts.length; i++) { const v = rnd(); line([pts[i - 1], pts[i]], Math.max(2.4 * dp, width[r.kind] * 0.55), v < 0.72 ? '#36b33a' : v < 0.9 ? '#f5c518' : '#d6261e'); }
      }
    }
    if (view.transit) for (const l of LINES) {
      line(l.stops.map(s => [s[1], s[2]]), 3.2 * dp, l.color);
      for (const s of l.stops) { g.fillStyle = '#fff'; g.strokeStyle = l.color; g.lineWidth = 1.6 * dp; g.beginPath(); g.arc(X(s[1]), Y(s[2]), 3.4 * dp, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    // The route.
    const rt = view.route === undefined ? ui(c).route : view.route;
    if (rt) line(rt.path, Math.max(5 * dp, px(14)), view.satellite ? '#7d7dffcc' : '#6262ffa8');
    // Labels: districts and parks when zoomed out, road names when in.
    // Labels do not overlap: one that would cover a label already drawn is left out (its box, turned, as an outline).
    const placed = [];
    const label = (text, x, y, size, color, bold = false, angle = 0, halo = S.halo) => {
      g.font = `${bold ? 'bold ' : ''}${size * dp}px DroidSans, sans-serif`;
      const hw = g.measureText(text).width / 2 + 2 * dp, hh = size * dp * 0.6, ca = Math.abs(Math.cos(angle)), sa = Math.abs(Math.sin(angle));
      const box = [x - hw * ca - hh * sa, y - hw * sa - hh * ca, x + hw * ca + hh * sa, y + hw * sa + hh * ca];
      if (placed.some(b => b[0] < box[2] && box[0] < b[2] && b[1] < box[3] && box[1] < b[3])) return;
      placed.push(box);
      g.save(); g.translate(x, y); if (angle) g.rotate(angle);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (halo) { g.strokeStyle = halo; g.lineWidth = 2.6 * dp; g.lineJoin = 'round'; g.strokeText(text, 0, 0); }
      g.fillStyle = color; g.fillText(text, 0, 0); g.restore();
    };
    if (z >= 12 && z <= 16) for (const [name, x, y] of DISTRICTS) label(name, X(x), Y(y), z >= 14 ? 13 : 12, view.satellite ? '#fff' : '#555', false);
    if (z >= 14) for (const p of PARKS) { const cx = p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length, cy = p.pts.reduce((a, q) => a + q[1], 0) / p.pts.length; label(p.name, X(cx), Y(cy), 11, S.parkText); }
    if (z >= 14) label(LAKE.name, X(LAKE.cx), Y(LAKE.cy), 11, S.waterText, false, 0, null);
    if (z >= 15) { const y = view.y + h / s * 0.3; label('River', X(riverX(y)), Y(y), 11, S.waterText, false, Math.PI / 2 - 0.1, null); }
    const visible = (x, y) => x > -40 && x < w + 40 && y > -20 && y < h + 20;
    // Clips a segment to the screen (inset by m): the visible part, or null (Liang–Barsky).
    const clip = (a, b, m) => {
      let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
      for (const [p, q] of [[-dx, a[0] - m], [dx, w - m - a[0]], [-dy, a[1] - m], [dy, h - m - a[1]]]) {
        if (p === 0) { if (q < 0) return null; continue; }
        const r = q / p;
        if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
      }
      return [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]];
    };
    const roadLabel = (r, size) => {
      // In the middle of the road's longest stretch on screen, along it and upright.
      g.font = `${size * dp}px DroidSans, sans-serif`;
      const need = g.measureText(r.name).width + 16 * dp;
      let best = null;
      for (let i = 1; i < r.pts.length; i++) {
        const part = clip([X(r.pts[i - 1][0]), Y(r.pts[i - 1][1])], [X(r.pts[i][0]), Y(r.pts[i][1])], 6 * dp);
        if (!part) continue;
        const len = Math.hypot(part[1][0] - part[0][0], part[1][1] - part[0][1]);
        if (len < need || (best && len <= best.len)) continue;
        best = {p: [(part[0][0] + part[1][0]) / 2, (part[0][1] + part[1][1]) / 2], len, ang: Math.atan2(part[1][1] - part[0][1], part[1][0] - part[0][0])};
      }
      if (!best) {
        // A road of many short pieces (along the river): the middle of its points on screen.
        const on = r.pts.map(([x, y]) => [X(x), Y(y)]).filter(([x, y]) => x > 6 * dp && x < w - 6 * dp && y > 6 * dp && y < h - 6 * dp);
        const run = on.reduce((n, q, i) => i ? n + Math.hypot(q[0] - on[i - 1][0], q[1] - on[i - 1][1]) : 0, 0);
        if (on.length < 3 || run < need) return;
        const k = Math.floor(on.length / 2), a = on[k - 1], b = on[k + 1];
        best = {p: on[k], ang: Math.atan2(b[1] - a[1], b[0] - a[0])};
      }
      let ang = best.ang; if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      label(r.name, best.p[0], best.p[1], size, S.text, false, ang);
    };
    if (z >= 14) for (const kind of ['art', 'loc']) for (const r of ROADS) if (r.kind === kind && (kind === 'art' || z >= 15)) roadLabel(r, kind === 'loc' ? 10.5 : 11.5);
    if (z >= 15) for (const grid of GRIDS) {
      // A name for each grid street near the middle of the screen.
      const ca = Math.cos(grid.angle), sa = Math.sin(grid.angle), n = Math.ceil(CITY_R / grid.step);
      for (let k = -n; k <= n; k++) {
        const d = k * grid.step;
        for (const [dir, names] of [['ns', grid.ns], ['ew', grid.ew]]) {
          const name = names[((k % names.length) + names.length) % names.length];
          // the point of the line nearest the view centre
          const ux = dir === 'ns' ? -sa : ca, uy = dir === 'ns' ? ca : sa, ox = dir === 'ns' ? ca * d : -sa * d, oy = dir === 'ns' ? sa * d : ca * d;
          const tt = (view.x - ox) * ux + (view.y - oy) * uy + (k % 3) * 60, x = ox + ux * tt, y = oy + uy * tt;
          if (Math.hypot(x, y) > CITY_R * 0.92 || (riverX(y) - x) * grid.side > -110) continue;
          const sx = X(x), sy = Y(y);
          if (!visible(sx, sy) || (z < 16 && k % 2)) continue;
          let ang = Math.atan2(uy, ux); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
          label(name, sx, sy, 10.5, S.text, false, ang);
        }
      }
    }
    if (z >= 12) {
      // Ring Rd: its name in a white box on the road, as Google drew route names.
      const r = ROADS[0];
      for (const i of [8, 24, 40, 56]) {
        const [x, y] = r.pts[i];
        if (!visible(X(x), Y(y))) continue;
        g.font = `bold ${10 * dp}px DroidSans, sans-serif`;
        const tw = g.measureText(r.name).width + 6 * dp;
        g.fillStyle = '#fff'; g.strokeStyle = '#555'; g.lineWidth = 1; g.fillRect(X(x) - tw / 2, Y(y) - 7 * dp, tw, 14 * dp); g.strokeRect(X(x) - tw / 2, Y(y) - 7 * dp, tw, 14 * dp);
        g.fillStyle = '#222'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(r.name, X(x), Y(y));
      }
    }
    // My location: the accuracy circle and blue_location.
    if (ui(c).me && !view.hideMe) {
      g.fillStyle = '#4a7bdc24'; g.strokeStyle = '#4a7bdc99'; g.lineWidth = 1.2 * dp;
      g.beginPath(); g.arc(X(ME.x), Y(ME.y), Math.max(ME.acc * s, 12 * dp), 0, Math.PI * 2); g.fill(); g.stroke();
      const dot = canvas.parentNode.querySelector('.ecmp-dot');
      if (dot?.complete) g.drawImage(dot, X(ME.x) - 8 * dp / 1.5, Y(ME.y) - 8 * dp / 1.5, 16 * dp / 1.5, 16 * dp / 1.5);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Markers and the bubble: positioned over the canvas, moved with it.
  const project = (c, x, y, view = st(c)) => {
    const vp = document.querySelector('.ecmp-map'), w = vp?.clientWidth || 320 * DP(), h = vp?.clientHeight || 400 * DP(), s = scale(view.z, DP());
    return [(x - view.x) * s + w / 2, (y - view.y) * s + h / 2];
  };
  // search_markers_android: 8 cells of 34 x 61 px (red, purple, yellow, pink, orange, purple, the shadow, blue);
  // letters_android: A–J, 12 x 15 px each, on the pin's head.
  const pin = (i, cell = 0, letter = true) => `<i class="ecmp-pinshadow"></i><i class="ecmp-pinimg" style="--cell:${cell}"></i>${letter && i < 10 ? `<i class="ecmp-letter" style="--l:${i}"></i>` : ''}`;
  function overlays(c) {
    const s = st(c), u = ui(c), out = [];
    if (s.starredLayer) for (const id of s.starred) { const p = place(id); if (p) out.push(`<button type="button" class="ecmp-star" data-x="${p.x}" data-y="${p.y}" data-action="ecmp-pick" data-kind="place" data-id="${p.id}" aria-label="${esc(p.name)}"></button>`); }
    if (s.wiki) for (const w of WIKI) out.push(`<button type="button" class="ecmp-wiki" data-x="${w.x}" data-y="${w.y}" data-action="ecmp-pick" data-kind="wiki" data-id="${w.id}" aria-label="${esc(w.name)}">W</button>`);
    if (s.favorites) for (const p of PLACES.filter(p => p.rating >= 4.5)) out.push(`<button type="button" class="ecmp-fav" data-x="${p.x}" data-y="${p.y}" data-action="ecmp-pick" data-kind="place" data-id="${p.id}" aria-label="${esc(p.name)}">${FAV_ICON}</button>`);
    if (s.latitude && s.latitudeLayer) for (const f of FRIENDS) out.push(`<button type="button" class="ecmp-friend" data-x="${f.x}" data-y="${f.y}" data-action="ecmp-pick" data-kind="friend" data-id="${f.id}" aria-label="${esc(f.name)}"><img src="${A('avatar_unknown')}" alt=""></button>`);
    u.results.forEach((id, i) => { const p = place(id) || u.custom; if (p) out.push(`<button type="button" class="ecmp-pin${u.sel === i ? ' sel' : ''}" data-x="${p.x}" data-y="${p.y}" data-action="ecmp-pick" data-kind="result" data-index="${i}" aria-label="${esc(p.name)}">${pin(i, 0, u.results.length > 1)}</button>`); });
    if (u.route) {
      const r = u.route;
      // directions_map_pins_android: the green start and the chequered end (34 x 61 px cells), the orange step dot.
      out.push(`<span class="ecmp-dpin" data-x="${r.from.x}" data-y="${r.from.y}" style="--cell:0"></span><span class="ecmp-dpin" data-x="${r.to.x}" data-y="${r.to.y}" style="--cell:1"></span>`);
      if (u.step >= 0) { const at = steps(c)[u.step].at; out.push(`<span class="ecmp-dstep" data-x="${at[0]}" data-y="${at[1]}"></span>`); }
    }
    return out.join('');
  }
  function bubbleHtml(c) {
    const b = ui(c).bubble;
    if (!b) return '';
    return `<button type="button" class="ecmp-bubble np-mp-popup_pointer_button_normal" data-x="${b.x}" data-y="${b.y}" data-action="ecmp-bubble"><i class="ec-bg ec-pressed np-mp-popup_pointer_button_selected"></i>
      <span class="ecmp-btext"><b>${esc(b.title)}</b>${b.sub ? `<small>${esc(b.sub)}</small>` : ''}</span>${b.more ? `<img class="ecmp-bdiv" src="${A('bubble_divider')}" alt=""><img class="ecmp-barrow" src="${A('directions_arrow_gray')}" alt="">` : ''}</button>`;
  }
  // Moves the markers and the bubble to the map's current view (no re-render while dragging).
  function placeAll(c, root, view = st(c)) {
    for (const el of root.querySelectorAll('[data-x]')) { const [x, y] = project(c, +el.dataset.x, +el.dataset.y, view); el.style.transform = `translate(${x}px, ${y}px)`; }
  }

  // Own drawings for the server's layer icons (the Wikipedia "W", the train, the Favorite Places ribbon).
  const FAV_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6" fill="#d9a400" stroke="#7a5b00" stroke-width="1.2"/><path d="M8 13l-2 9 4-3 2 4 1-9zM16 13l2 9-4-3-2 4-1-9z" fill="#c03030"/></svg>';
  const TRAIN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="16" rx="3" fill="#555"/><rect x="7" y="5" width="10" height="5" fill="#ddd"/><circle cx="9" cy="14" r="1.5" fill="#ddd"/><circle cx="15" cy="14" r="1.5" fill="#ddd"/><path d="M7 22l2-4h6l2 4" stroke="#555" stroke-width="2" fill="none"/></svg>';

  // ---------------------------------------------------------------------------------------------------------------
  // Screens.
  function renderMap(c) {
    const s = st(c), u = ui(c), many = u.results.length > 1 || (u.route && u.step >= 0);
    const zbtn = (id, dir, disabled) => `<button type="button" class="ecmp-zb ecmp-z${dir}" data-action="ecmp-zoom" data-dir="${dir === 'up' ? 1 : -1}"${disabled ? ' disabled' : ''}><img class="n" src="${A(`btn_zoom_${dir}_normal`)}" alt=""><img class="p" src="${A(`btn_zoom_${dir}_pressed`)}" alt=""><img class="d" src="${A(`btn_zoom_${dir}_disabled`)}" alt=""></button>`;
    const nav = many ? `<div class="ecmp-navbtns"><button type="button" class="ecmp-lb" data-action="ecmp-list"><img class="n" src="${A('btn_list_up_normal')}" alt=""><img class="p" src="${A('btn_list_down_pressed')}" alt=""></button>
      ${['prev_down', 'next_up'].map(n => `<button type="button" class="ecmp-pn" data-action="ecmp-${n === 'prev_down' ? 'prev' : 'next'}"><img class="n" src="${A(`btn_${n}_normal`)}" alt=""><img class="p" src="${A(`btn_${n}_pressed`)}" alt=""></button>`).join('')}</div>` : '';
    return `<div class="ecmp${s.satellite ? ' sat' : ''}" data-no-translate><div class="ecmp-map${u.zoomShown ? ' zoom' : ''}"><img class="ecmp-dot" src="${A('blue_location')}" alt="" hidden><img class="ecmp-tile" src="${A('loading_tile_android')}" alt="" hidden>
      <canvas class="ecmp-canvas"></canvas><div class="ecmp-over">${overlays(c)}${bubbleHtml(c)}</div>
      <div class="ecmp-bc">${nav}<span class="ecmp-zoombtns">${zbtn('down', 'down', s.z <= 3)}${zbtn('up', 'up', s.z >= 19)}</span></div>
</div>${u.dirOpen ? directionsPanel(c) : ''}</div>`;
  }
  // directions_input_dialog.xml
  function directionsPanel(c) {
    const u = ui(c), d = u.dir;
    const field = (name, value, hint, mine) => `<span class="ecmp-dfield npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-mp-textfield_selected np-fw-textfield_selected"></i><input name="${name}" class="${mine ? 'mine' : ''}" value="${esc(value)}" placeholder="${esc(hint)}" autocomplete="off" spellcheck="false"></span>`;
    const pick = name => `<button type="button" class="ecmp-dpick" data-action="ecmp-dpick" data-field="${name}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><img src="assets/fw-ic_input_get.png" alt=""></button>`;
    const mode = (id, img) => `<button type="button" class="ecmp-mode${d.mode === id ? ' on' : ''}" data-action="ecmp-mode" data-mode="${id}" style="--img:url('assets/mp-mode_${img}_${d.mode === id ? 'on' : 'off'}.9.png')" aria-pressed="${d.mode === id}"><i class="a"></i><i class="s"></i><i class="ic"></i><i class="s2"></i><i class="b"></i></button>`;
    return `<div class="ecmp-dim" data-action="ecmp-dclose"></div><form class="ecmp-dir" data-form="ecmp-dir"><img class="ecmp-dirbg" src="${A('bottombar_portrait_565')}" alt="">
      <div class="ecmp-drow">${field('from', d.from, t('start_point'), d.from === t('my_location'))}${pick('from')}</div>
      <div class="ecmp-drow">${field('to', d.to, t('end_point'), d.to === t('my_location'))}${pick('to')}</div>
      <div class="ecmp-drow ecmp-modes"><span class="ecmp-travel">${mode('drive', 'driving')}${mode('transit', 'transit')}${mode('walk', 'walk')}</span><i class="ecmp-sp"></i>
      <button type="submit" class="ecui-button ecmp-go"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('go'))}</span></button></div></form>`;
  }
  // A list screen (list.xml): GmmListView on the dark theme.
  const listRow = (action, attrs, inner, cls = '') => `<button type="button" class="ecmp-row ${cls}" data-action="${action}" ${attrs}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${inner}</button><img class="ecmp-div" src="assets/fw-divider_horizontal_dark.9.png" alt="">`;
  function renderResults(c) {
    const u = ui(c);
    const rows = u.results.map((id, i) => {
      const p = place(id) || u.custom;
      return listRow('ecmp-rpick', `data-index="${i}"`, `<span class="ecmp-rpin">${pin(i, 0, u.results.length > 1)}</span><span class="ecmp-rtext"><b>${esc(p.name)}</b><small>${esc(p.address)}</small>${p.rating ? stars(p.rating) : ''}</span><span class="ecmp-rdist">${esc(distance(c, dist(ME, p)))}</span>`);
    }).join('');
    return `<div class="ecmp-list"><div class="ecmp-lhead"><span><b>${esc(u.query)}</b></span></div><img class="ecmp-div" src="assets/fw-divider_horizontal_dark.9.png" alt=""><div class="ecmp-scroll">${rows}</div></div>`;
  }
  // stars_android: 17 px stars (on, half, off).
  const stars = r => `<span class="ecmp-stars">${[1, 2, 3, 4, 5].map(n => `<i style="--s:${r >= n ? 0 : r >= n - 0.5 ? 1 : 2}"></i>`).join('')}</span>`;
  const steps = c => { const r = ui(c).route; return r ? (r.texts ||= stepTexts(c, r)) : []; };
  function renderDirections(c) {
    const u = ui(c), r = u.route, list = steps(c);
    const head = `<div class="ecmp-dhead"><div class="ecmp-dh1"><i class="ecmp-lpin" style="--cell:0"></i><span>${esc(r.from.name)}</span></div><div class="ecmp-dh2"><i class="ecmp-lpin" style="--cell:1"></i><span><b>${esc(r.to.name)}</b><small>${esc(`${distance(c, r.total)} – ${fmt(c, 'dir_about', minutes(c, r.min))}`)}</small></span></div>
      <div class="ecmp-dbtns">${hbtn('ecmp-showroute', 'ic_menu_see_map', t('show_on_map'))}${r.mode === 'drive' ? hbtn('ecmp-navigate', 'da_ic_list_navigate', t('da_navigate')) : ''}${hbtn('ecmp-reverse', 'ic_menu_reverse_directions', t('directions'))}</div></div><img class="ecmp-div" src="assets/fw-divider_horizontal_dark.9.png" alt="">`;
    const rows = list.map((s, i) => listRow('ecmp-step', `data-index="${i}"`, `<span class="ecmp-snum">${i + 1}.</span><span class="ecmp-rtext"><span>${esc(s.text)}</span></span>${s.len ? `<span class="ecmp-rdist">${esc(distance(c, s.len))}</span>` : ''}`)).join('');
    return `<div class="ecmp-list">${head}<div class="ecmp-scroll">${rows}</div></div>`;
  }
  // template_header_button.xml on header_button: the icon over the single-line text.
  const hbtn = (action, icon, text) => `<button type="button" class="ecmp-hbtn npp-mp-header_button_normal" data-action="${action}"><i class="ec-bg np-mp-header_button_normal"></i><i class="ec-bg ec-pressed np-mp-header_button_pushed"></i><img src="${icon.startsWith('fw-') ? `assets/${icon}.png` : A(icon)}" alt=""><span>${esc(text)}</span></button>`;
  // The place page: tabs.xml with Address / Details / Reviews.
  function renderPlace(c, p) {
    const pl = place(p.id), tab = p.tab || 'address', starred = st(c).starred.includes(pl.id);
    const tabBtn = (id, label) => `<button type="button" class="ecmp-tab${tab === id ? ' on' : ''}" data-action="ecmp-tab" data-tab="${id}"><i class="ec-bg np-fw-tab_${tab === id ? 'selected' : 'unselected'}_v4"></i><i class="ec-bg ec-pressed np-fw-tab_press"></i><img src="${A(`${id}_${tab === id ? 'on' : 'off'}`)}" alt=""><span>${esc(t(`pp_${id}`))}</span></button>`;
    const head = `<div class="ecmp-pphead"><span class="ecmp-pptext"><b>${esc(pl.name)}</b><span>${esc(pl.address)}</span>${tab !== 'address' && pl.rating ? stars(pl.rating) : ''}</span><button type="button" class="ecmp-ppstar" data-action="ecmp-star" aria-pressed="${starred}"><img src="${A(starred ? 'star_on_pp' : 'star_off_pp')}" alt=""></button></div>`;
    const action = (act, icon, text, cell) => `<button type="button" class="ecmp-pprow npp-mp-list_item_pp_normal" data-action="${act}"><i class="ec-bg ec-pressed np-mp-list_item_pp_pressed"></i>${cell !== undefined ? `<i class="ecmp-ppicon" style="--cell:${cell}"></i>` : `<img class="ecmp-ppimg" src="${icon}" alt="">`}<span>${esc(text)}</span></button>`;
    let body;
    if (tab === 'address') {
      body = [action('ecmp-showplace', '', t('show_on_map'), 2), action('ecmp-dirto', 'assets/fw-ic_menu_directions.png', t('get_directions')), action('ecmp-navigate', A('da_ic_list_navigate'), t('da_navigate')),
        pl.phone ? action('ecmp-call', 'assets/fw-sym_action_call.png', fmt(c, 'da_call_number', pl.phone)) : '', action('ecmp-street', '', t('street_view'), 3), action('ecmp-report', 'assets/fw-ic_menu_report_image.png', t('report_problem'))].filter(Boolean).join('<i class="ecmp-ppdiv"></i>');
    } else if (tab === 'details') {
      body = `<div class="ecmp-ppinfo"><p><b>${esc(pl.cat)}</b></p>${pl.phone ? `<p>${esc(pl.phone)}</p>` : ''}<p>${esc(DETAILS[pl.id] || DETAILS.default)}</p></div>`;
    } else {
      const rs = REVIEWS.filter((_, i) => (i + pl.name.length) % 2 === 0 || i < 2).slice(0, 3);
      body = `<div class="ecmp-ppinfo">${stars(pl.rating)} <span class="ecmp-rcount">${esc(fmt(c, 'reviews_count', pl.reviews))}</span>${rs.map(([who, text, n]) => `<div class="ecmp-review">${stars(n)}<p>“${esc(text)}”</p><small>${esc(who)}</small></div>`).join('')}</div>`;
    }
    return `<div class="ecmp-pp"><div class="ecmp-tabs">${['address', 'details', 'reviews'].map(id => tabBtn(id)).join('')}</div>${head}<div class="ecmp-scroll ecmp-ppbody">${body}</div></div>`;
  }
  const DETAILS = {default: 'Open today 9 am – 9 pm.', p1: 'Grilled fish and steaks on the river terrace. Open today 11 am – 11 pm.', p2: 'Home-made pasta since 1987. Open today 12 pm – 10 pm.', p4: 'Espresso, pastries and free Wi-Fi. Open today 7 am – 6 pm.', p10: 'Art and local history. Open Tuesday to Sunday, 10 am – 5 pm.', p11: 'Stone arch bridge of 1871.', p12: 'Open daily from dawn to dusk.'};
  const REVIEWS = [['citysearch.com', 'Great place, friendly staff and good prices.', 5], ['A Google user', 'A bit crowded at lunchtime, but worth the wait.', 4], ['yelp.com', 'Nice spot by the river. Will come back.', 4], ['A Google user', 'Service was slow that evening.', 3]];
  function renderStarred(c) {
    const s = st(c), list = s.starred.map(place).filter(Boolean);
    const rows = list.map(p => listRow('ecmp-ppopen', `data-id="${p.id}"`, `<img class="ecmp-sicon" src="${A('star_on_list_view')}" alt=""><span class="ecmp-rtext"><b>${esc(p.name)}</b><small>${esc(p.address)}</small></span><span class="ecmp-rdist">${esc(distance(c, dist(ME, p)))}</span>`)).join('');
    return `<div class="ecmp-list"><div class="ecmp-lhead"><span><b>${esc(t('starred_items'))}</b></span></div><img class="ecmp-div" src="assets/fw-divider_horizontal_dark.9.png" alt=""><div class="ecmp-scroll">${rows || `<div class="ecmp-empty">${esc(t('starred_empty'))}</div>`}</div></div>`;
  }
  // Latitude: the friends list (friends_list.xml: friends_list_header, then friends_list_item rows).
  function renderFriends(c) {
    const rows = [{id: 'me', name: EC.gmail?.account || 'eclair.demo@gmail.com', place: 'Old Town', minutes: 0}, ...FRIENDS].map(f => listRow('ecmp-friendrow', `data-id="${f.id}"`, `<img class="ecmp-favatar" src="${A('avatar_unknown')}" alt=""><span class="ecmp-rtext"><b>${esc(f.name)}</b><small>${esc(f.place)}</small></span><span class="ecmp-rdist">${f.id === 'me' ? '' : esc(fmt(c, 'da_time_format_minutes', f.minutes))}</span>`)).join('');
    return `<div class="ecmp-list"><div class="ecmp-fhead np-mp-friends_list_header"><span>${esc(t('latitude'))}</span><button type="button" class="ecmp-fadd" data-action="ecmp-addfriends"><img src="${A('friends_add')}" alt="${esc(t('add_friends'))}"></button></div><div class="ecmp-scroll">${rows}</div></div>`;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Actions.
  const push = (c, page) => { ui(c).stack.push(page); c.render(); };
  function toMap(c) { ui(c).stack = []; c.render(); }
  function centerOn(c, x, y, z) { const s = st(c); s.x = x; s.y = y; if (z !== undefined) s.z = z; c.save(); }
  function select(c, i) {
    const u = ui(c), p = place(u.results[i]) || u.custom;
    if (!p) return;
    u.sel = i; u.bubble = {x: p.x, y: p.y, title: p.name, sub: p.address, kind: 'place', id: p.id, more: true};
    centerOn(c, p.x, p.y);
  }
  function runSearch(c, q) {
    q = q.trim();
    if (!q) return;
    const s = st(c), u = ui(c);
    s.history = [q, ...s.history.filter(h => h.toLocaleLowerCase() !== q.toLocaleLowerCase())].slice(0, 20); c.save();
    const low = q.toLocaleLowerCase();
    let hits = PLACES.filter(p => p.name.toLocaleLowerCase().includes(low) || low.includes(p.name.toLocaleLowerCase()));
    if (!hits.length) for (const [re, cats] of WORDS) if (re.test(q)) hits = PLACES.filter(p => cats.includes(p.cat));
    hits.sort((a, b) => dist(ME, a) - dist(ME, b));
    if (hits.length > 1) hits = hits.filter((p, i) => i === 0 || dist(ME, p) < 2200);
    u.custom = null;
    if (!hits.length) {
      // An address: the street of that name.
      const road = ROADS.find(r => low.includes(r.name.toLocaleLowerCase()) || r.name.toLocaleLowerCase().startsWith(low.replace(/^\d+\s*/, '')))
        || GRIDS.flatMap(g => [...g.ns, ...g.ew]).map(name => ({name})).find(r => low.replace(/^\d+\s*/, '') && r.name.toLocaleLowerCase().startsWith(low.replace(/^\d+\s*/, '')));
      if (road?.pts) { const m = road.pts[Math.floor(road.pts.length / 2)]; u.custom = {id: 'custom', name: q, address: road.name, x: m[0], y: m[1]}; }
    }
    u.results = hits.slice(0, 10).map(p => p.id);
    if (u.custom) u.results = ['custom'];
    u.query = q; u.route = null; u.step = -1; u.stack = [];
    if (!u.results.length) { u.bubble = null; c.render(); c.toast(t('no_results')); return; }
    select(c, 0);
    // Centred on the first result, zoomed out until the others fit.
    const first = place(u.results[0]) || u.custom, far = Math.max(250, ...u.results.map(id => place(id)).filter(Boolean).map(p => Math.max(Math.abs(p.x - first.x), Math.abs(p.y - first.y) * 0.7)));
    st(c).z = u.results.length > 1 ? Math.max(12, Math.min(17, Math.floor(Math.log2(140 / far * 131072)))) : Math.max(st(c).z, 16);
    c.render();
  }
  function fit(c, pts) {
    const s = st(c), xs = pts.map(p => p.x), ys = pts.map(p => p.y), span = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * 0.8, 300);
    s.x = (Math.max(...xs) + Math.min(...xs)) / 2; s.y = (Math.max(...ys) + Math.min(...ys)) / 2;
    s.z = Math.max(11, Math.min(17, Math.floor(Math.log2(260 / span * 131072))));
    c.save();
  }
  function search(c) {
    const s = st(c);
    c.searchDialog({icon: 'app-maps.png', hint: '', value: '',
      suggest: q => {
        const low = q.trim().toLocaleLowerCase();
        const hist = s.history.filter(h => !low || h.toLocaleLowerCase().startsWith(low)).slice(0, 4).map(h => ({text1: h, value: h}));
        const places = low ? PLACES.filter(p => p.name.toLocaleLowerCase().startsWith(low) && !hist.some(h => h.value === p.name)).slice(0, 3).map(p => ({text1: `${p.name}, ${p.address}`, value: p.name})) : [];
        return [...hist, ...places];
      },
      onGo: q => runSearch(c, q)});
  }
  function myLocation(c) {
    const u = ui(c);
    u.me = true; u.bubble = {x: ME.x, y: ME.y, title: t('my_location'), sub: '', kind: 'me'};
    centerOn(c, ME.x, ME.y, Math.max(st(c).z, 15)); u.stack = []; c.render();
  }
  function openDirections(c, to) {
    const u = ui(c);
    u.dir = {from: t('my_location'), to: to ? to.name : '', toPlace: to?.id || '', fromPlace: 'me', mode: u.dir?.mode || 'drive'};
    u.dirOpen = true; u.stack = []; c.render();
    setTimeout(() => { const f = c.el.viewport.querySelector(`.ecmp-dir input[name="${to ? 'from' : 'to'}"]`); f?.focus(); f?.dispatchEvent(new FocusEvent('focusin', {bubbles: true})); }, 30);
  }
  function resolve(c, text, placeId) {
    if (placeId === 'me' || text === t('my_location')) return {x: ME.x, y: ME.y, name: t('my_location')};
    const p = place(placeId) || PLACES.find(p => p.name.toLocaleLowerCase() === text.trim().toLocaleLowerCase());
    if (p) return {x: p.x, y: p.y, name: p.name, id: p.id};
    const low = text.trim().toLocaleLowerCase();
    const hit = PLACES.find(p => p.name.toLocaleLowerCase().includes(low) || p.address.toLocaleLowerCase().includes(low));
    if (hit && low) return {x: hit.x, y: hit.y, name: hit.name, id: hit.id};
    const road = ROADS.find(r => low && r.name.toLocaleLowerCase().includes(low.replace(/^\d+\s*/, '')));
    if (road) { const m = road.pts[Math.floor(road.pts.length / 2)]; return {x: m[0], y: m[1], name: text.trim()}; }
    return null;
  }
  function getDirections(c) {
    const u = ui(c), d = u.dir;
    const from = resolve(c, d.from, d.fromPlace), to = resolve(c, d.to, d.toPlace);
    if (!from || !to || !d.to.trim()) { c.toast(t('no_results')); return; }
    const r = d.mode === 'transit' ? transitRoute(c, from, to) || route(from, to, 'walk') : route(from, to, d.mode);
    if (!r) { c.toast(t('no_results')); return; }
    if (d.mode === 'transit' && r.mode !== 'transit') r.mode = 'walk';
    u.route = r; u.step = -1; u.dirOpen = false; u.results = []; u.bubble = null; u.me = true;
    c.imeBack?.();
    push(c, {page: 'directions'});
  }
  function showStep(c, i) {
    const u = ui(c), list = steps(c);
    u.step = Math.max(0, Math.min(list.length - 1, i));
    const s = list[u.step];
    u.bubble = {x: s.at[0], y: s.at[1], title: s.text, sub: s.len ? distance(c, s.len) : '', kind: 'step'};
    centerOn(c, s.at[0], s.at[1], Math.max(st(c).z, 16)); u.stack = []; c.render();
  }
  function clearMap(c) {
    const u = ui(c);
    Object.assign(u, {results: [], sel: -1, route: null, step: -1, bubble: null, custom: null, query: ''});
    Object.assign(st(c), {wiki: false, transit: false, favorites: false}); c.save(); c.render();
  }
  // The layers dialog: icons from layers_dialog_action_icons_android (45 px cells: 0 My Maps, 1 search, 2 Latitude,
  // 3 traffic, 4 directions, 5 the check, 6 layers, 7 satellite, 9 the submenu arrow, 11 starred items).
  function layersDialog(c) {
    const s = st(c), u = ui(c);
    const items = [
      {cell: 3, label: t('TRAFFIC_WIDGET_NAME'), on: s.traffic, go: () => { s.traffic = !s.traffic; }},
      {cell: 7, label: t('da_satellite'), on: s.satellite, go: () => { s.satellite = !s.satellite; }},
      ...(u.results.length ? [{cell: 1, label: u.query || t('search_results'), on: true, go: () => { u.results = []; u.bubble = null; }}] : []),
      ...(u.route ? [{cell: 4, label: t('directions'), on: true, go: () => { u.route = null; u.step = -1; u.bubble = null; }}] : []),
      ...(s.starred.length ? [{cell: 11, label: t('starred_items'), on: s.starredLayer, go: () => { s.starredLayer = !s.starredLayer; }}] : []),
      {cell: 2, label: t('latitude'), on: s.latitude && s.latitudeLayer, go: () => { if (!s.latitude) joinLatitude(c); else s.latitudeLayer = !s.latitudeLayer; }},
      ...(s.wiki ? [{icon: 'W', label: t('layer_wikipedia'), on: true, go: () => { s.wiki = false; }}] : []),
      ...(s.transit ? [{icon: TRAIN_ICON, label: t('layer_transit'), on: true, go: () => { s.transit = false; }}] : []),
      {cell: 6, label: t('more_layers'), more: true, go: () => setTimeout(() => moreLayers(c), 0)}];
    layerList(c, t('da_layers'), items);
  }
  function moreLayers(c) {
    const s = st(c);
    layerList(c, t('more_layers'), [
      {cell: 0, label: t('layer_my_maps'), sub: true, go: () => setTimeout(() => layerList(c, t('layer_my_maps'), [{cell: 11, label: t('starred_items'), on: s.starredLayer, go: () => { s.starredLayer = !s.starredLayer; if (!s.starred.length) c.toast(t('starred_empty')); }}]), 0)},
      {icon: 'W', label: t('layer_wikipedia'), on: s.wiki, go: () => { s.wiki = !s.wiki; if (s.wiki) st(c).z = Math.min(st(c).z, 14); }},
      {icon: TRAIN_ICON, label: t('layer_transit'), on: s.transit, go: () => { s.transit = !s.transit; }},
      {icon: FAV_ICON, label: t('layer_favorite_places'), sub: true, go: () => setTimeout(() => layerList(c, t('layer_favorite_places'), PLACES.filter(p => p.rating >= 4.5).map(p => ({icon: FAV_ICON, label: p.name, go: () => { s.favorites = true; openPlaceOnMap(c, p); }}))), 0)}]);
  }
  function layerList(c, title, items) {
    const icon = it => it.cell !== undefined ? `<i class="ecmp-licon" style="--cell:${it.cell}"></i>` : it.icon === 'W' ? '<i class="ecmp-licon ecmp-w">W</i>' : `<i class="ecmp-licon ecmp-svg">${it.icon}</i>`;
    const html = `<div class="ecmp-layers">${items.map((it, i) => `<button type="button" class="ecmp-layer" data-action="ecmp-layer" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${icon(it)}<span>${esc(it.label)}</span>${it.on ? '<i class="ecmp-licon ecmp-check" style="--cell:5"></i>' : it.sub || it.more ? '<i class="ecmp-licon ecmp-arrow" style="--cell:9"></i>' : ''}</button>`).join('<i class="ecmp-ldiv"></i>')}</div>`;
    c.dialog({title, icon: 'mp-ic_dialog_menu_generic.png', html, inverse: true, action(name, el) {
      if (name !== 'ecmp-layer') return false;
      c.closeDialog(); items[Number(el.dataset.index)].go(); c.save(); c.render(); return true;
    }});
  }
  function openPlaceOnMap(c, p) {
    const u = ui(c);
    u.bubble = {x: p.x, y: p.y, title: p.name, sub: p.address, kind: 'place', id: p.id, more: true};
    centerOn(c, p.x, p.y, Math.max(st(c).z, 16)); u.stack = []; c.render();
  }
  function joinLatitude(c) {
    const s = st(c);
    if (s.latitude) { push(c, {page: 'friends'}); return; }
    c.dialog({title: t('latitude'), icon: 'mp-ic_menu_latitude.png', message: t('latitude_intro'),
      buttons: [{label: t('accept_share'), action: () => { s.latitude = true; s.latitudeLayer = true; c.save(); fit(c, [...FRIENDS, ME]); ui(c).me = true; c.render(); }}, {label: t('cancel')}]});
  }
  function pick(c, el) {
    const u = ui(c), kind = el.dataset.kind;
    if (kind === 'result') { select(c, Number(el.dataset.index)); c.render(); return; }
    if (kind === 'place') { const p = place(el.dataset.id); u.bubble = {x: p.x, y: p.y, title: p.name, sub: p.address, kind: 'place', id: p.id, more: true}; }
    if (kind === 'wiki') { const w = WIKI.find(x => x.id === el.dataset.id); u.bubble = {x: w.x, y: w.y, title: w.name, sub: w.text, kind: 'wiki', id: w.id, more: true}; }
    if (kind === 'friend') { const f = FRIENDS.find(x => x.id === el.dataset.id); u.bubble = {x: f.x, y: f.y, title: f.name, sub: `${f.place} – ${fmt(c, 'da_time_format_minutes', f.minutes)}`, kind: 'friend', id: f.id}; }
    c.render();
  }
  function nearby(c, x, y) {
    // "What's nearby?" (GSMArena g098): the places around a point, nearest first, the name over the address.
    const list = PLACES.slice().sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).slice(0, 6);
    const html = `<div class="ecmp-layers ecmp-near">${list.map((p, i) => `<button type="button" class="ecmp-layer" data-action="ecmp-near" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span><b>${esc(p.name)}</b><small>${esc(p.address)}</small></span></button>`).join('<i class="ecmp-ldiv"></i>')}</div>`;
    c.dialog({title: t('whats_nearby'), icon: 'mp-ic_dialog_menu_generic.png', html, inverse: true, action(name, el) { if (name !== 'ecmp-near') return false; c.closeDialog(); openPlaceOnMap(c, list[Number(el.dataset.index)]); return true; }});
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The map's touch handling: drag, double tap, pinch; the zoom buttons appear and hide again.
  let zoomTimer = 0, anim = 0;
  function showZoom(c, root) {
    const u = ui(c);
    if (!u.zoomShown) { u.zoomShown = true; root.querySelector('.ecmp-map')?.classList.add('zoom'); }
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => { u.zoomShown = false; c.el.viewport.querySelector('.ecmp-map')?.classList.remove('zoom'); }, 3000);
  }
  function zoomTo(c, root, z, fx, fy) {
    // Animated: the map scales about the focus point to the new level.
    const s = st(c), canvas = root.querySelector('.ecmp-canvas');
    if (!canvas) return;
    z = Math.max(3, Math.min(19, z));
    const w = canvas.clientWidth, h = canvas.clientHeight, from = {...s}, dp = DP();
    fx ??= w / 2; fy ??= h / 2;
    const wx = s.x + (fx - w / 2) / scale(s.z, dp), wy = s.y + (fy - h / 2) / scale(s.z, dp);
    const t0 = performance.now(); cancelAnimationFrame(anim);
    const frame = now => {
      const f = Math.min(1, (now - t0) / 250), e = f * (2 - f), zz = from.z + (z - from.z) * e, k = scale(zz, dp);
      const view = {...s, z: zz, x: wx - (fx - w / 2) / k, y: wy - (fy - h / 2) / k};
      draw(c, canvas, view); placeAll(c, root, view);
      if (f < 1) anim = requestAnimationFrame(frame); else { Object.assign(s, {z, x: view.x, y: view.y}); c.save(); c.render(); }
    };
    anim = requestAnimationFrame(frame);
  }
  function bindMap(c, root) {
    const map = root.querySelector('.ecmp-map'), canvas = root.querySelector('.ecmp-canvas');
    if (!map || !canvas) return;
    const s = st(c), pts = new Map();
    let drag = null, lastTap = 0, moved = false;
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.offsetX, e.offsetY]); showZoom(c, root);
      if (pts.size === 1) { drag = {x: e.clientX, y: e.clientY, vx: s.x, vy: s.y, t: Date.now()}; moved = false; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; drag = {pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), z: s.z, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, vx: s.x, vy: s.y}; moved = true; }
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, [e.offsetX, e.offsetY]);
      const dp = DP();
      if (drag.pinch && pts.size === 2) {
        const [a, b] = [...pts.values()], z = Math.max(3, Math.min(19, drag.z + Math.log2(Math.hypot(a[0] - b[0], a[1] - b[1]) / drag.pinch)));
        const w = canvas.clientWidth, h = canvas.clientHeight, k0 = scale(drag.z, dp), k = scale(z, dp);
        const wx = drag.vx + (drag.cx - w / 2) / k0, wy = drag.vy + (drag.cy - h / 2) / k0;
        Object.assign(s, {z, x: wx - (drag.cx - w / 2) / k, y: wy - (drag.cy - h / 2) / k});
      } else if (!drag.pinch) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6 * dp) moved = true;
        if (!moved) return;
        const k = scale(s.z, dp) * (canvas.getBoundingClientRect().width / canvas.clientWidth || 1);
        s.x = drag.vx - dx / k; s.y = drag.vy - dy / k;
      }
      draw(c, canvas); placeAll(c, root);
    });
    const up = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size) return;
      const was = drag; drag = null;
      if (was?.pinch) { zoomTo(c, root, Math.round(s.z)); return; }
      if (moved) { c.save(); return; }
      // A tap: a double tap zooms in about it; a single tap closes the bubble.
      const now = Date.now();
      if (now - lastTap < 300) { lastTap = 0; zoomTo(c, root, Math.round(s.z) + 1, e.offsetX, e.offsetY); return; }
      lastTap = now;
      if (ui(c).bubble && now - (was?.t || now) < 400) setTimeout(() => { if (lastTap === now) { ui(c).bubble = null; c.render(); } }, 300);
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    // A long press: "What's nearby?" for that point.
    let hold = 0;
    canvas.addEventListener('pointerdown', e => { clearTimeout(hold); const x = e.offsetX, y = e.offsetY; hold = setTimeout(() => { if (!moved && pts.size === 1) { const k = scale(s.z, DP()); pts.clear(); drag = null; nearby(c, s.x + (x - canvas.clientWidth / 2) / k, s.y + (y - canvas.clientHeight / 2) / k); } }, 700); });
    for (const ev of ['pointerup', 'pointercancel', 'pointermove']) canvas.addEventListener(ev, e => { if (ev !== 'pointermove' || moved) clearTimeout(hold); });
    draw(c, canvas); placeAll(c, root);
    for (const img of root.querySelectorAll('.ecmp-dot, .ecmp-tile')) if (!img.complete) img.addEventListener('load', () => draw(c, canvas), {once: true});
  }

  // ---------------------------------------------------------------------------------------------------------------
  EC.register('maps', {
    title: 'Maps',
    render(c) {
      const p = top(c);
      switch (p.page) {
        case 'results': return renderResults(c);
        case 'directions': return renderDirections(c);
        case 'place': return renderPlace(c, p);
        case 'starred': return renderStarred(c);
        case 'friends': return renderFriends(c);
      }
      return renderMap(c);
    },
    mount(c, root) {
      if (top(c).page !== 'map') return;
      bindMap(c, root);
      const u = ui(c);
      if (u.loading && !u.loadTimer) u.loadTimer = setTimeout(() => { u.loading = false; u.loadTimer = 0; if (c.ui.view === 'maps') c.render(); }, 900);
      const form = root.querySelector('.ecmp-dir');
      if (form) for (const input of form.querySelectorAll('input')) input.addEventListener('input', () => { u.dir[input.name] = input.value; u.dir[`${input.name}Place`] = ''; input.classList.toggle('mine', input.value === t('my_location')); });
    },
    submit(form, event, c) {
      if (form.dataset.form !== 'ecmp-dir') return false;
      event.preventDefault(); getDirections(c); return true;
    },
    action(name, el, event, c) {
      const u = ui(c), s = st(c), p = top(c);
      switch (name) {
        case 'ecmp-zoom': showZoom(c, c.el.viewport); zoomTo(c, c.el.viewport, Math.round(s.z) + Number(el.dataset.dir)); return true;
        case 'ecmp-pick': pick(c, el); return true;
        case 'ecmp-bubble': {
          const b = u.bubble;
          if (b?.kind === 'place') push(c, {page: 'place', id: b.id, tab: 'address'});
          else if (b?.kind === 'wiki') { c.ui.browserGo = `http://en.m.wikipedia.org/wiki/${encodeURIComponent(b.title.replace(/ /g, '_'))}`; c.open('browser'); }
          else if (b?.kind === 'step') push(c, {page: 'directions'});
          return true;
        }
        case 'ecmp-list': if (u.route) push(c, {page: 'directions'}); else push(c, {page: 'results'}); return true;
        case 'ecmp-prev': case 'ecmp-next': {
          const d = name === 'ecmp-next' ? 1 : -1;
          if (u.route) showStep(c, u.step + d);
          else if (u.results.length) { select(c, (u.sel + d + u.results.length) % u.results.length); c.render(); }
          return true;
        }
        case 'ecmp-rpick': u.stack = []; select(c, Number(el.dataset.index)); c.render(); return true;
        case 'ecmp-step': showStep(c, Number(el.dataset.index)); return true;
        case 'ecmp-showroute': { u.step = -1; u.bubble = null; fit(c, u.route.path.map(([x, y]) => ({x, y}))); u.stack = []; c.render(); return true; }
        case 'ecmp-reverse': { const r = u.route; u.dir = {from: r.to.name, fromPlace: r.to.id || (r.to.name === t('my_location') ? 'me' : ''), to: r.from.name, toPlace: r.from.id || (r.from.name === t('my_location') ? 'me' : ''), mode: r.mode === 'transit' ? 'transit' : r.mode}; getDirections(c); return true; }
        case 'ecmp-navigate': {
          const to = p.page === 'place' ? place(p.id) : u.route?.to;
          EC.mapsNav?.start(c, to); return true;
        }
        case 'ecmp-dclose': u.dirOpen = false; c.imeBack?.(); c.render(); return true;
        case 'ecmp-mode': u.dir.mode = el.dataset.mode; for (const b of c.el.viewport.querySelectorAll('.ecmp-mode')) { const on = b.dataset.mode === u.dir.mode; b.classList.toggle('on', on); b.style.setProperty('--img', `url('assets/mp-mode_${{drive: 'driving', transit: 'transit', walk: 'walk'}[b.dataset.mode]}_${on ? 'on' : 'off'}.9.png')`); } return true;
        case 'ecmp-dpick': {
          // My Location or a starred place for the field.
          const field = el.dataset.field, list = [{label: t('my_location'), id: 'me'}, ...s.starred.map(place).filter(Boolean).map(x => ({label: x.name, id: x.id}))];
          c.dialog({title: t(field === 'from' ? 'start_point' : 'end_point').replace(/:$/, ''), icon: null, items: list.map(x => x.label), onItem: i => { u.dir[field] = list[i].label; u.dir[`${field}Place`] = list[i].id; c.render(); }});
          return true;
        }
        case 'ecmp-tab': p.tab = el.dataset.tab; c.render(); return true;
        case 'ecmp-star': {
          const id = p.id, on = s.starred.includes(id);
          s.starred = on ? s.starred.filter(x => x !== id) : [id, ...s.starred]; c.save(); c.render(); return true;
        }
        case 'ecmp-showplace': openPlaceOnMap(c, place(p.id)); return true;
        case 'ecmp-dirto': openDirections(c, place(p.id)); return true;
        case 'ecmp-call': c.ui.dialDigits = place(p.id).phone.replace(/\D/g, ''); c.ui.phoneTab = 'dialer'; c.open('phone'); return true;   // ACTION_DIAL tel:
        case 'ecmp-street': EC.mapsNav?.street(c, place(p.id)); return true;
        case 'ecmp-report': c.ui.browserGo = 'http://maps.google.com/support/bin/request.py?contact_type=data'; c.open('browser'); return true;
        case 'ecmp-ppopen': push(c, {page: 'place', id: el.dataset.id, tab: 'address'}); return true;
        case 'ecmp-friendrow': {
          const f = FRIENDS.find(x => x.id === el.dataset.id);
          if (!f) { myLocation(c); return true; }
          u.bubble = {x: f.x, y: f.y, title: f.name, sub: `${f.place} – ${fmt(c, 'da_time_format_minutes', f.minutes)}`, kind: 'friend', id: f.id};
          centerOn(c, f.x, f.y, Math.max(s.z, 15)); u.stack = []; c.render(); return true;
        }
        case 'ecmp-addfriends': c.toast(t('friends_empty')); return true;
      }
      return false;
    },
    menu(c) {
      const p = top(c), s = st(c), u = ui(c);
      const item = (label, icon, action) => ({label, icon, action});
      if (p.page !== 'map') {
        // In a list: Search, Directions and Map (ic_menu_see_map, m).
        c.menu([item(t('da_search_label'), 'fw-ic_menu_search.png', () => search(c)),
          item(t('directions'), 'fw-ic_menu_directions.png', () => openDirections(c, p.page === 'place' ? place(p.id) : null)),
          item(t('map'), 'mp-ic_menu_see_map.png', () => toMap(c))]);
        return true;
      }
      const clearable = u.results.length || u.route || u.bubble || s.wiki || s.transit || s.favorites;
      c.menu([item(t('da_search_label'), 'fw-ic_menu_search.png', () => search(c)),
        item(t('directions'), 'fw-ic_menu_directions.png', () => openDirections(c, u.bubble?.kind === 'place' ? place(u.bubble.id) : null)),
        item(t('da_layers'), 'mp-ic_menu_layers.png', () => layersDialog(c)),
        item(t('my_location'), 'fw-ic_menu_mylocation.png', () => myLocation(c)),
        item(s.latitude ? t('latitude') : t('join_latitude'), 'mp-ic_menu_latitude.png', () => joinLatitude(c)),
        {...item(t('da_clear_layers'), 'fw-ic_menu_revert.png', () => clearMap(c)), disabled: !clearable},
        item(t('starred_items'), null, () => push(c, {page: 'starred'})),
        item(t('da_help'), null, () => { c.ui.browserGo = 'http://www.google.com/mobile/maps/help'; c.open('browser'); }),
        item(t('da_terms_privacy_notices'), null, () => c.dialog({title: t('da_terms_privacy_notices'), icon: null, items: [t('da_terms_and_conditions'), t('da_privacy_policy'), t('da_legal_notices')],
          onItem: i => { c.ui.browserGo = ['http://m.google.com/tos', 'http://m.google.com/privacy', 'http://m.google.com/legalnotices'][i]; c.open('browser'); }}))]);
      return true;
    },
    search(c) { search(c); return true; },
    back(c) {
      const u = ui(c);
      if (u.dirOpen) { u.dirOpen = false; c.render(); return true; }
      if (u.stack.length) { u.stack.pop(); c.render(); return true; }
      if (u.bubble) { u.bubble = null; c.render(); return true; }
      return false;
    }
  });
  EC.maps = {st, ui, route, steps, stepTexts, distance, minutes, draw, scale, project, placeAll, PLACES, ROADS, ME, place, toMap, riverX, DP};
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    // The launcher opens the map; the tiles load for a moment the first time.
    c.open = (view, sub, opts) => { if (view === 'maps' && c.ui.view !== 'maps' && !EC.mapsNav?.active?.(c)) ui(c).stack = []; return open(view, sub, opts); };
  });
})();
