<template>
  <div class="pages-panel">
      <div class="pg-section"><span class="pal-cat-name"><icon name="pages" :size="14"/>Pages</span>
        <button class="btn sm" @click="openNew"><icon name="plus" :size="13"/>New page</button></div>
      <div class="pg-list">
        <div v-for="(p,i) in pages" :key="p.id" class="pg-row" :class="{on: p.id === current.id}" tabindex="0" role="button"
             @click="open(p.id)" @keydown.enter.self="open(p.id)">
          <icon :name="i === 0 ? 'home' : 'file'" :size="15"/>
          <div class="pg-main"><span class="pg-title">{{ p.title || 'Untitled' }}</span><span class="pg-path">{{ pagePath(p) }}</span></div>
          <span v-if="!p.inNav" class="pg-badge" title="Not shown in the site navigation">Hidden</span>
          <span class="pg-acts" @click.stop>
            <button class="ib" title="Move up" aria-label="Move up" :disabled="i === 0" @click="move(i,-1)"><icon name="up" :size="13"/></button>
            <button class="ib" title="Move down" aria-label="Move down" :disabled="i === pages.length - 1" @click="move(i,1)"><icon name="down" :size="13"/></button>
            <button class="ib" title="Duplicate page" aria-label="Duplicate page" @click="duplicate(p)"><icon name="copy" :size="13"/></button>
            <button class="ib" title="Delete page" aria-label="Delete page" :disabled="pages.length < 2" @click="remove(p)"><icon name="trash" :size="13"/></button>
          </span>
        </div>
      </div>
      <p class="pg-empty">The top page is the home page. Select a page to edit it; its title, address and menu visibility are in the right-hand panel. Link to any page from a button’s Link setting.</p>

      <div class="pg-section"><span class="pal-cat-name"><icon name="template" :size="14"/>Layouts</span>
        <button class="btn sm" @click="openNewLayout"><icon name="plus" :size="13"/>New layout</button></div>
      <div class="pg-actions">
        <button class="btn sm" @click="openApply('')"><icon name="apply" :size="13"/>Apply a layout…</button>
        <button v-if="!editingLayout" class="btn sm" @click="openSave"><icon name="copy" :size="13"/>Save page as layout</button>
      </div>
      <div class="choice-group" style="padding:12px 14px 6px">Your layouts</div>
      <p v-if="!templates.length" class="pg-empty">Nothing here yet. Use New layout to design one from scratch, or save a page you like. Then apply it to as many pages as you want.</p>
      <div v-for="t in templates" :key="t.id" class="tpl-card" :class="{on: editingLayout && current.id === t.id}">
        <div class="tpl-strip" aria-hidden="true"><span v-for="(c,j) in strip(t.content)" :key="j" :class="c"></span></div>
        <div class="tpl-main">
          <div class="tpl-name">{{ t.name }}<span v-if="editingLayout && current.id === t.id" class="pg-badge">Editing</span></div>
          <div class="tpl-desc">{{ t.description || summary(t.content) }}</div>
          <div class="tpl-row-acts">
            <button class="btn sm" @click="editLayout(t.id)"><icon name="edit" :size="12"/>Edit</button>
            <button class="btn sm" @click="openApply('t:' + t.id)">Apply…</button>
            <button class="ib" title="Duplicate layout" aria-label="Duplicate layout" @click="duplicateTemplate(t)"><icon name="copy" :size="13"/></button>
            <button class="ib" title="Delete layout" aria-label="Delete layout" @click="removeTemplate(t)"><icon name="trash" :size="13"/></button>
          </div>
        </div>
      </div>
      <div class="choice-group" style="padding:12px 14px 6px">Built-in</div>
      <div v-for="t in BUILTIN_TEMPLATES" :key="t.id" class="tpl-card">
        <div class="tpl-strip" aria-hidden="true"><span v-for="(c,j) in strip(builtinContent(t.id))" :key="j" :class="c"></span></div>
        <div class="tpl-main">
          <div class="tpl-name">{{ t.name }}</div>
          <div class="tpl-desc">{{ t.description }}</div>
          <div class="tpl-row-acts">
            <button class="btn sm" @click="openApply('b:' + t.id)">Apply…</button>
            <button class="btn sm ghost" @click="customize(t)" title="Make an editable copy in Your layouts"><icon name="edit" :size="12"/>Customize</button>
          </div>
        </div>
      </div>
      <div style="height:24px"></div>

      <teleport to="body">
        <div v-if="modal" class="scrim" @click.self="close" @keydown.esc.stop="close">
          <div class="modal" role="dialog" aria-modal="true">
            <template v-if="modal === 'new'">
              <div class="modal-head"><h2>New page</h2><button class="ib" @click="close" aria-label="Close"><icon name="x"/></button></div>
              <div class="modal-body">
                <label class="mlabel" style="margin-top:0" for="np-title">Title</label>
                <input id="np-title" ref="newTitle" class="inp" v-model="newTitle" placeholder="For example, Pricing" @keydown.enter="create">
                <div class="field-hint">Address: /{{ previewSlug }}</div>
                <span class="mlabel">Start from</span>
                <div class="choice-list">
                  <label class="choice"><input type="radio" value="blank" v-model="newSource"><span>Blank page<small>An empty canvas.</small></span></label>
                  <template v-for="g in sources" :key="g.group">
                    <div class="choice-group">{{ g.group }}</div>
                    <label v-for="o in g.items" :key="o.value" class="choice"><input type="radio" :value="o.value" v-model="newSource"><span>{{ o.label }}<small>{{ o.hint }}</small></span></label>
                  </template>
                </div>
              </div>
              <div class="modal-foot"><button class="btn" @click="close">Cancel</button><button class="btn primary" @click="create">Create page</button></div>
            </template>

            <template v-else-if="modal === 'apply'">
              <div class="modal-head"><h2>Apply a layout</h2><button class="ib" @click="close" aria-label="Close"><icon name="x"/></button></div>
              <div class="modal-body">
                <span class="mlabel" style="margin-top:0">Layout</span>
                <div class="choice-list">
                  <template v-for="g in sources" :key="g.group">
                    <div class="choice-group">{{ g.group }}</div>
                    <label v-for="o in g.items" :key="o.value" class="choice"><input type="radio" :value="o.value" v-model="applySrc"><span>{{ o.label }}<small>{{ o.hint }}</small></span></label>
                  </template>
                </div>
                <span class="mlabel">Apply to</span>
                <div class="choice-list">
                  <label v-for="p in pages" :key="p.id" class="choice"><input type="checkbox" :value="p.id" v-model="applyTargets"><span>{{ p.title || 'Untitled' }}<small>{{ pagePath(p) }} · {{ summary(p.content) }}</small></span></label>
                </div>
                <span class="mlabel">How</span>
                <div class="seg">
                  <button :class="{on: applyMode === 'replace'}" @click="applyMode = 'replace'">Replace the page’s blocks</button>
                  <button :class="{on: applyMode === 'append'}" @click="applyMode = 'append'">Add below what’s there</button>
                </div>
                <div v-if="applyMode === 'replace' && replaceCount" class="warn">This replaces every block on {{ replaceCount }} {{ replaceCount === 1 ? 'page' : 'pages' }}. Undo brings them back. Site settings, titles and addresses stay as they are.</div>
              </div>
              <div class="modal-foot"><button class="btn" @click="close">Cancel</button>
                <button class="btn primary" :disabled="!applySrc || !applyTargets.length" @click="apply">Apply to {{ applyTargets.length }} {{ applyTargets.length === 1 ? 'page' : 'pages' }}</button></div>
            </template>

            <template v-else-if="modal === 'newLayout'">
              <div class="modal-head"><h2>New layout</h2><button class="ib" @click="close" aria-label="Close"><icon name="x"/></button></div>
              <div class="modal-body">
                <p>A layout is a reusable arrangement of blocks. It opens in the editor so you can build it like a page, then apply it to any pages you choose.</p>
                <label class="mlabel" for="nl-name">Layout name</label>
                <input id="nl-name" ref="layoutName" class="inp" v-model="newTitle" placeholder="For example, Product page" @keydown.enter="createLayout">
                <span class="mlabel">Start from</span>
                <div class="choice-list">
                  <label class="choice"><input type="radio" value="blank" v-model="newSource"><span>Blank<small>Build it from scratch.</small></span></label>
                  <template v-for="g in sources" :key="g.group">
                    <div class="choice-group">{{ g.group }}</div>
                    <label v-for="o in g.items" :key="o.value" class="choice"><input type="radio" :value="o.value" v-model="newSource"><span>{{ o.label }}<small>{{ o.hint }}</small></span></label>
                  </template>
                </div>
              </div>
              <div class="modal-foot"><button class="btn" @click="close">Cancel</button><button class="btn primary" @click="createLayout">Create and edit</button></div>
            </template>

            <template v-else-if="modal === 'save'">
              <div class="modal-head"><h2>Save page as layout</h2><button class="ib" @click="close" aria-label="Close"><icon name="x"/></button></div>
              <div class="modal-body">
                <p>Saves the blocks on “{{ current.title }}” as a layout. You can edit it later, apply it to other pages, or start new pages from it.</p>
                <label class="mlabel" for="tpl-name">Layout name</label>
                <input id="tpl-name" ref="tplName" class="inp" v-model="tplName" @keydown.enter="saveTemplate">
              </div>
              <div class="modal-foot"><button class="btn" @click="close">Cancel</button><button class="btn primary" :disabled="!current.content.length" @click="saveTemplate">Save layout</button></div>
            </template>
          </div>
        </div>
      </teleport>
    </div>
