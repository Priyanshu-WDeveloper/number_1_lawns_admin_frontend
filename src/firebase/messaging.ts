import {
  getToken,
  onMessage,
  type MessagePayload,
} from 'firebase/messaging';

import { getFirebaseMessaging } from './firebase';

export const requestNotificationPermission = async () => {
  return Notification.requestPermission();
};

export const getFCMToken = async () => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error('Firebase Messaging is not supported');
  }

  const registration = await navigator.serviceWorker.ready;

  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
};

export const subscribeToForegroundMessages = async (
  callback: (payload: MessagePayload) => void,
) => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return;
  }

  return onMessage(messaging, callback);
};
