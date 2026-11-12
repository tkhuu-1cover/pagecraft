/* Google Fonts catalog, on-demand font loading and per-block font previews. */
import { reactive } from 'vue';
import { store } from './store.js';

/* ---------------- Google Fonts ---------------- */
/* Snapshot of popular Google Fonts families. Any other family can be loaded by name from the picker. */
export const FONT_GROUPS = {
  'sans-serif':'Inter|Roboto|Open Sans|Lato|Montserrat|Poppins|Source Sans 3|Nunito|Nunito Sans|Raleway|Work Sans|Rubik|Noto Sans|Manrope|DM Sans|Plus Jakarta Sans|Outfit|Figtree|Mulish|Karla|Barlow|IBM Plex Sans|Public Sans|Archivo|Space Grotesk|Sora|Lexend|Urbanist|Onest|Geist|Bricolage Grotesque|Schibsted Grotesk|Hanken Grotesk|Instrument Sans|Albert Sans|Red Hat Display|Red Hat Text|Kumbh Sans|Jost|Quicksand|Josefin Sans|Cabin|Heebo|Assistant|Fira Sans|PT Sans|Ubuntu|Oswald|Exo 2|Titillium Web|Overpass|Be Vietnam Pro|Epilogue|Syne|Familjen Grotesk|Golos Text|Atkinson Hyperlegible|Commissioner|Inter Tight|Libre Franklin|Chivo|Encode Sans|Asap|Varela Round|Wix Madefor Display',
  serif:'Playfair Display|Merriweather|Lora|PT Serif|Libre Baskerville|EB Garamond|Cormorant Garamond|Cormorant|Crimson Text|Crimson Pro|Source Serif 4|Noto Serif|Roboto Serif|Fraunces|DM Serif Display|DM Serif Text|Spectral|Bitter|Domine|Cardo|Alegreya|Newsreader|Literata|Instrument Serif|Young Serif|Gloock|Bodoni Moda|Libre Caslon Text|Zilla Slab|Roboto Slab|Arvo|Rokkitt|Prata|Gelasio|Petrona|Brygada 1918|Besley|IBM Plex Serif|Vollkorn|Old Standard TT|Josefin Slab|Noticia Text|Frank Ruhl Libre',
  display:'Bebas Neue|Anton|Archivo Black|Righteous|Lobster|Abril Fatface|Alfa Slab One|Bungee|Bungee Shade|Fredoka|Comfortaa|Monoton|Rubik Mono One|Black Ops One|Bowlby One|Chango|Dela Gothic One|Shrikhand|Titan One|Luckiest Guy|Bangers|Russo One|Passion One|Fjalla One|Staatliches|Unbounded|Big Shoulders Display|Lilita One|Paytone One|Ultra|Rammetto One|Bagel Fat One|Press Start 2P|Silkscreen',
  handwriting:'Pacifico|Dancing Script|Caveat|Satisfy|Great Vibes|Sacramento|Shadows Into Light|Indie Flower|Permanent Marker|Amatic SC|Kalam|Patrick Hand|Gochi Hand|Homemade Apple|Allura|Parisienne|Yellowtail|Kaushan Script|Courgette|Cookie|Gloria Hallelujah|Rock Salt|Nothing You Could Do|Reenie Beanie|Covered By Your Grace|Architects Daughter|Caveat Brush|Mrs Saint Delafield|Pinyon Script|Alex Brush',
  monospace:'JetBrains Mono|Fira Code|Source Code Pro|IBM Plex Mono|Roboto Mono|Space Mono|Inconsolata|DM Mono|Geist Mono|Ubuntu Mono|Courier Prime|Martian Mono|Red Hat Mono|Overpass Mono|Azeret Mono|Major Mono Display|Victor Mono|Anonymous Pro|Cousine|Noto Sans Mono|Xanh Mono|Spline Sans Mono|VT323'
};
export const fontCatalog = reactive([]);
export const fontIndex = {};
export function addCatalogFont(family, category){
  const k = family.toLowerCase(); if (fontIndex[k]) return fontIndex[k];
  const e = { family, category }; fontIndex[k] = e; fontCatalog.push(e); return e;
}
for (const [cat, list] of Object.entries(FONT_GROUPS)) list.split('|').forEach(f => addCatalogFont(f, cat));
export const findFont = f => f ? fontIndex[String(f).toLowerCase()] : null;
export const GENERIC = { 'sans-serif':'system-ui, sans-serif', serif:'Georgia, serif', display:'system-ui, sans-serif', handwriting:'cursive', monospace:'ui-monospace, monospace', other:'system-ui, sans-serif' };
export function fontStack(f){ if (!f) return ''; const e = findFont(f); return '"' + String(f).replace(/["\\]/g, '') + '", ' + GENERIC[e ? e.category : 'other']; }
export const fontState = reactive({ full: { 'Bricolage Grotesque':'ok', 'Fraunces':'ok', 'Geist':'ok', 'Geist Mono':'ok' }, preview: {} });
export const fontPending = {};
export const fontUrls = {};
export const encFamily = f => encodeURIComponent(f).replace(/%20/g, '+');
export function addSheet(url, before){
  return new Promise(res => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url;
    let done = false;
    const fin = ok => { if (done) return; done = true; clearTimeout(t); if (!ok) l.remove(); res(ok); };
    const t = setTimeout(() => fin(false), 10000);
    l.onload = () => fin(true); l.onerror = () => fin(false);
    if (before) document.head.insertBefore(l, before); else document.head.appendChild(l);
  });
}
/* Loads the full font (regular, bold, italic where available). Resolves true when Google Fonts has the family. */
export function loadFont(family){
  if (!family) return Promise.resolve(true);
  const st = fontState.full[family];
  if (st === 'ok') return Promise.resolve(true);
  if (st === 'error') return Promise.resolve(false);
  if (fontPending[family]) return fontPending[family];
  fontState.full[family] = 'loading';
  const base = 'https://fonts.googleapis.com/css2?family=' + encFamily(family);
  const urls = [base + ':ital,wght@0,400;0,700;1,400&display=swap', base + ':wght@400;700&display=swap', base + '&display=swap'];
  return fontPending[family] = (async () => {
    let ok = false;
    for (const u of urls){ if (await addSheet(u)){ ok = true; fontUrls[family] = u; break; } }
    fontState.full[family] = ok ? 'ok' : 'error';
    if (ok) addCatalogFont(family, 'other');
    delete fontPending[family];
    return ok;
  })();
}
/* Lightweight previews: only the glyphs needed to draw each family's own name, batched. */
export const previewQueue = new Set(); let previewTimer = null;
export function queuePreview(family){
  if (!family || fontState.full[family] === 'ok' || fontState.preview[family]) return;
  previewQueue.add(family); clearTimeout(previewTimer); previewTimer = setTimeout(flushPreview, 120);
}
export function flushPreview(){
  const fams = [...previewQueue]; previewQueue.clear();
  for (let i = 0; i < fams.length; i += 12) loadPreviewBatch(fams.slice(i, i + 12));
}
export async function loadPreviewBatch(fams){
  fams.forEach(f => fontState.preview[f] = 'loading');
  const chars = [...new Set(fams.join(''))].join('');
  const url = 'https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + encFamily(f)).join('&') + '&text=' + encodeURIComponent(chars) + '&display=block';
  const ok = await addSheet(url, document.getElementById('font-preview-anchor'));
  if (ok) fams.forEach(f => fontState.preview[f] = 'ok');
  else if (fams.length > 1) fams.forEach(f => loadPreviewBatch([f]));
  else fontState.preview[fams[0]] = 'error';
}
export function shownValue(obj, name){ const p = store.fontPreview; return p && p.obj === obj && p.name === name ? p.family : obj[name]; }
export function loadUsedFonts(){
  const set = new Set(); const r = store.project.settings;
  [r.headFont, r.bodyFont].forEach(f => f && set.add(f));
  const walk = l => l.forEach(it => { if (it.props.font) set.add(it.props.font); if (it.zones) for (const z in it.zones) walk(it.zones[z]); });
  store.project.pages.forEach(p => walk(p.content));
  set.forEach(f => loadFont(f));
}
