/* global firebase */

importScripts(
  'https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  // apiKey: 'YOUR_API_KEY',
  // authDomain: 'YOUR_AUTH_DOMAIN',
  // projectId: 'YOUR_PROJECT_ID',
  // storageBucket: 'YOUR_STORAGE_BUCKET',
  // messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  // appId: 'YOUR_APP_ID',

  apiKey: 'AIzaSyAia1WA12pg3z9vnWVltDUjzJ4iRHFJ7kI',
  authDomain: 'no-1-lawns-4c3b9.firebaseapp.com',
  projectId: 'no-1-lawns-4c3b9',
  storageBucket: 'no-1-lawns-4c3b9.firebasestorage.app',
  messagingSenderId: '682663039726',
  appId: '1:682663039726:web:1c1a8b2a108c7215be59ff',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);

  self.registration.showNotification(
    payload.notification?.title || 'Notification',
    {
      body: payload.notification?.body,
      icon: '/favicon.ico',
      data: payload.data,
    },
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || '/';

  event.waitUntil(clients.openWindow(url));
});
