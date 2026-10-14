const BUILD = {"version":"4c8f5e83ca00","platform":false,"files":[{"url":"assets/index-BGigC8VS.js","hash":"ee98455be0fe56b9","size":569668,"lazy":false},{"url":"assets/index-CYllomGS.css","hash":"4723244648a242cb","size":35913,"lazy":false},{"url":"assets/kit-D8GBxbMm.js","hash":"0b639a20549b6f20","size":7335,"lazy":false},{"url":"brands/offbeat/art/logo.svg","hash":"77f4a74ea767c9e6","size":623,"lazy":false},{"url":"brands/offbeat/art/prize-cap.svg","hash":"cf9b889070c3bfd8","size":491,"lazy":false},{"url":"brands/offbeat/art/prize-grand.svg","hash":"5c8bf5a76eabc102","size":491,"lazy":false},{"url":"brands/offbeat/art/prize-sticker.svg","hash":"f1e7bd9c22d821fd","size":491,"lazy":false},{"url":"brands/offbeat/art/prize-tshirt.svg","hash":"973772cc297be665","size":491,"lazy":false},{"url":"brands/offbeat/brand.json","hash":"edc5d696d432e989","size":1248,"lazy":false},{"url":"brands/offbeat/fonts/OFL-bungee.txt","hash":"1256e1025d54b27c","size":4378,"lazy":false},{"url":"brands/offbeat/fonts/OFL-fredoka.txt","hash":"9bbd4f5f107895d5","size":4387,"lazy":false},{"url":"brands/offbeat/fonts/bungee-latin-400-normal.woff2","hash":"126eec706b793168","size":14344,"lazy":false},{"url":"brands/offbeat/fonts/fredoka-latin-600-normal.woff2","hash":"b62f2898de150f01","size":16468,"lazy":false},{"url":"icons/apple-touch-icon.png","hash":"68f0c59bea893f66","size":7732,"lazy":false},{"url":"icons/icon-192.png","hash":"f47b756a0416325f","size":11362,"lazy":false},{"url":"icons/icon-512.png","hash":"cafb9aa5d7a6145d","size":30391,"lazy":false},{"url":"icons/icon-maskable-512.png","hash":"6be4b92d100b865f","size":19659,"lazy":false},{"url":"index.html","hash":"d0fbbcf27cca899c","size":4666,"lazy":false},{"url":"manifest.webmanifest","hash":"52862b69ffe3f169","size":672,"lazy":false},{"url":"mediapipe/wasm/vision_wasm_internal.js","hash":"e170ee67dd4e16c1","size":323377,"lazy":true},{"url":"mediapipe/wasm/vision_wasm_internal.wasm","hash":"8da277a733926eac","size":11756954,"lazy":true},{"url":"mediapipe/wasm/vision_wasm_module_internal.js","hash":"da8934057f147b62","size":323415,"lazy":true},{"url":"mediapipe/wasm/vision_wasm_module_internal.wasm","hash":"2dabd8e23c609846","size":11756972,"lazy":true},{"url":"mediapipe/wasm/vision_wasm_nosimd_internal.js","hash":"e81d715a3d42cc33","size":323180,"lazy":true},{"url":"mediapipe/wasm/vision_wasm_nosimd_internal.wasm","hash":"a28483cd42e74e85","size":10960242,"lazy":true},{"url":"models/face_landmarker.task","hash":"64184e229b263107","size":3758596,"lazy":true},{"url":"models/hand_landmarker.task","hash":"fbc2a30080c3c557","size":7819105,"lazy":true},{"url":"models/pose_landmarker_lite.task","hash":"59929e1d1ee95287","size":5777746,"lazy":true},{"url":"models/selfie_segmenter.tflite","hash":"191ac9529ae506ee","size":249537,"lazy":true}]};
/* Offbeat Games service worker. The build (vite.config.ts, pwaPlugin) prepends:
 *   const BUILD = { version, platform, files: [{ url, hash, size, lazy }] };
 * Every file is saved on install so the kiosk starts with no connection. Files marked
 * lazy (the web demo's tracking models) are saved the first time they are used instead.
 * A new version installs in the background and waits; the page switches to it at the
 * welcome screen (message "activate-update"), never in the middle of a game.
 */
/* global BUILD */
/* Platform builds run at /play/<link>/ and also keep the link's settings (link.json) and
 * every file it lists (files/<id>: logo, fonts, art). Those files never change under their
 * id, so any saved copy is good. New settings arrive with the message "update-link".
 */

const PREFIX = 'offbeat-v-';
const CACHE = PREFIX + BUILD.version;
const INDEX_KEY = '__offbeat-index__';
const scope = new URL(self.registration.scope);
const abs = (url) => new URL(url, scope).href;

/** url → hash of the files this version needs. */
const wanted = new Map(BUILD.files.map((f) => [abs(f.url), f]));

// Messages go out one after another so the page never sees an older progress after a newer one.
let outbox = Promise.resolve();
function broadcast(message) {
  outbox = outbox.then(async () => {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of clients) c.postMessage(message);
  });
  return outbox;
}

/** Finds the same file (same hash) in an older version's cache, so updates only download what changed. */
async function fromOldCaches(url, hash) {
  for (const name of await caches.keys()) {
    if (!name.startsWith(PREFIX) || name === CACHE) continue;
    const cache = await caches.open(name);
    const index = await cache.match(INDEX_KEY);
    if (!index) continue;
    const hashes = await index.json();
    if (hashes[url] !== hash) continue;
    const hit = await cache.match(url);
    if (hit) return hit;
  }
  return null;
}

