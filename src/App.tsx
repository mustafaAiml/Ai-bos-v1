import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Mic, 
  ScanLine, 
  BookOpen, 
  Layers, 
  Store, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';

import { 
  InventoryItem, 
  Transaction, 
  UdhaarCustomer, 
  UdhaarTransaction, 
  ShopProfile, 
  UserAuth, 
  WorkspaceType 
} from './types';

import { 
  initialShopProfile, 
  initialInventory, 
  initialTransactions, 
  initialCustomers, 
  initialUdhaarTransactions 
} from './data/initialData';

import { cleanItemName, devanagariToHinglish } from './utils/matching';
import { saveAccountDataToFirestore, loadAccountDataFromFirestore } from './lib/dbSync';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { BillScannerView } from './components/BillScannerView';
import { UdhaarKhataView } from './components/UdhaarKhataView';
import { SplashLoginModal } from './components/SplashLoginModal';
import { SuiteSwitcherModal } from './components/SuiteSwitcherModal';
import { ShopRegistrationModal } from './components/ShopRegistrationModal';
import { PublishModal } from './components/PublishModal';
import { OnboardingView } from './components/OnboardingView';
import { AIAssistantView } from './components/AIAssistantView';
import { AgenticAlertsView } from './components/AgenticAlertsView';
import { ReportsView } from './components/ReportsView';

type ActiveTab = 'dashboard' | 'inventory' | 'voice' | 'scanner' | 'ledger' | 'assistant' | 'reports';

