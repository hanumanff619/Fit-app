const CACHE_NAME='fitapp-v1';
const ASSETS=[
  './',
  './index.html','./styles/app.css','./app.js',
  './manifest.webmanifest','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(res=>res||fetch(e.request).then(r=>{
      const copy=r.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});
      return r;
    }).catch(()=>res))
  );
});