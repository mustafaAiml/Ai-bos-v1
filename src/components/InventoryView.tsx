import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Filter, 
  IndianRupee, 
  Percent, 
  Check, 
  X,
  Volume2
} from 'lucide-react';
import { InventoryItem, Category, Unit, Transaction } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  transactions?: Transaction[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORIES: Category[] = [
  'Beverages',
  'Grocery & Staples',
  'Snacks & Munchies',
  'Dairy & Bakery',
  'Personal Care',
  'Household Supplies',
  'Electronics',
  'General'
];

const UNITS: Unit[] = ['piece', 'kg', 'litre', 'packet', 'gm', 'box', 'bottle'];

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  transactions = [],
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState('');
  const [category, setCategory] = useState<Category>('Grocery & Staples');
  const [unit, setUnit] = useState<Unit>('packet');
  const [costPrice, setCostPrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(120);
  const [initialStock, setInitialStock] = useState<number>(20);
  const [remainingStock, setRemainingStock] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setAliases('');
    setCategory('Grocery & Staples');
    setUnit('packet');
    setCostPrice(100);
    setSellingPrice(120);
    setInitialStock(20);
    setRemainingStock(20);
    setLowStockThreshold(5);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setAliases((item.aliases || []).join(', '));
    setCategory(item.category);
    setUnit(item.unit);
    setCostPrice(item.costPrice);
    setSellingPrice(item.sellingPrice);
    const initVal = item.initialStock ?? item.stockQuantity;
    const remVal = item.remainingStock ?? item.stockQuantity;
    setInitialStock(initVal);
    setRemainingStock(remVal);
    setLowStockThreshold(item.lowStockThreshold);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const aliasArray = aliases
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(a => a.length > 0);

    const initStockNum = Number(initialStock);
    const remStockNum = Number(remainingStock);

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name,
        aliases: aliasArray,
        category,
        unit,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: remStockNum,
        initialStock: initStockNum,
        remainingStock: remStockNum,
        lowStockThreshold: Number(lowStockThreshold),
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddItem({
        name,
        aliases: aliasArray,
        category,
        unit,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: remStockNum,
        initialStock: initStockNum,
        remainingStock: remStockNum,
        lowStockThreshold: Number(lowStockThreshold),
      });
    }

    setIsModalOpen(false);
  };

  // Calculate profit margin %
  const marginPercent = sellingPrice > 0 ? Math.round(((sellingPrice - costPrice) / sellingPrice) * 100) : 0;

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.aliases || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Inventory Stock & Price Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Manage cost prices, profit margins %, voice keywords, and stock counts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Stock Item</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or voice alias (e.g. 'gehu', 'doodh', 'oil')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Product Name & Voice Keywords</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Cost (CP)</th>
                <th className="p-3.5 text-right">Selling (SP)</th>
                <th className="p-3.5 text-right">Margin %</th>
                <th className="p-3.5 text-center">Stock Level</th>
                <th className="p-3.5 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredInventory.map((item) => {
                const isLow = item.stockQuantity <= item.lowStockThreshold;
                const margin = item.sellingPrice > 0 ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100) : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Item Name & Voice Keywords */}
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.aliases && item.aliases.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Volume2 className="w-3 h-3 text-emerald-600 inline" />
                          {item.aliases.map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono font-medium">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      ₹{item.costPrice}
                    </td>

                    {/* Selling Price */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{item.sellingPrice}
                    </td>

                    {/* Margin % */}
                    <td className="p-3.5 text-right font-bold text-emerald-700">
                      +{margin}%
                    </td>

                    {/* Stock Level with Breakdown (Remaining Stock vs Initial Stock Progress Bar) */}
                    <td className="p-3.5 text-center min-w-[185px]">
                      {(() => {
                        const totalStock = item.initialStock ?? item.stockQuantity;
                        const remStock = item.remainingStock ?? item.stockQuantity;
                        const ratio = totalStock > 0 ? Math.min(100, Math.max(0, Math.round((remStock / totalStock) * 100))) : 0;
                        const isLow = remStock <= item.lowStockThreshold;
                        const isOut = remStock === 0;

                        return (
                          <div className="space-y-1.5 text-center">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                              <span className={
                                isOut 
                                  ? 'text-red-700 font-black flex items-center gap-1' 
                                  : isLow 
                                  ? 'text-red-600 font-black flex items-center gap-1' 
                                  : 'text-emerald-700 font-bold'
                              }>
                                {(isLow || isOut) && <AlertTriangle className="w-3.5 h-3.5 text-red-600 inline" />}
                                {remStock} {item.unit}s Left
                              </span>
                              <span className="text-slate-500 font-medium">
                                Initial: {totalStock}
                              </span>
                            </div>

                            {/* Remaining vs Initial Progress Bar with Red Low Stock Highlight */}
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isOut 
                                    ? 'bg-red-600' 
                                    : isLow 
                                    ? 'bg-red-500' 
                                    : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.max(0, ratio)}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                              <span>Remaining Ratio</span>
                              <span className={`font-mono font-bold ${isLow || isOut ? 'text-red-600' : 'text-slate-700'}`}>
                                {remStock} / {totalStock} ({ratio}%)
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-3 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Aapki Dukan Ka Stock Khali Hai!
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Add your first stock item manually or scan a wholesale purchase bill to import your stock items automatically.
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Item</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thumbs Up Soft Drink 600ml"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Voice Search Keywords / Aliases (Comma Separated)
                </label>
                <input
                  type="text"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="e.g. colddrink, thumbsup, thump, soda"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Keywords used by shopkeeper during voice sales (e.g., "doodh", "gehu", "namak").
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Measurement Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-900"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (CP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (SP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Margin %
                  </label>
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-mono font-bold text-emerald-800">
                    +{marginPercent}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Total Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Remaining Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={remainingStock}
                    onChange={(e) => setRemainingStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Add Item'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
