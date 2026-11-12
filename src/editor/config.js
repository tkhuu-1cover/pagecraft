/* Block definitions, field options, icons and palette thumbnails. */

/* ---------------- helpers ---------------- */
export const uid = () => Math.random().toString(36).slice(2, 10);
export const clone = o => JSON.parse(JSON.stringify(o));
export const opts = (...a) => a.map(x => Array.isArray(x) ? { label: x[0], value: x[1] } : { label: x, value: x });
export const ALIGN3 = opts(['Left','left'],['Center','center'],['Right','right']);
export const ALIGN2 = opts(['Left','left'],['Center','center']);
export const BLOCK_PAD = opts(['None','none'],['S','s'],['M','m'],['L','l']);
export const SECTION_PAD = opts(['None','none'],['S','s'],['M','m'],['L','l']);
export const BTN_VARIANTS = opts(['Primary','primary'],['Dark','secondary'],['Outline','outline'],['Link','ghost']);
export const CARD_ICONS = opts(['None','none'],['Wrench','wrench'],['Calendar','calendar'],['Bike','bike'],['Bolt','bolt'],['Layers','layers'],['Shield','shield'],['Heart','heart'],['Globe','globe'],['Star','star'],['People','users']);

export const ICONS = {
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  redo:'<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
  monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  tablet:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  down:'<path d="M12 5v14M19 12l-7 7-7-7"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  square:'<rect x="4" y="4" width="16" height="16" rx="3"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  import:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  'panel-left':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
  'panel-right':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  parent:'<path d="M14 9 9 4 4 9"/><path d="M20 20h-7a4 4 0 0 1-4-4V4"/>',
  grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sparkle:'<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
  send:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  pages:'<path d="M15 2H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6z"/><path d="M15 2v4h4"/><path d="M9 22h10a2 2 0 0 0 2-2V9" stroke-opacity=".5"/>',
  home:'<path d="M3 11 12 3l9 8"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  template:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
  'eye-off':'<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  css:'<path d="M4 3h16l-1.5 16L12 21l-6.5-2z"/><path d="M8 8h8l-.5 6-3.5 1-3.5-1"/>',
  apply:'<path d="M4 4h10v10H4z"/><path d="M10 20h10V10"/><path d="m14 14 6 6"/>',
  blocks:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><path d="M17.25 14v6.5M14 17.25h6.5"/>',
  outline:'<path d="M9 6h12M13 12h8M13 18h8"/><circle cx="4.5" cy="6" r="1.5"/><path d="M4.5 7.5V16a2 2 0 0 0 2 2H9M4.5 12H9"/>',
  grid:'<rect x="3" y="5" width="5" height="14" rx="1.2"/><rect x="9.5" y="5" width="5" height="14" rx="1.2"/><rect x="16" y="5" width="5" height="14" rx="1.2"/>',
  flex:'<rect x="2.5" y="7" width="6" height="10" rx="1.5"/><rect x="10.5" y="7" width="4.5" height="10" rx="1.5"/><rect x="17" y="7" width="4.5" height="10" rx="1.5"/>',
  space:'<path d="M4 3h16M4 21h16M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3"/>',
  divider:'<path d="M3 12h18"/><path d="M7 6h10M7 18h6" stroke-opacity=".45"/>',
  heading:'<path d="M6 4v16M18 4v16M6 12h12"/>',
  text:'<path d="M4 6h16M4 10.5h16M4 15h16M4 19.5h9"/>',
  button:'<rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M8.5 12h7"/>',
  hero:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h7M7 12.5h4.5M7 16h3"/>',
  card:'<rect x="4" y="3" width="16" height="18" rx="2.5"/><rect x="8" y="7" width="4" height="4" rx="1"/><path d="M8 15h8M8 18h5"/>',
  chart:'<path d="M3 21h18M6.5 17v-5M12 17V6M17.5 17v-8"/>',
  shapes:'<circle cx="6" cy="12" r="3"/><rect x="10.5" y="9" width="6" height="6" rx="1"/><path d="M20 9l2.5 6h-5z"/>',
  quote:'<path d="M6 7h4v4c0 3-1.3 5-4 6M14 7h4v4c0 3-1.3 5-4 6"/>',
  layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9.5 21V9"/>',
  type:'<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
  cursor:'<path d="m5 4 6.5 16 2.3-6.7L20.5 11z"/>',
  panels:'<rect x="3" y="3" width="18" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="18" height="7.5" rx="1.5"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  bike:'<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M15 5h2.5l1 12"/><path d="m5.5 17 4-8h7l-4.5 8"/><path d="M8.5 6h3"/>',
  bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>'
};

