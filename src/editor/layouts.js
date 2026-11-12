/* Built-in layout templates and helpers for applying layouts to pages. */
import { CONFIG } from './config.js';
import { createItem } from './model.js';
import { store } from './store.js';

export const BUILTIN_TEMPLATES = [
  { id:'landing', name:'Landing page', description:'Hero, highlights, numbers, a quote and a call to action.', build(){ const mk = createItem; return [
    mk('Hero',{title:'Say what you do in one clear line',description:'Follow it with a sentence or two about who it’s for and why it matters. Short enough to read at a glance.',buttons:[{label:'Get started',href:'#',variant:'primary'},{label:'Learn more',href:'#',variant:'outline'}],visual:'pattern',background:'tinted'}),
    mk('Heading',{text:'What you get',size:'xl',align:'center',padding:'m'}),
    mk('Grid',{numColumns:3,gap:20,padding:'s'},{items:[
      mk('Card',{icon:'bolt',title:'First benefit',description:'One concrete thing people get, in a sentence.'}),
      mk('Card',{icon:'shield',title:'Second benefit',description:'Another specific reason to care, with a detail that makes it believable.'}),
      mk('Card',{icon:'heart',title:'Third benefit',description:'The one people mention most when they recommend you.'})]}),
    mk('Stats',{items:[{value:'120',label:'something you’ve counted'},{value:'4.9',label:'average rating'},{value:'24h',label:'typical reply time'}]}),
    mk('Testimonial',{quote:'A short quote from a real customer that names the problem you solved for them.',name:'Customer name',role:'Their role or context',align:'center',padding:'l'}),
    mk('Flex',{direction:'column',align:'center',justify:'center',gap:12,padding:'l'},{items:[
      mk('Heading',{text:'Ready when you are',size:'l',align:'center',padding:'none'}),
      mk('Button',{label:'Get in touch',variant:'primary',size:'l',align:'center',padding:'s'})]})
  ]; } },
  { id:'about', name:'About', description:'Your story, a photo, what you care about and a quote.', build(){ const mk = createItem; return [
    mk('Hero',{title:'About us',description:'Where you started, what you do now, and the people who make it happen.',align:'center',visual:'none',background:'plain',padding:'s',buttons:[]}),
    mk('Image',{aspect:'21/9',radius:20,caption:'',padding:'s'}),
    mk('Text',{text:'Tell the story in a few short paragraphs. Start with the moment it began, then what changed, then what you’re working on today.',size:'l',maxWidth:680,padding:'m'}),
    mk('Heading',{text:'What we care about',size:'l',padding:'s'}),
    mk('Grid',{numColumns:3,gap:20,padding:'s'},{items:[
      mk('Card',{icon:'heart',title:'A value',description:'What it means in practice, in one or two sentences.',mode:'outline'}),
      mk('Card',{icon:'users',title:'Another value',description:'A specific example of how it shows up in your work.',mode:'outline'}),
      mk('Card',{icon:'globe',title:'A third value',description:'Why it matters to the people you work with.',mode:'outline'})]}),
    mk('Testimonial',{quote:'A line from someone who knows you well, about what makes you different.',name:'Their name',role:'How they know you',padding:'l'})
  ]; } },
  { id:'contact', name:'Contact', description:'A heading, ways to reach you and common questions.', build(){ const mk = createItem; return [
    mk('Heading',{text:'Get in touch',level:'h1',size:'xxl',padding:'m'}),
    mk('Text',{text:'The quickest way to reach us, and what to expect after you do.',size:'l',color:'muted',padding:'none'}),
    mk('Grid',{numColumns:3,gap:20,padding:'m'},{items:[
      mk('Card',{icon:'calendar',title:'Hours',description:'Monday to Friday, 9am–5pm'}),
      mk('Card',{icon:'globe',title:'Address',description:'Street and number\nTown and postcode'}),
      mk('Card',{icon:'users',title:'Email',description:'hello@example.com\nWe reply within a working day.'})]}),
    mk('Html',{padding:'m',html:'<div style="max-width:720px"><h2 class="s-h hs-m" style="margin-bottom:12px">Common questions</h2><details style="border-top:1.5px solid #e4e4e2;padding:14px 0"><summary style="cursor:pointer;font-weight:600">A question people often ask</summary><p style="margin-top:8px;color:#5c5f68">A short, direct answer.</p></details><details style="border-top:1.5px solid #e4e4e2;border-bottom:1.5px solid #e4e4e2;padding:14px 0"><summary style="cursor:pointer;font-weight:600">Another common question</summary><p style="margin-top:8px;color:#5c5f68">Another short answer.</p></details></div>'})
  ]; } },
  { id:'article', name:'Article', description:'Long-form text with an image and a pull quote.', build(){ const mk = createItem; return [
    mk('Heading',{text:'A headline that makes the point',level:'h1',size:'xxl',padding:'m'}),
    mk('Text',{text:'Published 12 November 2026 · 4 minute read',size:'s',color:'muted',padding:'none'}),
    mk('Image',{aspect:'16/9',radius:16,caption:'A caption that says what the picture shows.',padding:'m'}),
    mk('Text',{text:'Open with the most interesting fact or moment. Readers decide in the first two lines whether to keep going.',size:'l',maxWidth:680,padding:'s'}),
    mk('Text',{text:'Then explain it. Use short paragraphs, one idea each, and plain words.',maxWidth:680,padding:'s'}),
    mk('Testimonial',{quote:'A pull quote that captures the article in one sentence.',name:'Who said it',role:'Their role',padding:'m'}),
    mk('Text',{text:'Close with what the reader should do or think about next.',maxWidth:680,padding:'s'}),
    mk('Divider',{padding:'m'})
  ]; } }
];
export const builtinCache = {};
export function builtinContent(id){ if (!builtinCache[id]){ const t = BUILTIN_TEMPLATES.find(t => t.id === id); builtinCache[id] = t ? t.build() : null; } return builtinCache[id]; }
export function layoutSource(src){
  const i = (src || '').indexOf(':'); if (i < 0) return null;
  const kind = src.slice(0, i), id = src.slice(i + 1);
  let content = null;
  if (kind === 'b') content = builtinContent(id);
  else if (kind === 't'){ const t = store.project.templates.find(t => t.id === id); content = t && t.content; }
  else if (kind === 'p'){ const p = store.project.pages.find(p => p.id === id); content = p && p.content; }
  return content ? JSON.parse(JSON.stringify(content)) : null;
}
export function layoutName(src){
  const i = (src || '').indexOf(':'); const kind = src.slice(0, i), id = src.slice(i + 1);
  const x = kind === 'b' ? BUILTIN_TEMPLATES.find(t => t.id === id) : kind === 't' ? store.project.templates.find(t => t.id === id) : store.project.pages.find(p => p.id === id);
  return x ? (x.name || x.title || 'Untitled') : 'layout';
}
export function blockSummary(content){
  if (!content || !content.length) return 'Empty';
  return content.slice(0, 4).map(it => CONFIG[it.type].label).join(' · ') + (content.length > 4 ? ' · …' : '');
}
export function stripOf(content){
  return (content || []).slice(0, 6).map(it => ['Hero','Heading'].includes(it.type) ? 'big' : ['Button','Stats'].includes(it.type) ? 'acc' : '');
}
