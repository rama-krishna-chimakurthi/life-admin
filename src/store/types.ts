import { Timestamp } from "firebase/firestore";

export type Asset = {
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

export type StoreShape = {
  user: any;
  loading: boolean;
  signOut: () => void;
  assets: Asset[];
  createAsset: (a: Partial<Asset> & { initialBalance?: number }) => Promise<Asset>;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  transactions: Transaction[];
  addTransaction: (t: Partial<Transaction> & { amount: number; category: Transaction["category"]; }) => Promise<Transaction | undefined>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => void;
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => Promise<Reminder>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Reminder;
  deleteReminder: (id: string) => void;
};