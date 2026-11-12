/* Site/page data model: fields, defaults, the demo site, and JSON normalization. */
import { CONFIG, clone, uid } from './config.js';
import { store } from './store.js';

['Heading','Text','Button','Hero','Card','Grid','Flex','Stats','Testimonial'].forEach(t => {
  const c = CONFIG[t];
  c.fields = Object.assign({}, c.fields, { font: { type:'font', label: c.zones ? 'Font for blocks inside' : 'Font', allowInherit: true } });
  c.defaults.font = '';
});
export const CSS_FIELD = { type:'code', label:'Custom CSS', placeholder:'box-shadow: 0 10px 30px rgb(0 0 0 / .08);\n&:hover { transform: translateY(-4px); }\n& .s-card { border-radius: 4px; }' };
for (const t in CONFIG){ CONFIG[t].fields = Object.assign({}, CONFIG[t].fields, { css: CSS_FIELD }); CONFIG[t].defaults.css = ''; }
export const SITE_FIELDS = {
  siteName:{type:'text',label:'Site name'},
  accent:{type:'color',label:'Accent color'},
  headFont:{type:'font',label:'Heading font'},
  bodyFont:{type:'font',label:'Body font'},
  showHeader:{type:'radio',label:'Site header',options:[{label:'Show',value:true},{label:'Hide',value:false}]},
  showFooter:{type:'radio',label:'Site footer',options:[{label:'Show',value:true},{label:'Hide',value:false}]},
  customCss:{type:'code',label:'Custom CSS (whole site)',placeholder:'.site .s-card { transition: transform .2s; }\n.site .s-card:hover { transform: translateY(-4px); }'}
};
export const SITE_DEFAULTS = {siteName:'Spoke & Mend',accent:'#1f7a4d',headFont:'Bricolage Grotesque',bodyFont:'Geist',showHeader:true,showFooter:true,customCss:''};
export const PAGE_FIELDS = {
  title:{type:'text',label:'Page title'},
  slug:{type:'slug',label:'Address'},
  inNav:{type:'radio',label:'Site navigation',options:[{label:'Show',value:true},{label:'Hide',value:false}]}
};
export const PAGE_DEFAULTS = {title:'Untitled',slug:'',inNav:true};
export const LAYOUT_FIELDS = {
  name:{type:'text',label:'Layout name'},
  description:{type:'textarea',label:'Description'}
};
export function slugify(t){ return String(t || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48); }
export function uniqueSlug(base, exceptId, pages){
  pages = pages || store.project.pages;
  let b = slugify(base) || 'page', s = b, n = 2;
  while (pages.some(p => p.slug === s && p.id !== exceptId)) s = b + '-' + n++;
  return s;
}
export function pagePath(p){ return store.project.pages[0] === p ? '/' : '/' + (p.slug || ''); }

