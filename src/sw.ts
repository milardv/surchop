/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

// ✅ Déclare explicitement le scope du service worker
// eslint-disable-next-line no-undef
declare const self: ServiceWorkerGlobalScope;

// ⚙️ Active immédiatement le SW dès installation
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);

// 🛎️ Gère le clic sur notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url;
    if (!url) return;

    // ✅ Utilise self.clients au lieu de clients
    event.waitUntil(self.clients.openWindow(url));
});
