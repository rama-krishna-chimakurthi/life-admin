import { FirebaseService } from "../services/FirebaseService";
import { Timestamp } from "firebase/firestore";
import { Reminder } from "./types";

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

  const updateReminder = (reminderId: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, ...updates } : r)));
    return reminders.find((r) => r.id === reminderId)!;
  };

  const deleteReminder = (reminderId: string) => {
    if (user) {
      FirebaseService.deleteDocument("reminders", reminderId);
    }
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  return { addReminder, updateReminder, deleteReminder };
};