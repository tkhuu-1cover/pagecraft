<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container" :style="{textAlign:p.align}">
    <p class="s-text" :class="['ts-'+p.size,'tc-'+p.color]" :style="st"><editable :item="item" field="text" multiline/></p></div></div>
</template>

<script>
import { marginFor } from '../../editor/blocks.js';

export default { props:['item','p'],
  computed:{ st(){ return { maxWidth: this.p.maxWidth ? this.p.maxWidth + 'px' : 'none', margin: marginFor(this.p.align) }; } } };
</script>
