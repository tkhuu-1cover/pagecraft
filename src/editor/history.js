/* Undo/redo history and localStorage persistence. */
import { watch } from 'vue';
import { loadUsedFonts } from './fonts.js';
import { STORAGE_KEY, findItem, store } from './store.js';

/* ---------------- history + persistence ---------------- */
export const hist = { stack: [], pg: [], index: -1 };
export let recordTimer = null;
export function persist(s){
  try { localStorage.setItem(STORAGE_KEY, s); store.saved = 'Saved'; }
  catch (e) { store.saved = 'Not saved — storage is full'; }
}
export function record(){
  recordTimer = null;
  const s = JSON.stringify(store.project);
  if (s === hist.stack[hist.index]) return;
  hist.stack.splice(hist.index + 1); hist.pg.splice(hist.index + 1);
  hist.stack.push(s); hist.pg.push(store.data.id);
  if (hist.stack.length > 150){ hist.stack.shift(); hist.pg.shift(); }
  hist.index = hist.stack.length - 1;
  store.canUndo = hist.index > 0; store.canRedo = false;
  persist(s);
  loadUsedFonts();
}
export function flush(){ if (recordTimer){ clearTimeout(recordTimer); record(); } }
export function restore(i, pageHint){
  hist.index = i;
  store.project = JSON.parse(hist.stack[i]);
  if (pageHint && store.project.pages.some(p => p.id === pageHint)){ store.pageId = pageHint; store.layoutId = null; }
  else if (pageHint && store.project.templates.some(t => t.id === pageHint)) store.layoutId = pageHint;
  if (!store.project.pages.some(p => p.id === store.pageId)) store.pageId = store.project.pages[0].id;
  if (store.layoutId && !store.project.templates.some(t => t.id === store.layoutId)) store.layoutId = null;
  store.canUndo = i > 0; store.canRedo = i < hist.stack.length - 1;
  if (!findItem(store.selectedId)) store.selectedId = null;
  persist(hist.stack[i]);
  loadUsedFonts();
}
export function undo(){ flush(); if (hist.index > 0) restore(hist.index - 1, hist.pg[hist.index]); }
export function redo(){ flush(); if (hist.index < hist.stack.length - 1) restore(hist.index + 1, hist.pg[hist.index + 1]); }
record();
watch(() => store.project, () => { clearTimeout(recordTimer); recordTimer = setTimeout(record, 350); }, { deep: true });

export function readImage(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1600, s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85));
      };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
