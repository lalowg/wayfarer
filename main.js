// WAYFARER — atlas UI: filters, places, place card, saved tray, collections, notes, ledger, legend, form.
import { PLACES, byId, THEMES, REGIONS, COLLECTIONS, NOTES, fmtLatLon, distanceKm, bearing, compass, km } from './data.js';
import { createMap, drawGlobes } from './map.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (id) => String(PLACES.findIndex((p) => p.id === id) + 1).padStart(2, '0');
const KEY = 'wayfarer.saved.v1';

/* ---------- state ---------- */
const state = { theme: 'All', region: 'World', current: null, saved: loadSaved(), coll: null };
function loadSaved() {
  try { const a = JSON.parse(sessionStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter((id) => byId[id]) : []; } catch (e) { return []; }
}
function persist() { try { sessionStorage.setItem(KEY, JSON.stringify(state.saved)); } catch (e) { /* storage unavailable */ } }

let map = null; // set once the map has loaded
const mapCalls = [];
const withMap = (fn) => { if (map) fn(map); else mapCalls.push(fn); };

/* ---------- toast ---------- */
const toastEl = $('#toast');
let toastT = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
}

/* ---------- header ---------- */
const menuBtn = $('.bar__menu'), nav = $('#nav'), bar = $('.bar');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  menuBtn.querySelector('.bar__menu-label').textContent = open ? 'Close' : 'Menu';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
addEventListener('scroll', () => bar.classList.toggle('is-raised', scrollY > 8), { passive: true });

/* ---------- filters ---------- */
function radios(host, name, values, current) {
  host.innerHTML = values.map((v) => `<label class="seg__opt"><input type="radio" name="${name}" value="${esc(v)}"${v === current ? ' checked' : ''}><span>${esc(v)}</span></label>`).join('');
}
radios($('#theme-opts'), 'theme', ['All', ...THEMES], 'All');
radios($('#region-opts'), 'region', Object.keys(REGIONS), 'World');
$('#f-theme').addEventListener('change', (e) => { state.theme = e.target.value; refreshFilter(); });
$('#f-region').addEventListener('change', (e) => {
  state.region = e.target.value;
  refreshFilter();
  $('#map-plate').textContent = `Plate I · ${state.region === 'World' ? 'The World' : state.region}`;
  withMap((m) => m.region(REGIONS[state.region]));
});

const matchesTheme = (p) => state.theme === 'All' || p.themes.includes(state.theme);
const listed = () => PLACES.filter((p) => matchesTheme(p) && (state.region === 'World' || p.region === state.region));

function refreshFilter() {
  const list = listed();
  $('#place-list').innerHTML = list.map((p) => `<li><button class="pl${state.current === p.id ? ' is-current' : ''}${state.saved.includes(p.id) ? ' is-saved' : ''}" type="button" data-id="${p.id}" aria-pressed="${state.current === p.id}">
<span class="pl__n">${num(p.id)}</span><span class="pl__name">${esc(p.name)}</span><span class="pl__c">${esc(p.country)}</span><span class="pl__s" aria-hidden="true"><svg><use href="#i-pin"/></svg></span>${state.saved.includes(p.id) ? '<span class="visually-hidden">(saved)</span>' : ''}</button></li>`).join('');
  const label = [state.theme !== 'All' ? state.theme.toLowerCase() : '', state.region !== 'World' ? 'in ' + state.region : ''].filter(Boolean).join(' ');
  $('#places-count').textContent = list.length ? `${list.length} ${list.length === 1 ? 'place' : 'places'}${label ? ' · ' + label : ''}` : 'No places match. Try another theme or region.';
  const vis = new Set(PLACES.filter(matchesTheme).map((p) => p.id));
  withMap((m) => m.setFilter(vis));
}
$('#place-list').addEventListener('click', (e) => {
  const b = e.target.closest('.pl');
  if (b) select(b.dataset.id, { fly: true, reveal: true });
});