async function saveFile(cache, file) {
  const url = abs(file.url);
  const old = await fromOldCaches(url, file.hash);
  if (old) return cache.put(url, old);
  const response = await fetch(url, { cache: 'reload' });
  if (!response.ok) throw new Error(`${file.url}: HTTP ${response.status}`);
  return cache.put(url, response);
}

const LINK = 'link.json';
const isLinkFile = (rel) => rel.startsWith('files/');

/** A saved copy of a link file from any version's cache (they never change under their id). */
async function linkFileFromAnyCache(url) {
  for (const name of await caches.keys()) {
    if (!name.startsWith(PREFIX)) continue;
    const hit = await (await caches.open(name)).match(url);
    if (hit) return hit;
  }
  return null;
}

/** Saves the link's settings and every file they list; removes files no longer listed. */
async function saveLink(cache, config) {
  for (const rel of config.files) {
    const url = abs(rel);
    if (await cache.match(url)) continue;
    const old = await linkFileFromAnyCache(url);
    if (old) {
      await cache.put(url, old);
      continue;
    }
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`${rel}: HTTP ${response.status}`);
    await cache.put(url, response);
  }
  const keep = new Set(config.files.map(abs));
  for (const req of await cache.keys()) {
    const rel = req.url.slice(scope.href.length);
    if (isLinkFile(rel) && !keep.has(req.url)) await cache.delete(req);
  }
  await cache.put(abs(LINK), new Response(JSON.stringify(config), { headers: { 'content-type': 'application/json' } }));
}

async function install() {
  const cache = await caches.open(CACHE);
  const files = BUILD.files.filter((f) => !f.lazy);
  const total = files.reduce((s, f) => s + f.size, 0);
  let done = 0;
  let next = 0;
  // A few downloads at a time; progress goes to the page (operator panel, welcome screen).
  const worker = async () => {
    while (next < files.length) {
      const file = files[next++];
      if (!(await cache.match(abs(file.url)))) await saveFile(cache, file);
      done += file.size;
      void broadcast({ type: 'offline-progress', version: BUILD.version, done, total });
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  if (BUILD.platform) {
    const response = await fetch(abs(LINK), { cache: 'reload' });
    if (!response.ok) throw new Error(`${LINK}: HTTP ${response.status}`);
    await saveLink(cache, await response.json());
  }
  const index = Object.fromEntries(BUILD.files.map((f) => [abs(f.url), f.hash]));
  await cache.put(INDEX_KEY, new Response(JSON.stringify(index), { headers: { 'content-type': 'application/json' } }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await install();
      // The very first install has nothing to replace, so it can take over straight away.
      if (!self.registration.active) await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
      }
      await self.clients.claim();
      void broadcast({ type: 'offline-active', version: BUILD.version });
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'activate-update') void self.skipWaiting();
  if (data.type === 'update-link' && BUILD.platform && data.config) {
    event.waitUntil(
      (async () => {
        try {
          await saveLink(await caches.open(CACHE), data.config);
          event.source?.postMessage({ type: 'link-updated', version: data.config.version });
        } catch (err) {
          // Keep the old settings; the page asks again later.
          console.warn('[sw] link update failed', err);
        }
      })(),
    );
  }
  if (data.type === 'offline-status') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const missing = [];
        let savedBytes = 0;
        let totalBytes = 0;
        for (const file of BUILD.files) {
          totalBytes += file.size;
          if (await cache.match(abs(file.url))) savedBytes += file.size;
          else missing.push({ url: file.url, lazy: !!file.lazy, size: file.size });
        }
        if (BUILD.platform) {
          const saved = await cache.match(abs(LINK));
          if (!saved) missing.push({ url: LINK, lazy: false, size: 0 });
          else {
            for (const rel of (await saved.json()).files) {
              if (!(await cache.match(abs(rel)))) missing.push({ url: rel, lazy: false, size: 0 });
            }
          }
        }
        event.source?.postMessage({ type: 'offline-status', version: BUILD.version, files: BUILD.files.length, missing, savedBytes, totalBytes });
      })(),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.href.startsWith(scope.href)) return;

  // Any page under the app (with ?sim, ?debug and so on) is the app's index.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => (await caches.match(abs('index.html'), { cacheName: CACHE })) || fetch(request))(),
    );
    return;
  }

  const key = url.origin + url.pathname;
  const rel = key.slice(scope.href.length);

  if (BUILD.platform && (rel === LINK || isLinkFile(rel))) {
    // "?fresh" is the page checking the server for new settings: always the network.
    if (rel === LINK && url.searchParams.has('fresh')) return;
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(key);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok && response.status === 200 && rel !== LINK) event.waitUntil(cache.put(key, response.clone()));
        return response;
      })(),
    );
    return;
  }

  const file = wanted.get(key);
  if (!file) return; // not part of the app: straight to the network

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(key);
      if (hit) return hit;
      const response = await fetch(request);
      // Lazy files (and anything an interrupted install missed) are kept once fetched.
      if (response.ok && response.status === 200) event.waitUntil(cache.put(key, response.clone()));
      return response;
    })(),
  );
});
