# WAYFARER — The World, Reimagined

A cartographic discovery site that opens straight onto the map. WAYFARER is an atlas you can travel: filter 25 places by theme and region, open any of them for a culture note, save the ones that call to you, and watch your route draw itself across the world in vermilion ink.

Production URL: `https://wayfarer-indol.vercel.app`

> Fictional concept brand, built as a portfolio project. The map is illustrative and not for navigation; culture notes are general context, not rules.

---

## Concept

Travel inspiration usually arrives as a feed. WAYFARER treats it as cartography. The first screen is "Plate I", a full atlas spread: the legend column on the left (title, themes, regions and the place index) and the plate on the right, with engraved water lines around every coastline, a working coordinate readout and a saved-route tray along the bottom edge. Everything below the map is another plate in the same atlas: collections, culture notes, a route ledger, a key to the map and a commission form.

## Brand & positioning

- **Name and promise:** a wayfarer travels on foot and by curiosity. The brand offers context before consumption: where a place is, what it is known for, and how to behave well there.
- **Tone:** plain, warm and respectful. Notes are phrased as context ("you might meet…"), never as rules, and no culture is exoticised.
- **Conversion:** "Commission a personal atlas", a printed atlas built from the visitor's saved places. It is a demo and nothing is sent.

## Audience

Independent travellers and armchair explorers (25–60) who plan with maps open, read before they go and like to see the whole route at once.

## Art direction

- **Palette:** paper `#F4EFE3`, ink `#1E2A38`, vermilion `#E4572E`, teal `#2A9D8F`. Text-safe variants: vermilion-deep `#B8401D` and teal-deep `#1F7368` for small text and filled buttons; ink-soft `#4A5868` for secondary text.
- **Materials:** paper grain over everything (multiplied SVG noise), double-rule frames like atlas plates, offset "printed" shadows on buttons, cards and the ledger sheet.
- **The plate:** Equal Earth projection; land in warm stone with a faint engraved hatch; coastlines haloed by six alternating teal and paper strokes to make copperplate water lines; dashed borders; dotted graticule. All map strokes use `vector-effect: non-scaling-stroke`, so the linework stays crisp at every zoom.
- **Logo:** an original mark (a wire globe crossed by a dotted vermilion route from a teal origin) with a stroke-built geometric wordmark. `favicon.svg` is the globe on a paper tile.

## Typography

- **Bowlby One** for display: headings, plate titles, numerals and the ledger totals.
- **Familjen Grotesk** (400–700) for text, labels, coordinates (tabular figures) and controls.
- Loaded from Google Fonts with `display=swap`. Headings use `text-wrap: balance` and never break mid-word.

## Motion language

- **Ink draw:** routes and plotted collections draw themselves along the great circle (stroke-dash animation, compensated for the current zoom).
- **Fly-to:** region filters, list selections and "Fit route" glide the camera with a cubic in-out ease.
- **Stamp:** section headings land like a rubber stamp (overshoot and a tiny rotation), culture notes and map keys are inked in left to right, and collection plates settle onto the table.
- **Pins:** the active pin pulses with a halo; saved pins grow and turn teal with their stop number.
- **Compass rose:** turns slowly with scroll in the "Reading the atlas" plate.

## Signature interaction: how to use it

1. **Choose a theme** (Coast, Mountains, Food, Craft, Sacred, Night skies, Rail). Non-matching pins fade and the place index narrows.
2. **Choose a region** (World, Americas, Europe, Africa, Asia, Oceania). The map flies to it and the plate label updates.
3. **Open a place** from the index or by clicking its pin. The card shows its number, coordinates, themes and a culture note. Step through places with ‹ ›.
4. **Save to route.** Each saved place becomes a numbered teal stop, the route is drawn in vermilion along great circles, and the tray shows the total distance. Remove stops from the tray, "Fit route" to frame them, or clear them.
5. **Collections:** "Plot on the atlas" draws a curated line in dotted teal and frames it; "Save all stops" appends it to your route. Drag a globe (mouse or pen) to turn it.
6. **Culture notes:** every note links to the places where it applies; each link flies the atlas there and opens the card.
7. **Route ledger:** each leg's great-circle distance and initial compass bearing, plus the total. Reverse the order in one click.
8. **Map controls:** drag to pan; use the buttons, or Ctrl / ⌘ + scroll, to zoom (plain scrolling keeps scrolling the page); on touch screens, use two fingers. With the map focused, arrow keys pan, + / − zoom and 0 resets.
9. Saved places persist for the session (`sessionStorage`) and appear in the header count.

## Tech

- Static HTML, CSS and native ES modules, no build step.
- d3 v7.9.0 (`+esm` from jsDelivr) for `geoEqualEarth`, `geoPath`, `geoGraticule`, `geoOrthographic` (collection globes), zoom and transitions; topojson-client 3.1.0; world-atlas 2.0.2 `countries-110m.json` (Natural Earth).
- `data.js` (places, collections, notes, great-circle maths), `map.js` (map, fallback chart, globes), `main.js` (UI and state).
- If the CDN modules or data cannot load, a designed fallback chart (equirectangular graticule with pins and straight route lines) keeps every feature except zoom working.

## Local development

```bash
npx serve .
```

Open the printed local URL (ES modules need HTTP). An internet connection is needed for the map libraries and data.

## Accessibility & performance

- Landmarks, one `<h1>`, skip link and visible focus styles throughout. The place index is the keyboard path to every pin; the map region itself is focusable with keyboard panning and zooming, and has written instructions.
- Live regions announce filter counts, route distance and toasts; the place card is labelled and closes with Escape.
- `prefers-reduced-motion: reduce`: fly-to becomes an instant jump, no ink-draw or stamp animations, no rose rotation or pin pulse.
- Pins are kept at constant screen size by counter-scaling; strokes are non-scaling, so zooming costs a single transform update. The 110m dataset keeps the land path light; collection globes are drawn only when that section approaches the viewport.
- Text contrast meets WCAG AA: bright vermilion and teal are reserved for large display text, strokes and fills.

## Known limitations

- 1:110m data omits or simplifies small islands (the Faroe Islands, for example, appear only as a pin).
- Distances assume a spherical Earth and straight great-circle legs; real journeys are longer.
- The saved route lasts for the browser session only, by design.
- Globe rotation is mouse/pen only so that touch swipes keep scrolling the collection track.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