</template>

<script>
import { nextTick } from 'vue';
import { uid } from '../editor/config.js';
import { pagePath, uniqueSlug } from '../editor/model.js';
import { goToPage, reId, select, store, toast } from '../editor/store.js';
import { BUILTIN_TEMPLATES, blockSummary, builtinContent, layoutName, layoutSource, stripOf } from '../editor/layouts.js';

export default {
  emits: ['picked', 'go-blocks'],
  data(){ return { modal: null, newTitle: '', newSource: 'blank', applySrc: '', applyTargets: [], applyMode: 'replace', tplName: '', BUILTIN_TEMPLATES }; },
  created(){ this.$watch(() => store.pendingApply, v => { if (v){ store.pendingApply = null; this.openApply(v); } }, { immediate: true }); },
  computed: {
    pages(){ return store.project.pages; },
    templates(){ return store.project.templates; },
    current(){ return store.data; },
    editingLayout(){ return !!store.layoutId; },
    previewSlug(){ return uniqueSlug(this.newTitle); },
    sources(){
      return [
        { group: 'Built-in layouts', items: BUILTIN_TEMPLATES.map(t => ({ value: 'b:' + t.id, label: t.name, hint: t.description })) },
        { group: 'Your layouts', items: this.templates.map(t => ({ value: 't:' + t.id, label: t.name, hint: t.description || blockSummary(t.content) })) },
        { group: 'Copy the layout of a page', items: this.pages.map(p => ({ value: 'p:' + p.id, label: p.title || 'Untitled', hint: pagePath(p) + ' · ' + blockSummary(p.content) })) }
      ].filter(g => g.items.length);
    },
    replaceCount(){ return this.applyTargets.filter(id => { const p = this.pages.find(p => p.id === id); return p && p.content.length; }).length; }
  },
  methods: {
    summary: blockSummary, strip: stripOf, builtinContent,
    open(id){ goToPage(id); this.$emit('picked'); },
    move(i, d){ const j = i + d; if (j < 0 || j >= this.pages.length) return; const [p] = this.pages.splice(i, 1); this.pages.splice(j, 0, p); if (j === 0) toast('\u201c' + p.title + '\u201d is now the home page'); },
    duplicate(p){
      const c = JSON.parse(JSON.stringify(p)); c.id = uid(); c.title = p.title + ' copy'; c.slug = uniqueSlug(c.title); c.content = c.content.map(reId);
      this.pages.splice(this.pages.indexOf(p) + 1, 0, c); goToPage(c.id); toast('Duplicated \u201c' + p.title + '\u201d');
    },
    remove(p){
      if (this.pages.length < 2) return;
      const i = this.pages.indexOf(p); const wasCurrent = p.id === store.data.id;
      this.pages.splice(i, 1);
      if (wasCurrent) goToPage(this.pages[Math.max(0, i - 1)].id);
      toast('Deleted \u201c' + p.title + '\u201d. Undo brings it back.');
    },
    close(){ this.modal = null; },
    openNew(){ this.newTitle = ''; this.newSource = 'blank'; this.modal = 'new'; nextTick(() => this.$refs.newTitle && this.$refs.newTitle.focus()); },
    create(){
      const title = this.newTitle.trim() || 'Untitled';
      const content = this.newSource === 'blank' ? [] : (layoutSource(this.newSource) || []).map(reId);
      const p = { id: uid(), title, slug: uniqueSlug(title), inNav: true, content };
      this.pages.push(p); this.modal = null; goToPage(p.id); this.$emit('picked');
      toast('Created \u201c' + title + '\u201d');
    },
    openApply(src){ this.applySrc = src || ''; this.applyTargets = store.layoutId ? [] : [store.data.id]; this.applyMode = 'replace'; this.modal = 'apply'; },
    apply(){
      const base = layoutSource(this.applySrc); if (!base || !this.applyTargets.length) return;
      const targets = this.pages.filter(p => this.applyTargets.includes(p.id));
      targets.forEach(p => {
        const c = JSON.parse(JSON.stringify(base)).map(reId);
        if (this.applyMode === 'replace') p.content = c; else p.content.push(...c);
      });
      select(null);
      toast('Applied \u201c' + layoutName(this.applySrc) + '\u201d to ' + targets.length + (targets.length === 1 ? ' page' : ' pages'));
      this.modal = null;
    },
    openSave(){ this.tplName = (store.data.title || 'Page') + ' layout'; this.modal = 'save'; nextTick(() => this.$refs.tplName && this.$refs.tplName.select()); },
    saveTemplate(){
      const name = this.tplName.trim() || ((store.data.title || 'Page') + ' layout');
      this.templates.push({ id: uid(), name, content: JSON.parse(JSON.stringify(store.data.content)) });
      this.modal = null; toast('Saved \u201c' + name + '\u201d as a layout');
    },
    removeTemplate(t){
      if (store.layoutId === t.id){ store.layoutId = null; select(null); }
      const i = this.templates.indexOf(t); if (i >= 0) this.templates.splice(i, 1);
      toast('Deleted layout \u201c' + t.name + '\u201d. Undo brings it back.');
    },
    openNewLayout(){ this.newTitle = ''; this.newSource = 'blank'; this.modal = 'newLayout'; nextTick(() => this.$refs.layoutName && this.$refs.layoutName.focus()); },
    createLayout(){
      const name = this.newTitle.trim() || 'Untitled layout';
      const content = this.newSource === 'blank' ? [] : (layoutSource(this.newSource) || []).map(reId);
      const t = { id: uid(), name, description: '', content };
      this.templates.push(t); this.modal = null; this.editLayout(t.id);
      toast('Created \u201c' + name + '\u201d. Add blocks from the Blocks tab.');
    },
    editLayout(id){
      store.layoutId = id; store.selectedId = null; store.hoverId = null;
      nextTick(() => { const c = document.querySelector('.canvas'); if (c) c.scrollTop = 0; });
      this.$emit('go-blocks'); this.$emit('picked');
    },
    customize(b){
      const t = { id: uid(), name: b.name + ' (custom)', description: b.description, content: (layoutSource('b:' + b.id) || []).map(reId) };
      this.templates.push(t); this.editLayout(t.id);
    },
    duplicateTemplate(t){
      const c = { id: uid(), name: t.name + ' copy', description: t.description || '', content: JSON.parse(JSON.stringify(t.content)).map(reId) };
      this.templates.splice(this.templates.indexOf(t) + 1, 0, c); toast('Duplicated \u201c' + t.name + '\u201d');
    }
  }
};
</script>
