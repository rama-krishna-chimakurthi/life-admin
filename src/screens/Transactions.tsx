// src/screens/Transactions.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store/Store";
import AddTransactionModal from "./modals/AddTransactionModal";

export default function Transactions({ route }: any) {
  const { transactions, assets } = useStore();
  const [open, setOpen] = useState<boolean>(!!route?.params?.openAdd);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  useEffect(() => {
    if (route?.params?.openAdd) setOpen(true);
    if (route?.params?.editTransaction) {
      setEditingTransaction(route?.params?.editTransaction);
      setOpen(true);
    }
  }, [route?.params?.openAdd, route?.params?.editTransaction]);

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
        <Text style={{ fontWeight: "700", fontSize: 18 }}>Transactions</Text>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{
            backgroundColor: "#3778C2",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
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
            onPress={() => {
              setEditingTransaction(item);
              setOpen(true);
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "700" }}>₹{item.amount}</Text>
              <Text style={{ color: "#666" }}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ color: "#666" }}>
              {item.category}{item.subcategory ? ` - ${item.subcategory}` : ''} • {item.notes}
            </Text>
            {(item.fromAssetId || item.toAssetId) && (
              <Text style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                {item.fromAssetId && assets.find(a => a.id === item.fromAssetId)?.title}
                {item.fromAssetId && item.toAssetId && ' → '}
                {item.toAssetId && assets.find(a => a.id === item.toAssetId)?.title}
              </Text>
            )}
          </TouchableOpacity>
        )}}
      />

      <Modal visible={open} animationType="slide">
        <AddTransactionModal 
          onClose={() => {
            setOpen(false);
            setEditingTransaction(null);
          }} 
          editingTransaction={editingTransaction}
        />
      </Modal>
      </View>
    </SafeAreaView>
  );
}
