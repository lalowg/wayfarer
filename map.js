// WAYFARER — the atlas plate. d3-geo Equal Earth map with engraved water lines, pins, routes and zoom.
// Falls back to a simplified equirectangular chart if the CDN modules or data cannot load.
// Single-file UMD bundles: two requests instead of ~45 ESM sub-module requests.
const D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
const TOPO_URL = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
const NS = 'http://www.w3.org/2000/svg';

let lib = null; // { d3, land, borders }

function loadScript(src, global) {
  if (window[global]) return Promise.resolve(window[global]);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => (window[global] ? resolve(window[global]) : reject(new Error(global + ' missing')));
    s.onerror = () => reject(new Error('failed ' + src));
    document.head.appendChild(s);
  });
}

export async function loadGeo() {
  if (lib) return lib;
  try {
    const [d3, topo, res] = await Promise.all([loadScript(D3_URL, 'd3'), loadScript(TOPO_URL, 'topojson'), fetch(WORLD_URL)]);
    if (!res.ok) throw new Error('world-atlas ' + res.status);
    const world = await res.json();
    lib = {
      d3,
      land: topo.feature(world, world.objects.land),
      borders: topo.mesh(world, world.objects.countries, (a, b) => a !== b),
    };
  } catch (e) {
    lib = { d3: null };
  }
  return lib;
}

export async function createMap(opts) {
  const g = await loadGeo();
  return g.d3 ? d3Map(g, opts) : fallbackMap(opts);
}