/* ---------------- component config ---------------- */
export const CONFIG = {
  Heading: { label:'Heading', fields:{
      text:{type:'textarea',label:'Text'},
      level:{type:'select',label:'Tag',options:opts(['H1','h1'],['H2','h2'],['H3','h3'],['H4','h4'])},
      size:{type:'select',label:'Size',options:opts(['XXL','xxl'],['XL','xl'],['L','l'],['M','m'],['S','s'])},
      align:{type:'radio',label:'Alignment',options:ALIGN3},
      color:{type:'radio',label:'Color',options:opts(['Default','default'],['Accent','accent'],['Muted','muted'])},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{text:'Heading',level:'h2',size:'xl',align:'left',color:'default',padding:'s'} },
  Text: { label:'Text', fields:{
      text:{type:'textarea',label:'Text'},
      size:{type:'radio',label:'Size',options:opts(['S','s'],['M','m'],['L','l'])},
      align:{type:'radio',label:'Alignment',options:ALIGN3},
      color:{type:'radio',label:'Color',options:opts(['Default','default'],['Muted','muted'])},
      maxWidth:{type:'number',label:'Max width (px)',min:0,max:2000,step:20},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{text:'Write something your visitors need to know.',size:'m',align:'left',color:'default',maxWidth:640,padding:'s'} },
  Button: { label:'Button', fields:{
      label:{type:'text',label:'Label'},
      href:{type:'link',label:'Link'},
      variant:{type:'select',label:'Style',options:BTN_VARIANTS},
      size:{type:'radio',label:'Size',options:opts(['S','s'],['M','m'],['L','l'])},
      align:{type:'radio',label:'Alignment',options:ALIGN3},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{label:'Learn more',href:'#',variant:'primary',size:'m',align:'left',padding:'s'} },
  Hero: { label:'Hero', fields:{
      title:{type:'textarea',label:'Title'},
      description:{type:'textarea',label:'Description'},
      buttons:{type:'array',label:'Buttons',max:3,arrayFields:{
        label:{type:'text',label:'Label'},href:{type:'link',label:'Link'},variant:{type:'select',label:'Style',options:BTN_VARIANTS}},
        defaultItem:{label:'Button',href:'#',variant:'primary'},summary:i=>i.label},
      align:{type:'radio',label:'Alignment',options:ALIGN2},
      visual:{type:'radio',label:'Visual',options:opts(['None','none'],['Illustration','pattern'],['Image','image'])},
      image:{type:'image',label:'Image',showIf:p=>p.visual==='image'},
      background:{type:'radio',label:'Background',options:opts(['White','plain'],['Tinted','tinted'],['Dark','dark'])},
      padding:{type:'radio',label:'Vertical padding',options:opts(['S','s'],['M','m'],['L','l'])}
    }, defaults:{title:'A big, clear promise',description:'One or two sentences that tell visitors what this page is for and what to do next.',buttons:[{label:'Get started',href:'#',variant:'primary'}],align:'left',visual:'pattern',image:'',background:'plain',padding:'m'} },
  Card: { label:'Card', fields:{
      icon:{type:'select',label:'Icon',options:CARD_ICONS},
      title:{type:'text',label:'Title'},
      description:{type:'textarea',label:'Description'},
      mode:{type:'radio',label:'Style',options:opts(['Filled','card'],['Outline','outline'],['Flat','flat'])},
      align:{type:'radio',label:'Alignment',options:ALIGN2}
    }, defaults:{icon:'star',title:'Card title',description:'A short description of this feature or idea.',mode:'card',align:'left'} },
  Grid: { label:'Grid', zones:['items'], fields:{
      numColumns:{type:'number',label:'Columns',min:1,max:6},
      gap:{type:'number',label:'Gap (px)',min:0,max:120,step:4},
      padding:{type:'radio',label:'Vertical padding',options:SECTION_PAD}
    }, defaults:{numColumns:3,gap:20,padding:'m'} },
  Flex: { label:'Flex', zones:['items'], fields:{
      direction:{type:'radio',label:'Direction',options:opts(['Row','row'],['Column','column'])},
      justify:{type:'select',label:'Justify',options:opts(['Start','start'],['Center','center'],['End','end'],['Space between','between'])},
      align:{type:'select',label:'Align items',options:opts(['Start','start'],['Center','center'],['End','end'],['Stretch','stretch'])},
      gap:{type:'number',label:'Gap (px)',min:0,max:120,step:4},
      wrap:{type:'radio',label:'Wrap',options:[{label:'Wrap',value:true},{label:'No wrap',value:false}]},
      padding:{type:'radio',label:'Vertical padding',options:SECTION_PAD}
    }, defaults:{direction:'row',justify:'start',align:'center',gap:16,wrap:true,padding:'m'} },
  Stats: { label:'Stats', fields:{
      title:{type:'text',label:'Title (optional)'},
      items:{type:'array',label:'Stats',max:6,arrayFields:{value:{type:'text',label:'Value'},label:{type:'text',label:'Label'}},defaultItem:{value:'100',label:'Something counted'},summary:i=>i.value+' '+i.label},
      padding:{type:'radio',label:'Vertical padding',options:SECTION_PAD}
    }, defaults:{title:'',items:[{value:'1,000',label:'Things done'},{value:'50',label:'People involved'},{value:'12',label:'Years running'}],padding:'m'} },
  Logos: { label:'Logos', fields:{
      title:{type:'text',label:'Title'},
      items:{type:'array',label:'Names',max:10,arrayFields:{name:{type:'text',label:'Name'}},defaultItem:{name:'Company'},summary:i=>i.name},
      padding:{type:'radio',label:'Vertical padding',options:SECTION_PAD}
    }, defaults:{title:'Trusted by',items:[{name:'Acme'},{name:'Globex'},{name:'Initech'}],padding:'m'} },
  Testimonial: { label:'Testimonial', fields:{
      quote:{type:'textarea',label:'Quote'},
      name:{type:'text',label:'Name'},
      role:{type:'text',label:'Role'},
      align:{type:'radio',label:'Alignment',options:ALIGN2},
      padding:{type:'radio',label:'Vertical padding',options:SECTION_PAD}
    }, defaults:{quote:'This changed the way our team works.',name:'Alex Morgan',role:'Customer',align:'left',padding:'m'} },
  Image: { label:'Image', fields:{
      src:{type:'image',label:'Image'},
      alt:{type:'text',label:'Alt text'},
      aspect:{type:'select',label:'Aspect ratio',options:opts(['Wide 16:9','16/9'],['Cinema 21:9','21/9'],['Classic 4:3','4/3'],['Square 1:1','1/1'],['Portrait 3:4','3/4'])},
      radius:{type:'number',label:'Corner radius (px)',min:0,max:64},
      caption:{type:'text',label:'Caption'},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{src:'',alt:'',aspect:'16/9',radius:16,caption:'',padding:'s'} },
  Html: { label:'Custom HTML', fields:{
      html:{type:'code',label:'HTML',placeholder:'<div class="my-box">…</div>'},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{html:'<div style="padding:32px;border:1.5px dashed #c9c9cf;border-radius:14px;text-align:center;color:#6f727b">Custom HTML. Edit it in the panel, or ask the assistant to build something here.</div>',padding:'s'} },
  Space: { label:'Space', fields:{
      size:{type:'select',label:'Height',options:opts(['8px','8'],['16px','16'],['24px','24'],['32px','32'],['48px','48'],['64px','64'],['96px','96'],['128px','128'])}
    }, defaults:{size:'32'} },
  Divider: { label:'Divider', fields:{
      style:{type:'radio',label:'Style',options:opts(['Line','solid'],['Dashed','dashed'],['Accent','accent'])},
      padding:{type:'radio',label:'Vertical padding',options:BLOCK_PAD}
    }, defaults:{style:'solid',padding:'m'} }
};
export const CATEGORIES = [
  {name:'Layout',icon:'layout',types:['Grid','Flex','Space','Divider']},
  {name:'Typography',icon:'type',types:['Heading','Text']},
  {name:'Actions',icon:'cursor',types:['Button']},
  {name:'Sections',icon:'panels',types:['Hero','Card','Stats','Logos','Testimonial']},
  {name:'Media',icon:'image',types:['Image']},
  {name:'Advanced',icon:'code',types:['Html']}
];
export const BLOCK_ICONS = { Grid:'grid', Flex:'flex', Space:'space', Divider:'divider', Heading:'heading', Text:'text', Button:'button', Hero:'hero', Card:'card', Stats:'chart', Logos:'shapes', Testimonial:'quote', Image:'image', Html:'code' };
/* Mini wireframes for the Blocks palette (64×40). w/m/s = faint/medium/strong ink, a = accent, k = panel color, ln = stroke. */
export const BLOCK_THUMBS = {
  Grid:'<rect class="w" x="6" y="9" width="15" height="22" rx="2.5"/><rect class="w" x="24.5" y="9" width="15" height="22" rx="2.5"/><rect class="w" x="43" y="9" width="15" height="22" rx="2.5"/><rect class="m" x="9" y="13" width="9" height="2.5" rx="1.25"/><rect class="m" x="27.5" y="13" width="9" height="2.5" rx="1.25"/><rect class="m" x="46" y="13" width="9" height="2.5" rx="1.25"/>',
  Flex:'<rect class="w" x="6" y="11" width="14" height="13" rx="2.5"/><rect class="w" x="23" y="11" width="20" height="13" rx="2.5"/><rect class="w" x="46" y="11" width="12" height="13" rx="2.5"/><path class="ln" d="M8 31h48M52.5 28.5 56 31l-3.5 2.5"/>',
  Space:'<rect class="w" x="10" y="5" width="44" height="6" rx="2"/><rect class="w" x="10" y="29" width="44" height="6" rx="2"/><path class="ln" d="M32 14.5v11M29 17.5l3-3 3 3M29 22.5l3 3 3-3"/>',
  Divider:'<rect class="m" x="12" y="9" width="40" height="3" rx="1.5"/><path class="ln" d="M8 20h48"/><rect class="m" x="12" y="28" width="26" height="3" rx="1.5"/>',
  Heading:'<rect class="s" x="8" y="11" width="40" height="8" rx="2"/><rect class="w" x="8" y="24" width="30" height="3" rx="1.5"/>',
  Text:'<rect class="m" x="8" y="9" width="48" height="3" rx="1.5"/><rect class="m" x="8" y="15.5" width="44" height="3" rx="1.5"/><rect class="m" x="8" y="22" width="48" height="3" rx="1.5"/><rect class="m" x="8" y="28.5" width="28" height="3" rx="1.5"/>',
  Button:'<rect class="a" x="14" y="13" width="36" height="14" rx="7"/><rect class="k" x="23" y="18.5" width="18" height="3" rx="1.5"/>',
  Hero:'<rect class="w" x="4" y="4" width="56" height="32" rx="3"/><rect class="s" x="9" y="10" width="23" height="4" rx="1.5"/><rect class="s" x="9" y="16" width="16" height="4" rx="1.5"/><rect class="m" x="9" y="23" width="21" height="2" rx="1"/><rect class="a" x="9" y="28" width="10" height="4" rx="2"/><rect class="m" x="37" y="9" width="18" height="22" rx="2.5"/>',
  Card:'<rect class="w" x="14" y="4" width="36" height="32" rx="3"/><rect class="a" x="19" y="9" width="7" height="7" rx="2"/><rect class="s" x="19" y="20" width="20" height="3" rx="1.5"/><rect class="m" x="19" y="26" width="26" height="2" rx="1"/><rect class="m" x="19" y="30" width="17" height="2" rx="1"/>',
  Stats:'<path class="ln" d="M6 10h52"/><rect class="a" x="6" y="15" width="11" height="6" rx="1.5"/><rect class="a" x="24" y="15" width="8" height="6" rx="1.5"/><rect class="a" x="41" y="15" width="12" height="6" rx="1.5"/><rect class="m" x="6" y="25" width="14" height="2" rx="1"/><rect class="m" x="24" y="25" width="12" height="2" rx="1"/><rect class="m" x="41" y="25" width="15" height="2" rx="1"/>',
  Logos:'<rect class="w" x="20" y="8" width="24" height="2.5" rx="1.25"/><circle class="m" cx="10" cy="24" r="4"/><rect class="m" x="19" y="20" width="8" height="8" rx="1.5"/><path class="m" d="M35 28l4-8 4 8z"/><rect class="m" x="48" y="22" width="10" height="4" rx="2"/>',
  Testimonial:'<path class="a" d="M8 9h5v5c0 3-1.5 4.5-4 5.5l-1-1.5c1.5-.7 2-1.6 2-3H8zM16 9h5v5c0 3-1.5 4.5-4 5.5l-1-1.5c1.5-.7 2-1.6 2-3h-2z"/><rect class="s" x="26" y="10" width="30" height="3" rx="1.5"/><rect class="s" x="26" y="16" width="23" height="3" rx="1.5"/><circle class="m" cx="29.5" cy="29" r="3.5"/><rect class="m" x="35.5" y="27.5" width="14" height="3" rx="1.5"/>',
  Image:'<rect class="w" x="8" y="5" width="48" height="30" rx="3"/><circle class="m" cx="20" cy="14" r="3.5"/><path class="m" d="M11 32l12-11 9 8 7-6 14 9z"/>',
  Html:'<rect class="w" x="8" y="5" width="48" height="30" rx="3"/><path class="ln" style="opacity:.8;stroke-width:2" d="M25 14l-6 6 6 6M39 14l6 6-6 6M34 12l-4 16"/>'
};
