// src/screens/modals/AddTransactionModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Transaction, useStore } from "../../store/Store";
import { Timestamp } from "firebase/firestore";

function parseNumericInput(input: string) {
  if (!input) return 0;
  // remove commas, currency symbols, and trim
  const cleaned = String(input)
    .replace(/[^\d.-]/g, "")
    .trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

const categories = ["Expense", "Transfer", "Income", "Difference"] as const;

const subcategories = {
  Expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Other",
  ],
  Transfer: ["Savings", "Investment", "Loan", "Other"],
  Income: ["Monthly", "Bonus", "Freelance", "Other"],
  Difference: ["Interest", "Cashback", "Refund", "Other"],
};

export default function AddTransactionModal({
  onClose,
  editingTransaction,
}: {
  onClose: () => void;
  editingTransaction: Transaction | undefined;
}) {
  const {
    assets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createAsset,
  } = useStore();
  const safeAssets = Array.isArray(assets) ? assets : [];

  const [amount, setAmount] = useState(
    editingTransaction ? String(editingTransaction.amount) : ""
  );
  const [category, setCategory] = useState<(typeof categories)[number]>(
    editingTransaction ? editingTransaction.category : "Expense"
  );
  const [subcategory, setSubcategory] = useState(
    editingTransaction ? editingTransaction.subcategory || "" : ""
  );
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState("");

  const [fromAssetId, setFromAssetId] = useState<string | null>(
    editingTransaction
      ? editingTransaction.fromAssetId || null
      : safeAssets[0]?.id || null
  );
  const [toAssetId, setToAssetId] = useState<string | null>(
    editingTransaction
      ? editingTransaction.toAssetId || null
      : safeAssets[1]?.id || null
  );
  const [notes, setNotes] = useState(
    editingTransaction ? editingTransaction.notes || "" : ""
  );
  console.log("editingTransaction:", editingTransaction);
  const [date, setDate] = useState(
    editingTransaction ? editingTransaction.date.toDate() : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onSave = () => {
    // parse amount to number
    const amt = parseNumericInput(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      return Alert.alert(
        "Invalid amount",
        "Please enter a valid amount greater than 0."
      );
    }

    if (category === "Expense" && !fromAssetId) {
      return Alert.alert("Select account", "Please select a from account.");
    }
    if ((category === "Income" || category === "Difference") && !toAssetId) {
      return Alert.alert("Select account", "Please select a to account.");
    }

    if (category === "Transfer") {
      if (!fromAssetId || !toAssetId) {
        return Alert.alert(
          "Select accounts",
          "Please select both from and to accounts for transfer."
        );
      }
      if (fromAssetId === toAssetId) {
        return Alert.alert(
          "Invalid transfer",
          "From and to accounts must be different."
        );
      }
    }

    const transactionData = {
      amount: amt,
      category,
      subcategory,
      assetId:
        category === "Transfer"
          ? fromAssetId!
          : category === "Expense"
          ? fromAssetId!
          : toAssetId!,
      notes,
      date: Timestamp.fromDate(date),
      ...(category === "Transfer" && { fromAssetId, toAssetId }),
      ...(category === "Expense" && { fromAssetId }),
      ...(category !== "Expense" && category !== "Transfer" && { toAssetId }),
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    onClose();
  };

  const onDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTransaction(editingTransaction.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50 }}>
      <ScrollView
        style={{ flex: 1, padding: 18 }}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: "#777" }}>Close</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 18 }}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="₹ 0.00"
          style={{
            borderWidth: 1,
            borderColor: "#e6eef7",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
            backgroundColor: "#fff",
          }}
        />

        <Text style={{ marginTop: 12 }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
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

        <Text style={{ marginTop: 12 }}>Subcategory</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
          {subcategories[category].map((sub) => (
            <TouchableOpacity
              key={sub}
              onPress={() => {
                setSubcategory(sub);
                setShowCustomSubcategory(false);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: subcategory === sub ? "#3778C2" : "#f0f0f0",
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: subcategory === sub ? "#fff" : "#666" }}>
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
          {subcategory && !subcategories[category].includes(subcategory) && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: "#3778C2",
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>{subcategory}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowCustomSubcategory(true)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: "#e6eef7",
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#3778C2" }}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {showCustomSubcategory && (
          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            <TextInput
              value={customSubcategory}
              onChangeText={setCustomSubcategory}
              placeholder="Enter new subcategory"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#e6eef7",
                padding: 10,
                borderRadius: 8,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (customSubcategory.trim()) {
                  setSubcategory(customSubcategory.trim());
                  setCustomSubcategory("");
                  setShowCustomSubcategory(false);
                }
              }}
              style={{
                backgroundColor: "#3778C2",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {category === "Transfer" ? (
          <>
            <Text style={{ marginTop: 12 }}>From Account</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              {safeAssets.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setFromAssetId(a.id)}
                  style={{
                    padding: 12,
                    backgroundColor: fromAssetId === a.id ? "#eef6ff" : "#fff",
                  }}
                >
                  <Text>
                    {a.title} (₹{a.balance})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ marginTop: 12 }}>To Account</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              {safeAssets.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setToAssetId(a.id)}
                  style={{
                    padding: 12,
                    backgroundColor: toAssetId === a.id ? "#eef6ff" : "#fff",
                  }}
                >
                  <Text>
                    {a.title} (₹{a.balance})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : category === "Expense" ? (
          <>
            <Text style={{ marginTop: 12 }}>From Account</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              {safeAssets.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setFromAssetId(a.id)}
                  style={{
                    padding: 12,
                    backgroundColor: fromAssetId === a.id ? "#eef6ff" : "#fff",
                  }}
                >
                  <Text>
                    {a.title} (₹{a.balance})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : category === "Income" ? (
          <>
            <Text style={{ marginTop: 12 }}>To Account</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              {safeAssets.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setToAssetId(a.id)}
                  style={{
                    padding: 12,
                    backgroundColor: toAssetId === a.id ? "#eef6ff" : "#fff",
                  }}
                >
                  <Text>
                    {a.title} (₹{a.balance})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={{ marginTop: 12 }}>Account</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e6eef7",
                borderRadius: 8,
                marginTop: 6,
              }}
            >
              {safeAssets.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setToAssetId(a.id)}
                  style={{
                    padding: 12,
                    backgroundColor: toAssetId === a.id ? "#eef6ff" : "#fff",
                  }}
                >
                  <Text>
                    {a.title} (₹{a.balance})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={{ marginTop: 12 }}>Date & Time</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e6eef7",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e6eef7",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text>
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === "ios");
              if (selectedTime) setDate(selectedTime);
            }}
          />
        )}

        <Text style={{ marginTop: 12 }}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={{
            borderWidth: 1,
            borderColor: "#e6eef7",
            padding: 10,
            borderRadius: 8,
            marginTop: 6,
            height: 80,
            textAlignVertical: "top",
          }}
          multiline
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#3778C2",
            padding: 12,
            alignItems: "center",
            borderRadius: 8,
            marginTop: 18,
          }}
          onPress={onSave}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {editingTransaction ? "Update Transaction" : "Save Transaction"}
          </Text>
        </TouchableOpacity>

        {editingTransaction && (
          <TouchableOpacity
            style={{
              backgroundColor: "#ff4757",
              padding: 12,
              alignItems: "center",
              borderRadius: 8,
              marginTop: 8,
            }}
            onPress={onDelete}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Delete Transaction
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