/* ------------------------------------------------------------------ */
function d3Map({ d3, land, borders }, { host, svgEl, places, reduced, onSelect, onCoords, onWheelHint }) {
  const svg = d3.select(svgEl);
  const projection = d3.geoEqualEarth();
  const path = d3.geoPath(projection);
  const sphere = { type: 'Sphere' };
  const grat = d3.geoGraticule10();
  let W = 0, H = 0, k = 1, transform = d3.zoomIdentity;

  const defs = svg.append('defs');
  defs.append('pattern').attr('id', 'm-hatch').attr('patternUnits', 'userSpaceOnUse').attr('width', 5).attr('height', 5).attr('patternTransform', 'rotate(35)')
    .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 5).attr('class', 'm-hatch-line');
  defs.append('clipPath').attr('id', 'm-clip').append('path').attr('class', 'm-clip-path');
  const root = svg.append('g').attr('class', 'm-root');
  const sphereP = root.append('path').attr('class', 'm-sphere');
  const clipped = root.append('g').attr('clip-path', 'url(#m-clip)');
  const gratP = clipped.append('path').attr('class', 'm-grat');
  const rings = [[30, 't', 0.09], [25, 'p'], [19, 't', 0.13], [14, 'p'], [8.5, 't', 0.2], [4.5, 'p']];
  const ringP = rings.map(([w, kind, o]) => clipped.append('path').attr('class', 'ring ring--' + kind).style('stroke-width', w + 'px').style('stroke-opacity', o === undefined ? 1 : o));
  const landP = clipped.append('path').attr('class', 'm-land');
  const hatchP = clipped.append('path').attr('class', 'm-land-hatch');
  const bordP = clipped.append('path').attr('class', 'm-borders');
  const outlineP = root.append('path').attr('class', 'm-outline');
  const collG = root.append('g').attr('class', 'm-coll');
  const routeG = root.append('g').attr('class', 'm-route');
  const pinsG = root.append('g').attr('class', 'm-pins');

  const pins = pinsG.selectAll('g.pin').data(places, (d) => d.id).join('g').attr('class', 'pin').attr('data-id', (d) => d.id);
  const pinS = pins.append('g').attr('class', 'pin__s');
  pinS.append('circle').attr('class', 'pin__halo').attr('r', 15);
  pinS.append('circle').attr('class', 'pin__dot').attr('r', 6.5);
  pinS.append('text').attr('class', 'pin__num').attr('y', 3.6).attr('text-anchor', 'middle');
  pinS.append('text').attr('class', 'pin__label').attr('x', 12).attr('y', 4).text((d) => d.name);
  pins.on('click', (ev, d) => { ev.stopPropagation(); onSelect(d.id); });

  function layout() {
    W = Math.max(280, host.clientWidth);
    H = Math.max(240, host.clientHeight);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const pad = Math.min(W, H) * 0.04;
    const insetB = parseFloat(getComputedStyle(host).getPropertyValue('--inset-b')) || 0;
    projection.fitExtent([[pad, pad], [W - pad, H - pad - insetB]], sphere);
    defs.select('.m-clip-path').attr('d', path(sphere));
    sphereP.attr('d', path(sphere));
    outlineP.attr('d', path(sphere));
    gratP.attr('d', path(grat));
    const ld = path(land);
    ringP.forEach((p) => p.attr('d', ld));
    landP.attr('d', ld);
    hatchP.attr('d', ld);
    bordP.attr('d', path(borders));
    pins.attr('transform', (d) => { const [x, y] = projection([d.lon, d.lat]); return `translate(${x.toFixed(1)},${y.toFixed(1)})`; });
    pins.each(function (d) {
      const [x] = projection([d.lon, d.lat]);
      d3.select(this).select('.pin__label').attr('x', x > W * 0.82 ? -12 : 12).attr('text-anchor', x > W * 0.82 ? 'end' : 'start');
    });
    zoom.extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]]);
    redrawLines();
  }

  const zoom = d3.zoom().scaleExtent([1, 10])
    .filter((ev) => {
      if (ev.type === 'wheel') { if (!(ev.ctrlKey || ev.metaKey)) { onWheelHint?.(); return false; } return true; }
      if (ev.type === 'touchstart') return ev.touches.length > 1;
      return !ev.button;
    })
    .on('zoom', (ev) => {
      transform = ev.transform;
      root.attr('transform', transform);
      setK(transform.k);
    });
  svg.call(zoom);
  svg.style('touch-action', 'pan-y');
  svg.on('click', () => onSelect(null, true));

  function setK(nk) {
    k = nk;
    pinS.attr('transform', `scale(${(1 / k).toFixed(4)})`);
    host.classList.toggle('is-zoomed', k >= 2.4);
  }

  svg.on('pointermove', (ev) => {
    const [mx, my] = d3.pointer(ev, svgEl);
    const [x, y] = transform.invert([mx, my]);
    const ll = projection.invert([x, y]);
    if (!ll || !Number.isFinite(ll[0]) || !Number.isFinite(ll[1])) return;
    const back = projection(ll);
    if (!back || Math.hypot(back[0] - x, back[1] - y) > 1) { onCoords(null); return; }
    onCoords(ll);
  });
  svg.on('pointerleave', () => onCoords(null));

  const ease = d3.easeCubicInOut;
  function go(t, dur = 1300) {
    if (reduced) svg.call(zoom.transform, t);
    else svg.transition().duration(dur).ease(ease).call(zoom.transform, t);
  }
  function toBounds(b, maxK = 7) {
    const [[x0, y0], [x1, y1]] = b;
    const dx = Math.max(1, x1 - x0), dy = Math.max(1, y1 - y0);
    const kk = Math.max(1, Math.min(maxK, 0.82 / Math.max(dx / W, dy / H)));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    go(d3.zoomIdentity.translate(W / 2 - kk * cx, H / 2 - kk * cy).scale(kk));
  }
  const pointsOf = (ids) => ({ type: 'MultiPoint', coordinates: ids.map((id) => { const p = places.find((q) => q.id === id); return [p.lon, p.lat]; }) });

  // route + collection lines
  let routeIds = [], collIds = [];
  const legs = (ids) => ({ type: 'MultiLineString', coordinates: ids.slice(1).map((id, i) => { const a = places.find((p) => p.id === ids[i]), b = places.find((p) => p.id === id); return [[a.lon, a.lat], [b.lon, b.lat]]; }) });
  function redrawLines() {
    routeG.selectAll('path').attr('d', routeIds.length > 1 ? path(legs(routeIds)) : null);
    collG.selectAll('path').attr('d', collIds.length > 1 ? path(legs(collIds)) : null);
  }
  function inkDraw(sel) {
    const node = sel.node();
    if (reduced || !node || !node.getTotalLength) return;
    let len = 0;
    try { len = node.getTotalLength(); } catch (e) { len = 0; }
    if (!len) return;
    const L = len * k;
    sel.style('stroke-dasharray', `${L} ${L}`).style('stroke-dashoffset', L).style('transition', 'none');
    node.getBoundingClientRect();
    sel.style('transition', 'stroke-dashoffset 1.9s cubic-bezier(.65,0,.35,1)').style('stroke-dashoffset', 0);
    setTimeout(() => { sel.style('stroke-dasharray', null).style('stroke-dashoffset', null).style('transition', null); }, 2000);
  }

  const api = {
    lib: 'd3',
    resize: layout,
    select(id) { pins.classed('is-active', (d) => d.id === id); if (id) pins.filter((d) => d.id === id).raise(); },
    flyTo(id, minK = 3) {
      const p = places.find((q) => q.id === id);
      const [x, y] = projection([p.lon, p.lat]);
      const kk = Math.max(transform.k, minK);
      go(d3.zoomIdentity.translate(W / 2 - kk * x, H * 0.46 - kk * y).scale(kk), 1100);
    },
    region(box) {
      if (!box) { go(d3.zoomIdentity); return; }
      const [a, b, c, d] = box;
      const pts = [];
      for (let lon = a; lon <= c; lon += 4) { pts.push([lon, b], [lon, d]); }
      for (let lat = b; lat <= d; lat += 4) { pts.push([a, lat], [c, lat]); }
      toBounds(path.bounds({ type: 'MultiPoint', coordinates: pts }), 6);
    },
    fit(ids) {
      if (!ids.length) return;
      if (ids.length === 1) { api.flyTo(ids[0]); return; }
      toBounds(path.bounds(pointsOf(ids)), 5);
    },
    zoomBy(f) { if (reduced) svg.call(zoom.scaleBy, f); else svg.transition().duration(450).call(zoom.scaleBy, f); },
    pan(dx, dy) { if (reduced) svg.call(zoom.translateBy, dx / k, dy / k); else svg.transition().duration(250).call(zoom.translateBy, dx / k, dy / k); },
    reset() { go(d3.zoomIdentity, 1000); },
    setFilter(visible) { pins.classed('is-dim', (d) => !visible.has(d.id)); },
    setSaved(ids, animate) {
      pins.classed('is-saved', (d) => ids.includes(d.id));
      pins.select('.pin__num').text((d) => { const i = ids.indexOf(d.id); return i >= 0 ? i + 1 : ''; });
      const changed = ids.join() !== routeIds.join();
      routeIds = ids.slice();
      routeG.selectAll('path').data(ids.length > 1 ? ['glow', 'ink'] : []).join('path').attr('class', (d) => 'route route--' + d);
      redrawLines();
      if (animate && changed && ids.length > 1) inkDraw(routeG.select('.route--ink'));
    },
    plotCollection(ids) {
      collIds = ids.slice();
      pins.classed('is-coll', (d) => ids.includes(d.id));
      collG.selectAll('path').data(ids.length > 1 ? ['line'] : []).join('path').attr('class', 'coll-line');
      redrawLines();
      if (ids.length) { inkDraw(collG.select('.coll-line')); api.fit(ids); }
    },
  };
  layout();
  return api;
}

