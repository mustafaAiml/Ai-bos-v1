import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { Transaction, InventoryItem } from '../types';
import { getDailyInsightsAPI } from '../services/aiService';

interface DashboardViewProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
  onNavigateToVoice: () => void;
  onNavigateToScanner: () => void;
  onNavigateToInventory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  inventory,
  onNavigateToVoice,
  onNavigateToScanner,
  onNavigateToInventory,
}) => {
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Filter Today's transactions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = transactions.filter(t => t.type === 'sale' && t.timestamp.startsWith(todayStr));

  const todayRevenue = todaySales.reduce((acc, t) => acc + t.totalAmount, 0);
  const todayCogs = todaySales.reduce((acc, t) => acc + t.totalCost, 0);
  const todayProfit = todayRevenue - todayCogs;
  const todayItemsSold = todaySales.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const todayProfitMargin = todayRevenue > 0 ? Math.round((todayProfit / todayRevenue) * 100) : 0;

  // Calculate Low Stock alert count
  const lowStockCount = inventory.filter(i => i.stockQuantity <= i.lowStockThreshold).length;

  // Per-item daily sales breakdown
  const itemBreakdownMap: { [key: string]: { name: string; qty: number; unit: string; revenue: number; profit: number } } = {};

  todaySales.forEach(tx => {
    tx.items.forEach(item => {
      const key = item.itemName || 'Unknown Item';
      if (!itemBreakdownMap[key]) {
        itemBreakdownMap[key] = {
          name: key,
          qty: 0,
          unit: item.unit,
          revenue: 0,
          profit: 0
        };
      }
      itemBreakdownMap[key].qty += item.quantity;
      itemBreakdownMap[key].revenue += item.totalAmount;
      itemBreakdownMap[key].profit += (item.totalAmount - (item.costPrice ? item.costPrice * item.quantity : item.totalAmount * 0.8));
    });
  });

  const itemBreakdownList = Object.values(itemBreakdownMap).sort((a, b) => b.revenue - a.revenue);

  // 7-day chart data preparation
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const dayTxs = transactions.filter(t => t.type === 'sale' && t.timestamp.startsWith(dateKey));
    const dayRev = dayTxs.reduce((sum, t) => sum + t.totalAmount, 0);
    const dayCost = dayTxs.reduce((sum, t) => sum + t.totalCost, 0);
    const dayProf = dayRev - dayCost;

    chartData.push({
      date: dayLabel,
      Revenue: dayRev,
      NetProfit: dayProf,
      COGS: dayCost
    });
  }

  // Fetch AI daily business insights
  const fetchAiTips = async () => {
    setLoadingAi(true);
    const topNames = itemBreakdownList.slice(0, 3).map(i => i.name);
    const tips = await getDailyInsightsAPI({
      revenue: todayRevenue,
      cogs: todayCogs,
      netProfit: todayProfit,
      transactionsCount: todaySales.length,
      topItemNames: topNames
    });
    setAiTips(tips);
    setLoadingAi(false);
  };

  useEffect(() => {
    fetchAiTips();
  }, [todayRevenue]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner Summary & Quick Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 border border-emerald-700/50 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
              Live Business Ledger
            </span>
            <span className="text-xs text-slate-200 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Today's Financial Overview
          </h1>
          <p className="text-xs text-slate-200">
            Real-time automated sales calculation & stock ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNavigateToVoice}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Voice Sale Entry</span>
          </button>
          <button
            onClick={onNavigateToScanner}
            className="px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-500/50 font-semibold text-xs transition"
          >
            Scan Purchase Bill
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Revenue Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{todayRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 inline" />
            {todaySales.length} Transactions Today
          </p>
        </div>

        {/* COGS Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Cost of Goods (COGS)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">
            ₹{todayCogs.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Total product purchase cost
          </p>
        </div>

        {/* Net Profit Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-300 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-extrabold">Today's Net Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900 tracking-tight">
            ₹{todayProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-700 font-extrabold mt-1">
            Deterministic Python Calc
          </p>
        </div>

        {/* Items Sold Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Items Sold</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-900 tracking-tight">
            {todayItemsSold} <span className="text-xs text-slate-500 font-normal">units</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Across {itemBreakdownList.length} distinct items
          </p>
        </div>

        {/* Profit Margin Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Profit Margin %</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-900 tracking-tight">
            {todayProfitMargin}%
          </p>
          <p className="text-[10px] text-purple-700 font-bold mt-1">
            {todayProfitMargin >= 15 ? 'Healthy Margin' : 'Normal Retail Margin'}
          </p>
        </div>

      </div>

      {/* AI Daily Business Advice Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Gemini AI Daily Business Advice
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                AI Agent
              </span>
            </h3>
          </div>
          <button
            onClick={fetchAiTips}
            disabled={loadingAi}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>Refresh Advice</span>
          </button>
        </div>

        {loadingAi ? (
          <div className="p-4 text-center text-xs text-slate-600 font-medium">
            ⏳ Asking Gemini Agent for Kirana retail optimization tips...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiTips.map((tip, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-800 shadow-xs flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7-Day Chart & Low Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-Day Revenue vs Profit Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Sales & Profit Trend</h3>
              <p className="text-xs text-slate-500">Revenue vs Cost vs Net Profit breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1 text-emerald-700">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-700">
                <span className="w-3 h-3 rounded bg-cyan-600 inline-block"></span>
                <span>Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value}`, '']}
                />
                <Bar dataKey="Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NetProfit" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Box (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Low-Stock Warnings</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {lowStockCount} Items Low
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Items approaching threshold. Reorder soon to prevent lost customer sales.
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {inventory
                .filter(i => i.stockQuantity <= i.lowStockThreshold)
                .map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category} • CP: ₹{item.costPrice}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-200/80 rounded-md">
                        {item.stockQuantity} {item.unit} left
                      </span>
                    </div>
                  </div>
                ))}
              {lowStockCount === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 font-medium">
                  🎉 All inventory items have healthy stock levels!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToInventory}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition"
          >
            Manage Inventory Stock
          </button>
        </div>

      </div>

      {/* Per-Item Daily Sales Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Per-Item Sales Breakdown</h3>
            <p className="text-xs text-slate-500">Detailed performance per item sold today</p>
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {itemBreakdownList.length} Unique Items Sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Item Name</th>
                <th className="p-3 text-center">Quantity Sold</th>
                <th className="p-3 text-right">Revenue (₹)</th>
                <th className="p-3 text-right rounded-r-xl">Net Profit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {itemBreakdownList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                      {item.qty} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-700">
                    +₹{Math.round(item.profit).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {itemBreakdownList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No sales recorded yet today. Use <strong className="text-emerald-700">Speak & Sell</strong> or manual entry to add sales!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
