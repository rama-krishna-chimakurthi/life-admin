import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseService } from "../services/FirebaseService";
import { Asset, Transaction, Reminder, StoreShape } from "./types";
import { createAssetActions } from "./assetStore";
import { createTransactionActions } from "./transactionStore";
import { createReminderActions } from "./reminderStore";

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const unsubscribe = FirebaseService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        loadUserData();
      } else {
        setAssets([]);
        setTransactions([]);
        setReminders([]);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserData = async () => {
    try {
      const [assetsData, transactionsData, remindersData] = await Promise.all([
        FirebaseService.getDocuments("assets"),
        FirebaseService.getDocuments("transactions"),
        FirebaseService.getDocuments("reminders"),
      ]);
      setAssets((assetsData as Asset[]) || []);
      setTransactions((transactionsData as Transaction[]) || []);
      setReminders((remindersData as Reminder[]) || []);
    } catch (error) {
      console.error("Error loading user data:", error);
      setAssets([]);
      setTransactions([]);
      setReminders([]);
    }
  };

  const signOut = async () => {
    try {
      await FirebaseService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      setUser(null);
    }
  };

  const {
    createAsset,
    updateAsset,
    adjustAssetBalances,
    reverseAssetBalances,
  } = createAssetActions(user, setAssets);
  const { addTransaction, updateTransaction, deleteTransaction } =
    createTransactionActions(
      user,
      transactions,
      setTransactions,
      adjustAssetBalances,
      reverseAssetBalances
    );
  const { addReminder, updateReminder, deleteReminder, toggleReminder } =
    createReminderActions(user, reminders, setReminders);

  const store: StoreShape = {
    user,
    loading,
    signOut,
    assets,
    createAsset,
    updateAsset,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
