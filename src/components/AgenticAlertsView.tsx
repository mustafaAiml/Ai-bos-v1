import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  ShoppingBag, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { InventoryItem, Transaction, UdhaarCustomer } from '../types';

interface AgenticAlertsViewProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
  customers: UdhaarCustomer[];
}

interface AgentAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommended_action: string;
  action_type: string;
  action_payload: any;
  created_at: string;
}

export const AgenticAlertsView: React.FC<AgenticAlertsViewProps> = ({
  inventory,
  transactions,
  customers,
}) => {
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const scanAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/scan-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory, transactions, customers })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Agent scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanAlerts();
  }, [inventory, transactions, customers]);

  const handleExecuteAction = async (alert: AgentAlert) => {
    setExecutingId(alert.id);
    setActionSuccessMsg(null);
    try {
      const res = await fetch('/api/agents/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alert.id,
          action_type: alert.action_type,
          action_payload: alert.action_payload
        })
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccessMsg(`✅ ${data.message}`);
        // Remove executed alert
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error("Action execution error:", err);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>Agentic AI Autonomous Workflow Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                Active Monitoring
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Autonomous risk detection & 1-click executable agent workflows
            </p>
          </div>
        </div>

        <button
          onClick={scanAlerts}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning...' : 'Rescan Alerts'}</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">No Critical Business Risks Detected</p>
            <p className="text-[11px] text-slate-500">All stock levels, credit balances, and profit margins are performing optimally.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition space-y-2 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : alert.severity === 'high'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
                  <h4 className="font-extrabold text-sm">{alert.title}</h4>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                    alert.severity === 'critical'
                      ? 'bg-rose-200 text-rose-900'
                      : alert.severity === 'high'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {alert.description}
              </p>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{alert.recommended_action}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteAction(alert)}
                  disabled={executingId === alert.id}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {executingId === alert.id ? (
                    <span className="animate-pulse">Executing...</span>
                  ) : (
                    <>
                      <span>1-Click Execute</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
