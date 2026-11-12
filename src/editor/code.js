/* Code mode: Monaco loading and the source files it shows. */
import { store } from './store.js';
import { cleanSiteMarkup, escHtml, exportFileName, exportFontLinks } from './exporter.js';

/* Monaco is loaded on demand from a CDN with its AMD loader, so it never weighs down the main bundle.
   To self-host, copy node_modules/monaco-editor/min to /public/monaco and point this at '/monaco/'. */
export const MONACO_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/';
export let monacoPromise = null;
export function loadMonaco(){
  if (window.monaco && window.monaco.editor) return Promise.resolve(window.monaco);
  if (monacoPromise) return monacoPromise;
  monacoPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout')), 25000);
    window.MonacoEnvironment = { getWorkerUrl(){
      return 'data:text/javascript;charset=utf-8,' + encodeURIComponent("self.MonacoEnvironment={baseUrl:'" + MONACO_BASE + "'};importScripts('" + MONACO_BASE + "vs/base/worker/workerMain.js');");
    } };
    const sc = document.createElement('script');
    sc.src = MONACO_BASE + 'vs/loader.js';
    sc.onload = () => {
      try {
        window.require.config({ paths: { vs: MONACO_BASE + 'vs' } });
        window.require(['vs/editor/editor.main'], () => resolve(window.monaco), err => reject(err));
      } catch (e) { reject(e); }
    };
    sc.onerror = () => reject(new Error('load'));
    document.head.appendChild(sc);
  });
  monacoPromise.catch(() => { monacoPromise = null; });
  return monacoPromise;
}
export function editorIsDark(){
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export function prettyHtml(html){
  const tokens = html.split(/(<[^>]+>)/g).filter(t => t.trim() !== '');
  const voids = /^<(meta|link|br|hr|img|input|source|area|col|wbr|!)/i;
  let depth = 0; const out = [];
  for (const t of tokens){
    if (t.startsWith('</')){ depth = Math.max(0, depth - 1); out.push('  '.repeat(depth) + t); }
    else if (t.startsWith('<') && !voids.test(t) && !t.endsWith('/>')){ out.push('  '.repeat(depth) + t); depth++; }
    else out.push('  '.repeat(depth) + t.trim());
  }
  return out.join('\n').replace(/(<([a-z0-9-]+)[^>\n]*>)\n\s*([^<\n]*)\n\s*(<\/\2>)/gi, '$1$3$4');
}
export function pageDocument(p, body, fonts){
  const s = store.project.settings, pages = store.project.pages;
  const title = pages[0] === p ? (s.siteName || p.title) : ((p.title || p.name || 'Untitled') + ' — ' + s.siteName);
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + escHtml(title) + '</title>\n' + fonts + '<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
}
export const CODE_FILES = [
  { id: 'page', label: 'page.json', icon: 'file', lang: 'json', hint: 'This page’s settings and blocks' },
  { id: 'css', label: 'custom.css', icon: 'css', lang: 'css', hint: 'Site-wide CSS for every page' },
  { id: 'html', label: 'page.html', icon: 'code', lang: 'html', readOnly: true, hint: 'What Export site writes for this page' },
  { id: 'site', label: 'site.json', icon: 'pages', lang: 'json', hint: 'Every page, layout and setting' }
];
export function codeSource(id){
  const p = store.data;
  if (id === 'page') return JSON.stringify(store.layoutId
    ? { name: p.name, description: p.description || '', content: p.content }
    : { title: p.title, slug: p.slug, inNav: p.inNav, content: p.content }, null, 2);
  if (id === 'css') return store.project.settings.customCss || '';
  if (id === 'site') return JSON.stringify(store.project, null, 2);
  if (id === 'html'){
    const site = document.querySelector('.canvas .site'); if (!site) return '';
    const fileById = Object.fromEntries(store.project.pages.map(x => [x.id, exportFileName(x)]));
    const body = cleanSiteMarkup(site.cloneNode(true), fileById);
    return prettyHtml(pageDocument(p, body, exportFontLinks()));
  }
  return '';
}
