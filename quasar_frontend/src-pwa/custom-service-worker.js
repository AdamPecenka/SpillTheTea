import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

self.skipWaiting()
clientsClaim()

// Precache all assets injected by Quasar build
precacheAndRoute(self.__WB_MANIFEST)

// Cleanup old caches
cleanupOutdatedCaches()

// Offline fallback page (must exist in /public/offline.html)
const offlineFallback = '/offline.html'

// Handle navigation requests with NetworkFirst, fallback to offline.html
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3, // optional: timeout network if slow
        plugins: [],
      }).handle({ event })
    } catch (err) {
      return caches.match(offlineFallback)
    }
  },
)

// Optional: fallback for index.html in non-SSR production
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML || offlineFallback), {
      denylist: [
        new RegExp(process.env.PWA_SERVICE_WORKER_REGEX || 'service-worker.js'),
        /workbox-(.)*\.js$/,
      ],
    }),
  )
}

console.log('[SW] Custom Service Worker active')
