// src/store/Store.tsx
import "react-native-get-random-values";
import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Asset = {
  id: string;
  title: string;
  type: string;
  currency: string;
  balance: number;
  color?: string;
};
type Transaction = {
  id: string;
  amount: number;
  category: 'Expense' | 'Transfer' | 'Salary' | 'Difference';
  date: Date;
  notes?: string;
  subcategory?: string;
  fromAssetId?: string;
  toAssetId?: string;
};

type Reminder = {
  id: string;
  title: string;
  category: string;
  dueDate: Date;
  notes?: string;
  recurrence: string;
  attachmentUrl?: string;
  createdAt: Date;
};

type StoreShape = {
  user: any;
  signInMock: (arg?: any) => void;
  signOut: () => void;
  assets: Asset[];
  createAsset: (a: Partial<Asset> & { initialBalance?: number }) => Asset;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  transactions: Transaction[];
  addTransaction: (
    t: Partial<Transaction> & { amount: number; category: Transaction['category'] }
  ) => Transaction | undefined;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt'>) => Reminder;
  updateReminder: (id: string, updates: Partial<Reminder>) => Reminder;
  deleteReminder: (id: string) => void;
};

const StoreContext = createContext<StoreShape | null>(null);

const initialData = {
  assets: [
    {
      id: "a_bank_1",
      title: "HDFC Savings",
      type: "bank",
      currency: "INR",
      balance: 50000,
      color: "#6C5CE7",
    },
    {
      id: "a_cash_1",
      title: "Cash Wallet",
      type: "cash",
      currency: "INR",
      balance: 2500,
      color: "#00B894",
    },
    {
      id: "a_cc_1",
      title: "Axis Credit",
      type: "credit",
      currency: "INR",
      balance: -12000,
      color: "#FD79A8",
    },
  ] as Asset[],
  transactions: [
    {
      id: "t1",
      amount: 250,
      category: "Expense" as const,
      subcategory: "Food",
      date: new Date(),
      fromAssetId: "a_cash_1",
      notes: "Lunch",
    },
    {
      id: "t2",
      amount: 1200,
      category: "Expense" as const,
      subcategory: "Fuel",
      date: new Date(Date.now() - 86400000),
      fromAssetId: "a_bank_1",
      notes: "Petrol",
    },
  ] as Transaction[],
  reminders: [
    {
      id: "r1",
      title: "Pay Credit Card Bill",
      category: "Finance",
      dueDate: new Date(Date.now() + 86400000 * 3),
      notes: "Axis Bank credit card payment due",
      recurrence: "Monthly",
      createdAt: new Date(),
    },
    {
      id: "r2",
      title: "Vehicle Insurance Renewal",
      category: "Vehicle",
      dueDate: new Date(Date.now() + 86400000 * 7),
      notes: "Car insurance expires next week",
      recurrence: "One-time",
      createdAt: new Date(),
    },
  ] as Reminder[],
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>(initialData.assets);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [reminders, setReminders] = useState<Reminder[]>(initialData.reminders);

  const signInMock = ({ name = "You", email = "you@example.com" } = {}) =>
    setUser({ id: "local_user", name, email });
  const signOut = () => setUser(null);

  const createAsset = (asset: Partial<Asset> & { initialBalance?: number }) => {
    const doc: Asset = {
      id: uuidv4(),
      title: asset.title || "Untitled",
      type: asset.type || "bank",
      currency: asset.currency || "INR",
      balance: Number(asset.initialBalance || 0),
      color: asset.color || "#0984e3",
    };
    setAssets((prev) => [doc, ...prev]);
    return doc;
  };

  const addTransaction = ({
    amount,
    category,
    subcategory,
    date,
    fromAssetId,
    toAssetId,
    notes,
  }: any) => {
    const amt = Number(amount);
    
    setAssets((prevAssets) => {
      const copy = [...prevAssets];
      
      if (category === "Transfer") {
        // Handle transfer: deduct from fromAssetId, add to toAssetId
        const fromIdx = copy.findIndex((a) => a.id === fromAssetId);
        const toIdx = copy.findIndex((a) => a.id === toAssetId);
        if (fromIdx !== -1) {
          copy[fromIdx] = { ...copy[fromIdx], balance: Number(copy[fromIdx].balance) - amt };
        }
        if (toIdx !== -1) {
          copy[toIdx] = { ...copy[toIdx], balance: Number(copy[toIdx].balance) + amt };
        }
      } else if (category === "Expense") {
        // Handle expense: deduct from fromAssetId
        const idx = copy.findIndex((a) => a.id === fromAssetId);
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) - amt };
        }
      } else {
        // Handle income (Salary, Difference): add to toAssetId
        const idx = copy.findIndex((a) => a.id === toAssetId);
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) + amt };
        }
      }
      
      return copy;
    });

    const doc: Transaction = {
      id: uuidv4(),
      amount: amt,
      category,
      subcategory,
      date: date ? new Date(date) : new Date(),
      notes: notes || "",
      ...(fromAssetId && { fromAssetId }),
      ...(toAssetId && { toAssetId }),
    };
    setTransactions((prev) => [doc, ...prev]);
    return doc;
  };



  const updateAsset = (assetId: string, patch: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, ...patch } : a))
    );
  };

  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const oldTransaction = prev.find(t => t.id === transactionId);
      if (!oldTransaction) return prev;
      
      // Reverse the old transaction's effect on assets
      setAssets((prevAssets) => {
        const copy = [...prevAssets];
        const oldAmt = Number(oldTransaction.amount);
        
        if (oldTransaction.category === "Transfer") {
          // Reverse transfer: add back to from, subtract from to
          const fromIdx = copy.findIndex((a) => a.id === oldTransaction.fromAssetId);
          const toIdx = copy.findIndex((a) => a.id === oldTransaction.toAssetId);
          if (fromIdx !== -1) {
            copy[fromIdx] = { ...copy[fromIdx], balance: Number(copy[fromIdx].balance) + oldAmt };
          }
          if (toIdx !== -1) {
            copy[toIdx] = { ...copy[toIdx], balance: Number(copy[toIdx].balance) - oldAmt };
          }
        } else if (oldTransaction.category === "Expense") {
          // Reverse expense: add back to fromAssetId
          const idx = copy.findIndex((a) => a.id === oldTransaction.fromAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) + oldAmt };
          }
        } else {
          // Reverse income: subtract from toAssetId
          const idx = copy.findIndex((a) => a.id === oldTransaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) - oldAmt };
          }
        }
        
        return copy;
      });
      
      // Apply the new transaction's effect on assets
      const newTransaction = { ...oldTransaction, ...updates };
      const newAmt = Number(newTransaction.amount);
      
      setAssets((prevAssets) => {
        const copy = [...prevAssets];
        
        if (newTransaction.category === "Transfer") {
          // Apply transfer: subtract from from, add to to
          const fromIdx = copy.findIndex((a) => a.id === newTransaction.fromAssetId);
          const toIdx = copy.findIndex((a) => a.id === newTransaction.toAssetId);
          if (fromIdx !== -1) {
            copy[fromIdx] = { ...copy[fromIdx], balance: Number(copy[fromIdx].balance) - newAmt };
          }
          if (toIdx !== -1) {
            copy[toIdx] = { ...copy[toIdx], balance: Number(copy[toIdx].balance) + newAmt };
          }
        } else if (newTransaction.category === "Expense") {
          // Apply expense: subtract from fromAssetId
          const idx = copy.findIndex((a) => a.id === newTransaction.fromAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) - newAmt };
          }
        } else {
          // Apply income: add to toAssetId
          const idx = copy.findIndex((a) => a.id === newTransaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) + newAmt };
          }
        }
        
        return copy;
      });
      
      return prev.map((t) => (t.id === transactionId ? newTransaction : t));
    });
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const doc: Reminder = {
      id: uuidv4(),
      ...reminder,
      createdAt: new Date(),
    };
    setReminders((prev) => [doc, ...prev]);
    return doc;
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions((prev) => {
      const transaction = prev.find(t => t.id === transactionId);
      if (!transaction) return prev;
      
      // Reverse the transaction's effect on assets
      setAssets((prevAssets) => {
        const copy = [...prevAssets];
        const amt = Number(transaction.amount);
        
        if (transaction.category === "Transfer") {
          // Reverse transfer: add back to from, subtract from to
          const fromIdx = copy.findIndex((a) => a.id === transaction.fromAssetId);
          const toIdx = copy.findIndex((a) => a.id === transaction.toAssetId);
          if (fromIdx !== -1) {
            copy[fromIdx] = { ...copy[fromIdx], balance: Number(copy[fromIdx].balance) + amt };
          }
          if (toIdx !== -1) {
            copy[toIdx] = { ...copy[toIdx], balance: Number(copy[toIdx].balance) - amt };
          }
        } else if (transaction.category === "Expense") {
          // Reverse expense: add back to fromAssetId
          const idx = copy.findIndex((a) => a.id === transaction.fromAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) + amt };
          }
        } else {
          // Reverse income: subtract from toAssetId
          const idx = copy.findIndex((a) => a.id === transaction.toAssetId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], balance: Number(copy[idx].balance) - amt };
          }
        }
        
        return copy;
      });
      
      return prev.filter(t => t.id !== transactionId);
    });
  };

  const updateReminder = (reminderId: string, updates: Partial<Reminder>) => {
    setReminders((prev) => {
      const updated = prev.map(r => r.id === reminderId ? { ...r, ...updates } : r);
      return updated;
    });
    return reminders.find(r => r.id === reminderId)!;
  };

  const deleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter(r => r.id !== reminderId));
  };

  const store: StoreShape = {
    user,
    signInMock,
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
