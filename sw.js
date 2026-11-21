/* ==========================================================================
   Futebol Studio — Service Worker
   Estratégia pensada para NUNCA prender o usuário numa versão antiga:
     • Páginas (HTML): REDE PRIMEIRO. O cache só entra como reserva offline.
     • Ícones/manifest (mesma origem) e bibliotecas de CDN: "stale-while-revalidate".
     • Só mexe nos caches deste app (prefixo "futebol-studio-"): outros apps
       publicados no mesmo github.io não são afetados.
   Para publicar uma nova versão do app: troque VERSION abaixo (v3 → v4 ...).
   ========================================================================== */
const VERSION = 'v3';
const CACHE_PREFIX = 'futebol-studio-';
const SHELL_CACHE = CACHE_PREFIX + 'shell-' + VERSION;
const RUNTIME_CACHE = CACHE_PREFIX + 'runtime-' + VERSION;

// Caminhos RELATIVOS ao sw.js: funcionam na raiz do domínio e em /nome-do-repositorio/
const REQUIRED = ['./', './index.html'];
const OPTIONAL = [
  './manifest.webmanifest',
  './icon-180.png', './icon-192.png', './icon-512.png',
  './icon-maskable-192.png', './icon-maskable-512.png'
];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // cache:'reload' ignora o cache HTTP do GitHub Pages (10 min) e guarda a versão mais nova
    const guardar = url => cache.add(new Request(url, { cache: 'reload' }));
    await Promise.all(REQUIRED.map(guardar));                 // sem o HTML a instalação falha de propósito
    await Promise.allSettled(OPTIONAL.map(guardar));          // um ícone ausente NÃO derruba o app
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith(CACHE_PREFIX) && k !== SHELL_CACHE && k !== RUNTIME_CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const escopo = new URL(self.registration.scope);
  const mesmaOrigem = url.origin === self.location.origin;
  // Nunca intercepta caminhos de OUTROS apps do mesmo domínio
  if (mesmaOrigem && !url.pathname.startsWith(escopo.pathname)) return;

  if (req.mode === 'navigate') {
    event.respondWith(paginaRedePrimeiro(req));
  } else {
    event.respondWith(staleWhileRevalidate(event, req, mesmaOrigem ? SHELL_CACHE : RUNTIME_CACHE));
  }
});

async function paginaRedePrimeiro(req) {
  const cache = await caches.open(SHELL_CACHE);
  const indexUrl = new URL('./index.html', self.registration.scope).href;
  const raizUrl = new URL('./', self.registration.scope).href;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), NETWORK_TIMEOUT_MS);
    // cache:'no-cache' revalida com o servidor (ETag) — nunca serve HTML velho do cache HTTP
    const resposta = await fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }), { signal: ctrl.signal });
    clearTimeout(timer);
    const tipo = resposta.headers.get('content-type') || '';
    if (resposta.ok && tipo.includes('text/html')) {
      const copia = resposta.clone();
      await Promise.all([cache.put(indexUrl, copia.clone()), cache.put(raizUrl, copia.clone())]);
    }
    return resposta;
  } catch (erro) {
    // Sem rede (ou rede lenta demais): usa a última versão guardada
    const guardada = (await cache.match(req, { ignoreSearch: true })) || (await cache.match(indexUrl)) || (await cache.match(raizUrl));
    if (guardada) return guardada;
    return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:sans-serif;background:#070d18;color:#e2e8f0;padding:2rem"><h2>Sem conexão</h2><p>Abra o Futebol Studio uma vez com internet para habilitar o modo offline.</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(event, req, nomeCache) {
  const cache = await caches.open(nomeCache);
  const guardada = await cache.match(req);
  const atualizar = fetch(req).then(resposta => {
    if (resposta && (resposta.ok || resposta.type === 'opaque')) cache.put(req, resposta.clone()).catch(() => {});
    return resposta;
  }).catch(() => null);
  if (guardada) { event.waitUntil(atualizar); return guardada; }
  const nova = await atualizar;
  return nova || new Response('', { status: 504, statusText: 'Offline' });
}
