const fs=require('node:fs');
const path=require('node:path');
const dir=__dirname;
const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');
const model=fs.readFileSync(path.join(dir,'model.js'),'utf8');
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const html=`<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Интерактивный HTML-прототип Webtronica: мониторинг позиций и текстовой релевантности"><title>Просадки и релевантность — Webtronica</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 29 10v13L16 31 3 23V10Z' fill='none' stroke='%236c5888' stroke-width='3'/%3E%3Cpath d='M16 3v27M4 10l12 8 12-8' fill='none' stroke='%236c5888' stroke-width='3'/%3E%3C/svg%3E"><style>${css}</style></head><body><div id="app"></div><div id="overlay"></div><div id="portal"></div><div id="tooltip" class="tooltip" role="tooltip" hidden></div><div id="toast" class="toast" role="status" aria-live="polite" hidden></div><script>${model}</script><script>${app}</script></body></html>`;
fs.writeFileSync(path.join(dir,'..','webtronica-monitor.html'),html);
console.log('Built webtronica-monitor.html ('+Buffer.byteLength(html)+' bytes)');
