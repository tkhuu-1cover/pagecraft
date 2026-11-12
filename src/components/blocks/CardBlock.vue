<template>
  <div class="s-container"><div class="s-card" :class="'m-'+p.mode" :style="{textAlign:p.align}">
      <div v-if="p.icon && p.icon!=='none'" class="s-card-icon" :style="p.align==='center' ? {marginInline:'auto'} : null"><icon :name="p.icon" :size="21"/></div>
      <h3><editable :item="item" field="title"/></h3>
      <p><editable :item="item" field="description" multiline/></p>
    </div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