/* ---------- place card ---------- */
const card = $('#place-card');
function select(id, opts = {}) {
  state.current = id;
  withMap((m) => m.select(id));
  $$('#place-list .pl').forEach((b) => { const on = b.dataset.id === id; b.classList.toggle('is-current', on); b.setAttribute('aria-pressed', String(on)); });
  if (!id) { card.hidden = true; return; }
  renderCard();
  card.hidden = false;
  if (opts.fly) withMap((m) => m.flyTo(id));
  if (opts.reveal && matchMedia('(max-width: 1023px)').matches) $('#map').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  if (opts.focus) card.querySelector('.card__title')?.focus();
}
function renderCard() {
  const p = byId[state.current];
  if (!p) return;
  const saved = state.saved.includes(p.id);
  card.innerHTML = `<button class="card__close" type="button" data-close aria-label="Close ${esc(p.name)}"><svg aria-hidden="true" focusable="false"><use href="#i-x"/></svg></button>
<p class="card__k"><span>No. ${num(p.id)}</span><span>${esc(p.region)}</span></p>
<h3 class="card__title" id="card-title" tabindex="-1">${esc(p.name)}</h3>
<p class="card__where">${esc(p.country)} · ${fmtLatLon(p.lat, p.lon)}</p>
<ul class="card__tags">${p.themes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<div class="card__note"><p class="card__note-k">Culture note</p><p>${esc(p.note)}</p></div>
<div class="card__actions">
<button class="btn ${saved ? 'btn--teal' : 'btn--red'}" type="button" data-save="${p.id}" aria-pressed="${saved}">${saved ? `Saved · stop ${state.saved.indexOf(p.id) + 1}` : 'Save to route'}</button>
<span class="card__steps"><button class="round-btn round-btn--sm" type="button" data-step="-1" aria-label="Previous place"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><button class="round-btn round-btn--sm" type="button" data-step="1" aria-label="Next place"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button></span>
</div>`;
}
card.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) { const id = state.current; select(null); $(`#place-list .pl[data-id="${id}"]`)?.focus(); return; }
  const s = e.target.closest('[data-save]');
  if (s) { toggleSaved(s.dataset.save); card.querySelector('[data-save]')?.focus(); return; }
  const st = e.target.closest('[data-step]');
  if (st) {
    const list = listed().length ? listed() : PLACES;
    let i = list.findIndex((p) => p.id === state.current);
    i = (i + +st.dataset.step + list.length) % list.length;
    select(list[i].id, { fly: true });
    card.querySelector(`[data-step="${st.dataset.step}"]`)?.focus();
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !card.hidden && card.contains(document.activeElement)) select(null); });

/* ---------- saved route ---------- */
function toggleSaved(id) {
  const i = state.saved.indexOf(id);
  if (i >= 0) { state.saved.splice(i, 1); toast(`${byId[id].name} removed from your route.`); }
  else { state.saved.push(id); toast(`${byId[id].name} saved as stop ${state.saved.length}.`); }
  savedChanged(true);
}
function savedChanged(animate) {
  persist();
  withMap((m) => m.setSaved(state.saved, animate));
  renderTray();
  renderLedger();
  refreshFilter();
  if (state.current) renderCard();
  $$('[data-saved-count]').forEach((el) => { el.textContent = state.saved.length; });
  const lab = $('#c-saved-label'), cb = $('#c-saved');
  if (lab) {
    cb.disabled = !state.saved.length;
    if (!state.saved.length) cb.checked = false;
    lab.textContent = state.saved.length ? `Include my ${state.saved.length} saved ${state.saved.length === 1 ? 'place' : 'places'}` : 'Include my saved places (none yet)';
  }
}
function totalKm(ids) { let t = 0; for (let i = 1; i < ids.length; i++) t += distanceKm(byId[ids[i - 1]], byId[ids[i]]); return t; }
function renderTray() {
  const ids = state.saved;
  $('#tray-list').innerHTML = ids.map((id, i) => `<li class="stop"><span class="stop__n" aria-hidden="true">${i + 1}</span><button class="stop__name" type="button" data-id="${id}" aria-label="Stop ${i + 1}: ${esc(byId[id].name)}. Show on map">${esc(byId[id].name)}</button><button class="stop__x" type="button" data-remove="${id}" aria-label="Remove ${esc(byId[id].name)} from your route"><svg aria-hidden="true" focusable="false"><use href="#i-x"/></svg></button></li>`).join('');
  $('#tray-dist').textContent = ids.length === 0 ? 'Save places to draw a route between them.' : ids.length === 1 ? 'One stop saved. Add another to draw a route.' : `${ids.length} stops · about ${km(totalKm(ids))} along great circles`;
  $('#tray-fit').disabled = ids.length === 0;
  $('#tray-clear').disabled = ids.length === 0;
  $('#tray').classList.toggle('is-empty', ids.length === 0);
}
$('#tray-list').addEventListener('click', (e) => {
  const r = e.target.closest('[data-remove]');
  if (r) { const id = r.dataset.remove; const idx = state.saved.indexOf(id); toggleSaved(id); const next = $$('#tray-list .stop__name')[Math.min(idx, state.saved.length - 1)]; (next || $('#tray-title')).focus?.(); return; }
  const n = e.target.closest('.stop__name');
  if (n) select(n.dataset.id, { fly: true });
});
$('#tray-fit').addEventListener('click', () => withMap((m) => m.fit(state.saved)));
$('#tray-clear').addEventListener('click', () => { state.saved = []; savedChanged(false); toast('Route cleared.'); });

