<template>
  <div>
      <select class="inp" :value="mode" @change="pick($event.target.value)">
        <optgroup label="Pages in this site">
          <option v-for="p in pages" :key="p.id" :value="'page:' + p.id">{{ p.title || 'Untitled' }}  ({{ pagePath(p) }})</option>
        </optgroup>
        <option v-if="missing" value="__missing" disabled>Deleted page</option>
        <option value="__url">Web address or anchor…</option>
      </select>
      <input v-if="!isPage" class="inp" style="margin-top:6px" :value="val" placeholder="https://… or #section" @input="obj[name] = $event.target.value">
      <div v-if="missing" class="field-hint err">The page this linked to was deleted. Pick another one.</div>
    </div>
</template>

<script>
import { store } from '../editor/store.js';

export default {
  props: ['obj', 'name'],
  computed: {
    val(){ return this.obj[this.name] || ''; },
    pages(){ return store.project.pages; },
    isPage(){ return this.val.startsWith('page:'); },
    missing(){ return this.isPage && !this.pages.some(p => 'page:' + p.id === this.val); },
    mode(){ return this.missing ? '__missing' : this.isPage ? this.val : '__url'; }
  },
  methods: {
    pick(v){ if (v === '__url') this.obj[this.name] = this.isPage ? '#' : this.val; else if (v !== '__missing') this.obj[this.name] = v; }
  }
};
</script>
