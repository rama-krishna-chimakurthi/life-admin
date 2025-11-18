// src/screens/AssetDetail.tsx
import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";
import { Transaction } from "@/store/types";

export default function AssetDetail({ route }: any) {
  const { assetId } = route.params;
  const { assets, transactions } = useStore();
  const asset = (assets || []).find((a) => a.id === assetId);
  const related = (transactions || []).filter(
    (t) => t.fromAssetId === assetId || t.toAssetId === assetId
  );

  if (!asset)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Asset not found</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f8fb" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 18 }}>{asset.title}</Text>
          <Text style={{ color: "#666", marginTop: 6 }}>Balance</Text>
          <Text style={{ fontWeight: "700", fontSize: 22, marginTop: 6 }}>
            ₹{Number(asset.balance).toLocaleString()}
          </Text>
        </View>

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Recent Transactions
        </Text>
        <FlatList
          data={related}
          keyExtractor={(i: Transaction) => i.id}
          renderItem={({ item }: { item: Transaction }) => {
            const categoryColors = {
              Expense: "#ff4757",
              Transfer: "#ffa502",
              Income: "#2ed573",
              Difference: "#3742fa",
            };
            return (
              <View
                style={{
                  padding: 12,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: categoryColors[item.category] || "#ddd",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>₹{item.amount}</Text>
                  <Text style={{ color: "#666" }}>
                    {item.date.toDate().toLocaleDateString()}
                  </Text>
                </View>
                <Text style={{ color: "#666" }}>
                  {item.category}
                  {item.subcategory ? ` - ${item.subcategory}` : ""} •{" "}
                  {item.notes}
                </Text>
                {(item.fromAssetId || item.toAssetId) && (
                  <Text style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                    {item.fromAssetId &&
                      (assets || []).find((a) => a.id === item.fromAssetId)
                        ?.title}
                    {item.fromAssetId && item.toAssetId && " → "}
                    {item.toAssetId &&
                      (assets || []).find((a) => a.id === item.toAssetId)
                        ?.title}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
