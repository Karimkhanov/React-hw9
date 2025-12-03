const CACHE_NAME = 'rick-morty-v1';
const DYNAMIC_CACHE_NAME = 'rick-morty-dynamic-v1';

// Список файлов, которые мы хотим закэшировать сразу при установке
// (App Shell: то, что нужно для отображения интерфейса)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.jpeg',
  '/pwa-512x512.jpeg'
];

// 1. Установка Service Worker (Pre-caching)
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Активация (Очистка старых кэшей)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Перехват запросов (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Игнорируем запросы к Firebase и Google APIs (Auth не должен кэшироваться)
  if (url.origin.includes('googleapis.com') || url.origin.includes('firebase')) {
    return; // Просто выполняем запрос в сеть
  }

  // B. Стратегия для API Рика и Морти (Network First, затем Cache)
  if (url.href.includes('rickandmortyapi.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Если получили ответ от сети, клонируем его в кэш и возвращаем
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Если сети нет, пытаемся найти в кэше
          return caches.match(request);
        })
    );
    return;
  }

  // C. Стратегия для навигации (HTML) и статики (JS/CSS)
  event.respondWith(
    caches.match(request).then((response) => {
      // 1. Если нашли в кэше — возвращаем
      if (response) {
        return response;
      }

      // 2. Если нет — идем в сеть
      return fetch(request)
        .then((networkResponse) => {
          // Если это запрос на статику (js, css, png), сохраняем в динамический кэш
          // чтобы в следующий раз было доступно офлайн
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // 3. OFFLINE FALLBACK
          // Если сети нет и запроса нет в кэше, и это HTML-страница (навигация)
          // возвращаем index.html (App Shell)
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});