/* ------------------------------------------------------------------ */
function fallbackMap({ host, svgEl, places, onSelect }) {
  host.classList.add('is-fallback');
  const VW = 1000, VH = 520;
  const X = (lon) => ((lon + 180) / 360) * VW;
  const Y = (lat) => ((90 - lat) / 180) * VH;
  svgEl.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  let s = `<rect class="m-sphere" width="${VW}" height="${VH}" rx="6"/>`;
  for (let lon = -150; lon <= 150; lon += 30) s += `<line class="m-grat" x1="${X(lon)}" y1="0" x2="${X(lon)}" y2="${VH}"/>`;
  for (let lat = -60; lat <= 60; lat += 30) s += `<line class="m-grat" x1="0" y1="${Y(lat)}" x2="${VW}" y2="${Y(lat)}"/>`;
  s += `<text class="m-fallback-t" x="${VW / 2}" y="${VH - 18}" text-anchor="middle">Coastlines could not load, so this is a simplified chart. Places, notes and routes still work.</text>`;
  s += `<g class="m-coll"></g><g class="m-route"></g><g class="m-pins">`;
  s += places.map((p) => `<g class="pin" data-id="${p.id}" transform="translate(${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)})"><g class="pin__s"><circle class="pin__halo" r="15"/><circle class="pin__dot" r="6.5"/><text class="pin__num" y="3.6" text-anchor="middle"></text><text class="pin__label" x="12" y="4">${p.name}</text></g></g>`).join('');
  s += '</g>';
  svgEl.innerHTML = s;
  host.classList.add('is-zoomed');
  const pins = [...svgEl.querySelectorAll('.pin')];
  svgEl.addEventListener('click', (e) => { const p = e.target.closest('.pin'); onSelect(p ? p.dataset.id : null, !p); });
  const line = (ids, cls) => {
    if (ids.length < 2) return '';
    const pts = ids.map((id) => { const p = places.find((q) => q.id === id); return `${X(p.lon).toFixed(1)},${Y(p.lat).toFixed(1)}`; });
    return `<polyline class="${cls}" points="${pts.join(' ')}"/>`;
  };
  const noop = () => {};
  return {
    lib: 'fallback', resize: noop, flyTo: noop, region: noop, fit: noop, zoomBy: noop, pan: noop, reset: noop,
    select(id) { pins.forEach((p) => p.classList.toggle('is-active', p.dataset.id === id)); },
    setFilter(visible) { pins.forEach((p) => p.classList.toggle('is-dim', !visible.has(p.dataset.id))); },
    setSaved(ids) {
      pins.forEach((p) => { const i = ids.indexOf(p.dataset.id); p.classList.toggle('is-saved', i >= 0); p.querySelector('.pin__num').textContent = i >= 0 ? i + 1 : ''; });
      svgEl.querySelector('.m-route').innerHTML = line(ids, 'route route--ink');
    },
    plotCollection(ids) {
      pins.forEach((p) => p.classList.toggle('is-coll', ids.includes(p.dataset.id)));
      svgEl.querySelector('.m-coll').innerHTML = line(ids, 'coll-line');
    },
  };
}