/* ---------- ledger ---------- */
function renderLedger() {
  const ids = state.saved;
  $('#ledger-empty').hidden = ids.length >= 2;
  $('#ledger-wrap').hidden = ids.length < 2;
  if (ids.length === 1) $('#ledger-empty p').innerHTML = `One stop saved: <strong>${esc(byId[ids[0]].name)}</strong>. Save another place to measure your first leg.`;
  else $('#ledger-empty p').innerHTML = 'No stops yet. Open a place on the atlas and choose <strong>Save to route</strong>, or save every stop of a collection.';
  if (ids.length < 2) return;
  let rows = '';
  for (let i = 1; i < ids.length; i++) {
    const a = byId[ids[i - 1]], b = byId[ids[i]];
    const brg = bearing(a, b);
    rows += `<tr><td class="lg__n">${String(i).padStart(2, '0')}</td><td><span class="lg__p">${esc(a.name)}</span><span class="lg__c">${esc(a.country)}</span></td><td><span class="lg__p">${esc(b.name)}</span><span class="lg__c">${esc(b.country)}</span></td><td class="lg__d">${km(distanceKm(a, b))}</td><td class="lg__b"><span class="lg__arrow" style="transform:rotate(${brg.toFixed(0)}deg)" aria-hidden="true">↑</span>${compass(brg)} · ${brg.toFixed(0)}°</td></tr>`;
  }
  $('#ledger-body').innerHTML = rows;
  $('#ledger-total').textContent = km(totalKm(ids));
}
$('#ledger-reverse').addEventListener('click', () => { state.saved.reverse(); savedChanged(true); toast('Route reversed.'); });

