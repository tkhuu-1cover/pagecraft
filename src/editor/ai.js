/* The assistant: prompt building, Claude access, and applying returned operations. */
import { reactive } from 'vue';
import { CONFIG, clone, opts, uid } from './config.js';
import { PAGE_FIELDS, SAFE_PAGE_ID, SITE_DEFAULTS, SITE_FIELDS, uniqueSlug } from './model.js';
import { findItem, getZone, pathTo, store } from './store.js';

/* Optional: your own AI endpoint for use outside claude.ai (see .env.example). */
export const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT;

/* ---------------- AI assistant ---------------- */
export const IMG_PH = '[uploaded image]';
export const SAFE_ID = /^[A-Za-z0-9_-]{1,40}$/;
export let sampleFn = null;
export const ai = reactive({ status: 'loading' });
(async () => {
  try {
    if (AI_ENDPOINT) return;
    if (!window.claude || typeof window.claude.use !== 'function'){ ai.status = 'unavailable'; return; }
    const s = await window.claude.use('sample');
    if (s){ sampleFn = s; ai.status = 'ready'; } else ai.status = 'unavailable';
  } catch (e) { ai.status = 'unavailable'; }
})();
export function describeField(f){
  switch (f.type){
    case 'text': case 'textarea': return 'string';
    case 'code': return 'string (code)';
    case 'number': return 'number' + (f.min != null || f.max != null ? ' ' + (f.min ?? '') + '..' + (f.max ?? '') : '');
    case 'select': case 'radio': return f.options.map(o => JSON.stringify(o.value)).join('|');
    case 'color': return 'hex color';
    case 'image': return 'image data URL (user uploads only; never set it)';
    case 'font': return 'Google Fonts family name, or "" to inherit';
    case 'link': return 'URL, or "page:<pageId>" to link to a page of this site';
    case 'slug': return 'url-safe slug';
    case 'array': return '[{' + Object.entries(f.arrayFields).map(([k, a]) => k + ':' + describeField(a)).join(', ') + '}]';
  }
  return 'any';
}
export function aiRules(){
  const blocks = Object.entries(CONFIG).map(([t, c]) => '- ' + t + (c.zones ? ' (container; children go in zones.items)' : '') + ': ' +
    Object.entries(c.fields).filter(([k]) => k !== 'css').map(([k, f]) => k + '=' + describeField(f)).join('; ')).join('\n');
  const site = Object.entries(SITE_FIELDS).map(([k, f]) => k + '=' + describeField(f)).join('; ');
  const pageF = Object.entries(PAGE_FIELDS).map(([k, f]) => k + '=' + describeField(f)).join('; ');
  return [
    'You are the assistant built into Pagecraft, a visual page editor. The user asks for changes to their web page and you make them by returning operations the editor applies. You can do anything the editor’s panels can do and more: when no block or setting covers a request, use the escape hatches below.',
    '',
    'SITE MODEL',
    'The site has shared settings and several pages. You are editing the CURRENT PAGE: block operations (update, insert, remove, move, replaceContent) apply only to it.',
    'page = {"id","title","slug","inNav","content":[item,...]}. The first page is the home page. item = {"id","type","props","zones"?}. Containers (Grid, Flex) hold children in zones.items.',
    'Zone keys: "root" is the top level of the current page; "<containerId>:items" is inside a container.',
    'Links: link props (Button href, Hero button href) take "page:<pageId>" to link to a page of this site, or any URL. In Html blocks write <a href="page:<pageId>">. The site header and footer list every page with inNav true automatically.',
    '',
    'BLOCK TYPES (prop=allowed values)',
    blocks,
    'Every block also has css=string (see escape hatch 1).',
    'SITE SETTINGS (shared by all pages; change with updateSite): ' + site,
    'PAGE PROPS (current page; change with updatePage): ' + pageF,
    '',
    'ESCAPE HATCHES',
    '1. Block "css": CSS nested under that block’s wrapper element. Bare declarations style the wrapper; use & for nested rules, e.g. "transition:transform .2s; &:hover{transform:translateY(-4px)} & .s-card{box-shadow:0 10px 30px rgb(0 0 0/.08)}".',
    '2. Site setting customCss (via updateSite): site-wide CSS for every page. Start every selector with .site. Put @keyframes and shared rules here.',
    '3. "Html" block: any HTML with inline styles and classes, for structures no block can make (pricing tables, FAQs with <details>, timelines, comparison tables, badges, inline SVG illustrations, forms). Scripts, <style>, iframes and on* attributes are removed. Remote images and all network requests are blocked: use inline SVG, CSS gradients or emoji. Use <details>/<summary> and CSS for interactivity. Style it with the block css prop or customCss.',
    'Responsive rules: the canvas is a CSS container named site, so write @container site (max-width: 600px) {...}, never @media.',
    'Theme variables on .site: --sa (accent color), --site-head (heading font stack), --site-body (body font stack). Use var(--sa) for brand color.',
    'Existing classes: .s-nav .s-brand .s-footer .s-container .s-section .s-block .s-hero (.bg-plain/.bg-tinted/.bg-dark) .s-hero-title .s-hero-desc .s-hero-actions .s-hero-visual .s-btn (.v-primary/.v-secondary/.v-outline/.v-ghost) .s-h .s-text .s-card (.m-card/.m-outline/.m-flat) .s-card-icon .s-grid .s-flex .s-stats .s-stat .s-stat-v .s-stat-l .s-logos .s-logo .s-quote .s-avatar .s-img .s-hr .s-html. The .site element has a white background and dark text; a dark theme needs customCss on .site and the classes above.',
    'Fonts: any Google Fonts family name works in font, headFont and bodyFont; it loads automatically.',
    '',
    'GUIDELINES',
    '- Prefer real blocks and their props so the user can keep editing; use css, customCss or Html only when needed.',
    '- "This", "it" or "here" usually means the SELECTED BLOCK. Insert new sections after the selected block when it makes sense.',
    '- Write specific, natural copy in sentence case with typographic apostrophes and quotes, matching the page’s subject and tone.',
    '- Keep existing ids. Give new items short ids (letters, digits, - or _) only when later operations refer to them.',
    '- Values shown as "[uploaded image]" are user uploads: leave them alone.',
    '- If a request is unclear, make the most reasonable change and say what you assumed. If it can’t be done here (it needs a server or JavaScript), say so and make the closest thing.',
    '',
    'OUTPUT: reply with ONLY a JSON object: {"reply": string, "operations": [...]}',
    'reply: 1-3 short plain sentences to the user about what you changed, or the answer to their question. No markdown.',
    'operations, applied in order:',
    '{"op":"update","id":"<id>","props":{...}}  merge props into a block (arrays are replaced whole)',
    '{"op":"insert","zone":"root" or "<id>:items","index":<number; omit to append>,"item":{"type":"Grid","props":{...},"zones":{"items":[...]}}}  items may contain nested children',
    '{"op":"remove","id":"<id>"}',
    '{"op":"move","id":"<id>","zone":"<zone key>","index":<number>}',
    '{"op":"updateSite","props":{...}}  site settings',
    '{"op":"updatePage","props":{"title","slug","inNav"}}  current page props',
    '{"op":"createPage","page":{"id":"<short id>","title":"..","slug":"..","inNav":true,"content":[...]}}  adds a new page (it doesn\u2019t switch to it); give an id so you can link to it in later steps',
    '{"op":"replaceContent","content":[...]}  only for full-page rewrites',
    'Use an empty operations array when only answering a question.'
  ].join('\n');
}
export function pageForPrompt(){
  const p = store.data, ps = store.project.pages;
  return JSON.stringify({
    settings: store.project.settings,
    pages: ps.map((x, i) => ({ id: x.id, title: x.title, slug: x.slug, inNav: x.inNav, home: i === 0 })),
    editing: store.layoutId ? 'a reusable layout template named "' + p.name + '" (not a page; updatePage does not apply). Build it as a reusable structure with clear placeholder copy.' : 'a page',
    currentPage: { id: p.id, title: p.title || p.name, slug: p.slug, inNav: p.inNav, content: p.content }
  }, (k, v) => typeof v === 'string' && v.startsWith('data:') ? IMG_PH : v);
}
export function allIds(){
  const s = new Set(); const w = l => l.forEach(it => { s.add(it.id); if (it.zones) for (const z in it.zones) w(it.zones[z]); });
  w(store.data.content); return s;
}
export function mergeProps(target, incoming, defaults){
  if (!incoming || typeof incoming !== 'object') return;
  for (const k of Object.keys(incoming)){
    if (!(k in defaults)) continue;
    const v = incoming[k];
    if (v === IMG_PH || v === undefined) continue;
    target[k] = (v && typeof v === 'object') ? clone(v) : v;
  }
}
export function aiItems(list, used){
  return (Array.isArray(list) ? list : []).filter(it => it && CONFIG[it.type]).map(it => {
    const def = CONFIG[it.type];
    const id = typeof it.id === 'string' && SAFE_ID.test(it.id) && !used.has(it.id) ? it.id : uid();
    used.add(id);
    const out = { id, type: it.type, props: clone(def.defaults) };
    mergeProps(out.props, it.props, def.defaults);
    if (def.zones){ out.zones = {}; def.zones.forEach(z => out.zones[z] = aiItems(it.zones && it.zones[z], used)); }
    return out;
  });
}
export const clampIndex = (i, len) => (i === undefined || i === null || isNaN(+i)) ? len : Math.max(0, Math.min(len, Math.round(+i)));
export function applyOps(ops){
  const changes = [], errors = []; let focus = null;
  const lbl = it => CONFIG[it.type].label;
  for (const op of ops){
    try {
      if (!op || typeof op !== 'object') throw 'malformed step';
      switch (op.op){
        case 'update': {
          const r = findItem(String(op.id)); if (!r) throw 'no block with id ' + op.id;
          mergeProps(r.item.props, op.props, CONFIG[r.item.type].defaults);
          changes.push('Updated ' + lbl(r.item)); focus = focus || r.item.id; break;
        }
        case 'insert': {
          const list = getZone(String(op.zone || 'root')); if (!list) throw 'no place called ' + op.zone;
          const items = aiItems([op.item], allIds()); if (!items.length) throw 'unknown block type ' + (op.item && op.item.type);
          list.splice(clampIndex(op.index, list.length), 0, ...items);
          changes.push('Added ' + lbl(items[0])); focus = focus || items[0].id; break;
        }
        case 'remove': {
          const r = findItem(String(op.id)); if (!r) throw 'no block with id ' + op.id;
          r.list.splice(r.index, 1); changes.push('Removed ' + lbl(r.item)); break;
        }
        case 'move': {
          const r = findItem(String(op.id)); if (!r) throw 'no block with id ' + op.id;
          const key = String(op.zone || 'root'); const list = getZone(key); if (!list) throw 'no place called ' + op.zone;
          if (key !== 'root'){ const p = pathTo(key.slice(0, key.lastIndexOf(':'))); if (p && p.some(x => x.id === r.item.id)) throw 'can’t move a block inside itself'; }
          let idx = clampIndex(op.index, list.length);
          if (r.list === list && r.index < idx) idx--;
          r.list.splice(r.index, 1); list.splice(idx, 0, r.item);
          changes.push('Moved ' + lbl(r.item)); focus = focus || r.item.id; break;
        }
        case 'updateRoot': case 'updateSite': {
          mergeProps(store.project.settings, op.props, SITE_DEFAULTS); changes.push('Updated site settings'); break;
        }
        case 'updatePage': {
          const pg = store.data, pr = op.props || {};
          if (pr.title !== undefined) pg.title = String(pr.title);
          if (pr.slug !== undefined && store.project.pages[0] !== pg) pg.slug = uniqueSlug(pr.slug, pg.id);
          if (pr.inNav !== undefined) pg.inNav = !!pr.inNav;
          changes.push('Updated page “' + pg.title + '”'); break;
        }
        case 'createPage': {
          const src = op.page || op;
          const title = String(src.title || 'New page');
          const id = typeof src.id === 'string' && SAFE_PAGE_ID.test(src.id) && !store.project.pages.some(p => p.id === src.id) ? src.id : uid();
          store.project.pages.push({ id, title, slug: uniqueSlug(src.slug || title), inNav: src.inNav !== false, content: aiItems(src.content, new Set()) });
          changes.push('Created page “' + title + '”'); break;
        }
        case 'replaceContent': {
          const items = aiItems(op.content, new Set()); if (!items.length) throw 'the new page had no valid blocks';
          store.data.content = items; changes.push('Rebuilt the page (' + items.length + ' sections)'); break;
        }
        default: throw 'unknown step “' + op.op + '”';
      }
    } catch (e) { errors.push(String(e)); }
  }
  if (store.selectedId && !findItem(store.selectedId)) store.selectedId = null;
  if (focus && !findItem(focus)) focus = null;
  return { changes, errors, focus };
}
/* Outside claude.ai there is no window.claude, so the assistant can talk to your own backend instead.
   Set VITE_AI_ENDPOINT (see .env.example and server/ai-proxy.mjs). The endpoint receives
   { messages: [{ role, content }] } and must answer with the JSON object the prompt asks for. */
if (AI_ENDPOINT){
  sampleFn = {
    async json(input, opts = {}){
      let r;
      try { r = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: input }), signal: opts.signal }); }
      catch (e) { throw { code: e && e.name === 'AbortError' ? 'cancelled' : 'network' }; }
      if (r.status === 429) throw { code: 'rate_limited' };
      if (!r.ok) throw { code: 'server_error' };
      try { return await r.json(); } catch (e) { throw { code: 'invalid_json' }; }
    }
  };
  ai.status = 'ready';
}
export const AI_ERRORS = {
  rate_limited: 'You’ve hit a usage limit. Wait a little, then try again.',
  invalid_json: 'The answer couldn’t be read as page changes. Try again, or ask for something smaller.',
  prompt_too_large: 'This page is too large to send in one go. Ask about one section at a time.',
  refused: 'Claude declined that request. Try rephrasing it.',
  empty_completion: 'Claude returned nothing. Try asking in a different way.',
  session_expired: 'Your Claude session expired. Sign in again, then retry.'
};
export const AI_OFF = ['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'];
