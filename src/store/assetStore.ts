import { FirebaseService } from "../services/FirebaseService";
import { Asset } from "./types";

export const createAssetActions = (
  user: any,
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
) => {
  const createAsset = async (asset: Partial<Asset> & { initialBalance?: number }) => {
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

  const updateAsset = (assetId: string, patch: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, ...patch } : a))
    );
  };

  const updateAssetBalance = async (assetId: string, newBalance: number) => {
    console.log("Updating asset balance:", assetId, newBalance);
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, balance: newBalance } : a)));
    if (user) {
      await FirebaseService.updateDocument("assets", assetId, { balance: newBalance });
    }
  };

  const adjustAssetBalances = async (category: string, amount: number, fromAssetId?: string, toAssetId?: string) => {
    const amt = Number(amount);

    setAssets((prev) => {
      return prev.map((asset) => {
        if (category === "Transfer") {
          if (asset.id === fromAssetId) {
            const newBalance = Number(asset.balance) - amt;
            if (user) FirebaseService.updateDocument("assets", fromAssetId, { balance: newBalance });
            return { ...asset, balance: newBalance };
          }
          if (asset.id === toAssetId) {
            const newBalance = Number(asset.balance) + amt;
            if (user) FirebaseService.updateDocument("assets", toAssetId, { balance: newBalance });
            return { ...asset, balance: newBalance };
          }
        } else if (category === "Expense" && asset.id === fromAssetId) {
          const newBalance = Number(asset.balance) - amt;
          if (user) FirebaseService.updateDocument("assets", fromAssetId, { balance: newBalance });
          return { ...asset, balance: newBalance };
        } else if (category !== "Expense" && category !== "Transfer" && asset.id === toAssetId) {
          const newBalance = Number(asset.balance) + amt;
          if (user) FirebaseService.updateDocument("assets", toAssetId, { balance: newBalance });
          return { ...asset, balance: newBalance };
        }
        return asset;
      });
    });
  };

  const reverseAssetBalances = async (category: string, amount: number, fromAssetId?: string, toAssetId?: string) => {
    const amt = Number(amount);

    setAssets((prev) => {
      return prev.map((asset) => {
        if (category === "Transfer") {
          if (asset.id === fromAssetId) {
            const newBalance = Number(asset.balance) + amt;
            if (user) FirebaseService.updateDocument("assets", fromAssetId, { balance: newBalance });
            return { ...asset, balance: newBalance };
          }
          if (asset.id === toAssetId) {
            const newBalance = Number(asset.balance) - amt;
            if (user) FirebaseService.updateDocument("assets", toAssetId, { balance: newBalance });
            return { ...asset, balance: newBalance };
          }
        } else if (category === "Expense" && asset.id === fromAssetId) {
          const newBalance = Number(asset.balance) + amt;
          if (user) FirebaseService.updateDocument("assets", fromAssetId, { balance: newBalance });
          return { ...asset, balance: newBalance };
        } else if (category !== "Expense" && category !== "Transfer" && asset.id === toAssetId) {
          const newBalance = Number(asset.balance) - amt;
          if (user) FirebaseService.updateDocument("assets", toAssetId, { balance: newBalance });
          return { ...asset, balance: newBalance };
        }
        return asset;
      });
    });
  };

  return { createAsset, updateAsset, adjustAssetBalances, reverseAssetBalances };
};