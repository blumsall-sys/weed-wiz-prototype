// Always check for updated GitHub Pages content, bypassing HTTP cache for the worker.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
 window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(r=>r.update()).catch(console.warn));
}
