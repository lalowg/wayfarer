// WAYFARER — atlas content. The map is illustrative; notes are general cultural context, not rules.

export const THEMES = ['Coast', 'Mountains', 'Food', 'Craft', 'Sacred', 'Night skies', 'Rail'];

// [lon0, lat0, lon1, lat1]
export const REGIONS = {
  World: null,
  Americas: [-168, -56, -34, 70],
  Europe: [-26, 34, 40, 80],
  Africa: [-20, -36, 52, 37],
  Asia: [26, -8, 146, 55],
  Oceania: [112, -47, 180, -10],
};

export const PLACES = [
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', region: 'Europe', lat: 38.72, lon: -9.14, themes: ['Coast', 'Food'],
    note: 'Coffee is usually taken standing at the counter; ask for a bica if you want an espresso. Ride the old trams early in the morning, before the queues form.' },
  { id: 'reykjavik', name: 'Reykjavík', country: 'Iceland', region: 'Europe', lat: 64.15, lon: -21.94, themes: ['Coast', 'Night skies'],
    note: 'Pool culture is social and has rules: shower without a swimsuit before you enter the geothermal water. The tap water is excellent, so bottled water is rarely needed.' },
  { id: 'faroe', name: 'Tórshavn', country: 'Faroe Islands', region: 'Europe', lat: 62.01, lon: -6.77, themes: ['Coast', 'Food'],
    note: 'Heimablídni, “home hospitality”, means dinner at a family’s kitchen table. The weather changes by the hour, so locals plan walks around it rather than around the clock.' },
  { id: 'istanbul', name: 'Istanbul', country: 'Türkiye', region: 'Europe', lat: 41.01, lon: 28.98, themes: ['Food', 'Sacred', 'Craft'],
    note: 'Cover shoulders and knees in mosques; women are asked to cover their hair. Tea arrives constantly, and accepting a glass is part of the conversation.' },
  { id: 'zermatt', name: 'Zermatt', country: 'Switzerland', region: 'Europe', lat: 46.02, lon: 7.75, themes: ['Mountains', 'Rail'],
    note: 'The village is car-free, so small electric taxis and trains do the work. The Glacier Express runs from here to St. Moritz in about eight hours.' },
  { id: 'svalbard', name: 'Longyearbyen', country: 'Svalbard, Norway', region: 'Europe', lat: 78.22, lon: 15.65, themes: ['Night skies', 'Mountains'],
    note: 'From late October to mid-February the sun stays below the horizon. Because of polar bears, leaving the settlement means going with a trained guide.' },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', region: 'Asia', lat: 35.01, lon: 135.77, themes: ['Sacred', 'Craft'],
    note: 'Tipping is not customary and can cause confusion. Quiet is a courtesy on trains: phone calls are taken in the space between carriages.' },
  { id: 'hoian', name: 'Hội An', country: 'Vietnam', region: 'Asia', lat: 15.88, lon: 108.33, themes: ['Craft', 'Food', 'Coast'],
    note: 'Tailors can make clothes in a day or two; leave time for a second fitting. On the full-moon evening of each lunar month, the old town dims its lights for lanterns.' },
  { id: 'samarkand', name: 'Samarkand', country: 'Uzbekistan', region: 'Asia', lat: 39.65, lon: 66.97, themes: ['Craft', 'Sacred'],
    note: 'Bread is treated with respect: never place a round of non upside down or on the ground. The Registan’s tilework is at its warmest in the hour before sunset.' },
  { id: 'xian', name: 'Xi’an', country: 'China', region: 'Asia', lat: 34.34, lon: 108.94, themes: ['Food', 'Sacred'],
    note: 'The Muslim Quarter’s food streets come alive after dark; try roujiamo, a spiced meat filling in flatbread. The Ming city wall can be cycled end to end, roughly 14 km.' },
  { id: 'kochi', name: 'Kochi', country: 'India', region: 'Asia', lat: 9.93, lon: 76.26, themes: ['Coast', 'Food'],
    note: 'Meals are often served on a banana leaf and eaten with the right hand. Folding the leaf towards you at the end is a quiet way of saying you enjoyed it.' },
  { id: 'penang', name: 'George Town', country: 'Malaysia', region: 'Asia', lat: 5.41, lon: 100.33, themes: ['Food', 'Craft'],
    note: 'Hawker stalls often specialise in one dish, sometimes for generations; queue where the locals queue. Shoes come off before entering homes and many temples.' },
  { id: 'leh', name: 'Leh', country: 'Ladakh, India', region: 'Asia', lat: 34.15, lon: 77.58, themes: ['Mountains', 'Sacred', 'Night skies'],
    note: 'Leh sits at about 3,500 metres, so rest for the first two days. Walk clockwise around stupas and prayer wheels.' },
  { id: 'marrakech', name: 'Marrakech', country: 'Morocco', region: 'Africa', lat: 31.63, lon: -7.99, themes: ['Craft', 'Food'],
    note: 'Bargaining in the souks is expected and good-humoured. Ask before photographing people, and use your right hand for eating and greeting.' },
  { id: 'zanzibar', name: 'Stone Town', country: 'Zanzibar, Tanzania', region: 'Africa', lat: -6.16, lon: 39.19, themes: ['Coast', 'Craft'],
    note: 'Stone Town is largely Muslim, so dress modestly away from the beaches. Its carved wooden doors trace the city’s Swahili, Arab and Indian histories.' },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', region: 'Africa', lat: -33.92, lon: 18.42, themes: ['Coast', 'Mountains'],
    note: 'In summer a strong south-easterly, the “Cape Doctor”, clears the air. Plan Table Mountain walks for still mornings.' },
  { id: 'lalibela', name: 'Lalibela', country: 'Ethiopia', region: 'Africa', lat: 12.03, lon: 39.04, themes: ['Sacred'],
    note: 'The rock-hewn churches are active places of worship: remove your shoes and dress modestly. Many pilgrims arrive for Timkat, Epiphany, in January.' },
  { id: 'cusco', name: 'Cusco', country: 'Peru', region: 'Americas', lat: -13.53, lon: -71.97, themes: ['Mountains', 'Rail', 'Sacred'],
    note: 'At around 3,400 metres, coca tea is offered to help with the altitude. The railway towards Machu Picchu follows the Urubamba river through the Sacred Valley.' },
  { id: 'uyuni', name: 'Uyuni', country: 'Bolivia', region: 'Americas', lat: -20.46, lon: -66.83, themes: ['Night skies', 'Rail'],
    note: 'Just outside town lies a “train cemetery” of early 20th-century locomotives. After rain the salt flat can turn into a mirror, most often between January and March.' },
  { id: 'oaxaca', name: 'Oaxaca', country: 'Mexico', region: 'Americas', lat: 17.07, lon: -96.73, themes: ['Food', 'Craft'],
    note: 'Mole has many forms, and families guard their own recipes. Around 1–2 November, Day of the Dead is a family occasion first; join in respectfully.' },
  { id: 'banff', name: 'Banff', country: 'Canada', region: 'Americas', lat: 51.18, lon: -115.57, themes: ['Mountains', 'Rail'],
    note: 'Wildlife has right of way. Park guidance asks you to stay at least 30 metres from elk and 100 metres from bears.' },
  { id: 'valparaiso', name: 'Valparaíso', country: 'Chile', region: 'Americas', lat: -33.05, lon: -71.62, themes: ['Coast', 'Craft'],
    note: 'Ride the funiculars, some more than a century old, between the port and the painted hills. Many of the murals were commissioned by the residents themselves.' },
  { id: 'rotorua', name: 'Rotorua', country: 'Aotearoa New Zealand', region: 'Oceania', lat: -38.14, lon: 176.25, themes: ['Sacred', 'Craft'],
    note: 'On a marae you are welcomed through a formal pōwhiri; follow your hosts’ lead. The town sits on a geothermal field, and steam rises from gardens and parks.' },
  { id: 'hobart', name: 'Hobart', country: 'Tasmania, Australia', region: 'Oceania', lat: -42.88, lon: 147.33, themes: ['Food', 'Night skies', 'Coast'],
    note: 'On clear winter nights the aurora australis can appear over the southern horizon. Salamanca Market has filled the waterfront on Saturdays since 1972.' },
  { id: 'uluru', name: 'Uluru', country: 'Australia', region: 'Oceania', lat: -25.34, lon: 131.04, themes: ['Sacred', 'Night skies'],
    note: 'Uluru is sacred to the Aṉangu people, and climbing it has been prohibited since 2019. Some sites ask visitors not to take photographs; signs mark them.' },
];

