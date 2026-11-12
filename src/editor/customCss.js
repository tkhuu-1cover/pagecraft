/* Per-block and site-wide custom CSS, plus HTML sanitizing for Custom HTML blocks. */
import { watch } from 'vue';
import { store } from './store.js';

/* ---------------- custom CSS + HTML ---------------- */
export function sanitizeHtml(html){
  const doc = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html');
  doc.body.querySelectorAll('script,style,iframe,frame,frameset,object,embed,link,meta,base,noscript').forEach(n => n.remove());
  doc.body.querySelectorAll('*').forEach(el => {
    for (const a of Array.from(el.attributes)){
      const n = a.name.toLowerCase(), v = a.value.replace(/\s+/g, '').toLowerCase();
      if (n.startsWith('on') || (['href','src','action','formaction','xlink:href','srcdoc'].includes(n) && (v.startsWith('javascript:') || n === 'srcdoc'))) el.removeAttribute(a.name);
    }
  });
  return doc.body.innerHTML;
}
export function buildCustomCss(){
  let css = ''; const r = store.project.settings;
  if (r.customCss && String(r.customCss).trim()) css += r.customCss + '\n';
  const walk = l => l.forEach(it => {
    if (it.props.css && String(it.props.css).trim()) css += '.site [data-item-id="' + String(it.id).replace(/["\\]/g, '') + '"] {\n' + it.props.css + '\n}\n';
    if (it.zones) for (const z in it.zones) walk(it.zones[z]);
  });
  walk(store.data.content);
  return css.replace(/<\/?style/gi, '');
}
export const customStyleEl = document.createElement('style');
customStyleEl.id = 'pagecraft-custom-css';
document.head.appendChild(customStyleEl);
watch(buildCustomCss, css => { customStyleEl.textContent = css; }, { immediate: true });
