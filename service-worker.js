const CACHE_NAME = 'book-catalog-v1';
const urlsToCache = [
    '/book-catalog/',
    '/book-catalog/index.html',
    '/book-catalog/todo.html',
    '/book-catalog/style.css',
    '/book-catalog/todo.js',
    '/book-catalog/offline.html'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Кешируем файлы...');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('✅ Кеширование завершено!');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('❌ Ошибка кеширования:', error);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑 Удаляем старый кеш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('✅ Service Worker активирован!');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    console.log('✅ Из кеша:', event.request.url);
                    return response;
                }
                console.log('🌐 Из сети:', event.request.url);
                return fetch(event.request);
            })
            .catch(function(error) {
                console.error('❌ Ошибка:', error);
                // Если нет ни кеша, ни сети — показываем офлайн-страницу
                if (event.request.mode === 'navigate') {
                    return caches.match('/book-catalog/offline.html');
                }
            })
    );
});