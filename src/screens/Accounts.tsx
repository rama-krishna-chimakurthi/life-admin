// src/screens/Accounts.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";

export default function Accounts({ navigation }: any) {
  const { assets, createAsset } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("bank");
  //Test

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter account title");
      return;
    }
    createAsset({
      title: title.trim(),
      type,
      initialBalance: Number(balance) || 0,
    });
    setTitle("");
    setBalance("");
    setShowForm(false);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 18 }}>Accounts</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)}>
            <Text style={{ color: "#3778C2", fontSize: 32, padding: 10 }}>
              {showForm ? "×" : "+"}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>
              Add New Account
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Account name"
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            />

            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {["bank", "cash", "credit"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor: type === t ? "#3778C2" : "#f0f0f0",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: type === t ? "#fff" : "#666",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={balance}
              onChangeText={setBalance}
              placeholder="Initial balance"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            />

            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: "#3778C2",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Add Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={assets}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#fff",
                borderRadius: 10,
                marginBottom: 8,
              }}
              onPress={() =>
                navigation.navigate("AssetDetail", { assetId: item.id })
              }
            >
              <View>
                <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                <Text style={{ color: "#666", textTransform: "capitalize" }}>
                  {item.type}
                </Text>
              </View>
              <Text style={{ fontWeight: "700", textAlign: "right" }}>
                ₹{Number(item.balance).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
