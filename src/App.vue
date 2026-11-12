<template>
  <div class="editor">
      <header class="topbar">
        <button class="ib only-narrow" @click="showLeft=!showLeft; showRight=false" title="Blocks" aria-label="Show blocks"><icon name="panel-left"/></button>
        <div class="brand"><span class="brand-mark"></span><span class="hide-narrow">Pagecraft</span></div>
        <div class="vsep hide-narrow"></div>
        <div class="page-title hide-narrow">
          <span v-if="layout" class="layout-chip" title="Editing a layout"><icon name="template" :size="14"/>{{ layout.name }}</span>
          <select v-else class="page-switch" :value="page.id" @change="goToPage($event.target.value)" aria-label="Page you’re editing">
            <option v-for="p in store.project.pages" :key="p.id" :value="p.id">{{ p.title || 'Untitled' }}</option>
          </select>
          <span class="saved">{{ savedLabel }}</span>
        </div>
        <div class="spacer"></div>
        <button class="ib" :disabled="!store.canUndo" @click="undo" title="Undo (Ctrl/⌘ Z)" aria-label="Undo"><icon name="undo"/></button>
        <button class="ib" :disabled="!store.canRedo" @click="redo" title="Redo (Ctrl/⌘ Shift Z)" aria-label="Redo"><icon name="redo"/></button>
        <div class="vsep hide-narrow"></div>
        <div class="seg hide-narrow" role="group" aria-label="Viewport">
          <button :class="{on:store.viewport==='desktop'}" @click="store.viewport='desktop'" title="Desktop" aria-label="Desktop"><icon name="monitor" :size="15"/></button>
          <button :class="{on:store.viewport==='tablet'}" @click="store.viewport='tablet'" title="Tablet (820px)" aria-label="Tablet"><icon name="tablet" :size="15"/></button>
          <button :class="{on:store.viewport==='mobile'}" @click="store.viewport='mobile'" title="Mobile (390px)" aria-label="Mobile"><icon name="phone" :size="15"/></button>
        </div>
        <div class="seg mode-seg" role="group" aria-label="Mode">
          <button :class="{on: mode === 'edit'}" @click="setMode('edit')" title="Edit the page visually" aria-label="Edit"><icon name="edit" :size="14"/><span class="hide-narrow">Edit</span></button>
          <button :class="{on: mode === 'preview'}" @click="setMode('preview')" title="Preview the page as visitors see it" aria-label="Preview"><icon name="eye" :size="14"/><span class="hide-narrow">Preview</span></button>
          <button :class="{on: mode === 'code'}" @click="setMode('code')" title="View and edit the source code" aria-label="Code"><icon name="code" :size="14"/><span class="hide-narrow">Code</span></button>
        </div>
        <div class="menu-wrap">
          <button class="ib" @click.stop="menuOpen=!menuOpen" aria-label="More actions"><icon name="more"/></button>
          <div v-if="menuOpen" class="menu" @click.stop="menuOpen=false">
            <button @click="openPublish"><icon name="code" :size="15"/> View page JSON</button>
            <button @click="openImport"><icon name="import" :size="15"/> Import JSON…</button>
            <hr>
            <button @click="resetDemo"><icon name="reset" :size="15"/> Restore demo site</button>
            <button @click="clearPage" class="danger"><icon name="trash" :size="15"/> Clear page</button>
          </div>
        </div>
        <button class="btn" @click="openExport" title="Download a working website"><icon name="download" :size="15"/><span class="hide-narrow">Export site</span></button>
        <button class="btn primary" @click="openPublish">Publish</button>
        <button class="ib only-narrow" @click="showRight=!showRight; showLeft=false" title="Properties" aria-label="Show properties"><icon name="sliders"/></button>
      </header>

      <div class="body" :class="{preview: store.preview || store.codeMode, 'ai-wide': leftTab==='assistant'}">
        <aside class="side left" :class="{open:showLeft, 'ai-mode': leftTab==='assistant'}" v-show="!store.preview && !store.codeMode">
          <div class="tabs">
            <button :class="{on:leftTab==='pages'}" @click="leftTab='pages'"><icon name="pages" :size="14"/>Pages</button>
            <button :class="{on:leftTab==='components'}" @click="leftTab='components'"><icon name="blocks" :size="14"/>Blocks</button>
            <button :class="{on:leftTab==='outline'}" @click="leftTab='outline'"><icon name="outline" :size="14"/>Outline</button>
            <button :class="{on:leftTab==='assistant'}" @click="leftTab='assistant'"><icon name="sparkle" :size="14"/>Assistant</button>
          </div>
          <pages-panel v-if="leftTab==='pages'" @picked="showLeft=false" @go-blocks="leftTab='components'"/>
          <template v-if="leftTab==='components'">
            <p class="hint">Drag a block onto the page, or click it to add it below the selected block.</p>
            <div v-for="cat in CATEGORIES" :key="cat.name">
              <button class="pal-cat-title" @click="collapsed[cat.name]=!collapsed[cat.name]" :aria-expanded="!collapsed[cat.name]">
                <span class="pal-cat-name"><icon :name="cat.icon" :size="14"/>{{ cat.name }}</span><icon :name="collapsed[cat.name] ? 'chevron-right' : 'chevron-down'" :size="14"/>
              </button>
              <div class="pal-grid" v-show="!collapsed[cat.name]">
                <div v-for="t in cat.types" :key="t" class="pal-tile" draggable="true" tabindex="0" role="button" :title="'Drag onto the page, or click to add ' + CONFIG[t].label"
                     @dragstart="paletteDragStart($event,t)" @dragend="endDrag" @click="quickAdd(t)" @keydown.enter.prevent="quickAdd(t)">
                  <svg class="pal-thumb" viewBox="0 0 64 40" aria-hidden="true" v-html="BLOCK_THUMBS[t]"></svg>
                  <span>{{ CONFIG[t].label }}</span>
                </div>
              </div>
            </div>
            <div style="height:24px"></div>
          </template>
          <div v-else-if="leftTab==='outline'" class="outline">
            <div class="tree-row" :class="{sel:!store.selectedId}" @click="select(null)"><icon name="file" :size="14"/><span>{{ layout ? layout.name : (page.title || 'Untitled') }}</span><span class="tree-sub">{{ layout ? 'Layout' : pagePath(page) }}</span></div>
            <outline-tree :items="store.data.content" :depth="1" @picked="showLeft=false"/>
          </div>
          <ai-panel v-show="leftTab==='assistant'"/>
        </aside>

        <main v-show="!store.codeMode" class="canvas" :class="{edit:!store.preview,'is-dragging':!!store.drag}" @submit.prevent @click="canvasClick" @mouseleave="store.hoverId=null">
          <div v-if="layout && !store.preview" class="layout-bar" @click.stop>
            <icon name="template" :size="16"/>
            <span>Editing the layout <strong>{{ layout.name }}</strong>. Pages only change when you apply it.</span>
            <button class="btn sm" @click="applyFromBar"><icon name="apply" :size="13"/>Apply to pages…</button>
            <button class="btn sm primary" @click="exitLayout">Done</button>
          </div>
          <div class="frame" :class="{'layout-mode': !!layout}" :style="frameStyle">
            <div class="site" :style="siteVars">
              <header v-if="root.showHeader" class="s-nav">
                <a class="s-brand" :href="'page:' + homePage.id" title="Home page"><span class="s-brand-mark"></span>{{ root.siteName }}</a>
                <nav class="s-navlinks"><a v-for="p in navPages" :key="p.id" class="s-navtext" :class="{'s-current': p.id === page.id}" :href="'page:' + p.id">{{ p.title }}</a></nav>
              </header>
              <zone-list zone-key="root" :items="store.data.content" axis="y" cls="root-zone"/>
              <footer v-if="root.showFooter" class="s-footer"><div class="s-footer-in"><span>© 2026 {{ root.siteName }}</span><span class="s-footer-links"><a v-for="p in footerPages" :key="p.id" :href="'page:' + p.id">{{ p.title }}</a></span></div></footer>
            </div>
          </div>
        </main>
        <code-view v-if="store.codeMode"/>

        <aside class="side right" :class="{open:showRight}" v-show="!store.preview && !store.codeMode">
          <div class="side-head">
            <div class="crumbs">
              <button @click="select(null)">Page</button>
              <template v-for="c in crumbs" :key="c.id"><icon name="chevron-right" :size="11"/><button @click="pick(c.id)">{{ CONFIG[c.type].label }}</button></template>
            </div>
            <div class="side-title">
              <h2><icon :name="selected ? BLOCK_ICONS[selected.type] : 'sliders'" :size="16"/>{{ selected ? CONFIG[selected.type].label : (layout ? 'Layout settings' : 'Page settings') }}</h2>
              <div v-if="selected" class="row">
                <button class="ib" title="Duplicate" aria-label="Duplicate" @click="duplicateItem(selected.id)"><icon name="copy" :size="15"/></button>
                <button class="ib" title="Delete" aria-label="Delete" @click="removeItem(selected.id)"><icon name="trash" :size="15"/></button>
              </div>
            </div>
          </div>
          <div class="fields">
            <template v-for="g in fieldGroups" :key="g.key">
              <div v-if="g.title" class="field-group">{{ g.title }}</div>
              <field-editor v-for="fd in g.fields" :key="g.key + ':' + fd.k" :def="fd.f" :name="fd.k" :obj="g.obj"/>
            </template>
            <div v-if="!selected" class="empty-note">Select any block on the canvas to edit it. Headings, text and buttons can also be edited in place — click once to select, then click the text.<br><br>Shortcuts: <kbd>Del</kbd> removes, <kbd>Ctrl/⌘ D</kbd> duplicates, <kbd>Alt ↑/↓</kbd> reorders, <kbd>Esc</kbd> deselects.</div>
          </div>
        </aside>
        <div v-if="showLeft || showRight" class="drawer-scrim" @click="showLeft=showRight=false"></div>
      </div>

      <div v-if="modal" class="scrim" @click.self="modal=null">
        <div class="modal" role="dialog" aria-modal="true">
          <template v-if="modal==='publish'">
            <div class="modal-head"><h2>Publish site</h2><button class="ib" @click="modal=null" aria-label="Close"><icon name="x"/></button></div>
            <div class="modal-body">
              <p>This is the data for every page, your saved templates and the site settings. Your app would save it and render each page. Copy it into your backend, or paste it back in later with Import JSON.</p>
              <textarea ref="pubText" class="inp" readonly :value="json"></textarea>
            </div>
            <div class="modal-foot"><button class="btn" @click="modal=null">Close</button><button class="btn primary" @click="copyJson"><icon name="copy" :size="14"/> Copy JSON</button></div>
          </template>
          <template v-else-if="modal==='export'">
            <div class="modal-head"><h2>Export site</h2><button class="ib" @click="modal=null" aria-label="Close"><icon name="x"/></button></div>
            <div class="modal-body">
              <p>Builds a working website from your {{ store.project.pages.length }} {{ store.project.pages.length === 1 ? 'page' : 'pages' }}: plain HTML files that link to each other, one shared stylesheet with your custom CSS, and your fonts. Open index.html to view it, or upload the folder to any static web host.</p>
              <div class="export-files">
                <div v-for="f in exportPlan" :key="f.name" class="export-file"><icon :name="f.icon" :size="14"/><span class="fname">{{ f.name }}</span><span class="fdesc">{{ f.desc }}</span></div>
              </div>
              <div v-if="exportError" class="err" role="alert">{{ exportError }}</div>
            </div>
            <div class="modal-foot"><button class="btn" @click="modal=null">Cancel</button>
              <button class="btn primary" :disabled="exporting" @click="exportSite"><icon name="download" :size="14"/>{{ exporting ? 'Building pages…' : 'Download .zip' }}</button></div>
          </template>
          <template v-else-if="modal==='import'">
            <div class="modal-head"><h2>Import JSON</h2><button class="ib" @click="modal=null" aria-label="Close"><icon name="x"/></button></div>
            <div class="modal-body">
              <p>Paste a whole site exported from this editor to replace everything, or a single page’s JSON to add it as a new page. Undo brings back what was there.</p>
              <textarea class="inp" v-model="importText" placeholder='{ "root": { "props": {} }, "content": [] }'></textarea>
              <div v-if="importError" class="err">{{ importError }}</div>
            </div>
            <div class="modal-foot"><button class="btn" @click="modal=null">Cancel</button><button class="btn primary" :disabled="!importText.trim()" @click="doImport">Import page</button></div>
          </template>
        </div>
      </div>
      <div v-if="store.toast" class="toast" role="status">{{ store.toast }}</div>
    </div>
