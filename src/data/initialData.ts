import { InventoryItem, Transaction, UdhaarCustomer, ShopProfile, UdhaarTransaction } from '../types';

export const initialShopProfile: ShopProfile = {
  id: '',
  name: '',
  pincode: '',
  address: '',
  latitude: 19.0760,
  longitude: 72.8777,
  ownerName: '',
  ownerEmail: '',
  phone: '',
  category: '',
  mapsUrl: '',
  businessComplexity: 'simple_apparel'
};

export const initialInventory: InventoryItem[] = [];
export const initialTransactions: Transaction[] = [];
export const initialCustomers: UdhaarCustomer[] = [];
export const initialUdhaarTransactions: UdhaarTransaction[] = [];
