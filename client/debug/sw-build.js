(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * A very simple ServiceWorker that caches the
 * site for offline use.
 */


//keep track of the cache
let CACHE_VERSION = 'v1';


self.addEventListener('install', event => {

    //store some files on first load
    function onInstall () {
        return caches.open(CACHE_VERSION)
            .then(cache => cache.addAll([
                    '/draggable-window.html',
                    '/expandable-menu-item.html',
                    '/image/chat-icon.png',
                    '/image/memory-icon.png',
                    '/image/gallery-icon.png',
                    '/desktop-background.jpg',
                    '/draggable-window-border.png',
                    '/js/desktop.js',
                    '/stylesheet/style.css',
                    '/index.html'
                ])
            );
    }

    event.waitUntil(onInstall(event));

});

//clear out the cache if service worker is updated
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

//handle fetch events by sending back the cached resource if avaliable
self.addEventListener('fetch', (event) => {
    function onFetch (event) {
        let request = event.request;
        let acceptHeader = request.headers.get('Accept');
        let resourceType = 'static';
        let cacheKey;

        if (acceptHeader.indexOf('text/html') !== -1) { //make different cashes for different content to retrieve later
            resourceType = 'content';
        } else if (acceptHeader.indexOf('image') !== -1) {
            resourceType = 'image';
        }

        cacheKey = resourceType;

        // Use cache first.
        event.respondWith(
            fetchFromCache(event)
                .catch(() => fetch(request))
                .then(response => addToCache(cacheKey, request, response))
        );
    }

    //add responses to cache to fetch later
    function addToCache (cacheKey, request, response) {
        if (response.ok) {
            let copy = response.clone(); //copy the response to not use it up
            caches.open(cacheKey).then( cache => {
                cache.put(request, copy);
            });
            return response;
        }
    }

    //get responses from cache
    function fetchFromCache (event) {
        return caches.match(event.request).then(response => {
            if (!response) {
                throw Error('${event.request.url} not found in cache');
            }
            return response;
        });
    }

    onFetch(event);
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvc2VydmljZVdvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQSB2ZXJ5IHNpbXBsZSBTZXJ2aWNlV29ya2VyIHRoYXQgY2FjaGVzIHRoZVxuICogc2l0ZSBmb3Igb2ZmbGluZSB1c2UuXG4gKi9cblxuXG4vL2tlZXAgdHJhY2sgb2YgdGhlIGNhY2hlXG5sZXQgQ0FDSEVfVkVSU0lPTiA9ICd2MSc7XG5cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgZXZlbnQgPT4ge1xuXG4gICAgLy9zdG9yZSBzb21lIGZpbGVzIG9uIGZpcnN0IGxvYWRcbiAgICBmdW5jdGlvbiBvbkluc3RhbGwgKCkge1xuICAgICAgICByZXR1cm4gY2FjaGVzLm9wZW4oQ0FDSEVfVkVSU0lPTilcbiAgICAgICAgICAgIC50aGVuKGNhY2hlID0+IGNhY2hlLmFkZEFsbChbXG4gICAgICAgICAgICAgICAgICAgICcvZHJhZ2dhYmxlLXdpbmRvdy5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgJy9leHBhbmRhYmxlLW1lbnUtaXRlbS5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgJy9pbWFnZS9jaGF0LWljb24ucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgJy9pbWFnZS9tZW1vcnktaWNvbi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICAnL2ltYWdlL2dhbGxlcnktaWNvbi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICAnL2Rlc2t0b3AtYmFja2dyb3VuZC5qcGcnLFxuICAgICAgICAgICAgICAgICAgICAnL2RyYWdnYWJsZS13aW5kb3ctYm9yZGVyLnBuZycsXG4gICAgICAgICAgICAgICAgICAgICcvanMvZGVza3RvcC5qcycsXG4gICAgICAgICAgICAgICAgICAgICcvc3R5bGVzaGVldC9zdHlsZS5jc3MnLFxuICAgICAgICAgICAgICAgICAgICAnL2luZGV4Lmh0bWwnXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgZXZlbnQud2FpdFVudGlsKG9uSW5zdGFsbChldmVudCkpO1xuXG59KTtcblxuLy9jbGVhciBvdXQgdGhlIGNhY2hlIGlmIHNlcnZpY2Ugd29ya2VyIGlzIHVwZGF0ZWRcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignYWN0aXZhdGUnLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC53YWl0VW50aWwoXG4gICAgICAgIGNhY2hlcy5rZXlzKCkudGhlbihmdW5jdGlvbiAoY2FjaGVOYW1lcykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgICAgIGNhY2hlTmFtZXMubWFwKGZ1bmN0aW9uIChjYWNoZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlTmFtZSAhPT0gQ0FDSEVfVkVSU0lPTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlcy5kZWxldGUoY2FjaGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICk7XG59KTtcblxuLy9oYW5kbGUgZmV0Y2ggZXZlbnRzIGJ5IHNlbmRpbmcgYmFjayB0aGUgY2FjaGVkIHJlc291cmNlIGlmIGF2YWxpYWJsZVxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIChldmVudCkgPT4ge1xuICAgIGZ1bmN0aW9uIG9uRmV0Y2ggKGV2ZW50KSB7XG4gICAgICAgIGxldCByZXF1ZXN0ID0gZXZlbnQucmVxdWVzdDtcbiAgICAgICAgbGV0IGFjY2VwdEhlYWRlciA9IHJlcXVlc3QuaGVhZGVycy5nZXQoJ0FjY2VwdCcpO1xuICAgICAgICBsZXQgcmVzb3VyY2VUeXBlID0gJ3N0YXRpYyc7XG4gICAgICAgIGxldCBjYWNoZUtleTtcblxuICAgICAgICBpZiAoYWNjZXB0SGVhZGVyLmluZGV4T2YoJ3RleHQvaHRtbCcpICE9PSAtMSkgeyAvL21ha2UgZGlmZmVyZW50IGNhc2hlcyBmb3IgZGlmZmVyZW50IGNvbnRlbnQgdG8gcmV0cmlldmUgbGF0ZXJcbiAgICAgICAgICAgIHJlc291cmNlVHlwZSA9ICdjb250ZW50JztcbiAgICAgICAgfSBlbHNlIGlmIChhY2NlcHRIZWFkZXIuaW5kZXhPZignaW1hZ2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJlc291cmNlVHlwZSA9ICdpbWFnZSc7XG4gICAgICAgIH1cblxuICAgICAgICBjYWNoZUtleSA9IHJlc291cmNlVHlwZTtcblxuICAgICAgICAvLyBVc2UgY2FjaGUgZmlyc3QuXG4gICAgICAgIGV2ZW50LnJlc3BvbmRXaXRoKFxuICAgICAgICAgICAgZmV0Y2hGcm9tQ2FjaGUoZXZlbnQpXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IGZldGNoKHJlcXVlc3QpKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IGFkZFRvQ2FjaGUoY2FjaGVLZXksIHJlcXVlc3QsIHJlc3BvbnNlKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvL2FkZCByZXNwb25zZXMgdG8gY2FjaGUgdG8gZmV0Y2ggbGF0ZXJcbiAgICBmdW5jdGlvbiBhZGRUb0NhY2hlIChjYWNoZUtleSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBsZXQgY29weSA9IHJlc3BvbnNlLmNsb25lKCk7IC8vY29weSB0aGUgcmVzcG9uc2UgdG8gbm90IHVzZSBpdCB1cFxuICAgICAgICAgICAgY2FjaGVzLm9wZW4oY2FjaGVLZXkpLnRoZW4oIGNhY2hlID0+IHtcbiAgICAgICAgICAgICAgICBjYWNoZS5wdXQocmVxdWVzdCwgY29weSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vZ2V0IHJlc3BvbnNlcyBmcm9tIGNhY2hlXG4gICAgZnVuY3Rpb24gZmV0Y2hGcm9tQ2FjaGUgKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBjYWNoZXMubWF0Y2goZXZlbnQucmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJyR7ZXZlbnQucmVxdWVzdC51cmx9IG5vdCBmb3VuZCBpbiBjYWNoZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkZldGNoKGV2ZW50KTtcbn0pO1xuIl19
