import React from 'react';
import { 
  Sparkles, 
  Store, 
  Bot, 
  BarChart3, 
  ShieldCheck, 
  MapPin, 
  Mic, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface OnboardingViewProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              AI BOS <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Commercial Suite</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Artificial Intelligence Business Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('signin')}
            className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold text-slate-950 text-sm shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <span>Register Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Commercial Edition • Powered by Python ML & Gemini 2.5 Flash</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            The Complete AI Business Operating System for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Retail & Kirana</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Automate voice order billing, wholesale invoice OCR scanning, real-time inventory intelligence, Udhaar credit ledgers, and autonomous agent workflows.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-3"
            >
              <span>Setup Business Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpenAuth('signin')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition flex items-center justify-center gap-2"
            >
              <span>Sign In to Existing Store</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Voice-Powered POS Billing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Speak naturally in Hindi, Hinglish, or English ("Aaj 2 kg gehu 80 me becha") to record transactions instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">Wholesale Bill OCR Scanner</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload photos of paper purchase invoices. AI extracts line-items, cost rates, and auto-updates stock inventory.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">3-Layer AI Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generative chat assistant, autonomous agent alerts with 1-click reorders, and predictive demand ML forecasting.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10">
        <p>© 2026 AI BOS Commercial Operating System. All Rights Reserved.</p>
        <p>Verified Secure Infrastructure • Powered by Google Cloud & Python 3.10 Engine</p>
      </footer>
    </div>
  );
};
