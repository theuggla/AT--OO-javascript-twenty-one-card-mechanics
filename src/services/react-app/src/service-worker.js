/**
 * A very simple ServiceWorker that caches the
 * site for offline use.
 */

// Keep track of the cache.
let CACHE_VERSION = '1'
let STATIC_CACHE = 'static'

let expectedCaches = [CACHE_VERSION, STATIC_CACHE]

self.addEventListener('install', (event) => {
    // Store some files on first load.
  function onInstall () {
    return caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll([
              '/main.min.js',
              '/index.html',
              '/assets/favicon.ico'
            ]))
  }

  event.waitUntil(onInstall(event))
})
