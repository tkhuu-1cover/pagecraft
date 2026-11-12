<template>
  <div class="s-section" :class="'sp-'+p.padding"><div class="s-container">
      <zone-list :zone-key="item.id+':items'" :items="item.zones.items" :axis="p.direction==='row' ? 'x' : 'y'" nested :cls="['s-flex', p.direction==='row' ? 'f-row' : '']" :layout-style="st"/>
    </div></div>
</template>

<script>
import { JMAP } from '../../editor/blocks.js';

export default { props:['item','p'],
  computed:{ st(){ return { display:'flex', flexDirection:this.p.direction, justifyContent:JMAP[this.p.justify], alignItems:JMAP[this.p.align], gap:this.p.gap+'px', flexWrap:this.p.wrap ? 'wrap' : 'nowrap' }; } } };
</script>
