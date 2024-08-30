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

self.addEventListener("push", function (event) {
  const data = event.data?.json();
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

let HOST: string;

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (HOST) {
    // @ts-expect-error clients
    event.waitUntil(clients.openWindow(HOST));
  }
});

// simple message / data handling
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  if (type === "SET_HOSTNAME") {
    HOST = payload;
  }
});
