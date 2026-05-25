import { html, render } from './preact-config.js';
import App from './App.js';

render(html`<${App} />`, document.getElementById('root'));
