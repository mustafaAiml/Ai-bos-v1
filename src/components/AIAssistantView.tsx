import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  Package, 
  Lightbulb, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { InventoryItem, Transaction, ShopProfile, UdhaarCustomer } from '../types';

interface AIAssistantViewProps {
  shop: ShopProfile;
  inventory: InventoryItem[];
  transactions: Transaction[];
  customers: UdhaarCustomer[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: string[];
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  shop,
  inventory,
  transactions,
  customers,
}) => {
  const salesTxs = transactions.filter(t => t.type === 'sale');
  const todayRevenue = salesTxs.reduce((sum, t) => sum + t.totalAmount, 0);
  const todayProfit = salesTxs.reduce((sum, t) => sum + (t.netProfit || 0), 0);
  const lowStockCount = inventory.filter(i => (i.remainingStock ?? i.stockQuantity) <= (i.lowStockThreshold || 5)).length;

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI BOS Business Operating System Assistant for ${shop.name || 'your store'}. I am continuously analyzing your sales revenue (₹${todayRevenue.toFixed(2)} today), stock levels (${inventory.length} items tracked), and Udhaar credit ledgers in real time. What would you like to know or optimize today?`,
      suggestedActions: ["Show Low Stock Items", "Analyze Profit Margins", "Check Udhaar Ledger Summary"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            shop,
            inventory,
            transactions,
            customers
          }
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply || "I have analyzed your request.",
        suggestedActions: data.suggested_actions || ["Check Inventory", "Daily Profit Report"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Today's sales revenue stands at ₹${todayRevenue.toFixed(2)} with net profit of ₹${todayProfit.toFixed(2)}. You have ${lowStockCount} items requiring low stock reorders.`,
          suggestedActions: ["View Low Stock", "Check Udhaar Ledger"],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px] animate-fade-in">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>AI BOS Generative Business Assistant</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                Gemini 2.5 Flash
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Real-time conversational intelligence for {shop.name || 'Store'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Quick Business Context Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs overflow-x-auto gap-2">
        <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
          <span className="text-emerald-700 font-extrabold">Today's Revenue:</span>
          <span>₹{todayRevenue.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
          <span className="text-emerald-700 font-extrabold">Today's Profit:</span>
          <span>₹{todayProfit.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
          <span className="text-amber-700 font-extrabold">Low Stock Alerts:</span>
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold">{lowStockCount}</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You ({shop.ownerName || 'Owner'})</span>
                  <User className="w-3 h-3 text-slate-500" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI BOS Consultant</span>
                </>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none font-normal'
              }`}
            >
              {msg.content}
            </div>

            {/* Suggested Action Chips */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 max-w-xl">
                {msg.suggestedActions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(act)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-400 transition flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{act}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 w-max animate-pulse">
            <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>AI BOS is analyzing store database and calculating response...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask AI BOS e.g., 'How can I increase profit margins?' or 'Which items to reorder?'"
            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-900 transition"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
