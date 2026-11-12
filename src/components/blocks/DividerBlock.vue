<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container"><hr class="s-hr" :class="p.style"></div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
