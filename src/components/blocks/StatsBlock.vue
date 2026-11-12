<template>
  <div class="s-section" :class="'sp-'+p.padding"><div class="s-container">
      <h2 v-if="p.title" class="s-h hs-m s-stats-title"><editable :item="item" field="title"/></h2>
      <div class="s-stats"><div v-for="(s,i) in p.items" :key="i" class="s-stat"><div class="s-stat-v">{{ s.value }}</div><div class="s-stat-l">{{ s.label }}</div></div></div>
    </div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
