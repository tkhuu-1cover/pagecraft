# Pagecraft

A visual, multi-page website editor built with Vue 3 and Vite. Drag blocks onto a canvas, edit text in place, manage pages and reusable layouts, ask an AI assistant for changes, edit the source in Monaco, and export a working static site.

This project is the editor that ran as a single HTML file inside Claude, split into Vue single-file components and plain ES modules so you can develop it on your own.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Requires Node 18 or newer (Node 20.6+ for `npm run ai-proxy`, which uses `--env-file`).

## Project layout

```
index.html                  Vite entry; loads the editor fonts from Google Fonts
src/
  main.js                   Creates the app, registers components and template globals
  App.vue                   Editor shell: top bar, sidebars, canvas, modals, shortcuts
  styles/
    editor.css              Editor chrome (light and dark)
    site.css                The website’s own styles; also bundled into exports
  components/
    BlockWrapper.vue        Selection, hover, drag handle and toolbar around every block
    ZoneList.vue            A drop zone (the page, or the inside of a Grid/Flex)
    Editable.vue            In-place text editing
    FieldEditor.vue         Renders one settings field (text, select, color, image, …)
    ArrayField.vue          List fields such as Hero buttons or Stats
    FontField.vue           Google Fonts picker with live preview
    LinkField.vue           Link picker (pages in this site, or a URL)
    OutlineTree.vue         Outline tab
    PagesPanel.vue          Pages tab: pages, layouts, apply/save layouts
    AiPanel.vue             Assistant tab
    CodeView.vue            Code mode (Monaco)
    Icon.vue                Inline SVG icon set
    blocks/                 One component per site block (Heading, Hero, Grid, …)
  editor/
    config.js               Block definitions, fields, defaults, icons, palette thumbnails
    model.js                Site/page model, demo site, JSON normalization, slugs
    store.js                Reactive store, tree helpers, selection, drag-and-drop maths
    history.js              Undo/redo and localStorage persistence
    fonts.js                Font catalog and on-demand loading
    customCss.js            Per-block and site-wide custom CSS, HTML sanitizing
    layouts.js              Built-in layouts and layout helpers
    ai.js                   Assistant prompt, model access, applying operations
    exporter.js             Static-site export and a dependency-free ZIP writer
    code.js                 Monaco loader and the files shown in Code mode
    ui.js, blocks.js        Small shared constants and helpers
server/
  ai-proxy.mjs              Optional proxy so the assistant can use the Anthropic API
```

`main.js` imports the `editor/` modules in a fixed order because a few of them do work when they load: the store reads localStorage, history records the first snapshot, and custom CSS installs its `<style>` tag. Keep that order if you add modules.

## How it works

**Data.** Everything lives in `store.project`:

```js
{
  settings:  { siteName, accent, headFont, bodyFont, showHeader, showFooter, customCss },
  pages:     [{ id, title, slug, inNav, content: [block, …] }],   // first page is home
  templates: [{ id, name, description, content: [block, …] }]     // saved layouts
}
block = { id, type, props: { … }, zones?: { items: [block, …] } }  // Grid and Flex have zones
```

`store.data` is a getter for whatever is on the canvas: the current page, or a layout while one is being edited. Links between pages are stored as `page:<id>`, so renaming a page or changing its address never breaks them.

**Rendering.** `ZoneList` renders a list of blocks; each block is wrapped in `BlockWrapper` and drawn by the component registered as `c-<Type>` (for example `c-Hero`). The same markup is what Export site saves, minus editor-only attributes.

**History.** Any change to `store.project` is snapshotted (debounced) for undo/redo and saved to localStorage under `pagecraft:site:v2`.

## Adding a block

1. In `src/editor/config.js`, add an entry to `CONFIG` with a `label`, `fields` and `defaults` (add `zones: ['items']` if it holds other blocks). Field types: `text`, `textarea`, `number`, `select`, `radio`, `color`, `image`, `font`, `link`, `code`, `array`.
2. Add it to a `CATEGORIES` group, and give it an icon in `BLOCK_ICONS` and a 64×40 sketch in `BLOCK_THUMBS`.
3. Create `src/components/blocks/MyBlock.vue` taking `item` and `p` (the props). Use `<editable :item="item" field="title"/>` for text that should be editable in place, and `<zone-list :zone-key="item.id + ':items'" :items="item.zones.items" nested/>` for child blocks.
4. Register it in `src/main.js` as `app.component('c-MyBlock', MyBlock)`.

Every block automatically gets the Font (for text blocks listed in `model.js`) and Custom CSS settings, appears in the Outline, works with undo, and is understood by the assistant.

## The assistant

Inside Claude, the assistant uses the viewer’s Claude account. Outside Claude it needs an endpoint:

```bash
cp .env.example .env          # then set ANTHROPIC_API_KEY
npm run ai-proxy              # terminal 1
npm run dev                   # terminal 2
```

The editor posts `{ messages }` to `VITE_AI_ENDPOINT` and expects back the JSON object described in the prompt (`{ reply, operations }`). `server/ai-proxy.mjs` is a minimal example; keep your API key on the server and add authentication before deploying it anywhere public.

## Code mode

Monaco is loaded on demand from jsDelivr (`monaco-editor@0.52.2`) the first time Code mode opens, so it doesn’t add to the main bundle. To self-host it, install `monaco-editor@0.52.2`, copy `node_modules/monaco-editor/min` to `public/monaco`, and set `MONACO_BASE` in `src/editor/code.js` to `'/monaco/'`. If Monaco can’t load, Code mode falls back to a plain text editor.

## Export

Export site renders each page, removes editor-only markup, writes `index.html` plus one file per page, `styles.css` (from `site.css` plus custom CSS), `site.json` and a README, and zips them with the small writer in `exporter.js`. Inside Claude it uses the viewer’s download prompt; elsewhere it triggers a normal browser download.

## Notes

- `window.claude` (assistant and downloads inside Claude) is optional; every feature that uses it has a fallback or hides itself.
- Fonts come from Google Fonts, in the editor and in exported sites.
- Custom HTML blocks are sanitized (no scripts, iframes or inline event handlers).
