<template>
  <div class="blk" :data-item-id="item.id" :class="{selected: sel, hover: hov, dragging: isDragging}" :style="fontStyle"
      :draggable="(!store.preview && !store.editingId) ? 'true' : 'false'"
      @dragstart="onDragStart" @dragend="onDragEnd" @click="onClick" @mouseover.stop="onHover">
      <div v-if="hov && !sel" class="blk-label">{{ label }}</div>
      <div v-if="sel" class="blk-actions" @click.stop draggable="false">
        <span class="nm">{{ label }}</span>
        <button v-if="pos.hasParent" title="Select parent" aria-label="Select parent" @click="selectParent"><icon name="parent" :size="13"/></button>
        <button title="Move up" aria-label="Move up" :disabled="pos.first" @click="moveBy(item.id,-1)"><icon name="up" :size="13"/></button>
        <button title="Move down" aria-label="Move down" :disabled="pos.last" @click="moveBy(item.id,1)"><icon name="down" :size="13"/></button>
        <button title="Duplicate" aria-label="Duplicate" @click="duplicateItem(item.id)"><icon name="copy" :size="13"/></button>
        <button title="Delete" aria-label="Delete" @click="removeItem(item.id)"><icon name="trash" :size="13"/></button>
        <button class="only-narrow" title="Edit properties" aria-label="Edit properties" @click="openProps"><icon name="sliders" :size="13"/></button>
      </div>
      <component :is="'c-' + item.type" :item="item" :p="item.props"/>
    </div>
</template>

<script>
import { CONFIG } from '../editor/config.js';
import { fontStack, shownValue } from '../editor/fonts.js';
import { endDrag, findItem, select, store } from '../editor/store.js';

export default {
  props: ['item'],
  computed: {
    sel(){ return !store.preview && store.selectedId === this.item.id; },
    hov(){ return !store.preview && store.hoverId === this.item.id && !store.drag; },
    isDragging(){ return store.drag && store.drag.kind === 'move' && store.drag.id === this.item.id; },
    label(){ return CONFIG[this.item.type].label; },
    fontStyle(){ const f = shownValue(this.item.props, 'font'); if (!f) return null; const s = fontStack(f); return { fontFamily: s, '--site-head': s, '--site-body': s }; },
    pos(){ const r = findItem(this.item.id); return r ? { first: r.index === 0, last: r.index === r.list.length - 1, hasParent: !!r.parent, parentId: r.parent && r.parent.id } : {}; }
  },
  methods: {
    onClick(e){
      if (e.target.closest('a')) e.preventDefault();
      if (store.preview) return;
      e.stopPropagation(); select(this.item.id);
    },
    onHover(){ if (!store.preview && store.hoverId !== this.item.id) store.hoverId = this.item.id; },
    onDragStart(e){
      if (store.preview) return;
      e.stopPropagation();
      store.drag = { kind: 'move', id: this.item.id };
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', this.item.id); } catch(_){}
    },
    onDragEnd(){ endDrag(); },
    selectParent(){ if (this.pos.parentId){ select(this.pos.parentId); } },
    openProps(){ this.$root.openProps(); }
  }
};
</script>
