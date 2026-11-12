<template>
  <span class="editable" :contenteditable="canEdit ? 'plaintext-only' : 'false'" spellcheck="false" @focus="onFocus" @input="onInput" @blur="onBlur" @keydown="onKey"></span>
</template>

<script>
import { store } from '../editor/store.js';

export default {
  props: { item: Object, field: String, multiline: Boolean },
  computed: {
    canEdit(){ return !store.preview && store.selectedId === this.item.id; },
    value(){ return this.item.props[this.field]; }
  },
  watch: { value(v){ if (document.activeElement !== this.$el) this.$el.textContent = v == null ? '' : v; } },
  mounted(){ this.$el.textContent = this.value == null ? '' : this.value; },
  methods: {
    onFocus(){ store.editingId = this.item.id; },
    onInput(){ this.item.props[this.field] = this.$el.textContent; },
    onBlur(){ store.editingId = null; },
    onKey(e){
      e.stopPropagation();
      if (e.key === 'Escape' || (e.key === 'Enter' && !this.multiline)){ e.preventDefault(); this.$el.blur(); }
    }
  }
};
</script>
