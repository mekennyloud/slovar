// Кэширует приложение и словарь, чтобы всё открывалось без интернета.
// Изменил файлы приложения — подними APP. Пересобрал словарь — подними DATA.
const APP = 'slovar-app-v1';
const DATA = 'slovar-data-v1';
const APP_FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const DATA_FILES = ['data/mueller.json'];

const fill = (name, files) => caches.open(name).then(async c => {
  const have = await c.keys();
  if (have.length >= files.length) return;            // словарь уже лежит — второй раз не качаем
  await c.addAll(files.map(f => new Request(f, { cache: 'reload' })));
});

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([fill(APP, APP_FILES), fill(DATA, DATA_FILES)]).then(() => self.skipWaiting()));
});

// у Kokoro и плеера тот же адрес сайта — удаляем только свои старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('slovar-') && k !== APP && k !== DATA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// сначала из кэша (мгновенно и без сети), если нет — из сети
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
