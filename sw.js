const V='tinplate-v5',SC=self.registration.scope;
const FILES=['','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].map(f=>new URL(f,SC).href);
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(FILES.map(u=>c.add(new Request(u,{cache:'reload'}))))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
// Cache first (instant, works offline); refresh the cache in the background when online.
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match(new URL('index.html',SC).href):undefined);
    const net=fetch(r).then(x=>{if(x&&x.ok)c.put(r,x.clone());return x}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response('آفلاین هستید و این صفحه هنوز ذخیره نشده است.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })());
});
