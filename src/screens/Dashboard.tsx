// src/screens/Dashboard.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";
import AnimatedAssetCard from "../ui/AnimatedAssetCard";
import AnimatedFAB from "../ui/AnimatedFAB";

export default function Dashboard({ navigation }: any) {
  const { assets, transactions, reminders } = useStore();
  const totalNetWorth = (assets || []).reduce((s, a) => s + Number(a.balance || 0), 0);
  const recent = (transactions || []).slice(0, 6);
  const upcomingReminders = (reminders || [])
    .filter(r => new Date(r.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ color: "#333", fontSize: 20, fontWeight: "600" }}>
            Hi,
          </Text>
          <Text style={{ color: "#666", fontSize: 14 }}>Your Net Worth</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Reminders")}
            style={{ marginRight: 12, padding: 8 }}
          >
            <Text style={{ color: "#3778C2", fontSize: 24 }}>🔔</Text>
          </TouchableOpacity>
          <View
            style={{ backgroundColor: "#3778C2", padding: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              ₹{totalNetWorth.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
        <Text style={{ fontWeight: "700" }}>Accounts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Accounts")}>
          <Text style={{ color: "#3778C2", fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {(assets || []).map((item, index) => {
          const isLastOdd = assets.length % 2 === 1 && index === assets.length - 1;
          return React.createElement(AnimatedAssetCard, {
            key: item.id,
            asset: item,
            isLastOdd: isLastOdd,
            onPress: (a: any) => navigation.navigate("AssetDetail", { assetId: a.id })
          });
        })}
      </View>

      {upcomingReminders.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <Text style={{ fontWeight: "700" }}>Upcoming Reminders</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Reminders")}>
              <Text style={{ color: "#3778C2" }}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingReminders.map((reminder) => (
            <TouchableOpacity
              key={reminder.id}
              style={{
                padding: 12,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#3778C2",
              }}
              onPress={() => navigation.navigate("ReminderDetail", { reminderId: reminder.id })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "700", flex: 1 }}>{reminder.title}</Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {new Date(reminder.dueDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ color: "#666", fontSize: 12 }}>{reminder.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ flex: 1, marginTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text style={{ color: "#3778C2" }}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recent}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const categoryColors = {
              Expense: '#ff4757',
              Transfer: '#ffa502', 
              Income: '#2ed573',
              Difference: '#3742fa'
            };
            return (
            <TouchableOpacity
              style={{
                padding: 12,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: categoryColors[item.category] || '#ddd',
              }}
              onPress={() => navigation.navigate("Transactions", { editTransaction: item })}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "700" }}>₹{item.amount}</Text>
                <Text style={{ color: "#666" }}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ color: "#666" }}>
                {item.category}{item.subcategory ? ` - ${item.subcategory}` : ''} • {item.notes}
              </Text>
            </TouchableOpacity>
          )}}
        />
      </View>

      <AnimatedFAB
        onPress={() => navigation.navigate("Transactions", { openAdd: true })}
      />
      </View>
    </SafeAreaView>
  );
}
