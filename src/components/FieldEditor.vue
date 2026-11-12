<template>
  <div class="field">
      <div class="field-label">{{ def.label || name }}</div>
      <input v-if="def.type==='text'" class="inp" :value="val" @input="set($event.target.value)">
      <textarea v-else-if="def.type==='textarea'" class="inp" rows="3" :value="val" @input="set($event.target.value)"></textarea>
      <input v-else-if="def.type==='number'" class="inp" type="number" :min="def.min" :max="def.max" :step="def.step||1" :value="val" @input="onNum">
      <select v-else-if="def.type==='select'" class="inp" :value="val" @change="set($event.target.value)">
        <option v-for="o in def.options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <div v-else-if="def.type==='radio'" class="seg">
        <button v-for="o in def.options" :key="String(o.value)" :class="{on: val===o.value}" @click="set(o.value)">{{ o.label }}</button>
      </div>
      <div v-else-if="def.type==='color'" class="color-row">
        <input type="color" :value="val" @input="set($event.target.value)" aria-label="Pick color">
        <input class="inp mono" :value="val" @change="setColor($event.target.value)">
      </div>
      <div v-else-if="def.type==='image'">
        <div v-if="val" class="img-prev"><img :src="val" alt=""></div>
        <div class="row">
          <label class="btn sm"><icon name="upload" :size="14"/>{{ val ? 'Replace image' : 'Upload image' }}<input type="file" accept="image/*" hidden @change="upload"></label>
          <button v-if="val" class="btn sm ghost" @click="set('')">Remove</button>
        </div>
      </div>
      <array-field v-else-if="def.type==='array'" :def="def" :list="val"/>
      <font-field v-else-if="def.type==='font'" :def="def" :obj="obj" :name="name"/>
      <link-field v-else-if="def.type==='link'" :obj="obj" :name="name"/>
      <div v-else-if="def.type==='slug'">
        <div class="slug-row"><span>/</span><input class="inp mono" :value="isHome ? '' : val" :disabled="isHome" :placeholder="isHome ? 'home page' : ''" @change="setSlug($event)"></div>
        <div class="field-hint">{{ isHome ? 'This is the home page, so it opens at /. Move another page to the top of the Pages list to change that.' : 'Links to this page keep working when you change it.' }}</div>
      </div>
      <textarea v-else-if="def.type==='code'" class="inp code" rows="6" spellcheck="false" :placeholder="def.placeholder" :value="val" @input="set($event.target.value)"></textarea>
    </div>
</template>

<script>
import { uniqueSlug } from '../editor/model.js';
import { store, toast } from '../editor/store.js';
import { readImage } from '../editor/history.js';

export default {
  props: ['def', 'name', 'obj'],
  computed: { val(){ return this.obj[this.name]; }, isHome(){ return store.project.pages[0] === this.obj; } },
  methods: {
    set(v){ this.obj[this.name] = v; },
    setSlug(e){ const v = uniqueSlug(e.target.value || this.obj.title, this.obj.id); this.set(v); e.target.value = v; },
    onNum(e){
      let v = parseFloat(e.target.value); if (isNaN(v)) return;
      if (this.def.min != null) v = Math.max(this.def.min, v);
      if (this.def.max != null) v = Math.min(this.def.max, v);
      this.set(v);
    },
    setColor(v){ if (/^#[0-9a-f]{6}$/i.test(v.trim())) this.set(v.trim()); },
    async upload(e){
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { this.set(await readImage(f)); } catch (err) { toast('That file couldn’t be read as an image'); }
      e.target.value = '';
    }
  }
};
</script>
