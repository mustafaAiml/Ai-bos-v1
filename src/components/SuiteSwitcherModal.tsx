import React from 'react';
import { 
  X, 
  Store, 
  UserCheck, 
  Building2, 
  Lock, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WorkspaceType } from '../types';

interface SuiteSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSuite: WorkspaceType;
  onSelectSuite: (suite: WorkspaceType) => void;
}

export const SuiteSwitcherModal: React.FC<SuiteSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeSuite,
  onSelectSuite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none">
                AI BOS Workspace Selector
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Intelligent Business Operating System. Switch between your enterprise modules.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Suite Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Commerce Suite (ACTIVE) */}
          <div 
            onClick={() => {
              onSelectSuite('commerce');
              onClose();
            }}
            className={`relative rounded-xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
              activeSuite === 'commerce'
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {activeSuite === 'commerce' && (
              <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full flex items-center gap-1 shadow-xs">
                <Check className="w-3 h-3 text-white" /> ACTIVE
              </span>
            )}
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Commerce Suite</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart POS, Inventory Intelligence, Voice Orders, AI Bill Scanner, Udhaar Ledger & Business Analytics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-700 font-bold">
              <span>Enterprise Active</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Finance Suite (LOCKED) */}
          <div className="relative rounded-xl p-5 border border-slate-200 bg-slate-50/80 opacity-80 flex flex-col justify-between">
            <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-700" /> Locked
            </span>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 border border-purple-200 text-purple-700 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">Finance Suite 🔒</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Corporate accounting, GST tax compliance, bank reconciliation & AI balance sheet forecasting.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Financial Management</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Personal Space (LOCKED) */}
          <div className="relative rounded-xl p-5 border border-slate-200 bg-slate-50/80 opacity-80 flex flex-col justify-between">
            <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-700" /> Locked
            </span>
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">Personal Space 🔒</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personal task management, goal tracking, habits, notes & personal productivity assistant.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Personal Operating Space</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          ✨ <strong className="text-emerald-700 font-bold">AI BOS Intelligence Engine</strong> • Commercial Enterprise Architecture.
        </div>

      </div>
    </div>
  );
};