/* ---------- collections ---------- */
const track = $('#cols-track');
track.innerHTML = COLLECTIONS.map((c, i) => `<li class="plate" data-coll="${c.id}">
<div class="plate__globe"><svg data-stops="${c.stops.join(',')}" role="img" aria-label="Globe showing ${esc(c.name)}: ${c.stops.map((s) => esc(byId[s].name)).join(' to ')}"></svg><span class="plate__hint" aria-hidden="true">Drag to turn</span></div>
<p class="plate__k"><span>Collection ${String(i + 1).padStart(2, '0')}</span><span>${c.days} days</span></p>
<h3 class="plate__title">${esc(c.name)}</h3>
<p class="plate__text">${esc(c.text)}</p>
<ol class="plate__stops">${c.stops.map((s) => `<li>${esc(byId[s].name)}</li>`).join('')}</ol>
<p class="plate__meta">Best ${esc(c.season)} · illustrative</p>
<div class="plate__actions"><button class="btn btn--ink btn--sm" type="button" data-plot="${c.id}">Plot on the atlas</button><button class="btn-text" type="button" data-saveall="${c.id}">Save all stops</button></div>
</li>`).join('');
track.addEventListener('click', (e) => {
  const p = e.target.closest('[data-plot]');
  if (p) { plot(p.dataset.plot); return; }
  const s = e.target.closest('[data-saveall]');
  if (s) {
    const c = COLLECTIONS.find((x) => x.id === s.dataset.saveall);
    const add = c.stops.filter((id) => !state.saved.includes(id));
    state.saved.push(...add);
    savedChanged(true);
    toast(add.length ? `${add.length} ${add.length === 1 ? 'stop' : 'stops'} from ${c.name} added to your route.` : `Every stop of ${c.name} is already saved.`);
  }
});
const collChip = document.createElement('div');
collChip.className = 'map__coll';
collChip.hidden = true;
$('#map').appendChild(collChip);
function plot(id) {
  const c = COLLECTIONS.find((x) => x.id === id);
  state.coll = c ? id : null;
  collChip.hidden = !c;
  if (c) collChip.innerHTML = `<span class="map__coll-k">Plotted</span> <strong>${esc(c.name)}</strong> <button type="button" class="map__coll-x" aria-label="Clear the plotted collection"><svg aria-hidden="true" focusable="false"><use href="#i-x"/></svg></button>`;
  $('#atlas').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => withMap((m) => m.plotCollection(c ? c.stops : [])), reduced ? 0 : 500);
}
collChip.addEventListener('click', (e) => { if (e.target.closest('.map__coll-x')) { plot(null); $('#map').focus(); } });
const step = () => track.querySelector('.plate')?.getBoundingClientRect().width + 24 || 400;
$('#cols-prev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }));
$('#cols-next').addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }));
let globesDrawn = false;
const drawG = () => { if (globesDrawn) return; globesDrawn = true; drawGlobes($$('.plate__globe svg'), PLACES, reduced); };
if ('IntersectionObserver' in window) {
  const gio = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { drawG(); gio.disconnect(); } }, { rootMargin: '400px 0px' });
  gio.observe($('#collections'));
} else drawG();

/* ---------- culture notes ---------- */
$('#notes-grid').innerHTML = NOTES.map((n, i) => `<li class="note">
<span class="note__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
<h3 class="note__title">${esc(n.title)}</h3>
<p class="note__text">${esc(n.text)}</p>
<p class="note__k">Where you might meet it</p>
<ul class="note__places">${n.places.map((id) => `<li><button type="button" data-goto="${id}" aria-label="Show ${esc(byId[id].name)} on the atlas"><svg aria-hidden="true" focusable="false"><use href="#i-pin"/></svg>${esc(byId[id].name)}</button></li>`).join('')}</ul>
</li>`).join('');
$('#notes-grid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-goto]');
  if (!b) return;
  $('#atlas').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  select(b.dataset.goto, { fly: true, focus: true });
});

/* ---------- legend rose ---------- */
(function rose() {
  let t = '';
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180, major = i % 9 === 0;
    const r1 = 186, r2 = major ? 172 : 180;
    t += `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * r2).toFixed(1)}" y2="${(-Math.cos(a) * r2).toFixed(1)}" stroke="#F4EFE3" stroke-opacity="${major ? 0.8 : 0.35}"/>`;
  }
  $('#rose-ticks').innerHTML = t;
  if (reduced) return;
  const sec = $('#legend'), star = $('.rose__star');
  let raf = 0;
  const upd = () => {
    raf = 0;
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    star.style.transform = `rotate(${(p * 120 - 40).toFixed(2)}deg)`;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  upd();
})();

/* ---------- stamp reveals ---------- */
const stamps = $$('.stamp, .note, .plate, .key');
if (reduced || !('IntersectionObserver' in window)) stamps.forEach((el) => el.classList.add('is-in'));
else {
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
  stamps.forEach((el) => io.observe(el));
}

/* ---------- nav current ---------- */
const navLinks = $$('.bar__nav a');
if ('IntersectionObserver' in window) {
  const sio = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => sio.observe(s));
}

