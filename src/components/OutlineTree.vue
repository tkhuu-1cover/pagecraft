<template>
  <div class="tree">
      <template v-for="it in items" :key="it.id">
        <div class="tree-row" :class="{sel: store.selectedId===it.id, hov: store.hoverId===it.id}" :style="{paddingLeft:(10+depth*14)+'px'}"
             @click="pick(it.id)" @mouseenter="store.hoverId=it.id" @mouseleave="store.hoverId=null">
          <icon :name="BLOCK_ICONS[it.type] || 'square'" :size="13"/><span>{{ CONFIG[it.type].label }}</span><span class="tree-sub">{{ sub(it) }}</span>
        </div>
        <template v-if="it.zones">
          <outline-tree v-for="(list, zn) in it.zones" :key="zn" :items="list" :depth="depth+1" @picked="$emit('picked')"/>
        </template>
      </template>
      <div v-if="!items.length && depth>1" class="tree-empty" :style="{paddingLeft:(30+depth*14)+'px'}">Empty</div>
    </div>
</template>

<script>
import { scrollToItem, select } from '../editor/store.js';

export default {
  props: { items: Array, depth: { type: Number, default: 0 } },
  emits: ['picked'],
  methods: {
    sub(it){ const p = it.props; const s = p.title || p.text || p.label || p.quote || p.name || ''; return String(s).slice(0, 40); },
    pick(id){ select(id); scrollToItem(id); this.$emit('picked'); }
  }
};
</script>
