<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container" :style="{textAlign:p.align}">
    <a class="s-btn" :class="['v-'+p.variant,'bs-'+p.size]" :href="p.href || '#'"><editable :item="item" field="label"/></a></div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
