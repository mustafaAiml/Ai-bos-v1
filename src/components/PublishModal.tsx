import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Globe, 
  Download, 
  Check, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Layers,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  onClearAllData: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  onClearAllData
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [activeTab, setActiveTab] = useState<'playstore' | 'web' | 'cleardata'>('playstore');

  if (!isOpen) return null;

  const currentUrl = appUrl || window.location.origin;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyManifest = () => {
    const manifestCode = `{
  "short_name": "AI-BOS",
  "name": "AI-BOS - Smart Business Operating System",
  "start_url": "/",
  "background_color": "#f8fafc",
  "theme_color": "#059669",
  "display": "standalone",
  "orientation": "portrait"
}`;
    navigator.clipboard.writeText(manifestCode);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Publish App to Play Store & Web
              </h3>
              <p className="text-xs text-slate-500">
                Full guide & tools to put your AI-BOS app online on Chrome and Google Play Store.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('playstore')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'playstore'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play Store (Android APK)</span>
          </button>

          <button
            onClick={() => setActiveTab('web')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'web'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Chrome Web & PWA</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'deployment'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Netlify & Railway Deployment</span>
          </button>

          <button
            onClick={() => setActiveTab('cleardata')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
              activeTab === 'cleardata'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Example Data</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          
          {/* TAB 1: PLAY STORE */}
          {activeTab === 'playstore' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Ready for Google Play Store (TWA / APK / AAB)</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  This application is fully PWA-configured with <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">manifest.json</code> and offline <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">sw.js</code> service worker. You can build an Android App Bundle (.aab) in under 3 minutes.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Option A: One-Click PWABuilder (Recommended for Play Store)
                </h4>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed text-slate-600">
                  <li>Copy your live application URL below:</li>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-800"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <li>Open <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline flex-inline items-center gap-1">PWABuilder.com <ExternalLink className="w-3 h-3 inline" /></a> in your browser.</li>
                  <li>Paste the copied URL and click <strong>"Start"</strong>.</li>
                  <li>Click <strong>"Generate Package"</strong> under Android and download your signed Google Play Store APK & AAB package!</li>
                </ol>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Option B: CLI Bubblewrap (Developer Method)
                </h4>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
                  <p className="text-slate-400"># Install Google's official Bubblewrap CLI</p>
                  <p className="text-emerald-400">npm i -g @bubblewrap/cli</p>
                  <p className="text-slate-400"># Initialize Android project from your web app URL</p>
                  <p className="text-emerald-400">bubblewrap init --manifest={currentUrl}/manifest.json</p>
                  <p className="text-slate-400"># Build signed Android App Bundle (.aab)</p>
                  <p className="text-emerald-400">bubblewrap build</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHROME WEB */}
          {activeTab === 'web' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-900">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span>Chrome Online Website & PWA Installation</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  Your web app is hosted live and ready for any phone, desktop, or tablet browser.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">How users install on Chrome & Android / iOS:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-bold text-slate-900">💻 Chrome Desktop</p>
                    <p className="text-slate-600 leading-relaxed">
                      Click the <strong>Install App (⬇️)</strong> icon in the address bar to install AI-BOS as a native desktop software.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-bold text-slate-900">📱 Chrome Android & Safari iOS</p>
                    <p className="text-slate-600 leading-relaxed">
                      Tap menu <strong>(⋮)</strong> and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Deploying to Custom Domain (Cloud Run / Vercel):</h4>
                <p className="text-slate-600 leading-relaxed">
                  Run <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">npm run build</code> to compile frontend static assets and server code. Host on Cloud Run, Vercel, or Netlify with custom domain pointing to port 3000.
                </p>
              </div>
            </div>
          )}

          {/* TAB: DEPLOYMENT (NETLIFY + RAILWAY) */}
          {activeTab === 'deployment' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>Netlify Frontend & Railway Backend Instructions</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  Your project contains pre-configured <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">netlify.toml</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">Procfile</code>, and <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">railway.json</code> files.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">1. Railway Backend Deployment:</h4>
                <p className="text-slate-600 leading-relaxed">
                  Deploy the Python FastAPI backend on <strong>Railway.app</strong> using the included <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Procfile</code> (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">uvicorn server.main:app --host 0.0.0.0 --port $PORT</code>).
                  Once deployed, Railway gives you a URL like <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">https://your-app.up.railway.app</code>.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">2. Connecting Netlify Frontend to Railway:</h4>
                <p className="text-slate-600 leading-relaxed">
                  In <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">netlify.toml</code>, update the redirect target from the placeholder to your Railway URL:
                </p>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px]">
                  <p className="text-slate-400"># netlify.toml</p>
                  <p className="text-emerald-400">[[redirects]]</p>
                  <p className="text-slate-200">  from = "/api/*"</p>
                  <p className="text-amber-300">  to = "https://YOUR-RAILWAY-APP.up.railway.app/api/:splat"</p>
                  <p className="text-slate-200">  status = 200</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                <p className="font-bold">⚡ Offline & Fallback Engine Active</p>
                <p className="text-slate-700 leading-relaxed">
                  Note: Even if backend APIs are disconnected or loading on Netlify, the client-side fallback AI engine executes all shop searches, voice parsing, and inventory stock logic seamlessly in the browser!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CLEAR EXAMPLE DATA */}
          {activeTab === 'cleardata' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Remove Example Shop & Sample Data</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  As requested, you can clear out all mock store examples (sample inventory items, past demo sales, and sample customers) to start fresh with your real business shop details.
                </p>
              </div>

              <div className="p-5 border border-slate-200 bg-slate-50 rounded-xl space-y-3 text-center">
                <p className="font-bold text-slate-900 text-sm">
                  Ready to set up your real shop?
                </p>
                <p className="text-slate-600 max-w-md mx-auto">
                  Clicking below will clear example inventory stock and demo logs so you can enter your own store name, scan real bills, and add real items.
                </p>
                
                <button
                  onClick={() => {
                    onClearAllData();
                    onClose();
                  }}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-white shadow-sm transition inline-flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Example Data & Start Fresh</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500">
          <span className="text-[11px]">Powered by <strong>zyroX Gemini 2.5 Flash Engine</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 text-xs rounded-xl transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
