const CACHE='wiz-dog-build-v08';
const ASSETS=[
  "./",
  "./index.html",
  "./src/game.js",
  "./src/style.css",
  "./src/register-sw.js",
  "./assets/atlas/atlas-data.js",
  "./assets/atlas/player.png",
  "./assets/atlas/animals.png",
  "./assets/atlas/mushrooms.png",
  "./assets/animals/sunny.png",
  "./assets/animals/peaches.png",
  "./assets/atlas/npcs.png",
  "./assets/atlas/world.png",
  "./assets/atlas/items.png",
  "./assets/atlas/ui.png",
  "./assets/atlas/buildings.png",
  "./assets/atlas/interiors.png",
  "./assets/audio/moonlit_garden_loop.mp3",
  "./assets/audio/dialogue.wav",
  "./assets/audio/ui.wav",
  "./assets/audio/quest.wav",
  "./assets/audio/pickup.wav",
  "./assets/audio/plant.wav",
  "./assets/audio/water.wav",
  "./assets/audio/cast.wav",
  "./assets/audio/snail.wav",
  "./assets/audio/jump.wav",
  "./assets/audio/door.wav",
  "./assets/audio/harvest.wav",
  "./assets/audio/purchase.wav",

  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.webmanifest"
];
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE&&(n.startsWith('weed-wizards-')||n.startsWith('wiz-dog-'))).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.headers.has('range'))return; /* Media byte-range requests pass through unchanged. */ e.respondWith(fetch(e.request).then(response=>{if(response.status===200){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(e.request)));});
