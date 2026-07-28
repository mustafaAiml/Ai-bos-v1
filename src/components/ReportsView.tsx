import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Package, 
  BookOpen, 
  Sparkles, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { InventoryItem, Transaction, UdhaarCustomer, ShopProfile } from '../types';

interface ReportsViewProps {
  shop: ShopProfile;
  inventory: InventoryItem[];
  transactions: Transaction[];
  customers: UdhaarCustomer[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  shop,
  inventory,
  transactions,
  customers,
}) => {
  const [reportType, setReportType] = useState<'sales_summary' | 'profit_loss' | 'inventory_valuation' | 'udhaar_ledger'>('sales_summary');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const salesTxs = transactions.filter(t => t.type === 'sale');
  const purchaseTxs = transactions.filter(t => t.type === 'purchase');

  const totalRevenue = salesTxs.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCogs = salesTxs.reduce((sum, t) => sum + (t.totalCost || t.totalAmount * 0.8), 0);
  const netProfit = totalRevenue - totalCogs;
  const marginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const totalStockValue = inventory.reduce((sum, i) => sum + (i.remainingStock ?? i.stockQuantity) * (i.costPrice || 0), 0);
  const totalRetailValue = inventory.reduce((sum, i) => sum + (i.remainingStock ?? i.stockQuantity) * (i.sellingPrice || 0), 0);

  const totalUdhaarDebt = customers.reduce((sum, c) => sum + (c.totalOwed > 0 ? c.totalOwed : 0), 0);

  const handleExportCSV = () => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `AI BOS Business Report - ${shop.name || 'Store'}\n`;
    csvContent += `Report Type: ${reportType.replace('_', ' ').toUpperCase()}\n`;
    csvContent += `Generated Date: ${new Date().toLocaleString()}\n\n`;

    if (reportType === 'sales_summary' || reportType === 'profit_loss') {
      csvContent += "Transaction ID,Date,Type,Amount,Cost,Net Profit,Source,Note\n";
      transactions.forEach(t => {
        csvContent += `"${t.id}","${t.timestamp}","${t.type}",${t.totalAmount},${t.totalCost || 0},${t.netProfit || 0},"${t.source}","${t.note || ''}"\n`;
      });
    } else if (reportType === 'inventory_valuation') {
      csvContent += "Item Name,Category,Unit,Cost Price,Selling Price,Stock Quantity,Total Cost Value,Total Retail Value\n";
      inventory.forEach(i => {
        const qty = i.remainingStock ?? i.stockQuantity;
        csvContent += `"${i.name}","${i.category}","${i.unit}",${i.costPrice},${i.sellingPrice},${qty},${qty * i.costPrice},${qty * i.sellingPrice}\n`;
      });
    } else {
      csvContent += "Customer Name,Phone,Address,Outstanding Udhaar Owed\n";
      customers.forEach(c => {
        csvContent += `"${c.name}","${c.phone}","${c.address || ''}",${c.totalOwed}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aibos_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    setExportMsg("CSV report exported successfully!");
    setTimeout(() => setExportMsg(null), 3000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Enterprise Business Reports & Export Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official commercial reports for {shop.name || 'Store'} (Address: {shop.address || 'Local Market'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {exportMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportMsg}</span>
        </div>
      )}

      {/* Report Type Selector Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 overflow-x-auto">
        <button
          onClick={() => setReportType('sales_summary')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            reportType === 'sales_summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sales & Revenue Summary
        </button>
        <button
          onClick={() => setReportType('profit_loss')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            reportType === 'profit_loss' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profit & Loss Breakdown
        </button>
        <button
          onClick={() => setReportType('inventory_valuation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            reportType === 'inventory_valuation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inventory Stock Valuation
        </button>
        <button
          onClick={() => setReportType('udhaar_ledger')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            reportType === 'udhaar_ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Udhaar Credit Ledger Report
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <p className="text-xs text-emerald-800 font-extrabold uppercase">Total Revenue Recorded</p>
          <p className="text-2xl font-black text-emerald-950 mt-1">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">{salesTxs.length} Sales Transactions</p>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
          <p className="text-xs text-teal-800 font-extrabold uppercase">Net Profit Margin</p>
          <p className="text-2xl font-black text-teal-950 mt-1">₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-teal-700 mt-1 font-bold">{marginPct}% Profit Margin Rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-600 font-extrabold uppercase">Inventory Stock Value (Cost)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Retail Value: ₹{totalRetailValue.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <p className="text-xs text-amber-800 font-extrabold uppercase">Outstanding Udhaar Debt</p>
          <p className="text-2xl font-black text-amber-950 mt-1">₹{totalUdhaarDebt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">{customers.filter(c => c.totalOwed > 0).length} Credit Customers</p>
        </div>
      </div>

      {/* Report Table View */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>{reportType.replace('_', ' ')} Details</span>
          <span className="text-slate-500 font-normal text-[11px]">Commercial Audit Log</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'sales_summary' || reportType === 'profit_loss' ? (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Revenue Amount</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 font-bold uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full ${t.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3">{t.items.map(i => i.itemName).join(', ') || 'General Order'}</td>
                    <td className="p-3 font-bold text-slate-900">₹{t.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-slate-500">₹{(t.totalCost || 0).toFixed(2)}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{(t.netProfit || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'inventory_valuation' ? (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Cost Rate</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">Total Cost Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {inventory.map(i => {
                  const qty = i.remainingStock ?? i.stockQuantity;
                  return (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{i.name}</td>
                      <td className="p-3">{i.category}</td>
                      <td className="p-3 font-bold">{qty} {i.unit}</td>
                      <td className="p-3">₹{i.costPrice.toFixed(2)}</td>
                      <td className="p-3 font-bold">₹{i.sellingPrice.toFixed(2)}</td>
                      <td className="p-3 font-black text-emerald-800">₹{(qty * i.costPrice).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Outstanding Credit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.address || 'Local Market'}</td>
                    <td className="p-3 font-black text-amber-700">₹{c.totalOwed.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
