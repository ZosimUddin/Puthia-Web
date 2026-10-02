importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAEZ2x5TuIztbTW1MJLVW0DilEraAihNMM",
  authDomain: "our-puthia-45c6e.firebaseapp.com",
  projectId: "our-puthia-45c6e",
  storageBucket: "our-puthia-45c6e.firebasestorage.app",
  messagingSenderId: "879558865198",
  appId: "1:879558865198:web:932e24d30d6a6a2a2e8abf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background FCM message:', payload);
  const data = payload.data || {};
  const isCall = data.type === 'call_invite' || data.type === 'audio_call' || data.type === 'video_call' || data.action === 'call' || data.callId;

  if (isCall) {
    const callerName = data.callerName || payload.notification?.title?.replace(/^.*?:\s*/, '') || 'ব্যবহারকারী';
    const callType = (data.callType === 'video' || data.type === 'video_call') ? 'ভিডিও কল' : 'অডিও কল';
    const notificationTitle = `📞 ইনকামিং ${callType}: ${callerName}`;
    const notificationOptions = {
      body: 'উত্তর দিতে ট্যাপ করুন',
      icon: data.callerPhoto || data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `call-${data.callId || Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 300, 150, 500],
      data: {
        type: 'call_invite',
        callId: data.callId || `call_${Date.now()}`,
        callerId: data.callerId,
        callerName: callerName,
        callerPhoto: data.callerPhoto || '',
        callType: (data.callType === 'video' || data.type === 'video_call') ? 'video' : 'audio',
        receiverId: data.receiverId,
        url: `/?incoming_call=${data.callId || ''}&type=${data.callType || 'audio'}`
      }
    };

    const callPayload = {
      id: data.callId || `call_${Date.now()}`,
      callerId: data.callerId || 'unknown',
      callerName: callerName,
      callerPhoto: data.callerPhoto || '',
      receiverId: data.receiverId || '',
      receiverName: data.receiverName || '',
      type: (data.callType === 'video' || data.type === 'video_call') ? 'video' : 'audio',
      status: 'ringing',
      createdAt: Date.now()
    };

    // Broadcast to open clients
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'FCM_CALL_INVITE',
          payload: callPayload
        });
      });
    });

    // BroadcastChannel cross-tab notify
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('puthia_calls_channel');
        channel.postMessage({
          type: 'FCM_CALL_INVITE',
          payload: callPayload
        });
        channel.close();
      }
    } catch (e) {
      console.warn('BroadcastChannel error in SW:', e);
    }

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }

  // Normal System Notifications (Messages, Friend Requests, Reactions, News, Emergency Alerts, etc.)
  const notifTitle = payload.notification?.title || data.title || 'আমাদের পুঠিয়া';
  const notifBody = payload.notification?.body || data.body || data.message || 'নতুন নোটিফিকেশন এসেছে';
  const notifIcon = data.icon || payload.notification?.icon || data.actorAvatar || '/pwa-192x192.png';
  const notifImage = data.image || payload.notification?.image;
  const notifUrl = data.url || data.deepLink || payload.data?.url || '/';

  const notificationOptions = {
    body: notifBody,
    icon: notifIcon,
    image: notifImage,
    badge: '/pwa-192x192.png',
    tag: data.tag || `notif_${Date.now()}`,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: notifUrl,
      type: data.type || 'system_notification'
    }
  };

  return self.registration.showNotification(notifTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};

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
                receiverId: notificationData.receiverId,
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
            console.warn("Client navigate error in firebase-messaging-sw.js:", e);
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
