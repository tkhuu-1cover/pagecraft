<template>
  <section class="codeview" aria-label="Source code">
      <div class="code-bar">
        <div class="code-tabs" role="tablist">
          <button v-for="f in files" :key="f.id" role="tab" :aria-selected="file === f.id ? 'true' : 'false'" :class="{on: file === f.id}" @click="switchTo(f.id)">
            <icon :name="f.icon" :size="13"/><span class="fname">{{ f.label }}</span>
            <span v-if="dirty[f.id]" class="dot" title="Changes not applied yet"></span>
            <span v-if="f.readOnly" class="ro">read-only</span>
          </button>
        </div>
        <div class="code-actions">
          <span class="code-hint">{{ hint }}</span>
          <button class="btn sm" :disabled="!dirty[file]" @click="revert">Revert</button>
          <button class="btn sm primary" :disabled="!dirty[file] || current.readOnly" @click="apply"><icon name="check" :size="13"/>Apply changes</button>
        </div>
      </div>
      <div v-if="error" class="code-error" role="alert"><icon name="x" :size="13"/><span>{{ error }}</span></div>
      <div class="code-host-wrap">
        <div v-show="!plain" ref="host" class="code-host"></div>
        <div v-if="status === 'loading'" class="code-loading">Loading the code editor…</div>
        <textarea v-if="plain" class="code-plain" spellcheck="false" :readonly="current.readOnly" :value="texts[file]" @input="onPlainInput" @keydown="onPlainKey" aria-label="Source code"></textarea>
      </div>
    </section>
</template>

<script>
import { nextTick, watch } from 'vue';
import { CONFIG } from '../editor/config.js';
import { normalizeList, normalizeProject, uniqueSlug } from '../editor/model.js';
import { select, store, toast } from '../editor/store.js';
import { CODE_FILES, codeSource, editorIsDark, loadMonaco } from '../editor/code.js';

