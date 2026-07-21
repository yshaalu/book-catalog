const CACHE_NAME = 'book-catalog-v3';
const urlsToCache = [
    '/book-catalog/',
    '/book-catalog/index.html',
    '/book-catalog/todo.html',
    '/book-catalog/feedback.php',
    '/book-catalog/style.css',
    '/book-catalog/todo.js',
    '/book-catalog/offline.html'
    // Если есть favicon — добавьте
    // '/book-catalog/favicon.ico'
];

// УСТАНОВКА
self.addEventListener('install', function(event) {
    console.log('📦 Service Worker: Установка...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Кешируем файлы...');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('✅ Кеширование завершено!');
                // Принудительно активируем Service Worker
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('❌ Ошибка кеширования:', error);
            })
    );
});

// АКТИВАЦИЯ
self.addEventListener('activate', function(event) {
    console.log('🚀 Service Worker: Активация...');
    
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
            // Перехватываем управление страницами
            return self.clients.claim();
        })
    );
});

// ПЕРЕХВАТ ЗАПРОСОВ
self.addEventListener('fetch', function(event) {
    console.log('🌐 Запрос:', event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Если файл есть в кеше — отдаём его
                if (response) {
                    console.log('✅ Из кеша:', event.request.url);
                    return response;
                }
                // Если нет — запрашиваем из сети
                console.log('🌐 Из сети:', event.request.url);
                return fetch(event.request);
            })
            .catch(function(error) {
                console.error('❌ Ошибка запроса:', error);
                // Если нет ни кеша, ни сети — показываем страницу офлайн
                if (event.request.mode === 'navigate') {
                    return caches.match('/book-catalog/offline.html');
                }
            })
    );
});