</template>

<script>
import { CATEGORIES, CONFIG, uid } from './editor/config.js';
import { fontStack, shownValue } from './editor/fonts.js';
import { LAYOUT_FIELDS, PAGE_FIELDS, SITE_FIELDS, demoProject, normalizeProject, slugify, uniqueSlug } from './editor/model.js';
import { duplicateItem, endDrag, findItem, goToPage, insertNew, moveBy, pathTo, removeItem, scrollToItem, select, store, toast } from './editor/store.js';
import { flush, redo, undo } from './editor/history.js';
import { buildSiteFiles, exportFileName, makeZip, saveFile } from './editor/exporter.js';

export default {
  data(){ return { leftTab:'components', menuOpen:false, modal:null, importText:'', importError:'', showLeft:false, showRight:false, collapsed:{}, CATEGORIES, exporting:false, exportError:'' } },
  computed:{
    root(){ return store.project.settings; },
    page(){ return store.data; },
    layout(){ return store.layoutId ? store.data : null; },
    mode(){ return store.codeMode ? 'code' : store.preview ? 'preview' : 'edit'; },
    homePage(){ return store.project.pages[0]; },
    navPages(){ return store.project.pages.filter((p, i) => i > 0 && p.inNav); },
    footerPages(){ return store.project.pages.filter(p => p.inNav); },
    selected(){ const r = findItem(store.selectedId); return r ? r.item : null; },
    crumbs(){ return store.selectedId ? (pathTo(store.selectedId) || []).slice(0, -1) : []; },
    fieldGroups(){
      const vis = (fields, o) => Object.entries(fields).filter(([, f]) => !f.showIf || f.showIf(o)).map(([k, f]) => ({ k, f }));
      if (this.selected){ const p = this.selected.props; return [{ key: this.selected.id, title: null, obj: p, fields: vis(CONFIG[this.selected.type].fields, p) }]; }
      return [
        store.layoutId
          ? { key: 'layout-' + this.page.id, title: 'This layout', obj: this.page, fields: vis(LAYOUT_FIELDS, this.page) }
          : { key: 'page-' + this.page.id, title: 'This page', obj: this.page, fields: vis(PAGE_FIELDS, this.page) },
        { key: 'site', title: 'Whole site', obj: this.root, fields: vis(SITE_FIELDS, this.root) }
      ];
    },
    frameStyle(){ return { width: { desktop:'100%', tablet:'820px', mobile:'390px' }[store.viewport] }; },
    siteVars(){
      const r = this.root;
      return { '--sa': r.accent,
        '--site-head': fontStack(shownValue(r, 'headFont')) || "'Bricolage Grotesque', system-ui, sans-serif",
        '--site-body': fontStack(shownValue(r, 'bodyFont')) || "'Geist', system-ui, sans-serif" };
    },
    json(){ return JSON.stringify(store.project, null, 2); },
    exportPlan(){
      return [
        ...store.project.pages.map((p, i) => ({ name: exportFileName(p), desc: p.title || 'Untitled', icon: i === 0 ? 'home' : 'file' })),
        { name: 'styles.css', desc: 'Shared styles and your custom CSS', icon: 'css' },
        { name: 'site.json', desc: 'Editable copy to import later', icon: 'code' },
        { name: 'README.txt', desc: 'How to open and host it', icon: 'text' }
      ];
    },
    savedLabel(){ return store.saved; }
  },
  watch:{ 'page.title':{ immediate:true, handler(t){ document.title = (t || 'Untitled') + ' — Pagecraft'; } } },
  mounted(){
    window.addEventListener('click', () => { this.menuOpen = false; });
    window.addEventListener('keydown', this.onKey);
  },
  methods:{
    undo, redo, select, goToPage,
    pick(id){ select(id); scrollToItem(id); },
    paletteDragStart(e, t){ store.drag = { kind:'new', type:t }; e.dataTransfer.effectAllowed = 'copy'; try { e.dataTransfer.setData('text/plain', t); } catch(_){} },
    endDrag,
    quickAdd(t){ if (store.preview) store.preview = false; insertNew(t); this.showLeft = false; },
    togglePreview(){ this.setMode(store.preview ? 'edit' : 'preview'); },
    setMode(m){
      flush();
      store.codeMode = m === 'code'; store.preview = m === 'preview';
      store.hoverId = null; store.editingId = null;
      if (m !== 'edit') this.showLeft = this.showRight = false;
    },
    canvasClick(e){
      const a = e && e.target && e.target.closest ? e.target.closest('a') : null;
      if (a){
        e.preventDefault();
        const h = a.getAttribute('href') || '';
        if (h.startsWith('page:') && (store.preview || !a.closest('.blk'))){ goToPage(h.slice(5)); return; }
        if (store.preview && /^https?:\/\//i.test(h)){ window.open(h, '_blank', 'noopener'); return; }
      }
      if (!store.preview) select(null);
    },
    openPublish(){ flush(); this.modal = 'publish'; },
    openExport(){ flush(); this.exportError = ''; this.modal = 'export'; },
    exitLayout(){ store.layoutId = null; select(null); },
    applyFromBar(){ store.pendingApply = 't:' + store.layoutId; this.leftTab = 'pages'; this.showLeft = true; },
    async exportSite(){
      if (this.exporting) return;
      this.exporting = true; this.exportError = '';
      try {
        const files = await buildSiteFiles();
        await saveFile((slugify(store.project.settings.siteName) || 'site') + '-website.zip', makeZip(files));
        this.modal = null; toast('Site exported');
      } catch (e) {
        const c = e && e.code;
        this.exportError = c === 'declined' ? 'The download was cancelled. Export again whenever you’re ready.'
          : c === 'rate_limited' ? 'Another download prompt is still open. Finish that one, then try again.'
          : c === 'too_large' ? 'The site is too large to save in one file. Try removing some uploaded images.'
          : 'The export didn’t finish. Try again.';
      } finally { this.exporting = false; }
    },
    openImport(){ this.importText = ''; this.importError = ''; this.modal = 'import'; },
    async copyJson(){
      try { await navigator.clipboard.writeText(this.json); toast('Site JSON copied'); }
      catch (e) { const ta = this.$refs.pubText; if (ta){ ta.select(); try { document.execCommand('copy'); toast('Page JSON copied'); } catch(_) { toast('Select the text and copy it manually'); } } }
    },
    doImport(){
      try {
        const raw = JSON.parse(this.importText);
        const d = normalizeProject(raw);
        if (Array.isArray(raw.pages)){ store.project = d; goToPage(d.pages[0].id); toast('Site imported'); }
        else { const p = d.pages[0]; p.id = uid(); p.slug = uniqueSlug(p.title); store.project.pages.push(p); goToPage(p.id); toast('Added “' + p.title + '” as a new page'); }
        this.modal = null;
      }
      catch (e) { this.importError = e instanceof SyntaxError ? 'That isn’t valid JSON. Check for a missing bracket or comma.' : e.message; }
    },
    resetDemo(){ store.project = demoProject(); goToPage('home'); toast('Demo site restored'); },
    clearPage(){ store.data.content = []; select(null); toast('Page cleared — press Undo to bring it back'); },
    onKey(e){
      const t = e.target;
      const typing = t && (['INPUT','TEXTAREA','SELECT'].includes(t.tagName) || t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey; const k = e.key.toLowerCase();
      if (mod && (k === 'z' || k === 'y')){ if (typing) return; e.preventDefault(); (k === 'y' || e.shiftKey) ? redo() : undo(); return; }
      if (typing) return;
      if (e.key === 'Escape'){ if (this.modal) this.modal = null; else if (store.preview) store.preview = false; else select(null); return; }
      if (store.preview || !store.selectedId || this.modal) return;
      if (e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); removeItem(store.selectedId); }
      else if (mod && k === 'd'){ e.preventDefault(); duplicateItem(store.selectedId); }
      else if (e.altKey && e.key === 'ArrowUp'){ e.preventDefault(); moveBy(store.selectedId, -1); }
      else if (e.altKey && e.key === 'ArrowDown'){ e.preventDefault(); moveBy(store.selectedId, 1); }
    },
    openProps(){ this.showRight = true; }
  }
};
</script>
