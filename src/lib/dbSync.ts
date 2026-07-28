import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ShopProfile, InventoryItem, Transaction, UdhaarCustomer, UdhaarTransaction } from "../types";

export interface AccountDataPayload {
  shop: ShopProfile;
  inventory: InventoryItem[];
  transactions: Transaction[];
  customers: UdhaarCustomer[];
  udhaarTransactions: UdhaarTransaction[];
  lastUpdated?: string;
}

export async function saveAccountDataToFirestore(email: string, data: AccountDataPayload): Promise<boolean> {
  if (!email || !db) return false;
  try {
    const docRef = doc(db, "user_stores", email.toLowerCase().trim());
    await setDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Firestore save fallback to localStorage:", err);
    return false;
  }
}

export async function loadAccountDataFromFirestore(email: string): Promise<AccountDataPayload | null> {
  if (!email || !db) return null;
  try {
    const docRef = doc(db, "user_stores", email.toLowerCase().trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AccountDataPayload;
    }
  } catch (err) {
    console.warn("Firestore load fallback to localStorage:", err);
  }
  return null;
}
