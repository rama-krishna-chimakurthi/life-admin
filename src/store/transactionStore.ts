import { FirebaseService } from "../services/FirebaseService";
import { Timestamp } from "firebase/firestore";
import { Transaction } from "./types";

export const createTransactionActions = (
  user: any,
  transactions: Transaction[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  adjustAssetBalances: (category: string, amount: number, fromAssetId?: string, toAssetId?: string) => Promise<void>,
  reverseAssetBalances: (category: string, amount: number, fromAssetId?: string, toAssetId?: string) => Promise<void>
) => {
  const addTransaction = async ({ amount, category, subcategory, date, fromAssetId, toAssetId, notes }: any) => {
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
      } else {
        newTransaction = { ...doc, id: Date.now().toString() };
      }
    } catch (error) {
      console.error("Error saving transaction to Firebase:", error);
      newTransaction = { ...doc, id: Date.now().toString() };
    }

    await adjustAssetBalances(category, amt, fromAssetId, toAssetId);
    setTransactions((prev) => [newTransaction, ...prev.filter((t) => t.id !== newTransaction.id)]);
    return newTransaction;
  };

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    const oldTransaction = transactions.find((t) => t.id === transactionId);
    if (!oldTransaction) return;

    const newTransaction = { ...oldTransaction, ...updates };

    try {
      if (user) {
        await FirebaseService.updateDocument("transactions", transactionId, newTransaction);
      }
    } catch (error) {
      console.error("Error saving transaction to Firebase:", error);
    }

    console.log("old transaction:", oldTransaction);
    console.log("new transaction:", newTransaction);

    await reverseAssetBalances(oldTransaction.category, oldTransaction.amount, oldTransaction.fromAssetId, oldTransaction.toAssetId);
    await adjustAssetBalances(newTransaction.category, newTransaction.amount, newTransaction.fromAssetId, newTransaction.toAssetId);
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? newTransaction : t)));
  };

  const deleteTransaction = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    await reverseAssetBalances(transaction.category, transaction.amount, transaction.fromAssetId, transaction.toAssetId);
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  return { addTransaction, updateTransaction, deleteTransaction };
};