"use client";

import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushSubscriptionManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      setPermission(Notification.permission);
    };

    checkSupport();

    if (!VAPID_PUBLIC_KEY) {
      return;
    }

    const registerAndSubscribe = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        // 2. Wait for registration to be ready
        await navigator.serviceWorker.ready;

        // 3. Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // 4. Request Permission if not already granted
          if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== 'granted') {
              return;
            }
          }

          // 5. Subscribe to Push Service
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });

          // 6. Send subscription to your server
          await fetch('/api/user/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription })
          });
        }
      } catch (error) {
      }
    };

    // Small delay to ensure browser is fully ready
    const timer = setTimeout(registerAndSubscribe, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
