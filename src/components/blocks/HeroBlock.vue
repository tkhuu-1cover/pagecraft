<template>
  <section class="s-hero" :class="['bg-'+p.background,'sp-'+p.padding,'al-'+p.align,{split: p.visual!=='none' && p.align==='left'}]">
    <div class="s-container s-hero-inner">
      <div>
        <h1 class="s-hero-title"><editable :item="item" field="title" multiline/></h1>
        <p class="s-hero-desc"><editable :item="item" field="description" multiline/></p>
        <div class="s-hero-actions" v-if="p.buttons && p.buttons.length">
          <a v-for="(b,i) in p.buttons" :key="i" class="s-btn" :class="'v-'+b.variant" :href="b.href || '#'">{{ b.label }}</a>
        </div>
      </div>
      <div v-if="p.visual==='pattern'" class="s-hero-visual" aria-hidden="true"><i class="s-wheel w2"></i><i class="s-wheel w1"></i></div>
      <div v-else-if="p.visual==='image'" class="s-hero-visual">
        <img v-if="p.image" :src="p.image" alt="">
        <div v-else class="s-img-ph"><icon name="image" :size="26"/>Upload an image in the panel on the right</div>
      </div>
    </div></section>
</template>

<script>
export default { props:['item','p'] };
</script>
