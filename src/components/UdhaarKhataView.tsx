import React, { useState } from 'react';
import { 
  BookOpen, 
  UserPlus, 
  Plus, 
  Minus, 
  Phone, 
  Send, 
  Search, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  X,
  Copy,
  MessageSquare
} from 'lucide-react';
import { UdhaarCustomer, UdhaarTransaction } from '../types';

interface UdhaarKhataViewProps {
  customers: UdhaarCustomer[];
  transactions: UdhaarTransaction[];
  onAddCustomer: (cust: Omit<UdhaarCustomer, 'id' | 'lastTransactionAt'>) => void;
  onAddUdhaarEntry: (entry: Omit<UdhaarTransaction, 'id' | 'timestamp'>) => void;
}

export const UdhaarKhataView: React.FC<UdhaarKhataViewProps> = ({
  customers,
  transactions,
  onAddCustomer,
  onAddUdhaarEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  
  // New Customer Modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // New Transaction entry state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'gave_credit' | 'got_payment'>('gave_credit');
  const [entryAmount, setEntryAmount] = useState<number>(100);
  const [entryNote, setEntryNote] = useState('');

  // Reminder message copied toast state
  const [copiedMsg, setCopiedMsg] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const customerTransactions = transactions.filter(t => t.customerId === selectedCustomer?.id);

  // Total shop credit balances
  const totalYouWillGet = customers.reduce((acc, c) => acc + (c.totalOwed > 0 ? c.totalOwed : 0), 0);
  const totalYouWillGive = customers.reduce((acc, c) => acc + (c.totalOwed < 0 ? Math.abs(c.totalOwed) : 0), 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    onAddCustomer({
      name: custName,
      phone: custPhone,
      totalOwed: 0,
      notes: custNotes
    });
    setCustName('');
    setCustPhone('');
    setCustNotes('');
    setIsCustomerModalOpen(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || entryAmount <= 0) return;

    onAddUdhaarEntry({
      customerId: selectedCustomer.id,
      type: entryType,
      amount: Number(entryAmount),
      note: entryNote || (entryType === 'gave_credit' ? 'Took items on credit' : 'Received cash payment')
    });

    setIsEntryModalOpen(false);
    setEntryAmount(100);
    setEntryNote('');
  };

  // WhatsApp reminder message text
  const generateWhatsAppReminder = () => {
    if (!selectedCustomer) return '';
    return `Namaste ${selectedCustomer.name} ji, Gupta Kirana Store se aapka Udhaar Khata balance: ₹${selectedCustomer.totalOwed} baaki hai. Kripya payment Google Pay / UPI ya cash se karein. Dhanyawad!`;
  };

  const handleCopyReminder = () => {
    const text = generateWhatsAppReminder();
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Customer Udhaar Khata (Ledger)
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Track customer pending credits, cash repayments, and send WhatsApp payment reminders.
          </p>
        </div>

        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs shadow-sm transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Summary Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total You Will Get (Aapko Milega)</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              ₹{totalYouWillGet.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
            +₹
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200/90 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total You Will Give (Aapko Dena Hai)</p>
            <p className="text-2xl font-black text-rose-700 mt-1">
              ₹{totalYouWillGive.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
            -₹
          </div>
        </div>
      </div>

      {/* Split View: Customer List (1 Col) & Selected Customer Ledger (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Sidebar List */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredCustomers.map(cust => {
              const isSelected = cust.id === selectedCustomer?.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{cust.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {cust.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold text-xs ${
                      cust.totalOwed > 0 ? 'text-emerald-700' : cust.totalOwed < 0 ? 'text-rose-700' : 'text-slate-500'
                    }`}>
                      ₹{Math.abs(cust.totalOwed)}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">
                      {cust.totalOwed > 0 ? 'You Get' : cust.totalOwed < 0 ? 'You Give' : 'Settled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Ledger Logs */}
        {selectedCustomer && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            
            {/* Customer Profile Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedCustomer.phone} {selectedCustomer.notes && `• ${selectedCustomer.notes}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEntryType('gave_credit'); setIsEntryModalOpen(true); }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>Gave Credit (Diya ₹)</span>
                </button>

                <button
                  onClick={() => { setEntryType('got_payment'); setIsEntryModalOpen(true); }}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <Minus className="w-4 h-4 text-emerald-600" />
                  <span>Got Payment (Mila ₹)</span>
                </button>
              </div>
            </div>

            {/* Total Balance Card for Customer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Net Outstanding Balance</p>
                <p className={`text-2xl font-black mt-0.5 ${
                  selectedCustomer.totalOwed > 0 ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  ₹{selectedCustomer.totalOwed}
                </p>
              </div>

              {selectedCustomer.totalOwed > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReminder}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs text-indigo-900 border border-slate-300 font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>WhatsApp Reminder</span>
                  </button>
                </div>
              )}
            </div>

            {copiedMsg && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>WhatsApp Payment Reminder text copied to clipboard!</span>
              </div>
            )}

            {/* Transaction Ledger Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Transaction Log History</h4>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {customerTransactions.map(tx => {
                  const isCredit = tx.type === 'gave_credit';
                  return (
                    <div key={tx.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{tx.note}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(tx.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-right font-mono font-bold text-sm">
                        <span className={isCredit ? 'text-rose-700' : 'text-emerald-700'}>
                          {isCredit ? `-₹${tx.amount}` : `+₹${tx.amount}`}
                        </span>
                        <p className="text-[9px] uppercase text-slate-500 font-sans font-medium">
                          {isCredit ? 'Gave Credit' : 'Got Cash'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {customerTransactions.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No ledger transactions recorded for this customer yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Customer</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Verma Uncle (Flat 302)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Address</label>
                <input
                  type="text"
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g. Flat 302, promises to pay on 1st"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-sm"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {entryType === 'gave_credit' ? 'Gave Credit to Customer' : 'Got Payment from Customer'}
              </h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-mono font-bold text-emerald-700 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Note / Item Details</label>
                <input
                  type="text"
                  value={entryNote}
                  onChange={(e) => setEntryNote(e.target.value)}
                  placeholder="e.g. Took 2 Atta & 1 Oil"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-sm ${
                    entryType === 'gave_credit' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
