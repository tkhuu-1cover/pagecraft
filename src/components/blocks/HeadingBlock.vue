<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container" :style="{textAlign:p.align}">
    <component :is="p.level" class="s-h" :class="['hs-'+p.size,'tc-'+p.color]"><editable :item="item" field="text" multiline/></component></div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