/* ------------------------------------------------------------------ */
// Small orthographic globes for the collection plates. Drag to spin.
export async function drawGlobes(nodes, places, reduced) {
  const g = await loadGeo();
  if (!g.d3) { nodes.forEach((n) => n.closest('.plate')?.classList.add('no-globe')); return; }
  const { d3, land } = g;
  nodes.forEach((svgEl) => {
    const ids = svgEl.dataset.stops.split(',');
    const pts = ids.map((id) => { const p = places.find((q) => q.id === id); return [p.lon, p.lat]; });
    const c = d3.geoCentroid({ type: 'MultiPoint', coordinates: pts });
    const proj = d3.geoOrthographic().scale(132).translate([150, 150]).clipAngle(90).precision(0.6);
    const path = d3.geoPath(proj);
    let rot = [-c[0], -c[1] * 0.8, 0];
    const s = d3.select(svgEl);
    s.attr('viewBox', '0 0 300 300');
    const ocean = s.append('path').attr('class', 'g-ocean');
    const gr = s.append('path').attr('class', 'g-grat');
    const ld = s.append('path').attr('class', 'g-land');
    const rt = s.append('path').attr('class', 'g-route');
    const dots = s.append('g');
    const rim = s.append('path').attr('class', 'g-rim');
    const line = { type: 'LineString', coordinates: pts };
    function draw() {
      proj.rotate(rot);
      ocean.attr('d', path({ type: 'Sphere' }));
      rim.attr('d', path({ type: 'Sphere' }));
      gr.attr('d', path(d3.geoGraticule10()));
      ld.attr('d', path(land));
      rt.attr('d', path(line));
      const centre = proj.invert([150, 150]);
      dots.selectAll('circle').data(pts).join('circle').attr('r', (d, i) => (i === 0 ? 5 : 4)).attr('class', (d, i) => 'g-stop' + (i === 0 ? ' g-stop--first' : ''))
        .attr('cx', (d) => proj(d)[0]).attr('cy', (d) => proj(d)[1])
        .attr('display', (d) => (d3.geoDistance(d, centre) < Math.PI / 2 ? null : 'none'));
    }
    draw();
    let drag = null;
    svgEl.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY, r: rot.slice() }; svgEl.setPointerCapture?.(e.pointerId); svgEl.classList.add('is-grab'); });
    svgEl.addEventListener('pointermove', (e) => {
      if (!drag) return;
      rot = [drag.r[0] + (e.clientX - drag.x) * 0.5, Math.max(-80, Math.min(80, drag.r[1] - (e.clientY - drag.y) * 0.5)), 0];
      draw();
    });
    const up = () => { drag = null; svgEl.classList.remove('is-grab'); };
    svgEl.addEventListener('pointerup', up);
    svgEl.addEventListener('pointercancel', up);
  });
  void NS; void reduced;
}
