import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export class NotificationService {
  static async initialize(): Promise<void> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Benachrichtigungen wurden nicht erlaubt!');
        return;
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  static async scheduleNotification({
    title,
    body,
    data,
    trigger,
  }: {
    title: string;
    body: string;
    data?: Record<string, any>;
    trigger?: Notifications.NotificationTriggerInput;
  }): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger,
    });
  }

  static async showLocalNotification({
    title,
    body,
    data,
  }: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Sofortige Benachrichtigung
    });
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Spezifische Benachrichtigungen für die BierLounge App
  static async notifyDrinkConsumption(userName: string, drinkName: string, price: number): Promise<void> {
    await this.showLocalNotification({
      title: 'Getränk gekauft! 🍺',
      body: `${userName} hat ${drinkName} für CHF ${price.toFixed(2)} gekauft.`,
      data: {
        type: 'drink_consumption',
        userName,
        drinkName,
        price,
      },
    });
  }

  static async notifyLowStock(drinkName: string, currentStock: number): Promise<void> {
    await this.showLocalNotification({
      title: 'Niedriger Bestand! ⚠️',
      body: `${drinkName} hat nur noch ${currentStock} Stück auf Lager.`,
      data: {
        type: 'low_stock',
        drinkName,
        currentStock,
      },
    });
  }

  static async notifyMonthlyReport(userName: string, totalAmount: number): Promise<void> {
    await this.showLocalNotification({
      title: 'Monatsbericht verfügbar! 📊',
      body: `${userName} hat im Monat CHF ${totalAmount.toFixed(2)} ausgegeben.`,
      data: {
        type: 'monthly_report',
        userName,
        totalAmount,
      },
    });
  }
}
