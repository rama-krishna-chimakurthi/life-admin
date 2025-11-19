// src/screens/Dashboard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../store/Store";
import { useAuth } from "../store/AuthStore";
import AnimatedAssetCard from "../ui/AnimatedAssetCard";
import AnimatedFAB from "../ui/AnimatedFAB";
import AppIcon from "../components/AppIcon";
import { Timestamp } from "firebase/firestore";
import { truncate } from "@/util/format";
import { Reminder } from "../store/types";

export default function Dashboard({ navigation }: any) {
  const { assets, transactions, reminders, toggleReminder } = useStore();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  const totalNetWorth = (assets || []).reduce(
    (s, a) => s + Number(a.balance || 0),
    0
  );
  const recent = Array.isArray(transactions) ? transactions.slice(0, 6) : [];
  const upcomingReminders: Reminder[] = Array.isArray(reminders)
    ? reminders
        .filter((r: Reminder) => r.dueDate >= Timestamp.now() && !r.completed)
        .sort(
          (a, b) =>
            new Date(a.dueDate.toDate()).getTime() -
            new Date(b.dueDate.toDate()).getTime()
        )
        .slice(0, 3)
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3778C2"
            colors={["#3778C2"]}
          />
        }
      >
        <View style={{ flex: 1, padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {useAuth().user?.photoURL ? (
                <Image
                  source={{ uri: useAuth().user?.photoURL || "" }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
              ) : (
                <AppIcon size={40} style={{ marginRight: 12 }} />
              )}

              <View>
                <Text
                  style={{ color: "#333", fontSize: 20, fontWeight: "600" }}
                >
                  Hi, {truncate(useAuth().user?.displayName) || "User"}
                </Text>
                <Text style={{ color: "#666", fontSize: 14 }}>
                  Your Net Worth
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Reminders")}
                style={{ marginRight: 12, padding: 8 }}
              >
                <Ionicons name="notifications" size={24} color="#3778C2" />
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: "#3778C2",
                  padding: 12,
                  borderRadius: 12,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  ₹{totalNetWorth.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={signOut} style={{ padding: 8 }}>
                <MaterialIcons name="logout" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 18,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Accounts</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Accounts")}
              style={{ padding: 10 }}
            >
              <Ionicons name="add" size={32} color="#3778C2" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(assets || []).map((item, index) => {
              const isLastOdd =
                assets.length % 2 === 1 && index === assets.length - 1;
              return React.createElement(AnimatedAssetCard, {
                key: item.id,
                asset: item,
                isLastOdd: isLastOdd,
                onPress: (a: any) =>
                  navigation.navigate("AssetDetail", { assetId: a.id }),
              });
            })}
          </View>

          {upcomingReminders.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Upcoming Reminders</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Reminders")}
                >
                  <Text style={{ color: "#3778C2" }}>See all</Text>
                </TouchableOpacity>
              </View>
              {upcomingReminders.map((reminder) => (
                <View
                  key={reminder.id}
                  style={{
                    padding: 12,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: "#3778C2",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ReminderDetail", {
                        reminderId: reminder.id,
                      })
                    }
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "700", flex: 1 }}>
                        {reminder.title}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 12 }}>
                        {reminder.dueDate.toDate().toLocaleDateString()}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleReminder(reminder.id)}
                        style={{
                          marginLeft: 8,
                          padding: 6,
                          backgroundColor: reminder.completed
                            ? "#2ed573"
                            : "transparent",
                          borderRadius: 16,
                          borderWidth: reminder.completed ? 0 : 2,
                          borderColor: "#ddd",
                        }}
                      >
                        <Ionicons
                          name={
                            reminder.completed ? "checkmark" : "ellipse-outline"
                          }
                          size={16}
                          color={reminder.completed ? "#fff" : "#ddd"}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ color: "#666", fontSize: 12 }}>
                      {reminder.category}
                    </Text>
                  </TouchableOpacity>
                </View>
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
              <TouchableOpacity
                onPress={() => navigation.navigate("Transactions")}
              >
                <Text style={{ color: "#3778C2" }}>See all</Text>
              </TouchableOpacity>
            </View>

            {recent.map((item) => {
              const categoryColors = {
                Expense: "#ff4757",
                Transfer: "#ffa502",
                Income: "#2ed573",
                Difference: "#3742fa",
              };
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    padding: 12,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: categoryColors[item.category] || "#ddd",
                  }}
                  onPress={() =>
                    navigation.navigate("Transactions", {
                      editTransaction: item,
                    })
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>₹{item.amount}</Text>
                    <Text style={{ color: "#666" }}>
                      {item.date.toDate().toLocaleString()}
                    </Text>
                  </View>
                  <Text style={{ color: "#666" }}>
                    {item.category}
                    {item.subcategory ? ` - ${item.subcategory}` : ""} •{" "}
                    {item.notes}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AnimatedFAB
            onPress={() =>
              navigation.navigate("Transactions", { openAdd: true })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
