// src/screens/AddReminder.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStore } from "../store/Store";
import { NotificationService } from "../services/NotificationService";
import { Timestamp } from "firebase/firestore";
import { Reminder } from "../store/types";

const categories = [
  "Finance",
  "Document",
  "Vehicle",
  "Health",
  "Subscription",
  "Others",
];
const recurrenceTypes = ["One-time", "Monthly"];

const quickDateOptions = [
  { label: "In 1 hour", hours: 1 },
  { label: "Tomorrow 9 AM", hours: 24, setHour: 9 },
  { label: "In 3 days", hours: 72 },
  { label: "Next week", hours: 168 },
];

export default function AddReminder({ navigation, route }: any) {
  const { addReminder, updateReminder } = useStore();
  const editingReminder = route?.params?.editingReminder as
    | Reminder
    | undefined;
  const [title, setTitle] = useState(editingReminder?.title || "");
  const [category, setCategory] = useState(
    editingReminder?.category || "Finance"
  );
  const [dueDate, setDueDate] = useState(
    editingReminder ? editingReminder.dueDate.toDate() : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dateString, setDateString] = useState(
    (editingReminder ? editingReminder.dueDate.toDate() : new Date())
      .toISOString()
      .slice(0, 16)
  );

  const setQuickDate = (option: any) => {
    const newDate = new Date();
    if (option.setHour !== undefined && !option.hours) {
      // Today at specific hour
      newDate.setHours(option.setHour, 0, 0, 0);
    } else if (option.hours) {
      newDate.setHours(newDate.getHours() + option.hours);
      if (option.setHour !== undefined) {
        newDate.setHours(option.setHour, 0, 0, 0);
      }
    } else if (option.days) {
      newDate.setDate(newDate.getDate() + option.days);
    }
    setDueDate(newDate);
    setDateString(newDate.toISOString().slice(0, 16));
  };
  const [notes, setNotes] = useState(editingReminder?.notes || "");
  const [recurrence, setRecurrence] = useState(
    editingReminder?.recurrence || "One-time"
  );
  const [disabled, setDisabled] = useState(false);
  const handleSave = async () => {
    setDisabled(true);
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      setDisabled(false);
      return;
    }

    const reminderData = {
      title: title.trim(),
      category,
      dueDate: Timestamp.fromDate(dueDate),
      notes: notes.trim(),
      recurrence,
    };

    const reminder = editingReminder
      ? await updateReminder(editingReminder.id, reminderData)
      : await addReminder(reminderData);

    // Handle notifications
    try {
      if (editingReminder) {
        // Cancel old notification and schedule new one
        await NotificationService.cancelNotification(editingReminder.id);
        console.log("Cancelled old notification for:", editingReminder.id);
      }
      console.log("Scheduling notification for reminder:", reminder);
      await NotificationService.scheduleReminder(reminder);
    } catch (error) {
      console.log("Failed to handle notification:", error);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: "#666" }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            {editingReminder ? "Edit Reminder" : "Add Reminder"}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={disabled}>
            <Text style={{ color: "#3778C2", fontWeight: "700" }}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter reminder title"
          style={{
            borderWidth: 1,
            borderColor: "#e6eef7",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Category</Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: category === cat ? "#3778C2" : "#f0f0f0",
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: category === cat ? "#fff" : "#666" }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Due Date & Time
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
            Quick Options:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {quickDateOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setQuickDate(option)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "#3778C2",
                borderRadius: 16,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <MaterialIcons
                name="date-range"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: "#fff", fontSize: 12 }}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "#3778C2",
                borderRadius: 16,
                marginBottom: 8,
              }}
            >
              <MaterialIcons
                name="access-time"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: "#fff", fontSize: 12 }}>Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            padding: 12,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Selected:</Text>
          <Text style={{ color: "#666" }}>{dueDate.toLocaleString()}</Text>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const newDate = new Date(selectedDate);
                newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
                setDueDate(newDate);
                setDateString(newDate.toISOString().slice(0, 16));
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={dueDate}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                const newDate = new Date(dueDate);
                newDate.setHours(
                  selectedTime.getHours(),
                  selectedTime.getMinutes()
                );
                setDueDate(newDate);
                setDateString(newDate.toISOString().slice(0, 16));
              }
            }}
          />
        )}

        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Recurrence</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {recurrenceTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setRecurrence(type)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: recurrence === type ? "#3778C2" : "#f0f0f0",
                marginRight: 8,
              }}
            >
              <Text style={{ color: recurrence === type ? "#fff" : "#666" }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Notes (Optional)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional notes"
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: "#e6eef7",
            padding: 12,
            borderRadius: 8,
            height: 100,
            textAlignVertical: "top",
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
