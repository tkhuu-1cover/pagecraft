/* The reactive editor store, tree helpers, selection, and drag-and-drop maths. */
import { reactive, nextTick } from 'vue';
import { clone, uid } from './config.js';
import { createItem, demoProject, normalizeProject } from './model.js';

/* ---------------- store ---------------- */
export const STORAGE_KEY = 'pagecraft:site:v2';
export const OLD_STORAGE_KEY = 'pagecraft:page:v1';
export function loadInitial(){
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return normalizeProject(JSON.parse(s)); } catch (e) {}
  try {
    const s = localStorage.getItem(OLD_STORAGE_KEY);
    if (s){ const demo = demoProject(); const old = normalizeProject(JSON.parse(s)); demo.settings = old.settings; demo.pages[0].content = old.pages[0].content; demo.pages[0].title = old.pages[0].title; return demo; }
  } catch (e) {}
  return demoProject();
}
export const store = reactive({
  project: loadInitial(), pageId: null, layoutId: null, pendingApply: null, codeMode: false,
  get data(){
    if (this.layoutId){ const t = this.project.templates.find(t => t.id === this.layoutId); if (t) return t; }
    const ps = this.project.pages; return ps.find(p => p.id === this.pageId) || ps[0];
  },
  selectedId: null, hoverId: null, editingId: null,
  viewport: 'desktop', preview: false, fontPreview: null, aiOpen: false,
  drag: null, dropTarget: null,
  canUndo: false, canRedo: false, saved: '', toast: ''
});

export function findItem(id, list = store.data.content, parent = null){
  if (!id) return null;
  for (let i = 0; i < list.length; i++){
    const it = list[i];
    if (it.id === id) return { item: it, list, index: i, parent };
    if (it.zones) for (const z in it.zones){ const r = findItem(id, it.zones[z], it); if (r) return r; }
  }
  return null;
}
export function pathTo(id, list = store.data.content, acc = []){
  for (const it of list){
    if (it.id === id) return [...acc, it];
    if (it.zones) for (const z in it.zones){ const p = pathTo(id, it.zones[z], [...acc, it]); if (p) return p; }
  }
  return null;
}
export function getZone(key){
  if (key === 'root') return store.data.content;
  const i = key.lastIndexOf(':'); const r = findItem(key.slice(0, i));
  return r && r.item.zones ? r.item.zones[key.slice(i + 1)] : null;
}
export function reId(it){ it.id = uid(); if (it.zones) for (const z in it.zones) it.zones[z].forEach(reId); return it; }

export let toastTimer;
export function toast(msg){ store.toast = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => store.toast = '', 2200); }
export function select(id){ store.selectedId = id || null; }
export function goToPage(id){
  if (!store.project.pages.some(p => p.id === id)) return;
  store.layoutId = null; store.pageId = id; store.selectedId = null; store.hoverId = null; store.editingId = null;
  nextTick(() => { const c = document.querySelector('.canvas'); if (c) c.scrollTop = 0; });
}
export function scrollToItem(id){
  nextTick(() => { const el = document.querySelector('[data-item-id="' + id + '"]'); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
}
export function moveBy(id, d){
  const r = findItem(id); if (!r) return; const j = r.index + d;
  if (j < 0 || j >= r.list.length) return;
  const [x] = r.list.splice(r.index, 1); r.list.splice(j, 0, x);
}
export function duplicateItem(id){
  const r = findItem(id); if (!r) return;
  const c = reId(clone(r.item)); r.list.splice(r.index + 1, 0, c); select(c.id); scrollToItem(c.id);
}
export function removeItem(id){
  const r = findItem(id); if (!r) return;
  r.list.splice(r.index, 1);
  if (!findItem(store.selectedId)) store.selectedId = null;
}
export function insertNew(type){
  const item = createItem(type);
  const r = findItem(store.selectedId);
  if (r) r.list.splice(r.index + 1, 0, item); else store.data.content.push(item);
  select(item.id); scrollToItem(item.id);
}
export function endDrag(){ store.drag = null; store.dropTarget = null; }
export function performDrop(){
  const t = store.dropTarget, d = store.drag;
  if (!t || !d) return;
  const list = getZone(t.zone); if (!list) return;
  if (d.kind === 'new'){
    const item = createItem(d.type); list.splice(t.index, 0, item); select(item.id);
  } else {
    const loc = findItem(d.id); if (!loc) return;
    let idx = t.index;
    if (loc.list === list && loc.index < idx) idx--;
    loc.list.splice(loc.index, 1); list.splice(idx, 0, loc.item); select(loc.item.id);
  }
}
export function computeDrop(e, zoneEl, zoneKey, axis){
  const kids = Array.from(zoneEl.children).filter(n => n.classList.contains('blk'));
  const zr = zoneEl.getBoundingClientRect();
  if (!kids.length) return { zone: zoneKey, index: 0, line: null };
  const rects = kids.map(k => k.getBoundingClientRect());
  if (axis === 'y'){
    let idx = kids.length;
    for (let i = 0; i < rects.length; i++){ if (e.clientY < rects[i].top + rects[i].height / 2){ idx = i; break; } }
    let y;
    if (idx === 0) y = rects[0].top - zr.top;
    else if (idx === rects.length) y = rects[idx - 1].bottom - zr.top;
    else y = (rects[idx - 1].bottom + rects[idx].top) / 2 - zr.top;
    return { zone: zoneKey, index: idx, line: { top: Math.round(y - 2), left: 0, width: Math.round(zr.width), height: 4 } };
  }
  let best = 0, bd = Infinity;
  rects.forEach((r, i) => {
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    const dist = dx * dx + dy * dy * 4;
    if (dist < bd){ bd = dist; best = i; }
  });
  const r = rects[best];
  const before = e.clientX < r.left + r.width / 2;
  const x = before ? r.left - zr.left - 6 : r.right - zr.left + 2;
  return { zone: zoneKey, index: before ? best : best + 1, line: { top: Math.round(r.top - zr.top), left: Math.round(x), width: 4, height: Math.round(r.height) } };
}