export const byId = Object.fromEntries(PLACES.map((p) => [p.id, p]));

export const COLLECTIONS = [
  { id: 'silk', name: 'The Silk Thread', days: 21, stops: ['istanbul', 'samarkand', 'xian'], season: 'Apr–May, Sep–Oct',
    text: 'Caravanserai to tea house: an overland line from the Bosphorus to the old capital of China, through the blue domes of Samarkand.' },
  { id: 'atlantic', name: 'Atlantic Edge', days: 16, stops: ['lisbon', 'faroe', 'reykjavik', 'svalbard'], season: 'Jun–Aug',
    text: 'North along the ocean’s rim, from tiled Lisbon to the islands where summer nights never quite go dark.' },
  { id: 'monsoon', name: 'Monsoon Kitchens', days: 14, stops: ['kochi', 'penang', 'hoian'], season: 'Dec–Mar',
    text: 'Three port cities shaped by the trade winds, each with a kitchen built on what the ships brought in.' },
  { id: 'andes', name: 'Spine of the Andes', days: 18, stops: ['cusco', 'uyuni', 'valparaiso'], season: 'May–Oct',
    text: 'Highland rail, white salt and a painted port: down the continent’s backbone to the Pacific.' },
  { id: 'southern', name: 'Southern Skies', days: 15, stops: ['uluru', 'hobart', 'rotorua'], season: 'May–Aug',
    text: 'Red centre, southern lights and steaming earth: a winter route under the darkest skies of the southern hemisphere.' },
];

