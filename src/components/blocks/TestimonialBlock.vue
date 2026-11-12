<template>
  <div class="s-section" :class="'sp-'+p.padding"><div class="s-container"><figure class="s-quote" :class="'al-'+p.align">
      <blockquote><editable :item="item" field="quote" multiline/></blockquote>
      <figcaption class="s-quote-by"><span class="s-avatar">{{ initials }}</span><span class="s-quote-meta"><div class="s-quote-name"><editable :item="item" field="name"/></div><div class="s-quote-role"><editable :item="item" field="role"/></div></span></figcaption>
    </figure></div></div>
</template>

<script>
export default { props:['item','p'],
  computed:{ initials(){ return (this.p.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase(); } } };
</script>
