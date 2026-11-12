<template>
  <div class="s-block" :class="'bp-'+p.padding"><div class="s-container"><figure class="s-figure">
      <div class="s-img" :style="{aspectRatio:p.aspect, borderRadius:p.radius+'px'}">
        <img v-if="p.src" :src="p.src" :alt="p.alt">
        <div v-else class="s-img-ph"><icon name="image" :size="28"/>Select this block, then upload an image in the panel on the right</div>
      </div>
      <figcaption v-if="p.caption">{{ p.caption }}</figcaption>
    </figure></div></div>
</template>

<script>
export default { props:['item','p'] };
</script>