/* ---------- commission form ---------- */
(function form() {
  const f = $('#com-form');
  const F = (k) => f.elements[k];
  $('#c-themes').innerHTML = THEMES.map((t) => `<label class="check"><input type="checkbox" name="themes" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('');
  const msg = $('#c-msg');
  msg.addEventListener('input', () => { $('#c-msg-count').textContent = `${msg.value.length} / 500`; });
  const rules = {
    name: () => (F('name').value.trim().length >= 2 ? '' : 'Please add your name.'),
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(F('email').value.trim()) ? '' : 'Please enter an email address like name@example.com.'),
    themes: () => ($$('input[name="themes"]:checked', f).length ? '' : 'Choose at least one theme for your atlas.'),
    format: () => (F('format').value ? '' : 'Choose a format.'),
  };
  const errs = { name: '#c-name-err', email: '#c-email-err', themes: '#c-themes-err', format: '#c-format-err' };
  let tried = false;
  function check(k) {
    const m = rules[k]();
    const el = $(errs[k]);
    el.textContent = m;
    el.closest('.field').classList.toggle('is-invalid', !!m);
    const inputs = k === 'themes' ? $$('input[name="themes"]', f) : [F(k)];
    inputs.forEach((i) => (m ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
    return !m;
  }
  f.addEventListener('input', (e) => { if (!tried) return; const k = e.target.name; if (k in rules) check(k); });
  f.addEventListener('change', (e) => { if (!tried) return; const k = e.target.name; if (k in rules) check(k); });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    tried = true;
    const bad = Object.keys(rules).filter((k) => !check(k));
    const done = $('#com-done');
    if (bad.length) {
      done.hidden = true;
      (bad[0] === 'themes' ? $('input[name="themes"]', f) : F(bad[0])).focus();
      return;
    }
    const themes = $$('input[name="themes"]:checked', f).map((i) => i.value.toLowerCase());
    const withSaved = $('#c-saved').checked && state.saved.length;
    const fmt = F('format').options[F('format').selectedIndex].textContent.toLowerCase();
    done.innerHTML = `<h3>Thank you, ${esc(F('name').value.trim().split(' ')[0])}.</h3><p>This is a portfolio demo, so your request was <strong>not sent</strong> and nothing has been ordered.</p><p>A real cartographer would now draft a ${esc(fmt)} following ${esc(themes.join(', '))}${withSaved ? `, built around your ${state.saved.length} saved ${state.saved.length === 1 ? 'place' : 'places'}` : ''}.</p>`;
    done.hidden = false;
    done.focus();
  });
})();

/* ---------- boot the map ---------- */
renderTray();
renderLedger();
refreshFilter();
savedChanged(false);
window.wayfarerReady = true;

const mapHost = $('#map');
let hintT = 0;
createMap({
  host: mapHost,
  svgEl: $('#map-svg'),
  places: PLACES,
  reduced,
  onSelect: (id, fromBlank) => { if (fromBlank) { if (!card.hidden) select(null); return; } select(id); },
  onCoords: (ll) => { $('#map-coords').textContent = ll ? fmtLatLon(ll[1], ll[0]) : '— · —'; },
  onWheelHint: () => { mapHost.parentElement.classList.add('is-hint'); clearTimeout(hintT); hintT = setTimeout(() => mapHost.parentElement.classList.remove('is-hint'), 1600); },
}).then((m) => {
  map = m;
  $('#map-loading').hidden = true;
  mapHost.classList.add('is-ready');
  mapCalls.splice(0).forEach((fn) => fn(m));
  m.setSaved(state.saved, false);
  m.setFilter(new Set(PLACES.filter(matchesTheme).map((p) => p.id)));
  if (state.current) m.select(state.current);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => m.resize(), 150); });
});

mapHost.addEventListener('keydown', (e) => {
  if (e.target !== mapHost || !map) return;
  const P = 90;
  const keys = { ArrowLeft: () => map.pan(P, 0), ArrowRight: () => map.pan(-P, 0), ArrowUp: () => map.pan(0, P), ArrowDown: () => map.pan(0, -P), '+': () => map.zoomBy(1.6), '=': () => map.zoomBy(1.6), '-': () => map.zoomBy(1 / 1.6), _: () => map.zoomBy(1 / 1.6), 0: () => map.reset() };
  if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
});
$('#z-in').addEventListener('click', () => withMap((m) => m.zoomBy(1.6)));
$('#z-out').addEventListener('click', () => withMap((m) => m.zoomBy(1 / 1.6)));
$('#z-reset').addEventListener('click', () => {
  withMap((m) => m.reset());
  state.region = 'World';
  const w = $('#region-opts input[value="World"]');
  if (w) w.checked = true;
  $('#map-plate').textContent = 'Plate I · The World';
  refreshFilter();
});