export function createItem(type, props, zones){
  const def = CONFIG[type];
  const it = { id: uid(), type, props: Object.assign(clone(def.defaults), props || {}) };
  if (def.zones){ it.zones = {}; def.zones.forEach(z => it.zones[z] = (zones && zones[z]) || []); }
  return it;
}
export function demoProject(){
  const mk = createItem;
  const home = { id:'home', title:'Home', slug:'home', inNav:true, content:[
    mk('Hero',{title:'Fix your own bike, with a little help',description:'Spoke & Mend is a volunteer-run workshop in the old tram depot. Borrow our tools and stands, ask a mechanic when you’re stuck, and ride home on something you fixed yourself.',buttons:[{label:'See workshop hours',href:'page:visit',variant:'primary'},{label:'Browse classes',href:'page:classes',variant:'outline'}],visual:'pattern',background:'tinted',padding:'m'}),
    mk('Logos',{title:'Supported by neighbours and local businesses',items:[{name:'Tramline Coffee'},{name:'Harbour Hardware'},{name:'oakfield library'},{name:'Greenway Trust'},{name:'Kettle & Co.'},{name:'North St Market'}],padding:'m'}),
    mk('Space',{size:'24'}),
    mk('Heading',{text:'Three ways to get rolling',size:'xl',align:'center',padding:'none'}),
    mk('Text',{text:'Whether you’ve never held a spoke wrench or you’re truing your tenth wheel, there’s a bench for you.',align:'center',color:'muted',size:'l',maxWidth:560,padding:'s'}),
    mk('Grid',{numColumns:3,gap:20,padding:'m'},{items:[
      mk('Card',{icon:'wrench',title:'Open workshop',description:'Drop in Tuesday to Saturday. Stands, tools and spare parts are free to use, and mechanics are on hand to point you the right way.'}),
      mk('Card',{icon:'calendar',title:'Repair classes',description:'Six-week evening courses covering brakes, gears, wheels and bearings. Small groups, one bike each.'}),
      mk('Card',{icon:'bike',title:'Refurbished bikes',description:'Donated bikes, rebuilt by volunteers and sold at cost. Every one leaves with a safety check and a lock.'})
    ]}),
    mk('Stats',{title:'Since we opened the doors',items:[{value:'2,400',label:'bikes rebuilt since 2019'},{value:'85',label:'volunteer mechanics'},{value:'£0',label:'to use the workshop'},{value:'6',label:'days open each week'}],padding:'m'}),
    mk('Testimonial',{quote:'I came in with a wheel that wobbled like a dinner plate. Two hours later I’d trued it myself and learned what every tool on the wall was for.',name:'Priya Natarajan',role:'Member since 2022',align:'center',padding:'l'}),
    mk('Flex',{direction:'column',align:'center',justify:'center',gap:12,padding:'l'},{items:[
      mk('Heading',{text:'Got a bike gathering dust?',size:'l',align:'center',padding:'none'}),
      mk('Text',{text:'We collect donations every Saturday morning. Any condition, any size.',align:'center',color:'muted',padding:'none'}),
      mk('Button',{label:'Book a drop-off',href:'page:visit',variant:'primary',size:'l',align:'center',padding:'s'})
    ]})
  ]};
  const classes = { id:'classes', title:'Classes', slug:'classes', inNav:true, content:[
    mk('Hero',{title:'Repair classes',description:'Six-week evening courses in a workshop that smells faintly of chain oil. Small groups, real bikes, and one mechanic for every four learners.',align:'center',visual:'none',background:'plain',padding:'s',buttons:[{label:'Ask about the next course',href:'page:visit',variant:'primary'}]}),
    mk('Grid',{numColumns:2,gap:20,padding:'m'},{items:[
      mk('Card',{icon:'wrench',title:'Beginner mechanics',description:'Tuesdays, 6:30–8:30pm. Punctures, brakes, gears and a proper safety check. No experience needed.'}),
      mk('Card',{icon:'bike',title:'Wheel building',description:'Thursdays, 6:30–8:30pm. Lace, tension and true a wheel from a bare rim and hub. Bring patience.'}),
      mk('Card',{icon:'layers',title:'Bearings and headsets',description:'Saturdays, 10am–12pm. The fiddly bits: hubs, bottom brackets, headsets, and when to replace them.'}),
      mk('Card',{icon:'users',title:'Women and non-binary night',description:'Last Friday of the month, 6–9pm. Open workshop with a mechanic on hand and nobody hovering.'})
    ]}),
    mk('Stats',{title:'',items:[{value:'£60',label:'per six-week course'},{value:'4',label:'learners per mechanic'},{value:'Free',label:'for members on low incomes'}],padding:'m'}),
    mk('Flex',{direction:'column',align:'center',justify:'center',gap:12,padding:'l'},{items:[
      mk('Heading',{text:'Not sure which one fits?',size:'l',align:'center',padding:'none'}),
      mk('Text',{text:'Drop in during open workshop and we’ll look at your bike together.',align:'center',color:'muted',padding:'none'}),
      mk('Button',{label:'Find the workshop',href:'page:visit',variant:'primary',size:'l',align:'center',padding:'s'})
    ]})
  ]};
  const visit = { id:'visit', title:'Visit us', slug:'visit', inNav:true, content:[
    mk('Heading',{text:'Visit the workshop',level:'h1',size:'xxl',padding:'m'}),
    mk('Text',{text:'We’re in the old tram depot on Harbour Road, round the back past the bike racks. Step-free access through the side door.',size:'l',color:'muted',maxWidth:620,padding:'none'}),
    mk('Grid',{numColumns:3,gap:20,padding:'m'},{items:[
      mk('Card',{icon:'calendar',title:'Opening hours',description:'Tuesday to Friday, 4–8pm\nSaturday, 10am–5pm\nClosed Sunday and Monday'}),
      mk('Card',{icon:'globe',title:'Find us',description:'Unit 4, Old Tram Depot\nHarbour Road\nTen minutes’ walk from Central Station'}),
      mk('Card',{icon:'heart',title:'Donate a bike',description:'Saturday mornings, 10am–12pm. Any condition, any size. We’ll strip what we can’t rebuild for parts.'})
    ]}),
    mk('Html',{padding:'m',html:'<div style="max-width:720px"><h2 class="s-h hs-m" style="margin-bottom:12px">Before you come</h2><details style="border-top:1.5px solid #e4e4e2;padding:14px 0"><summary style="cursor:pointer;font-weight:600">Do I need to book?</summary><p style="margin-top:8px;color:#5c5f68">Not for open workshop. Turn up, sign in at the front bench and we’ll find you a stand.</p></details><details style="border-top:1.5px solid #e4e4e2;padding:14px 0"><summary style="cursor:pointer;font-weight:600">What should I bring?</summary><p style="margin-top:8px;color:#5c5f68">Your bike, and any parts you’ve already bought. We have the tools, the grease and a box of spare bolts.</p></details><details style="border-top:1.5px solid #e4e4e2;border-bottom:1.5px solid #e4e4e2;padding:14px 0"><summary style="cursor:pointer;font-weight:600">Is it really free?</summary><p style="margin-top:8px;color:#5c5f68">Yes. Donations keep the lights on, and parts from our shelves are sold at cost.</p></details></div>'})
  ]};
  return { settings: clone(SITE_DEFAULTS), pages:[home, classes, visit], templates:[] };
}
export function normalizeList(list){
  return (Array.isArray(list) ? list : []).filter(it => it && CONFIG[it.type]).map(it => {
    const def = CONFIG[it.type];
    const out = { id: typeof it.id === 'string' ? it.id : uid(), type: it.type, props: Object.assign(clone(def.defaults), it.props || {}) };
    if (def.zones){ out.zones = {}; def.zones.forEach(z => out.zones[z] = normalizeList(it.zones && it.zones[z])); }
    return out;
  });
}
export function pickKeys(o, defaults){ const out = {}; for (const k in defaults) if (o && k in o) out[k] = o[k]; return out; }
export function normalizePage(p, i){
  p = p || {};
  return { id: typeof p.id === 'string' && SAFE_PAGE_ID.test(p.id) ? p.id : uid(), title: String(p.title || 'Untitled'), slug: slugify(p.slug || p.title) || ('page-' + (i + 1)), inNav: p.inNav !== false, content: normalizeList(p.content) };
}
export const SAFE_PAGE_ID = /^[A-Za-z0-9_-]{1,40}$/;
export function normalizeProject(d){
  if (!d || typeof d !== 'object') throw new Error('That JSON isn’t a Pagecraft site or page.');
  if (Array.isArray(d.pages)){
    const pages = d.pages.filter(Boolean).map(normalizePage);
    if (!pages.length) throw new Error('The site needs at least one page.');
    const ids = new Set(), slugs = new Set();
    pages.forEach(p => {
      if (ids.has(p.id)) p.id = uid(); ids.add(p.id);
      let b = p.slug, sl = b, n = 2; while (slugs.has(sl)) sl = b + '-' + n++; p.slug = sl; slugs.add(sl);
    });
    const templates = (Array.isArray(d.templates) ? d.templates : []).filter(t => t && t.name).map(t => ({ id: typeof t.id === 'string' ? t.id : uid(), name: String(t.name), description: String(t.description || ''), content: normalizeList(t.content) }));
    return { settings: Object.assign(clone(SITE_DEFAULTS), pickKeys(d.settings, SITE_DEFAULTS)), pages, templates };
  }
  if (Array.isArray(d.content)){
    const r = (d.root && d.root.props) || {};
    return { settings: Object.assign(clone(SITE_DEFAULTS), pickKeys(r, SITE_DEFAULTS)), pages:[normalizePage({ id:'home', title: r.title || 'Home', slug:'home', content: d.content }, 0)], templates: [] };
  }
  throw new Error('The JSON needs a "pages" array, or a single page’s "content" array.');
}