export default {
  data(){ return { files: CODE_FILES, file: 'page', status: 'loading', plain: false, error: '', dirty: { page: false, css: false, html: false, site: false }, texts: { page: '', css: '', html: '', site: '' } }; },
  computed: { current(){ return CODE_FILES.find(f => f.id === this.file); }, hint(){ return this.current.hint + (this.current.readOnly ? '' : ' · Ctrl/⌘ S applies'); } },
  created(){ this.base = {}; this.models = null; this.editor = null; },
  mounted(){
    this.stopWatch = watch(() => [store.project, store.data && store.data.id, store.layoutId], (n, o) => {
      clearTimeout(this.t);
      const pageChanged = !o || n[1] !== o[1] || n[2] !== o[2];
      this.t = setTimeout(() => nextTick(() => this.refreshAll(pageChanged)), pageChanged ? 0 : 250);
    }, { deep: true });
    this.init();
  },
  beforeUnmount(){
    this.dead = true; clearTimeout(this.t); if (this.stopWatch) this.stopWatch();
    if (this.mq && this.mqFn) this.mq.removeEventListener('change', this.mqFn);
    if (this.editor) this.editor.dispose();
    if (this.models) Object.values(this.models).forEach(m => m.dispose());
  },
  methods: {
    async init(){
      try {
        const monaco = await loadMonaco();
        if (this.dead) return;
        this.monaco = monaco;
        this.models = {};
        CODE_FILES.forEach(f => { this.models[f.id] = monaco.editor.createModel('', f.lang); });
        this.editor = monaco.editor.create(this.$refs.host, {
          model: this.models[this.file], automaticLayout: true, theme: editorIsDark() ? 'vs-dark' : 'vs',
          fontFamily: "'Geist Mono', ui-monospace, Menlo, monospace", fontSize: 13, lineHeight: 20,
          minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 2, wordWrap: 'on',
          padding: { top: 12 }, renderLineHighlight: 'line', smoothScrolling: true, fixedOverflowWidgets: true
        });
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this.apply());
        this.editor.onDidChangeModelContent(() => this.checkDirty());
        if (window.matchMedia){ this.mq = window.matchMedia('(prefers-color-scheme: dark)'); this.mqFn = () => monaco.editor.setTheme(editorIsDark() ? 'vs-dark' : 'vs'); this.mq.addEventListener('change', this.mqFn); }
        this.status = 'ready';
        this.refreshAll(true);
        this.editor.updateOptions({ readOnly: !!this.current.readOnly });
        this.editor.focus();
      } catch (e) {
        if (this.dead) return;
        this.status = 'ready'; this.plain = true;
        this.error = 'The Monaco editor couldn’t load here, so you’re editing in a plain text box. Everything else works the same.';
        this.refreshAll(true);
      }
    },
    value(id){ return this.plain ? this.texts[id] : (this.models ? this.models[id].getValue() : ''); },
    refresh(id, force){
      if (this.status !== 'ready') return;
      if (!force && this.dirty[id]) return;
      const v = codeSource(id);
      this.base[id] = v;
      if (this.plain) this.texts[id] = v;
      else if (this.models[id].getValue() !== v){ this.refreshing = true; try { this.models[id].setValue(v); } finally { this.refreshing = false; } }
      this.dirty[id] = false;
    },
    refreshAll(pageChanged){
      if (pageChanged){
        const lost = ['page', 'html'].some(id => this.dirty[id]);
        ['page', 'html'].forEach(id => this.refresh(id, true));
        if (lost) toast('Unapplied edits to page.json were discarded');
      }
      CODE_FILES.forEach(f => this.refresh(f.id, false));
    },
    checkDirty(){ if (this.refreshing) return; CODE_FILES.forEach(f => { this.dirty[f.id] = this.base[f.id] !== undefined && this.value(f.id) !== this.base[f.id]; }); },
    switchTo(id){
      this.file = id; this.error = this.plain ? this.error : '';
      if (this.editor){ this.editor.setModel(this.models[id]); this.editor.updateOptions({ readOnly: !!this.current.readOnly }); this.editor.focus(); }
    },
    revert(){ this.refresh(this.file, true); this.error = ''; },
    apply(){
      const f = this.file;
      if (this.current.readOnly || !this.dirty[f]) return;
      const v = this.value(f);
      try {
        if (f === 'css') store.project.settings.customCss = v;
        else if (f === 'page'){
          const o = JSON.parse(v);
          if (!o || typeof o !== 'object' || !Array.isArray(o.content)) throw new Error('page.json needs a "content" array of blocks.');
          const p = store.data;
          if (store.layoutId){ if (o.name !== undefined) p.name = String(o.name); if (o.description !== undefined) p.description = String(o.description); }
          else {
            if (o.title !== undefined) p.title = String(o.title);
            if (o.slug !== undefined && store.project.pages[0] !== p) p.slug = uniqueSlug(o.slug, p.id);
            if (o.inNav !== undefined) p.inNav = !!o.inNav;
          }
          const unknown = o.content.filter(it => !it || !CONFIG[it.type]).length;
          p.content = normalizeList(o.content);
          if (unknown) toast(unknown + (unknown === 1 ? ' block had' : ' blocks had') + ' an unknown type and ' + (unknown === 1 ? 'was' : 'were') + ' skipped');
        }
        else if (f === 'site'){
          const raw = JSON.parse(v);
          if (!raw || !Array.isArray(raw.pages)) throw new Error('site.json needs a "pages" array.');
          store.project = normalizeProject(raw);
          if (!store.project.pages.some(p => p.id === store.pageId)) store.pageId = store.project.pages[0].id;
          if (store.layoutId && !store.project.templates.some(t => t.id === store.layoutId)) store.layoutId = null;
        }
        this.error = ''; select(null);
        this.dirty[f] = false;
        nextTick(() => { this.refresh(f, true); toast('Changes applied'); });
      } catch (e) {
        this.error = e instanceof SyntaxError ? 'That isn’t valid JSON yet: ' + e.message + '. The red underlines in the editor show where.' : (e.message || 'Those changes couldn’t be applied.');
      }
    },
    onPlainInput(e){ this.texts[this.file] = e.target.value; this.checkDirty(); },
    onPlainKey(e){ if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); this.apply(); } }
  }
};
</script>
