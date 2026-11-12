/* Static-site export: renders every page, writes styles.css, and zips it all. */
import SITE_CSS from '../styles/site.css?raw';
import { nextTick } from 'vue';
import { encFamily, fontState, fontUrls } from './fonts.js';
import { store } from './store.js';
import { flush } from './history.js';

/* ---------------- export a working static site ---------------- */
export let downloadsApi = null;
(async () => { try { if (window.claude && typeof window.claude.use === 'function') downloadsApi = await window.claude.use('downloads'); } catch (e) {} })();
export const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(b){ let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
/* Minimal ZIP writer (stored, no compression) — every unzip tool and OS can open it. */
export function makeZip(files){
  const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const f of files){
    const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
    ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
export async function saveFile(filename, blob){
  if (downloadsApi){ await downloadsApi.save({ filename, data: blob }); return; }
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export const escHtml = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function exportFileName(p){
  if (store.project.pages[0] === p) return 'index.html';
  const b = p.slug || p.id; return (b === 'index' ? 'index-page' : b) + '.html';
}
export function usedFonts(){
  const set = new Set(); const r = store.project.settings;
  [r.headFont, r.bodyFont].forEach(f => f && set.add(f));
  const walk = l => l.forEach(it => { if (it.props.font) set.add(it.props.font); if (it.zones) for (const z in it.zones) walk(it.zones[z]); });
  store.project.pages.forEach(p => walk(p.content));
  return set;
}
export function exportFontLinks(){
  const base = document.querySelector('link[href*="fonts.googleapis.com/css2?family=Bricolage"]');
  const urls = base ? [base.href] : [];
  const preloaded = ['Bricolage Grotesque', 'Fraunces', 'Geist', 'Geist Mono'];
  usedFonts().forEach(f => { if (!preloaded.includes(f) && fontState.full[f] !== 'error') urls.push(fontUrls[f] || ('https://fonts.googleapis.com/css2?family=' + encFamily(f) + '&display=swap')); });
  return '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    urls.map(u => '<link rel="stylesheet" href="' + escHtml(u) + '">').join('\n') + '\n';
}
export function exportCss(){
  const siteCss = SITE_CSS.replace(/^\.canvas\.edit .*$/gm, '');
  let custom = ''; const r = store.project.settings;
  if (r.customCss && String(r.customCss).trim()) custom += r.customCss + '\n';
  const walk = l => l.forEach(it => {
    if (it.props.css && String(it.props.css).trim()) custom += '.site [data-item-id="' + String(it.id).replace(/["\\]/g, '') + '"] {\n' + it.props.css + '\n}\n';
    if (it.zones) for (const z in it.zones) walk(it.zones[z]);
  });
  store.project.pages.forEach(p => walk(p.content));
  return '/* ' + r.siteName + ' — generated by Pagecraft */\n' +
    '*,*::before,*::after{box-sizing:border-box}\nhtml,body{margin:0;background:#fff}\nbody{-webkit-font-smoothing:antialiased}\nimg,svg{max-width:100%}\n' +
    '.zone{position:relative}\n.zone.root-zone{flex:1}\n.blk{position:relative}\n' +
    siteCss + '\n.site{container:site / inline-size;min-height:100vh;border-radius:0}\n' +
    (custom ? '\n/* Custom CSS */\n' + custom.replace(/<\/?style/gi, '') : '');
}
export function cleanSiteMarkup(el, fileById){
  el.querySelectorAll('.zone-empty,.drop-line,.blk-label,.blk-actions,.s-img-ph').forEach(n => n.remove());
  el.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  el.querySelectorAll('[spellcheck]').forEach(n => n.removeAttribute('spellcheck'));
  el.querySelectorAll('[draggable]').forEach(n => n.removeAttribute('draggable'));
  el.querySelectorAll('.blk').forEach(n => n.classList.remove('selected', 'hover', 'dragging'));
  el.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h.startsWith('page:')) a.setAttribute('href', fileById[h.slice(5)] || '#');
    else if (/^https?:\/\//i.test(h)){ a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  });
  el.querySelectorAll('[title="Home page"]').forEach(n => n.removeAttribute('title'));
  return el.outerHTML.replace(/<!--[\s\S]*?-->/g, '');
}
export async function buildSiteFiles(){
  flush();
  const pages = store.project.pages, s = store.project.settings;
  const fileById = Object.fromEntries(pages.map(p => [p.id, exportFileName(p)]));
  const prev = { pageId: store.pageId, sel: store.selectedId, layoutId: store.layoutId };
  store.layoutId = null; store.selectedId = null; store.hoverId = null; store.editingId = null;
  const files = [], fonts = exportFontLinks();
  try {
    for (const p of pages){
      store.pageId = p.id;
      await nextTick(); await nextTick();
      const site = document.querySelector('.canvas .site');
      if (!site) throw new Error('render');
      const body = cleanSiteMarkup(site.cloneNode(true), fileById);
      const title = pages[0] === p ? (s.siteName || p.title) : (p.title + ' — ' + s.siteName);
      files.push({ name: fileById[p.id], data: '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + escHtml(title) + '</title>\n' + fonts + '<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n' + body + '\n</body>\n</html>\n' });
    }
  } finally {
    store.pageId = prev.pageId; store.layoutId = prev.layoutId; store.selectedId = prev.sel;
  }
  files.push({ name: 'styles.css', data: exportCss() });
  files.push({ name: 'site.json', data: JSON.stringify(store.project, null, 2) });
  files.push({ name: 'README.txt', data: [
    s.siteName + ' — exported from Pagecraft on ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    '',
    'Open index.html in a browser to see the site. Each page is a plain HTML file and they all share styles.css,',
    'so you can upload this whole folder to any static web host as it is. No build step or server code is needed.',
    '',
    'Pages',
    ...pages.map(p => '  ' + fileById[p.id] + '  —  ' + p.title),
    '',
    'Other files',
    '  styles.css  —  styles for every page, including your custom CSS',
    '  site.json   —  the editable site. Import it into Pagecraft (… menu → Import JSON) to keep editing.',
    '',
    'Fonts load from Google Fonts, so pages need an internet connection to show the right typefaces.',
    ''
  ].join('\n') });
  return files;
}
