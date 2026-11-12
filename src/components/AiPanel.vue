<template>
  <section class="ai-panel" aria-label="Assistant">
      <header v-if="msgs.length" class="ai-head">
        <span>Conversation</span>
        <button class="btn sm ghost" :disabled="busy" @click="clear"><icon name="plus" :size="13"/>New chat</button>
      </header>
      <div class="ai-body" ref="body" aria-live="polite">
        <div v-if="ai.status==='unavailable' && !msgs.length" class="ai-empty">The assistant uses Claude, which isn’t available in this view. Open this page inside Claude to use it.</div>
        <div v-else-if="!msgs.length" class="ai-empty">
          <p>Describe a change and I’ll make it, including things the panels can’t do yet: hover effects, animations, custom sections, a new theme, or a rewrite of the copy. Every change can be undone.</p>
          <div class="ai-sugs"><button v-for="s in suggestions" :key="s" :disabled="busy || ai.status!=='ready'" @click="send(s)">{{ s }}</button></div>
        </div>
        <template v-for="(m,i) in msgs" :key="i">
          <div v-if="m.role==='user'" class="ai-msg user">{{ m.text }}</div>
          <div v-else class="ai-msg bot" :class="{err: m.error}">
            <div>{{ m.text }}</div>
            <ul v-if="m.changes && m.changes.length" class="ai-changes"><li v-for="(c,j) in m.changes" :key="j"><icon name="check" :size="12"/>{{ c }}</li></ul>
            <div v-if="m.errors && m.errors.length" class="ai-skipped">Skipped {{ m.errors.length }} step{{ m.errors.length>1 ? 's' : '' }}: {{ m.errors.join('; ') }}</div>
            <div v-if="m.changes && m.changes.length && m.afterIdx>m.beforeIdx" class="ai-actions">
              <button class="btn sm" :disabled="m.undone" @click="undoMsg(m)"><icon name="undo" :size="13"/>{{ m.undone ? 'Undone' : 'Undo these changes' }}</button>
            </div>
          </div>
        </template>
        <div v-if="busy" class="ai-msg bot pending"><span class="ai-dots"><i></i><i></i><i></i></span>{{ phase }}</div>
      </div>
      <footer class="ai-foot">
        <div v-if="sel" class="ai-ctx" :class="{off: !useSel}">
          <button @click="useSel=!useSel" :title="useSel ? 'The assistant will focus on this block. Click to ask about the whole page instead.' : 'Click to focus on the selected block again.'">{{ CONFIG[sel.type].label }} selected</button>
        </div>
        <div class="ai-input">
          <textarea v-model="text" rows="2" :disabled="ai.status==='unavailable'"
            :placeholder="sel && useSel ? 'Ask for a change to this ' + CONFIG[sel.type].label.toLowerCase() + '…' : 'Ask for a change to the page…'"
            @keydown.enter.exact.prevent="send()"></textarea>
          <button v-if="!busy" class="ai-send" :disabled="!text.trim() || ai.status!=='ready'" @click="send()" aria-label="Send"><icon name="send" :size="16"/></button>
          <button v-else class="ai-send stop" @click="stop" aria-label="Stop"><icon name="stop" :size="14"/></button>
        </div>
        <div class="ai-note">Enter to send, Shift+Enter for a new line. Uses your Claude account.</div>
      </footer>
    </section>
</template>

<script>
import { nextTick } from 'vue';
import { findItem, scrollToItem, select, store, toast } from '../editor/store.js';
import { flush, hist, record, recordTimer, undo } from '../editor/history.js';
import { AI_ERRORS, AI_OFF, ai, aiRules, applyOps, pageForPrompt, sampleFn } from '../editor/ai.js';
import { AI_SUGGESTIONS } from '../editor/blocks.js';

export default {
  data(){ return { ai, msgs: [], text: '', busy: false, phase: '', ctl: null, useSel: true, suggestions: AI_SUGGESTIONS }; },
  computed: { sel(){ const r = findItem(store.selectedId); return r ? r.item : null; } },
  watch: { sel(){ this.useSel = true; } },
  methods: {
    scrollDown(){ nextTick(() => { const b = this.$refs.body; if (b) b.scrollTop = b.scrollHeight; }); },
    clear(){ this.msgs = []; },
    send(t){
      const text = (t || this.text).trim();
      if (!text || this.busy || ai.status !== 'ready') return;
      this.run(text);
    },
    async run(text){
      const sel = this.useSel && this.sel ? this.sel : null;
      const history = this.msgs.filter(m => !m.error).slice(-8).map(m => ({ role: m.role,
        content: m.role === 'user' ? m.text : m.text + (m.changes && m.changes.length ? '\n[Applied: ' + m.changes.join('; ') + ']' : '') }));
      this.msgs.push({ role: 'user', text });
      this.text = ''; this.busy = true; this.phase = 'Thinking…'; this.scrollDown();
      const ctl = new AbortController(); this.ctl = ctl;
      const input = [
        { role: 'user', content: aiRules() },
        ...history,
        { role: 'user', content: 'SITE JSON (settings, all pages, and the current page you are editing):\n' + pageForPrompt() + '\n\nSELECTED BLOCK: ' + (sel ? sel.id + ' (' + sel.type + ')' : 'none') + '\n\nREQUEST: ' + text }
      ];
      try {
        const res = await sampleFn.json(input, { signal: ctl.signal, cache: false, onText: () => { this.phase = 'Writing changes…'; } });
        if (!res || typeof res !== 'object' || Array.isArray(res)) throw { code: 'invalid_json' };
        const ops = Array.isArray(res.operations) ? res.operations : [];
        flush(); const beforeIdx = hist.index;
        const out = applyOps(ops);
        clearTimeout(recordTimer); record();
        const afterIdx = hist.index;
        this.msgs.push({ role: 'assistant', text: String(res.reply || (out.changes.length ? 'Done.' : 'No changes made.')), changes: out.changes, errors: out.errors, beforeIdx, afterIdx, undone: false });
        if (out.focus){ select(out.focus); scrollToItem(out.focus); }
      } catch (e) {
        const code = e && e.code;
        if (AI_OFF.includes(code)) ai.status = 'unavailable';
        this.msgs.push({ role: 'assistant', error: true, text: code === 'cancelled' ? 'Stopped. Nothing was changed.' : AI_OFF.includes(code) ? 'The assistant isn’t allowed to use Claude in this view.' : (AI_ERRORS[code] || 'Something went wrong reaching Claude. Try again.') });
      } finally {
        this.busy = false; this.ctl = null; this.phase = ''; this.scrollDown();
      }
    },
    stop(){ if (this.ctl) this.ctl.abort(); },
    undoMsg(m){
      if (hist.index === m.afterIdx){ undo(); m.undone = true; }
      else toast('You’ve made edits since then. Use Undo in the toolbar to step back.');
    }
  }
};
</script>
