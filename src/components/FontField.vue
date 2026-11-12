<template>
  <div class="ff">
      <button class="ff-current" :aria-expanded="open ? 'true' : 'false'" @click="toggle">
        <span v-if="val" class="ff-name" :style="{fontFamily: stack(val)}">{{ val }}</span>
        <span v-else class="ff-name inherit">Page default</span>
        <span class="ff-cat">{{ catOf(val) }}</span>
        <icon :name="open ? 'chevron-down' : 'chevron-right'" :size="14"/>
      </button>
      <div v-if="open" class="ff-pop">
        <div class="ff-search"><icon name="search" :size="14"/>
          <input ref="search" v-model="q" placeholder="Search or type any Google Font" aria-label="Search fonts"
                 @keydown.enter.prevent="onEnter" @keydown.esc.stop.prevent="close">
        </div>
        <div class="ff-chips">
          <button v-for="c in FONT_CATS" :key="c.v" :class="{on: cat===c.v}" @click="cat=c.v">{{ c.l }}</button>
        </div>
        <div class="ff-list" ref="list" @mouseleave="stopPreview">
          <button v-if="def.allowInherit && !q" class="ff-row plain" :class="{on: !val}" @click="choose('')" @mouseenter="preview('')" @focus="preview('')">
            <span class="ff-row-name">Page default</span><span class="ff-row-cat">Inherit</span>
          </button>
          <button v-for="f in filtered" :key="f.family" class="ff-row" :data-family="f.family"
                  :class="{on: val===f.family, pending: !ready(f.family)}"
                  @click="choose(f.family)" @mouseenter="preview(f.family)" @focus="preview(f.family)">
            <span class="ff-row-name" :style="{fontFamily: stack(f.family)}">{{ f.family }}</span>
            <span class="ff-row-cat">{{ catOf(f.family) }}</span>
          </button>
          <button v-if="customCandidate" class="ff-row custom" @click="tryCustom">
            <span>Load “{{ q.trim() }}” from Google Fonts</span><icon name="import" :size="14"/>
          </button>
          <div v-if="!filtered.length && !customCandidate" class="ff-empty">No fonts in this category match. Try All, or type the full name of any Google Font.</div>
        </div>
        <div v-if="status" class="ff-status" :class="{err: statusErr}" role="status">{{ status }}</div>
        <div class="ff-foot">Hover a font to preview it on the page. <a href="https://fonts.google.com/" target="_blank" rel="noopener">Browse fonts.google.com</a></div>
      </div>
    </div>
</template>

<script>
import { nextTick } from 'vue';
import { findFont, fontCatalog, fontStack, fontState, loadFont, queuePreview } from '../editor/fonts.js';
import { store } from '../editor/store.js';
import { CAT_SHORT, FONT_CATS } from '../editor/ui.js';

export default {
  props: ['def', 'obj', 'name'],
  data(){ return { open:false, q:'', cat:'all', status:'', statusErr:false, FONT_CATS }; },
  computed: {
    val(){ return this.obj[this.name]; },
    filtered(){
      const q = this.q.trim().toLowerCase();
      return fontCatalog.filter(f => (this.cat === 'all' || f.category === this.cat) && (!q || f.family.toLowerCase().includes(q)));
    },
    customCandidate(){ const q = this.q.trim(); return q.length >= 2 && !findFont(q); }
  },
  watch: { filtered(){ this.observeRows(); } },
  beforeUnmount(){ this.stopPreview(); if (this.io) this.io.disconnect(); },
  methods: {
    stack: fontStack,
    catOf(f){ const e = findFont(f); return e ? CAT_SHORT[e.category] : ''; },
    ready(f){ return fontState.full[f] === 'ok' || fontState.preview[f] === 'ok'; },
    toggle(){
      this.open = !this.open;
      if (this.open){ this.status = ''; nextTick(() => { if (this.$refs.search) this.$refs.search.focus({ preventScroll: true }); this.setupObserver(); }); }
      else this.close();
    },
    close(){ this.open = false; this.stopPreview(); if (this.io){ this.io.disconnect(); this.io = null; } },
    setupObserver(){
      if (!('IntersectionObserver' in window)){ this.filtered.slice(0, 40).forEach(f => queuePreview(f.family)); return; }
      this.io = new IntersectionObserver(ents => ents.forEach(en => {
        if (en.isIntersecting){ queuePreview(en.target.dataset.family); this.io && this.io.unobserve(en.target); }
      }), { root: this.$refs.list, rootMargin: '160px' });
      this.observeRows();
    },
    observeRows(){ nextTick(() => { if (!this.io || !this.$refs.list) return; this.$refs.list.querySelectorAll('[data-family]').forEach(el => this.io.observe(el)); }); },
    preview(f){ if (f) loadFont(f); store.fontPreview = { obj: this.obj, name: this.name, family: f }; },
    stopPreview(){ const p = store.fontPreview; if (p && p.obj === this.obj && p.name === this.name) store.fontPreview = null; },
    choose(f){ if (f) loadFont(f); this.obj[this.name] = f; this.q = ''; this.close(); },
    async tryCustom(){
      const raw = this.q.trim(); if (!raw) return;
      const exact = findFont(raw); if (exact) return this.choose(exact.family);
      this.statusErr = false; this.status = 'Looking for “' + raw + '” on Google Fonts…';
      let fam = raw, ok = await loadFont(raw);
      const titled = raw.replace(/\b[a-z]/g, c => c.toUpperCase());
      if (!ok && titled !== raw){ ok = await loadFont(titled); fam = titled; }
      if (ok){ this.status = ''; this.choose(fam); }
      else { this.statusErr = true; this.status = '“' + raw + '” isn’t on Google Fonts. Check the exact name on fonts.google.com, for example “Space Grotesk”.'; }
    },
    onEnter(){ if (this.filtered.length === 1) this.choose(this.filtered[0].family); else if (this.customCandidate) this.tryCustom(); }
  }
};
</script>
