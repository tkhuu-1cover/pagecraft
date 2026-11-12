<template>
  <div class="zone" :class="[cls, {nested, 'drop-active': isTarget}]" :style="layoutStyle" :data-zone="zoneKey"
      @dragenter="onEnter" @dragover="onOver" @dragleave="onLeave" @drop="onDrop">
      <block v-for="it in items" :key="it.id" :item="it"/>
      <div v-if="!items.length && !store.preview" class="zone-empty">{{ emptyText }}</div>
      <div v-if="line && items.length" class="drop-line" :style="lineStyle"></div>
    </div>
</template>

<script>
import { computeDrop, endDrag, pathTo, performDrop, store } from '../editor/store.js';

export default {
  props: { zoneKey: String, items: Array, axis: { type: String, default: 'y' }, nested: Boolean, layoutStyle: Object, cls: [String, Array, Object] },
  computed: {
    isTarget(){ return !!store.drag && store.dropTarget && store.dropTarget.zone === this.zoneKey; },
    line(){ return this.isTarget && store.dropTarget.line; },
    lineStyle(){ const l = this.line; return { top: l.top + 'px', left: l.left + 'px', width: l.width + 'px', height: l.height + 'px' }; },
    emptyText(){ return this.zoneKey === 'root' ? 'Drag a block here to start your page, or click one in the Blocks panel.' : 'Drop blocks here'; }
  },
  methods: {
    valid(){
      const d = store.drag; if (!d || store.preview) return false;
      if (d.kind === 'move' && this.zoneKey !== 'root'){
        const owner = this.zoneKey.slice(0, this.zoneKey.lastIndexOf(':'));
        const p = pathTo(owner); if (p && p.some(x => x.id === d.id)) return false;
      }
      return true;
    },
    onEnter(e){ if (this.valid()) e.preventDefault(); },
    onOver(e){
      if (!this.valid()) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect = store.drag.kind === 'new' ? 'copy' : 'move';
      const t = computeDrop(e, this.$el, this.zoneKey, this.axis);
      const o = store.dropTarget;
      if (!o || o.zone !== t.zone || o.index !== t.index || JSON.stringify(o.line) !== JSON.stringify(t.line)) store.dropTarget = t;
    },
    onLeave(e){
      if (e.relatedTarget && this.$el.contains(e.relatedTarget)) return;
      if (store.dropTarget && store.dropTarget.zone === this.zoneKey) store.dropTarget = null;
    },
    onDrop(e){ if (!this.valid()) return; e.preventDefault(); e.stopPropagation(); performDrop(); endDrag(); }
  }
};
</script>
