import React from 'react';
import { 
  Building2, 
  Mic, 
  ScanLine, 
  Store, 
  User, 
  Sparkles, 
  Layers, 
  LogOut,
  MapPin,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { ShopProfile, UserAuth, WorkspaceType } from '../types';

interface NavbarProps {
  shop: ShopProfile;
  user: UserAuth;
  activeWorkspace: WorkspaceType;
  onOpenSuiteSwitcher: () => void;
  onOpenShopModal: () => void;
  onOpenAuthModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenScanModal: () => void;
  onOpenPublishModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  shop,
  user,
  activeWorkspace,
  onOpenSuiteSwitcher,
  onOpenShopModal,
  onOpenAuthModal,
  onOpenVoiceModal,
  onOpenScanModal,
  onOpenPublishModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <div 
              onClick={onOpenSuiteSwitcher}
              className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-emerald-700 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900">
                    AI-BOS
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                    zyroX
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 rounded-md border border-amber-300 flex items-center gap-1 shadow-2xs">
                    🐍 Python 3.10 AI Core
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  One AI. Every Workspace.
                </p>
              </div>
            </div>

            {/* Workspace Selector Pill */}
            <div 
              onClick={onOpenSuiteSwitcher}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 cursor-pointer transition text-xs font-semibold text-slate-700"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Commerce Suite</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>
          </div>

          {/* Center Shop Selector */}
          <div className="flex-1 max-w-md mx-2">
            <div 
              onClick={onOpenShopModal}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 cursor-pointer transition text-xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition">
                    {shop.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-400 inline" />
                    {shop.address || 'Click to set location'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex-shrink-0 ml-1 shadow-xs">
                Change
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Publish & App Download Guide Button */}
            <button
              onClick={onOpenPublishModal}
              title="Publish to Play Store & Chrome Web"
              className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition flex items-center gap-1.5 font-bold text-xs shadow-xs"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">PlayStore & Web</span>
            </button>

            {/* Quick Voice Entry Button */}
            <button
              onClick={onOpenVoiceModal}
              title="Voice Assistant (Hindi/English NLP)"
              className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition flex items-center gap-1.5 font-bold text-xs shadow-xs"
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span className="hidden lg:inline">Speak & Sell</span>
            </button>

            {/* Quick Bill OCR Button */}
            <button
              onClick={onOpenScanModal}
              title="AI Bill Scanner (Camera OCR)"
              className="p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 transition flex items-center gap-1.5 font-bold text-xs shadow-xs"
            >
              <ScanLine className="w-4 h-4 text-cyan-600" />
              <span className="hidden lg:inline">Scan Bill</span>
            </button>

            {/* User Auth Profile */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div 
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="font-semibold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">Owner</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
