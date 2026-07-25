export type Category = 
  | 'Beverages' 
  | 'Grocery & Staples' 
  | 'Snacks & Munchies' 
  | 'Dairy & Bakery' 
  | 'Personal Care' 
  | 'Household Supplies' 
  | 'Electronics' 
  | 'General';

export type Unit = 'piece' | 'kg' | 'litre' | 'packet' | 'gm' | 'box' | 'bottle';

export interface InventoryItem {
  id: string;
  name: string;
  aliases: string[]; // Voice keywords like ["gehu", "wheat", "aata"]
  category: Category;
  unit: Unit;
  costPrice: number; // CP
  sellingPrice: number; // SP
  stockQuantity: number;
  initialStock?: number;
  remainingStock?: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'sale' | 'purchase';

export interface TransactionItem {
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  totalAmount: number;
  costPrice?: number; // for profit calculation
}

export interface Transaction {
  id: string;
  type: TransactionType;
  items: TransactionItem[];
  totalAmount: number;
  totalCost: number;
  netProfit: number;
  source: 'manual' | 'voice' | 'bill_ocr';
  note?: string;
  timestamp: string;
  customerName?: string;
}

export interface UdhaarTransaction {
  id: string;
  customerId: string;
  type: 'gave_credit' | 'got_payment'; // gave_credit = customer owes shop; got_payment = customer paid
  amount: number;
  note: string;
  timestamp: string;
}

export interface UdhaarCustomer {
  id: string;
  name: string;
  phone: string;
  totalOwed: number; // positive = customer owes shop (Get ₹X); negative = shop owes customer
  lastTransactionAt: string;
  notes?: string;
}

export interface ShopProfile {
  id: string;
  name: string;
  pincode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  category: string;
  mapsUrl?: string;
  googlePlaceId?: string;
  businessComplexity?: 'simple_apparel' | 'fmcg_kirana' | 'standard_retail';
  customCategories?: string[];
  customUnits?: string[];
}

export interface UserAuth {
  isLoggedIn: boolean;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  token?: string;
}

export interface VoiceNLPResult {
  transaction_type: 'sale' | 'purchase' | 'unclear';
  detected_language: 'hi' | 'en' | 'hinglish';
  items: {
    item_name: string;
    quantity: number;
    unit: Unit;
    unit_price?: number;
    total_amount?: number;
  }[];
  spoken_response: string;
  confidence: number;
}

export interface BillOCRResult {
  vendor_name: string;
  bill_number: string;
  bill_date: string;
  items: {
    item_name: string;
    quantity: number;
    unit: Unit;
    cost_price: number;
    selling_price: number;
    total_amount: number;
    category?: Category;
  }[];
  grand_total: number;
  summary_notes: string;
}

export type WorkspaceType = 'commerce' | 'personal' | 'enterprise';

export interface Workspace {
  id: WorkspaceType;
  name: string;
  tagline: string;
  status: 'active' | 'coming_soon';
  description: string;
  iconName: string;
}
