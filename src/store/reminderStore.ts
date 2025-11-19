import { FirebaseService } from "../services/FirebaseService";
import { Timestamp } from "firebase/firestore";
import { Reminder } from "./types";
import { NotificationService } from "@/services/NotificationService";

export const createReminderActions = (
  user: any,
  reminders: Reminder[],
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>
) => {
  const addReminder = async (reminder: Omit<Reminder, "id" | "createdAt">) => {
    const doc = { ...reminder, createdAt: Timestamp.now() };

    let newReminder: Reminder;
    try {
      if (user) {
        const savedDoc = await FirebaseService.addDocument("reminders", doc);
        newReminder = { ...doc, id: savedDoc.id };
      } else {
        newReminder = { ...doc, id: Date.now().toString() };
      }
    } catch (error) {
      console.error("Error saving reminder to Firebase:", error);
      newReminder = { ...doc, id: Date.now().toString() };
    }

    setReminders((prev) => [newReminder, ...prev]);
    return newReminder;
  };

  const updateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
    const old = reminders.find((r) => r.id === reminderId);
    const updated = { ...old, ...updates };
    
    setReminders((prev) => prev.map((r) => (r.id === reminderId ? updated : r)));
    
    if (user) {
      await FirebaseService.updateDocument("reminders", reminderId, updated);
    }
    
    // If dueDate changed, reschedule notification
    if (updates.dueDate && updates.dueDate !== old?.dueDate) {
      await NotificationService.cancelNotification(reminderId);
      if (!updated.completed) {
        await NotificationService.scheduleReminder(updated);
      }
    }
    
    return updated;
  };

  const deleteReminder = (reminderId: string) => {
    if (user) {
      FirebaseService.deleteDocument("reminders", reminderId);
    }
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const toggleReminder = async (reminderId: string) => {
    let completedAt = Timestamp.now();
    let state = true;
    const reminder = reminders.find((r) => r.id === reminderId);
    if (reminder.completed) {
      console.log("Already marked as completed");
      state = false;
      completedAt = null;
    }
    setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, completed: state, completedAt } : r)));
    if (user) {
      await FirebaseService.updateDocument("reminders", reminderId, { completed: state, completedAt });
    }
    if (state) {
      await NotificationService.cancelNotification(reminder.id);
    } else {
      await NotificationService.scheduleReminder(reminder);
    }
  };

  return { addReminder, updateReminder, deleteReminder, toggleReminder };
};