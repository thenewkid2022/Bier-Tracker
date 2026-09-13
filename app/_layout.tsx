import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { NotificationService } from '../src/services/NotificationService';
import { TwintService } from '../src/services/TwintService';
import { useAppStore } from '../src/state/appStore';

export default function RootLayout() {
  useEffect(() => {
    NotificationService.initialize().catch((error) => {
      console.error('Fehler beim Initialisieren der Notifications:', error);
    });

    const handleDeepLink = (url: string) => {
      const twintService = TwintService.getInstance();
      const paymentData = twintService.parsePaymentReturnLink(url);
      if (paymentData?.status === 'completed' && paymentData.userId) {
        twintService
          .handleCompletedPayment(paymentData.userId, paymentData.amount ?? 0)
          .then(async () => {
            const store = useAppStore.getState();
            await store.hydrate();
            await store.refreshAdminStatus();
            if (store.selectedUserId === paymentData.userId) {
              await store.loadProfile(paymentData.userId);
            }
          })
          .catch((error) => {
            console.error('Fehler beim Verarbeiten der Zahlung:', error);
          });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
