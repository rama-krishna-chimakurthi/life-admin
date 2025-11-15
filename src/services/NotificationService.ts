// src/services/NotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for notifications');
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

  static async scheduleReminder(reminder: {
    id: string;
    title: string;
    body: string;
    dueDate: Date;
    recurrence?: string;
  }) {
    await this.requestPermissions();

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminder.dueDate,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 ' + reminder.title,
        body: reminder.body,
        data: { reminderId: reminder.id },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    // If monthly recurrence, schedule next month
    if (reminder.recurrence === 'Monthly') {
      const nextMonth = new Date(reminder.dueDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 ' + reminder.title,
          body: reminder.body,
          data: { reminderId: reminder.id },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextMonth } as Notifications.DateTriggerInput,
      });
    }

    return notificationId;
  }

  static async cancelNotification(reminderId: string) {
    // Get all scheduled notifications and cancel those matching the reminder ID
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications.filter(
      notification => notification.content.data?.reminderId === reminderId
    );
    
    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  static async cancelReminder(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}