export const NOTES = [
  { title: 'Shoes at the threshold', text: 'Across much of Asia and the Middle East, shoes come off before entering homes and many temples and mosques. A row of shoes at the door is your cue.', places: ['kyoto', 'penang', 'istanbul', 'samarkand', 'leh'] },
  { title: 'The right hand', text: 'In many cultures the left hand is associated with hygiene, so eat, pass food and hand over money with your right.', places: ['kochi', 'marrakech', 'zanzibar', 'lalibela'] },
  { title: 'Accept the tea', text: 'An offered glass of tea is usually an invitation to talk rather than a sales pitch. Taking a sip, even a small one, is the courteous answer.', places: ['istanbul', 'marrakech', 'samarkand'] },
  { title: 'Dress for sacred places', text: 'Covered shoulders and knees are expected at most active places of worship. A light scarf in a day bag solves almost every situation.', places: ['istanbul', 'lalibela', 'zanzibar', 'leh'] },
  { title: 'Tipping is local', text: 'There is no global rule. In Japan tipping is not customary, in Canada it is expected, and in much of Europe rounding up is plenty.', places: ['kyoto', 'banff', 'lisbon'] },
  { title: 'Ask before the photograph', text: 'A smile and a gesture towards the camera is usually enough. Some sites are sacred and ask that no photographs be taken at all.', places: ['marrakech', 'uluru', 'lalibela', 'oaxaca'] },
  { title: 'Altitude asks for patience', text: 'Above roughly 2,500 metres, plan an easy first day or two, drink water and let the body adjust before long walks.', places: ['cusco', 'leh', 'uyuni'] },
  { title: 'Welcomes have a form', text: 'Some welcomes follow a ceremony or a custom of their own. Watch your hosts, follow their lead and let them set the pace.', places: ['rotorua', 'faroe', 'samarkand'] },
];

export const fmtLatLon = (lat, lon) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;

// great-circle helpers (spherical Earth, R = 6371 km)
const rad = (d) => (d * Math.PI) / 180;
export function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function bearing(a, b) {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const compass = (deg) => POINTS[Math.round(deg / 22.5) % 16];
export const km = (n) => Math.round(n).toLocaleString('en-US') + ' km';
