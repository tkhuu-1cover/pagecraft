<template>
  <div class="arr">
      <div v-for="(it,i) in list" :key="i" class="arr-item" :class="{open: open===i}">
        <div class="arr-head" @click="open = open===i ? null : i">
          <icon :name="open===i ? 'chevron-down' : 'chevron-right'" :size="14"/>
          <span class="arr-sum">{{ summary(it,i) }}</span>
          <span class="arr-acts" @click.stop>
            <button class="ib" title="Move up" aria-label="Move up" :disabled="i===0" @click="move(i,-1)"><icon name="up" :size="13"/></button>
            <button class="ib" title="Move down" aria-label="Move down" :disabled="i===list.length-1" @click="move(i,1)"><icon name="down" :size="13"/></button>
            <button class="ib" title="Remove" aria-label="Remove" @click="remove(i)"><icon name="trash" :size="13"/></button>
          </span>
        </div>
        <div v-if="open===i" class="arr-body">
          <field-editor v-for="(fd,k) in def.arrayFields" :key="k" :def="fd" :name="k" :obj="it"/>
        </div>
      </div>
      <button class="btn sm full" :disabled="def.max && list.length>=def.max" @click="add"><icon name="plus" :size="14"/> Add item</button>
    </div>
</template>

<script>
import { clone } from '../editor/config.js';

export default {
  props: ['def', 'list'],
  data(){ return { open: null }; },
  methods: {
    add(){ this.list.push(clone(this.def.defaultItem)); this.open = this.list.length - 1; },
    remove(i){ this.list.splice(i, 1); this.open = null; },
    move(i, d){ const j = i + d; if (j < 0 || j >= this.list.length) return; const [x] = this.list.splice(i, 1); this.list.splice(j, 0, x); this.open = j; },
    summary(it, i){ return (this.def.summary && this.def.summary(it)) || ('Item ' + (i + 1)); }
  }
};
</script>
