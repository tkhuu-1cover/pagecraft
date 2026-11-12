<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container"><div class="s-html" v-html="clean"></div></div></div>
</template>

<script>
import { sanitizeHtml } from '../../editor/customCss.js';

export default { props:['item','p'],
  computed:{ clean(){ return sanitizeHtml(this.p.html); } } };
</script>
