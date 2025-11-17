// src/screens/ReminderDetail.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";

const categoryColors = {
  Finance: "#3778C2",
  Document: "#00B894",
  Vehicle: "#FD79A8",
  Health: "#E17055",
  Subscription: "#6C5CE7",
  Others: "#74B9FF",
};

export default function ReminderDetail({ route, navigation }: any) {
  const { reminderId } = route.params;
  const { reminders, deleteReminder } = useStore();

  const reminder = reminders.find((r) => r.id === reminderId);

  if (!reminder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Reminder not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteReminder(reminderId);
            navigation.goBack();
          },
        },
      ]
    );
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
            <Text style={{ color: "#666" }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            Reminder Details
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AddReminder", {
                  editingReminder: reminder,
                })
              }
            >
              <Text style={{ color: "#3778C2", fontWeight: "700" }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ color: "#E74C3C", fontWeight: "700" }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            padding: 16,
            backgroundColor: "#f8f9fa",
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor:
              categoryColors[reminder.category as keyof typeof categoryColors],
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
            {reminder.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor:
                  categoryColors[
                    reminder.category as keyof typeof categoryColors
                  ],
                borderRadius: 12,
                marginRight: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                {reminder.category}
              </Text>
            </View>
            <Text style={{ color: "#666" }}>{reminder.recurrence}</Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
            Due: {reminder.dueDate.toDate().toLocaleString()}
          </Text>
        </View>

        {reminder.notes && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Notes
            </Text>
            <View
              style={{
                padding: 12,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#666", lineHeight: 20 }}>
                {reminder.notes}
              </Text>
            </View>
          </View>
        )}

        {reminder.attachmentUrl && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Attachment
            </Text>
            <View style={{ borderRadius: 8, overflow: "hidden" }}>
              <Image
                source={{ uri: reminder.attachmentUrl }}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
            Created: {reminder.createdAt.toDate().toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
