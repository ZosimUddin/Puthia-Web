const CACHE_NAME = 'amader-puthia-pwa-v3';
const ESSENTIAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ESSENTIAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event with Stale-While-Revalidate Strategy + Offline Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Handling
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(
      console.log('PWA Background Syncing offline submissions...')
    );
  }
});

// Push Notification Handling
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'আমাদের পুঠিয়া', body: 'নতুন আপডেট পাওয়া গেছে' };
  const isCall = data.type === 'call_invite' || data.action === 'call' || data.callId;

  if (isCall) {
    const callerName = data.callerName || data.title || 'ব্যবহারকারী';
    const callType = data.callType === 'video' ? 'ভিডিও কল' : 'অডিও কল';
    const title = `📞 ইনকামিং ${callType}: ${callerName}`;
    const options = {
      body: 'উত্তর দিতে ট্যাপ করুন',
      icon: data.callerPhoto || '/icon-192.png',
      badge: '/icon-192.png',
      tag: `call-${data.callId || Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
      data: {
        type: 'call_invite',
        callId: data.callId || `call_${Date.now()}`,
        callerId: data.callerId,
        callerName: data.callerName || 'ব্যবহারকারী',
        callerPhoto: data.callerPhoto || '',
        callType: data.callType || 'audio',
        url: `/?incoming_call=${data.callId || ''}&type=${data.callType || 'audio'}`
      }
    };

    const callPayload = {
      id: data.callId || `call_${Date.now()}`,
      callerId: data.callerId || 'unknown',
      callerName: data.callerName || 'ব্যবহারকারী',
      callerPhoto: data.callerPhoto || '',
      type: data.callType || 'audio',
      status: 'ringing',
      createdAt: Date.now()
    };

    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'FCM_CALL_INVITE',
          payload: callPayload
        });
      });
    });

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('puthia_calls_channel');
        channel.postMessage({
          type: 'FCM_CALL_INVITE',
          payload: callPayload
        });
        channel.close();
      }
    } catch (e) {}

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
    return;
  }
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};

  // Resolve absolute URL for Service Worker navigation
  let rawUrl = notificationData.url || '/notifications';
  if (notificationData.type === 'chat_message' || notificationData.type === 'message') {
    rawUrl = notificationData.url || '/messages';
  } else if (notificationData.type === 'notice' || notificationData.type === 'announcement') {
    rawUrl = notificationData.url || '/notice';
  }

  const fullUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (notificationData.type === 'call_invite') {
            client.postMessage({
              type: 'FCM_CALL_INVITE',
              payload: {
                id: notificationData.callId,
                callerId: notificationData.callerId,
                callerName: notificationData.callerName,
                callerPhoto: notificationData.callerPhoto,
                type: notificationData.callType || 'audio',
                status: 'ringing',
                createdAt: Date.now()
              }
            });
          }

          try {
            if ('navigate' in client) {
              await client.navigate(fullUrl);
            }
          } catch (e) {
            console.warn("Client navigate error in sw.js:", e);
          }

          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});
