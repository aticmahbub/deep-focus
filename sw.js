// sw.js — DeepFocus Service Worker
// Handles background timer and fires notifications when tab is inactive

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

let timerTimeout = null;

self.addEventListener('message', (event) => {
    const {type, payload} = event.data;

    if (type === 'START_TIMER') {
        // Cancel any existing timer
        if (timerTimeout) clearTimeout(timerTimeout);

        const {remainingMs, mode} = payload;

        timerTimeout = setTimeout(() => {
            timerTimeout = null;

            // Check if any client (tab) is currently visible
            self.clients
                .matchAll({type: 'window', includeUncontrolled: true})
                .then((clients) => {
                    const anyVisible = clients.some(
                        (c) => c.visibilityState === 'visible',
                    );

                    if (!anyVisible) {
                        // Tab is hidden — fire a system notification
                        const title =
                            mode === 'focus'
                                ? '✅ Focus session complete!'
                                : '⏰ Break is over!';
                        const body =
                            mode === 'focus'
                                ? 'Great work. Time for a break.'
                                : 'Ready to focus again? Tap to start your next session.';

                        self.registration.showNotification(title, {
                            body,
                            icon: '/icon-192.png',
                            badge: '/icon-192.png',
                            tag: 'deepfocus-timer',
                            renotify: true,
                            requireInteraction: false,
                        });
                    }

                    // Also message the tab so it can play sound + update UI
                    clients.forEach((c) =>
                        c.postMessage({type: 'TIMER_ENDED', mode}),
                    );
                });
        }, remainingMs);
    }

    if (type === 'CANCEL_TIMER') {
        if (timerTimeout) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
        }
    }
});

// Clicking the notification focuses the app tab
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({type: 'window'}).then((clients) => {
            if (clients.length) return clients[0].focus();
            return self.clients.openWindow('/');
        }),
    );
});
