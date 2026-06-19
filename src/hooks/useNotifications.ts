import { useCallback, useEffect, useState } from 'react';

import {
  getFCMToken,
  requestNotificationPermission,
  subscribeToForegroundMessages,
} from '@/firebase/messaging';
import {
  useSubscribeNotificationMutation,
  useUnsubscribeNotificationMutation,
} from '@/API/api';
import toast from 'react-hot-toast';

// import { useSubscribeNotificationMutation } from '@/features/notifications/notificationApi';

export function useNotifications() {
  const [permission, setPermission] = useState(
    Notification.permission,
  );

  const [token, setToken] = useState<string | null>(null);

  const [subscribeNotification] = useSubscribeNotificationMutation();
  const [unsubscribeNotification] = useUnsubscribeNotificationMutation();

  const enableNotifications = useCallback(async () => {
    const result = await requestNotificationPermission();

    setPermission(result);

    if (result !== 'granted') {
      return;
    }

    try {
      const fcmToken = await getFCMToken();

      setToken(fcmToken);

      await subscribeNotification({
        token: fcmToken,
      }).unwrap();

      toast.success('Notifications enabled');
    } catch (error) {
      toast.error('Failed to enable notifications');
      console.error('Enable notifications error:', error);
    }
  }, [subscribeNotification]);

  const disableNotifications = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      await unsubscribeNotification({ token }).unwrap();
      setToken(null);
      toast.success('Notifications disabled');
    } catch (error) {
      toast.error('Failed to disable notifications');
      console.error('Disable notifications error:', error);
    }
  }, [token, unsubscribeNotification]);

  useEffect(() => {
    const unsubscribePromise = subscribeToForegroundMessages(
      (payload) => {
        console.log('Foreground Message:', payload);
        toast.success(
          payload.notification?.title ?? 'New notification',
        );
        // toast.success(...)
      },
    );

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe?.();
      });
    };
  }, []);

  return {
    permission,
    token,
    enableNotifications,
    disableNotifications,
  };
}
