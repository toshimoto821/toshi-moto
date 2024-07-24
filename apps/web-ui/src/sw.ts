/// <reference lib="webworker" />
// @ts-expect-error workbox
self.__WB_DISABLE_DEV_LOGS = true;

import { precacheAndRoute } from "workbox-precaching";
// const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;
// import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// to allow work offline
const cacheName = "api-cache-v1";
self.addEventListener("install", function (event) {
  // The promise that skipWaiting() returns can be safely ignored.

  event.waitUntil(caches.open(cacheName));

  // may not want to skip waiting in production
  self.skipWaiting();
});

self.addEventListener("activate", function () {
  // The promise that clients.claim() returns can be safely ignored.
  self.clients.claim();
});

/**
 * Check if cached API data is still valid
 * @param  {Object}  response The response object
 * @return {Boolean}          If true, cached data is valid
 */
const hasCache = function (response: Response, ttl: number) {
  if (!response) return false;
  if (!ttl) return false;
  const fetched = response.headers.get("sw-fetched-on");
  const now = new Date().getTime();
  if (fetched && parseFloat(fetched) + ttl > now) {
    return true;
  }
  return false;
};

const cacheTtlMap = {
  // @todo make these configurable by user
  ["/api/tx/"]: 1000 * 60 * 60 * 24 * 365, // 1 year
  ["/api/address/"]: {
    ".*/txs": 1000 * 60 * 60 * 24 * 365, // 1 year
    ".*": 1000 * 60 * 60 * 24 * 2, // 2 day
  },
  "https://blockchain.info/q/totalbc": 1000 * 60 * 10, // 10 minutes
  "https://api.coingecko.com/api/v3/simple/price": 1000 * 60 * 5, // 5 minutes -- @todo this should be dynamic
  "/api/prices/simple": 1000 * 60 * 5, // 5 minutes -- @todo this should be dynamic
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range":
    1000 * 60 * 60 * 24, // 24 hours
  "/api/prices/range": 1000 * 60 * 60 * 24, // 24 hours
} as Record<string, number | Record<string, number>>;

const getCacheTtl = (url: string) => {
  // const url = new URL(url);
  // loop through cacheTtlMap and return the first match
  for (const [key, value] of Object.entries(cacheTtlMap)) {
    if (url.includes(key)) {
      if (typeof value === "number") {
        return value;
      }
      // parse the url and check if it matches any of the regexes
      for (const [regex, ttl] of Object.entries(value)) {
        const re = new RegExp(regex);
        if (re.test(url)) {
          return ttl;
        }
      }
    }
  }

  return 0;
};

self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);
  const ttlHeaderAsString = url.searchParams.get("ttl");

  const ttl = ttlHeaderAsString
    ? parseInt(ttlHeaderAsString, 10)
    : getCacheTtl(url.origin + url.pathname);

  if (ttl > 0) {
    event.respondWith(
      caches.open(cacheName).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse && hasCache(cachedResponse, ttl)) {
            return cachedResponse;
          }
          return fetch(event.request.url).then((fetchedResponse) => {
            const copy = fetchedResponse.clone();

            const headers = new Headers(copy.headers);
            headers.append("sw-fetched-on", new Date().getTime() + "");
            if (copy.status === 200) {
              copy.blob().then((body) => {
                cache.put(
                  event.request,
                  new Response(body, {
                    status: copy.status,
                    statusText: copy.statusText,
                    headers: headers,
                  })
                );
              });
            }

            return fetchedResponse;
          });
        })
      )
    );
  } else {
    return fetch(event.request.url);
  }
});
