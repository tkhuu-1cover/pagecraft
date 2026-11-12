/* Entry point. Modules are imported in dependency order: some of them do setup work when they load
   (the store reads localStorage, history records the first snapshot, custom CSS installs a <style>). */
import { createApp } from 'vue';
import './styles/editor.css';
import './styles/site.css';
import { CONFIG, BLOCK_ICONS, BLOCK_THUMBS } from './editor/config.js';
import './editor/fonts.js';
import { pagePath } from './editor/model.js';
import { store, select, moveBy, duplicateItem, removeItem, goToPage } from './editor/store.js';
import './editor/history.js';
import './editor/customCss.js';
import './editor/ai.js';
import './editor/exporter.js';
import './editor/ui.js';
import './editor/layouts.js';
import './editor/code.js';
import './editor/blocks.js';
import App from './App.vue';
import Icon from './components/Icon.vue';
import ZoneList from './components/ZoneList.vue';
import BlockWrapper from './components/BlockWrapper.vue';
import Editable from './components/Editable.vue';
import OutlineTree from './components/OutlineTree.vue';
import FieldEditor from './components/FieldEditor.vue';
import ArrayField from './components/ArrayField.vue';
import FontField from './components/FontField.vue';
import LinkField from './components/LinkField.vue';
import PagesPanel from './components/PagesPanel.vue';
import CodeView from './components/CodeView.vue';
import HeadingBlock from './components/blocks/HeadingBlock.vue';
import TextBlock from './components/blocks/TextBlock.vue';
import ButtonBlock from './components/blocks/ButtonBlock.vue';
import HeroBlock from './components/blocks/HeroBlock.vue';
import CardBlock from './components/blocks/CardBlock.vue';
import GridBlock from './components/blocks/GridBlock.vue';
import FlexBlock from './components/blocks/FlexBlock.vue';
import StatsBlock from './components/blocks/StatsBlock.vue';
import LogosBlock from './components/blocks/LogosBlock.vue';
import TestimonialBlock from './components/blocks/TestimonialBlock.vue';
import ImageBlock from './components/blocks/ImageBlock.vue';
import HtmlBlock from './components/blocks/HtmlBlock.vue';
import AiPanel from './components/AiPanel.vue';
import SpaceBlock from './components/blocks/SpaceBlock.vue';
import DividerBlock from './components/blocks/DividerBlock.vue';

const app = createApp(App);

/* Templates use these directly, so they're available everywhere. */
Object.assign(app.config.globalProperties, { store, CONFIG, BLOCK_ICONS, BLOCK_THUMBS, select, moveBy, duplicateItem, removeItem, goToPage, pagePath });

/* Components are registered globally under the tag names the templates use
   (site blocks are looked up dynamically as 'c-' + block type). */
app.component('icon', Icon);
app.component('zone-list', ZoneList);
app.component('block', BlockWrapper);
app.component('editable', Editable);
app.component('outline-tree', OutlineTree);
app.component('field-editor', FieldEditor);
app.component('array-field', ArrayField);
app.component('font-field', FontField);
app.component('link-field', LinkField);
app.component('pages-panel', PagesPanel);
app.component('code-view', CodeView);
app.component('c-Heading', HeadingBlock);
app.component('c-Text', TextBlock);
app.component('c-Button', ButtonBlock);
app.component('c-Hero', HeroBlock);
app.component('c-Card', CardBlock);
app.component('c-Grid', GridBlock);
app.component('c-Flex', FlexBlock);
app.component('c-Stats', StatsBlock);
app.component('c-Logos', LogosBlock);
app.component('c-Testimonial', TestimonialBlock);
app.component('c-Image', ImageBlock);
app.component('c-Html', HtmlBlock);
app.component('ai-panel', AiPanel);
app.component('c-Space', SpaceBlock);
app.component('c-Divider', DividerBlock);

app.mount('#app');
