<template>
  <div class="s-section" :class="'sp-'+p.padding"><div class="s-container">
      <p v-if="p.title" class="s-logos-title"><editable :item="item" field="title"/></p>
      <div class="s-logos"><span v-for="(l,i) in p.items" :key="i" class="s-logo" :class="'l'+(i%6)">{{ l.name }}</span></div>
    </div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
