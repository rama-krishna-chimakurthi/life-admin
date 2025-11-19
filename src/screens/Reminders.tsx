// src/screens/Reminders.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";
import { Timestamp } from "firebase/firestore";

const categoryColors = {
  Finance: "#3778C2",
  Document: "#00B894",
  Vehicle: "#FD79A8",
  Health: "#E17055",
  Subscription: "#6C5CE7",
  Others: "#74B9FF",
};

export default function Reminders({ navigation }: any) {
  const { reminders } = useStore();

  const now = Timestamp.now();
  const upcoming = reminders.filter((r) => r.dueDate >= now);
  const overdue = reminders.filter((r) => r.dueDate < now);

  const renderReminder = ({ item }: any) => (
    <TouchableOpacity
      style={{
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor:
          categoryColors[item.category as keyof typeof categoryColors],
      }}
      onPress={() =>
        navigation.navigate("ReminderDetail", { reminderId: item.id })
      }
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "700", flex: 1 }}>{item.title}</Text>
        <Text style={{ color: "#666", fontSize: 12 }}>
          {item.dueDate.toDate().toLocaleDateString()}
        </Text>
      </View>
      <Text style={{ color: "#666", marginTop: 4 }}>{item.category}</Text>
      {item.notes && (
        <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700" }}>Reminders</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddReminder")}
            style={{
              backgroundColor: "#3778C2",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {overdue.length > 0 && (
          <>
            <Text
              style={{ fontWeight: "700", color: "#E74C3C", marginBottom: 8 }}
            >
              Overdue ({overdue.length})
            </Text>
            <FlatList
              data={overdue}
              keyExtractor={(i) => i.id}
              renderItem={renderReminder}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Upcoming ({upcoming.length})
        </Text>
        <FlatList
          data={upcoming.sort(
            (a, b) =>
              new Date(a.dueDate.toDate()).getTime() -
              new Date(b.dueDate.toDate()).getTime()
          )}
          keyExtractor={(i) => i.id}
          renderItem={renderReminder}
        />
      </View>
    </SafeAreaView>
  );
}
