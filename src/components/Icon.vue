<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="html"></svg>
</template>

<script>
import { ICONS } from '../editor/config.js';

export default {
  props: { name: String, size: { type: Number, default: 17 } },
  computed: { html(){ return ICONS[this.name] || ''; } }
};
</script>
