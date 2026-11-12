<template>
  <div class="s-section" :class="'sp-'+p.padding"><div class="s-container">
      <zone-list :zone-key="item.id+':items'" :items="item.zones.items" axis="grid" nested :cls="['s-grid', p.numColumns>=3 ? 'c3p' : '']" :layout-style="st"/>
    </div></div>
</template>

<script>
export default { props:['item','p'],
  computed:{ st(){ return { display:'grid', gridTemplateColumns:'repeat(' + Math.max(1, this.p.numColumns | 0) + ', minmax(0,1fr))', gap: this.p.gap + 'px', alignItems:'stretch' }; } } };
</script>