export default function App() {
  // Helper to load account data from localStorage based on user email
  const loadAccountData = (email: string) => {
    if (!email) return null;
    const key = `aibos_user_account_${email.toLowerCase().trim()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved user account data", e);
      }
    }
    return null;
  };

  // 1. User State
  const [user, setUser] = useState<UserAuth>(() => {
    const saved = localStorage.getItem('aibos_user');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: false,
      email: '',
      name: ''
    };
  });

  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('commerce');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Account-Scoped Persistent States
  const initialAccount = loadAccountData(user.email);

  const [shop, setShop] = useState<ShopProfile>(() => {
    if (initialAccount?.shop) return initialAccount.shop;
    const savedLegacy = localStorage.getItem('aibos_shop');
    return savedLegacy ? JSON.parse(savedLegacy) : {
      ...initialShopProfile,
      ownerEmail: user.email,
      ownerName: user.name
    };
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (initialAccount?.inventory) return initialAccount.inventory;
    const savedLegacy = localStorage.getItem('aibos_inventory');
    return savedLegacy ? JSON.parse(savedLegacy) : initialInventory;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (initialAccount?.transactions) return initialAccount.transactions;
    const savedLegacy = localStorage.getItem('aibos_transactions');
    return savedLegacy ? JSON.parse(savedLegacy) : initialTransactions;
  });

  const [customers, setCustomers] = useState<UdhaarCustomer[]>(() => {
    if (initialAccount?.customers) return initialAccount.customers;
    const savedLegacy = localStorage.getItem('aibos_customers');
    return savedLegacy ? JSON.parse(savedLegacy) : initialCustomers;
  });

  const [udhaarTransactions, setUdhaarTransactions] = useState<UdhaarTransaction[]>(() => {
    if (initialAccount?.udhaarTransactions) return initialAccount.udhaarTransactions;
    const savedLegacy = localStorage.getItem('aibos_udhaar_txs');
    return savedLegacy ? JSON.parse(savedLegacy) : initialUdhaarTransactions;
  });

  // Modal Visibility States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Toast feedback state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync state to account-scoped LocalStorage & Firestore DB
  useEffect(() => {
    localStorage.setItem('aibos_user', JSON.stringify(user));
    if (user.email) {
      const userKey = `aibos_user_account_${user.email.toLowerCase().trim()}`;
      const payload = {
        shop,
        inventory,
        transactions,
        customers,
        udhaarTransactions,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(userKey, JSON.stringify(payload));

      // Async Firestore Cloud Persistence Sync
      saveAccountDataToFirestore(user.email, payload);
    }
  }, [user, shop, inventory, transactions, customers, udhaarTransactions]);

  // Handle Login & Account Switch with Cloud Sync
  const handleLoginSuccess = async (newUser: UserAuth) => {
    setUser(newUser);
    const userKey = `aibos_user_account_${newUser.email.toLowerCase().trim()}`;
    const savedAccountStr = localStorage.getItem(userKey);

    // Try loading from Firestore cloud database first
    const cloudData = await loadAccountDataFromFirestore(newUser.email);
    if (cloudData) {
      if (cloudData.shop) setShop(cloudData.shop);
      if (cloudData.inventory) setInventory(cloudData.inventory);
      if (cloudData.transactions) setTransactions(cloudData.transactions);
      if (cloudData.customers) setCustomers(cloudData.customers);
      if (cloudData.udhaarTransactions) setUdhaarTransactions(cloudData.udhaarTransactions);
      showToast(`✅ Welcome back ${newUser.name}! Synced store data from Cloud Database.`);
      return;
    }

    if (savedAccountStr) {
      // RETURNING USER WITH LOCALSTORE DATA!
      try {
        const acc = JSON.parse(savedAccountStr);
        if (acc.shop) setShop(acc.shop);
        if (acc.inventory) setInventory(acc.inventory);
        if (acc.transactions) setTransactions(acc.transactions);
        if (acc.customers) setCustomers(acc.customers);
        if (acc.udhaarTransactions) setUdhaarTransactions(acc.udhaarTransactions);

        showToast(`✅ Welcome back ${newUser.name}! Restored saved store data for ${newUser.email}`);
      } catch (err) {
        console.error("Error restoring account data:", err);
      }
    } else {
      // NEW USER WITH DIFFERENT EMAIL -> FRESH NEW APP DATA!
      const freshShop: ShopProfile = {
        id: 'shop_' + Date.now(),
        name: '',
        pincode: '400001',
        address: '',
        ownerName: newUser.name,
        ownerEmail: newUser.email,
        phone: newUser.phone || '+91 9876543210',
        category: 'Grocery & Staples',
        businessComplexity: 'fmcg_kirana'
      };

      setShop(freshShop);
      setInventory(initialInventory);
      setTransactions([]);
      setCustomers([]);
      setUdhaarTransactions([]);

      // Automatically open Google Maps shop setup modal so they register shop details!
      setIsShopModalOpen(true);
      showToast(`✨ New account registered for ${newUser.email}! Please search Google Maps for your shop.`);
    }
  };

  const handleLogout = () => {
    const guestUser: UserAuth = {
      isLoggedIn: false,
      email: '',
      name: 'Guest'
    };
    setUser(guestUser);
    setIsAuthModalOpen(true);
    showToast('Logged out. Enter Email & Mobile to sign into another store.');
  };

  // Record a Sale / Purchase Transaction
  const handleRecordTransaction = (txData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update inventory stock counts automatically
    setInventory(prevInv => {
      return prevInv.map(inv => {
        const cleanedInvName = cleanItemName(inv.name);
        const invNameLower = inv.name.toLowerCase();

        const txItemMatch = txData.items.find(i => {
          if (i.itemId === inv.id) return true;
          const cleanedTxName = cleanItemName(i.itemName);
          const rawTxName = devanagariToHinglish(i.itemName).toLowerCase();
          return (
            cleanedTxName.length > 0 && (
              invNameLower.includes(cleanedTxName) ||
              cleanedTxName.includes(cleanedInvName) ||
              rawTxName.includes(invNameLower) ||
              invNameLower.includes(rawTxName)
            )
          );
        });

        if (txItemMatch) {
          const qty = txItemMatch.quantity;
          const currentRem = inv.remainingStock ?? inv.stockQuantity;
          const currentInit = inv.initialStock ?? Math.max(inv.stockQuantity, currentRem);
          const newRem = txData.type === 'sale' 
            ? Math.max(0, currentRem - qty) 
            : currentRem + qty;
          const newInit = txData.type === 'purchase' && newRem > currentInit ? newRem : currentInit;

          return {
            ...inv,
            stockQuantity: newRem,
            remainingStock: newRem,
            initialStock: newInit,
            updatedAt: new Date().toISOString()
          };
        }
        return inv;
      });
    });

    showToast(`✅ Transaction recorded! Stock updated automatically.`);
  };

  // Create new inventory item + record transaction
  const handleAddItemAndRecord = (
    newItemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>,
    txData: Omit<Transaction, 'id' | 'timestamp'>
  ) => {
    const newItemId = 'inv_' + Date.now();
    const createdItem: InventoryItem = {
      ...newItemData,
      id: newItemId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInventory(prev => [createdItem, ...prev]);

    handleRecordTransaction({
      ...txData,
      items: txData.items.map(i => ({ ...i, itemId: newItemId }))
    });

    showToast(`✨ Created "${newItemData.name}" & recorded transaction!`);
  };

  // Inventory CRUD
  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'inv_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setInventory(prev => [newItem, ...prev]);
    showToast(`📦 Added "${newItem.name}" to inventory stock.`);
  };

  const handleUpdateInventoryItem = (updated: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
    showToast(`Updated "${updated.name}" details.`);
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast(`Deleted item from stock.`);
  };

  // Bill Scanner Import Stock
  const handleImportBillStock = (
    billItems: {
      item_name: string;
      quantity: number;
      unit: any;
      cost_price: number;
      selling_price: number;
      total_amount: number;
      category?: string;
    }[],
    vendorName: string
  ) => {
    let totalCostSum = 0;

    setInventory(prevInv => {
      let updatedInv = [...prevInv];

      billItems.forEach(bItem => {
        totalCostSum += bItem.total_amount;

        const existingIdx = updatedInv.findIndex(
          i => i.name.toLowerCase().includes(bItem.item_name.toLowerCase()) || bItem.item_name.toLowerCase().includes(i.name.toLowerCase())
        );

        if (existingIdx >= 0) {
          // Update existing stock
          const currentInv = updatedInv[existingIdx];
          const currentRem = currentInv.remainingStock ?? currentInv.stockQuantity;
          const currentInit = currentInv.initialStock ?? Math.max(currentInv.stockQuantity, currentRem);
          const newRem = currentRem + bItem.quantity;
          const newInit = Math.max(currentInit, newRem);

          updatedInv[existingIdx] = {
            ...currentInv,
            stockQuantity: newRem,
            remainingStock: newRem,
            initialStock: newInit,
            costPrice: bItem.cost_price,
            sellingPrice: bItem.selling_price || currentInv.sellingPrice,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Create new stock item
          updatedInv.push({
            id: 'inv_' + Math.random().toString(36).substr(2, 9),
            name: bItem.item_name,
            aliases: [bItem.item_name.toLowerCase()],
            category: (bItem.category as any) || 'General',
            unit: bItem.unit || 'packet',
            costPrice: bItem.cost_price,
            sellingPrice: bItem.selling_price || Math.round(bItem.cost_price * 1.25),
            stockQuantity: bItem.quantity,
            initialStock: bItem.quantity,
            remainingStock: bItem.quantity,
            lowStockThreshold: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      return updatedInv;
    });

    // Record purchase transaction
    const purchaseTx: Transaction = {
      id: 'tx_bill_' + Date.now(),
      type: 'purchase',
      source: 'bill_ocr',
      items: billItems.map(b => ({
        itemName: b.item_name,
        quantity: b.quantity,
        unit: b.unit,
        unitPrice: b.cost_price,
        totalAmount: b.total_amount,
        costPrice: b.cost_price
      })),
      totalAmount: totalCostSum,
      totalCost: totalCostSum,
      netProfit: 0,
      note: `Wholesale purchase invoice from ${vendorName}`,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [purchaseTx, ...prev]);

    showToast(`🎉 Successfully imported ${billItems.length} items into inventory stock!`);
    setActiveTab('dashboard');
  };

  // Udhaar Ledger Actions
  const handleAddCustomer = (custData: Omit<UdhaarCustomer, 'id' | 'lastTransactionAt'>) => {
    const newCust: UdhaarCustomer = {
      ...custData,
      id: 'cust_' + Date.now(),
      lastTransactionAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCust]);
    showToast(`User ${custData.name} added to Udhaar Khata.`);
  };

  const handleAddUdhaarEntry = (entryData: Omit<UdhaarTransaction, 'id' | 'timestamp'>) => {
    const newEntry: UdhaarTransaction = {
      ...entryData,
      id: 'ud_' + Date.now(),
      timestamp: new Date().toISOString()
    };

    setUdhaarTransactions(prev => [newEntry, ...prev]);

    // Update customer owed balance
    setCustomers(prev => prev.map(c => {
      if (c.id === entryData.customerId) {
        const delta = entryData.type === 'gave_credit' ? entryData.amount : -entryData.amount;
        return {
          ...c,
          totalOwed: c.totalOwed + delta,
          lastTransactionAt: new Date().toISOString()
        };
      }
      return c;
    }));

    showToast(`Ledger entry recorded!`);
  };

  // Restore sample demo data
  const handleResetDemoData = () => {
    if (confirm('Reset to initial sample data for Kirana Store?')) {
      setShop(initialShopProfile);
      setInventory(initialInventory);
      setTransactions(initialTransactions);
      setCustomers(initialCustomers);
      setUdhaarTransactions(initialUdhaarTransactions);
      showToast('Restored sample Kirana store dataset!');
    }
  };

  // Clear all example data for fresh real shop
  const handleClearAllData = () => {
    const emptyShop: ShopProfile = {
      id: 'shop_' + Date.now(),
      name: 'My Store',
      pincode: '400001',
      address: 'Main Market Road',
      ownerName: 'Store Owner',
      ownerEmail: 'owner@mystore.com',
      phone: '+91 98000 00000',
      category: 'General Retail'
    };
    setShop(emptyShop);
    setInventory([]);
    setTransactions([]);
    setCustomers([]);
    setUdhaarTransactions([]);
    localStorage.removeItem('aibos_shop');
    localStorage.removeItem('aibos_inventory');
    localStorage.removeItem('aibos_transactions');
    localStorage.removeItem('aibos_customers');
    localStorage.removeItem('aibos_udhaar_txs');
    showToast('Cleared example data! Set up your real store details now.');
    setIsShopModalOpen(true);
  };

  if (!user.isLoggedIn) {
    return (
      <>
        <OnboardingView onOpenAuth={(mode) => {
          if (mode) setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }} />
        <SplashLoginModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          currentUser={user}
          initialMode={authModalMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        shop={shop}
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenSuiteSwitcher={() => setIsSuiteModalOpen(true)}
        onOpenShopModal={() => setIsShopModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenVoiceModal={() => setActiveTab('voice')}
        onOpenScanModal={() => setActiveTab('scanner')}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventory Stock ({inventory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'voice'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Speak & Sell (Voice AI)</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ScanLine className="w-4 h-4 text-cyan-600" />
              <span>AI Bill Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Udhaar Khata</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'assistant'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Consultant</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports & Analytics</span>
            </button>

          </div>

          <button
            onClick={handleResetDemoData}
            title="Reset to pre-loaded sample Kirana store dataset"
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>

        {/* Autonomous Agentic AI Workflow Alerts Bar */}
        <AgenticAlertsView
          inventory={inventory}
          transactions={transactions}
          customers={customers}
        />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            inventory={inventory}
            onNavigateToVoice={() => setActiveTab('voice')}
            onNavigateToScanner={() => setActiveTab('scanner')}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            transactions={transactions}
            onAddItem={handleAddInventoryItem}
            onUpdateItem={handleUpdateInventoryItem}
            onDeleteItem={handleDeleteInventoryItem}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceAssistantView
            inventory={inventory}
            onRecordTransaction={handleRecordTransaction}
            onAddItemAndRecord={handleAddItemAndRecord}
          />
        )}

        {activeTab === 'scanner' && (
          <BillScannerView
            onImportBillStock={handleImportBillStock}
          />
        )}

        {activeTab === 'ledger' && (
          <UdhaarKhataView
            customers={customers}
            transactions={udhaarTransactions}
            onAddCustomer={handleAddCustomer}
            onAddUdhaarEntry={handleAddUdhaarEntry}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistantView
            shop={shop}
            inventory={inventory}
            transactions={transactions}
            customers={customers}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            shop={shop}
            inventory={inventory}
            transactions={transactions}
            customers={customers}
          />
        )}

      </main>

      {/* Modals */}
      <SplashLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={user}
      />

      <SuiteSwitcherModal
        isOpen={isSuiteModalOpen}
        onClose={() => setIsSuiteModalOpen(false)}
        activeSuite={activeWorkspace}
        onSelectSuite={(s) => {
          setActiveWorkspace(s);
          showToast(`Switched to Commerce Suite`);
        }}
      />

      <ShopRegistrationModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        currentShop={shop}
        onUpdateShop={(s, recItems) => {
          setShop(s);
          if (recItems && recItems.length > 0) {
            setInventory(prev => {
              const newItems = recItems.map((item, idx) => ({
                id: 'inv_rec_' + Date.now() + '_' + idx,
                name: item.name,
                aliases: [item.name.toLowerCase()],
                category: item.category || 'General Retail',
                unit: item.unit || 'Pcs',
                costPrice: Number(item.cost) || 100,
                sellingPrice: Number(item.price) || 150,
                stockQuantity: Number(item.stock) || 10,
                lowStockThreshold: 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }));
              return [...newItems, ...prev];
            });
            showToast(`Loaded ${recItems.length} AI-recommended items into inventory!`);
          } else {
            showToast(`Shop details updated: ${s.name}`);
          }
        }}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        appUrl={window.location.origin}
        onClearAllData={handleClearAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 <strong className="text-slate-800">AI BOS</strong> (Smart Business Operating System) • Tagline: <em className="text-emerald-700 font-medium">Enterprise Business Intelligence Engine</em></p>
          <p className="text-[11px] text-slate-500">Powered by <strong className="text-emerald-700 font-semibold">AI BOS Intelligence Core</strong> • Gemini 2.5 Flash Vision & Voice NLP</p>
        </div>
      </footer>

    </div>
  );
}
