// src/store/Store.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { FirebaseService } from "../services/FirebaseService";
import { Timestamp } from "firebase/firestore";

type Asset = {
  id: string;
  title: string;
  type: string;
  currency: string;
  balance: number;
  color?: string;
};
export type Transaction = {
  id: string;
  amount: number;
  category: "Expense" | "Transfer" | "Income" | "Difference";
  date: Timestamp;
  notes?: string;
  subcategory?: string;
  fromAssetId?: string;
  toAssetId?: string;
};

export type Reminder = {
  id: string;
  title: string;
  category: string;
  dueDate: Timestamp;
  notes?: string;
  recurrence: string;
  attachmentUrl?: string;
  createdAt: Timestamp;
};

type StoreShape = {
  user: any;
  loading: boolean;
  signOut: () => void;
  assets: Asset[];
  createAsset: (
    a: Partial<Asset> & { initialBalance?: number }
  ) => Promise<Asset>;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  transactions: Transaction[];
  addTransaction: (
    t: Partial<Transaction> & {
      amount: number;
      category: Transaction["category"];
    }
  ) => Promise<Transaction | undefined>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => void;

  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => Promise<Reminder>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Reminder;
  deleteReminder: (id: string) => void;
};

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

  const createAsset = async (
    asset: Partial<Asset> & { initialBalance?: number }
  ) => {
    const doc = {
      title: asset.title || "Untitled",
      type: asset.type || "bank",
      currency: asset.currency || "INR",
      balance: Number(asset.initialBalance || 0),
      color: asset.color || "#0984e3",
    };

    let newAsset: Asset;
    try {
      const savedDoc = await FirebaseService.addDocument("assets", doc);
      newAsset = { ...doc, id: savedDoc.id };
      setAssets((prev) => [newAsset, ...prev]);
    } catch (error) {
      console.error("Error creating asset:", error);
      newAsset = { ...doc, id: Date.now().toString() };
      setAssets((prev) => [newAsset, ...prev]);
    }
    return newAsset;
  };

  const addTransaction = async ({
    amount,
    category,
    subcategory,
    date,
    fromAssetId,
    toAssetId,
    notes,
  }: any) => {
    const amt = Number(amount);

    const doc = {
      amount: amt,
      category,
      subcategory,
      date: date ? date : Timestamp.now(),
      notes: notes || "",
      ...(fromAssetId && { fromAssetId }),
      ...(toAssetId && { toAssetId }),
    };

    let newTransaction: Transaction;
    try {
      if (user) {
        const savedDoc = await FirebaseService.addDocument("transactions", doc);
        newTransaction = { ...doc, id: savedDoc.id };
        console.log("Transaction saved to Firebase");
      } else {
        newTransaction = { ...doc, id: Date.now().toString() };
      }
    } catch (error) {
      console.error("Error saving transaction to Firebase:", error);
      newTransaction = { ...doc, id: Date.now().toString() };
    }

    // Update local state
    setAssets((prevAssets) => {
      const copy = [...prevAssets];

      if (category === "Transfer") {
        const fromIdx = copy.findIndex((a) => a.id === fromAssetId);
        const toIdx = copy.findIndex((a) => a.id === toAssetId);
        if (fromIdx !== -1) {
          copy[fromIdx] = {
            ...copy[fromIdx],
            balance: Number(copy[fromIdx].balance) - amt,
          };
        }
        if (toIdx !== -1) {
          copy[toIdx] = {
            ...copy[toIdx],
            balance: Number(copy[toIdx].balance) + amt,
          };
        }
      } else if (category === "Expense") {
        const idx = copy.findIndex((a) => a.id === fromAssetId);
        if (idx !== -1) {
          copy[idx] = {
            ...copy[idx],
            balance: Number(copy[idx].balance) - amt,
          };
        }
      } else {
        const idx = copy.findIndex((a) => a.id === toAssetId);
        if (idx !== -1) {
          copy[idx] = {
            ...copy[idx],
            balance: Number(copy[idx].balance) + amt,
          };
        }
      }

      return copy;
    });

    setTransactions((prev) => [
      newTransaction,
      ...prev.filter((t) => t.id !== newTransaction.id),
    ]);
    return newTransaction;
  };

  const updateAsset = (assetId: string, patch: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, ...patch } : a))
    );
  };

  const updateTransaction = async (
    transactionId: string,
    updates: Partial<Transaction>
  ) => {
    const oldTransaction = transactions.find((t) => t.id === transactionId);
    if (!oldTransaction) return;

    const newTransaction = { ...oldTransaction, ...updates };

    try {
      if (user) {
        try {
          await FirebaseService.updateDocument(
            "transactions",
            transactionId,
            newTransaction
          );
          console.log("Transaction updated in Firebase");
        } catch (updateError) {
          console.log("Document not found, creating new one");
          await FirebaseService.addDocument("transactions", {
            ...newTransaction,
            id: transactionId,
          });
          console.log("Transaction created in Firebase");
        }
      }
    } catch (error) {
      console.error("Error saving transaction to Firebase:", error);
    }

    // Update local state
    setTransactions((prev) => {
      // Reverse the old transaction's effect on assets
      setAssets((prevAssets) => {
        const copy = [...prevAssets];
        const oldAmt = Number(oldTransaction.amount);

        if (oldTransaction.category === "Transfer") {
          const fromIdx = copy.findIndex(
            (a) => a.id === oldTransaction.fromAssetId
          );
          const toIdx = copy.findIndex(
            (a) => a.id === oldTransaction.toAssetId
          );
          if (fromIdx !== -1) {
            copy[fromIdx] = {
              ...copy[fromIdx],
              balance: Number(copy[fromIdx].balance) + oldAmt,
            };
          }
          if (toIdx !== -1) {
            copy[toIdx] = {
              ...copy[toIdx],
              balance: Number(copy[toIdx].balance) - oldAmt,
            };
          }
        } else if (oldTransaction.category === "Expense") {
          const idx = copy.findIndex(
            (a) => a.id === oldTransaction.fromAssetId
          );
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) + oldAmt,
            };
          }
        } else {
          const idx = copy.findIndex((a) => a.id === oldTransaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) - oldAmt,
            };
          }
        }

        return copy;
      });

      // Apply the new transaction's effect on assets
      const newAmt = Number(newTransaction.amount);

      setAssets((prevAssets) => {
        const copy = [...prevAssets];

        if (newTransaction.category === "Transfer") {
          const fromIdx = copy.findIndex(
            (a) => a.id === newTransaction.fromAssetId
          );
          const toIdx = copy.findIndex(
            (a) => a.id === newTransaction.toAssetId
          );
          if (fromIdx !== -1) {
            copy[fromIdx] = {
              ...copy[fromIdx],
              balance: Number(copy[fromIdx].balance) - newAmt,
            };
          }
          if (toIdx !== -1) {
            copy[toIdx] = {
              ...copy[toIdx],
              balance: Number(copy[toIdx].balance) + newAmt,
            };
          }
        } else if (newTransaction.category === "Expense") {
          const idx = copy.findIndex(
            (a) => a.id === newTransaction.fromAssetId
          );
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) - newAmt,
            };
          }
        } else {
          const idx = copy.findIndex((a) => a.id === newTransaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) + newAmt,
            };
          }
        }

        return copy;
      });

      return prev.map((t) => (t.id === transactionId ? newTransaction : t));
    });
  };

  const addReminder = async (reminder: Omit<Reminder, "id" | "createdAt">) => {
    const doc = {
      ...reminder,
      createdAt: Timestamp.now(),
    };

    let newReminder: Reminder;
    try {
      if (user) {
        const savedDoc = await FirebaseService.addDocument("reminders", doc);
        newReminder = { ...doc, id: savedDoc.id };
        console.log("Reminder saved to Firebase");
      } else {
        newReminder = { ...doc, id: Date.now().toString() };
      }
    } catch (error) {
      console.error("Error saving reminder to Firebase:", error);
      newReminder = { ...doc, id: Date.now().toString() };
    }

    setReminders((prev) => [newReminder, ...prev]);
    return newReminder;
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions((prev) => {
      const transaction = prev.find((t) => t.id === transactionId);
      if (!transaction) return prev;

      // Reverse the transaction's effect on assets
      setAssets((prevAssets) => {
        const copy = [...prevAssets];
        const amt = Number(transaction.amount);

        if (transaction.category === "Transfer") {
          const fromIdx = copy.findIndex(
            (a) => a.id === transaction.fromAssetId
          );
          const toIdx = copy.findIndex((a) => a.id === transaction.toAssetId);
          if (fromIdx !== -1) {
            copy[fromIdx] = {
              ...copy[fromIdx],
              balance: Number(copy[fromIdx].balance) + amt,
            };
          }
          if (toIdx !== -1) {
            copy[toIdx] = {
              ...copy[toIdx],
              balance: Number(copy[toIdx].balance) - amt,
            };
          }
        } else if (transaction.category === "Expense") {
          const idx = copy.findIndex((a) => a.id === transaction.fromAssetId);
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) + amt,
            };
          }
        } else {
          const idx = copy.findIndex((a) => a.id === transaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              balance: Number(copy[idx].balance) - amt,
            };
          }
        }

        return copy;
      });

      return prev.filter((t) => t.id !== transactionId);
    });
  };

  const updateReminder = (reminderId: string, updates: Partial<Reminder>) => {
    setReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === reminderId ? { ...r, ...updates } : r
      );
      return updated;
    });
    return reminders.find((r) => r.id === reminderId)!;
  };

  const deleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

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
