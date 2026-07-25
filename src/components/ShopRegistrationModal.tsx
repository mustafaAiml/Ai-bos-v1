import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Search, 
  Navigation, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink,
  HelpCircle,
  Shirt,
  ShoppingBag,
  AlertTriangle,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { ShopProfile } from '../types';
import { searchShopsAPI } from '../services/aiService';

interface ShopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShop: ShopProfile;
  onUpdateShop: (shop: ShopProfile, recommendedInventory?: any[]) => void;
}

export const ShopRegistrationModal: React.FC<ShopRegistrationModalProps> = ({
  isOpen,
  onClose,
  currentShop,
  onUpdateShop,
}) => {
  const [mapsUrl, setMapsUrl] = useState(currentShop.mapsUrl || '');
  const [shopQuery, setShopQuery] = useState(currentShop.name || '');
  const [cityName, setCityName] = useState('Mumbai');
  const [areaName, setAreaName] = useState('Market Area');
  const [pincode, setPincode] = useState(currentShop.pincode || '');
  const [ownerName, setOwnerName] = useState(currentShop.ownerName || 'Store Owner');
  const [phone, setPhone] = useState(currentShop.phone || '+91 98000 00000');
  
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUrlValid, setIsUrlValid] = useState<boolean>(false);

  const [isSearching, setIsSearching] = useState(false);
  const [matchedShop, setMatchedShop] = useState<any | null>(
    currentShop.name && currentShop.name !== 'My Store' && currentShop.name !== 'Gupta Kirana & Super Mart'
      ? {
          name: currentShop.name,
          address: currentShop.address,
          city: 'Mumbai',
          area: 'Market Area',
          pincode: currentShop.pincode,
          maps_url: currentShop.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentShop.name)}`,
          category: currentShop.category || 'Clothing & Garments',
          business_complexity: currentShop.businessComplexity || 'simple_apparel',
          complexity_reasoning: 'Customized suite according to store type.',
          lat: currentShop.latitude || 19.0760,
          lng: currentShop.longitude || 72.8777
        }
      : null
  );

  const [isLocating, setIsLocating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Validate Google Maps URL format
  const validateMapsUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError(null);
      setIsUrlValid(false);
      return false;
    }

    const googleMapsPattern = /^(https?:\/\/)?(www\.)?(maps\.app\.goo\.gl|goo\.gl\/maps|google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)\/.+/i;

    if (googleMapsPattern.test(trimmed)) {
      setUrlError(null);
      setIsUrlValid(true);
      return true;
    } else {
      setUrlError('Please enter a valid Google Maps link format (e.g., https://maps.app.goo.gl/8djLufq6inNE7fdY7)');
      setIsUrlValid(false);
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMapsUrl(value);
    validateMapsUrl(value);
  };

  if (!isOpen) return null;

  const handleSearchMaps = async (overrideInput?: string) => {
    setIsSearching(true);
    setMatchedShop(null);
    try {
      const results = await searchShopsAPI({
        shop_name: shopQuery,
        city: cityName,
        area: areaName,
        pincode: pincode,
        query: overrideInput || mapsUrl || shopQuery
      });
      if (results && results.length > 0) {
        setMatchedShop(results[0]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(4));
        const longitude = Number(pos.coords.longitude.toFixed(4));
        const gpsMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        setMatchedShop({
          name: shopQuery || 'My GPS Verified Store',
          address: `GPS Linked Coordinates: ${latitude}° N, ${longitude}° E`,
          pincode: pincode || '400001',
          maps_url: gpsMapsUrl,
          category: 'Retail Store',
          business_complexity: 'simple_apparel',
          complexity_reasoning: 'GPS Linked store location.',
          lat: latitude,
          lng: longitude
        });
        setIsLocating(false);
        setSuccessMsg('GPS coordinates captured!');
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      }
    );
  };

  const handleConfirmShop = () => {
    const finalShopName = shopQuery.trim() || currentShop.name || 'My Kirana Store';
    const finalAddress = (matchedShop?.address || currentShop.address || `${areaName}, ${cityName}`).trim();
    const finalPincode = pincode.trim() || currentShop.pincode || '400001';

    const updatedProfile: ShopProfile = {
      ...currentShop,
      name: finalShopName,
      address: finalAddress,
      pincode: finalPincode,
      latitude: matchedShop?.lat || currentShop.latitude || 19.0760,
      longitude: matchedShop?.lng || currentShop.longitude || 72.8777,
      category: matchedShop?.category || currentShop.category || 'Grocery & Staples',
      mapsUrl: matchedShop?.maps_url || mapsUrl || currentShop.mapsUrl,
      businessComplexity: matchedShop?.business_complexity || currentShop.businessComplexity || 'fmcg_kirana',
      ownerName: ownerName.trim() || currentShop.ownerName || 'Store Owner',
      phone: phone.trim() || currentShop.phone || '+91 9876543210'
    };

    onUpdateShop(updatedProfile, matchedShop?.recommended_inventory);
    setSuccessMsg(`Saved details for ${finalShopName}!`);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Google Maps Shop Search & Verification
              </h3>
              <p className="text-xs text-slate-500">
                Provide your Google Maps Link to auto-locate shop & configure commerce suite.
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

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* DEDICATED GOOGLE MAPS URL FIELD WITH VALIDATION */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Google Maps Shop URL (Dedicated Field)</span>
              </label>
              {isUrlValid && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Valid Format
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="url"
                value={mapsUrl}
                onChange={handleUrlChange}
                placeholder="https://maps.app.goo.gl/8djLufq6inNE7fdY7"
                className={`w-full pl-3 pr-24 py-2.5 bg-white border rounded-xl text-xs font-mono focus:outline-none transition ${
                  urlError 
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20 text-red-900' 
                    : isUrlValid 
                    ? 'border-emerald-500 focus:border-emerald-600 text-slate-900' 
                    : 'border-slate-300 focus:border-emerald-600 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => handleSearchMaps(mapsUrl)}
                disabled={isSearching || (!isUrlValid && mapsUrl.trim().length > 0)}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
              >
                <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>{isSearching ? 'Parsing...' : 'Verify Link'}</span>
              </button>
            </div>

            {urlError && (
              <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-normal">
              Supported Formats: <code className="text-emerald-700 font-semibold">maps.app.goo.gl/...</code>, <code className="text-emerald-700 font-semibold">goo.gl/maps/...</code>, or <code className="text-emerald-700 font-semibold">google.com/maps/...</code>
            </p>

            {/* DYNAMIC GOOGLE MAP IFRAME PREVIEW PLACEHOLDER */}
            {(isUrlValid || (mapsUrl && mapsUrl.length > 10)) && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 animate-fade-in space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Google Map Location Preview</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                    Dynamic Map View
                  </span>
                </div>
                
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 group">
                  <iframe
                    title="Google Maps Location Preview"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(matchedShop ? `${matchedShop.name}, ${matchedShop.address}` : mapsUrl)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full rounded-xl"
                  ></iframe>
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 text-white backdrop-blur-xs text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 pointer-events-none">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Google Maps Visual Confirmation</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* OR SEARCH BY SHOP DETAILS (Shop Name, Area, City, Pincode) */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Search Shop Location (Name, Area, City)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Backend Location AI Search</span>
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Shop Name</label>
              <input
                type="text"
                value={shopQuery}
                onChange={(e) => setShopQuery(e.target.value)}
                placeholder="e.g. M.A. Collection / Gupta Kirana Store"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Area / Colony / Market</label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Kurla West / Market Yard"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">City / Town</label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Mumbai / Delhi / Jaipur"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400070"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 text-slate-900"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSearchMaps()}
              disabled={isSearching}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching Location on Google Maps...' : 'Find Shop on Google Maps'}</span>
            </button>
          </div>

          {/* VERIFICATION CARD: "Kya yahi hai aapki shop?" */}
          {matchedShop ? (
            <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-3 animate-fade-in shadow-xs">
              
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-700 animate-pulse" />
                  <span className="font-extrabold text-sm text-emerald-950">
                    Kya yahi hai aapki shop?
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                  Google Maps Verified
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-base text-slate-900">
                    {matchedShop.name}
                  </h4>
                  <a
                    href={matchedShop.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <span>Google Maps Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-700 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{matchedShop.address} (Pincode: {matchedShop.pincode})</span>
                </p>

                <div className="pt-2 border-t border-emerald-200/80 mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    {matchedShop.business_complexity === 'simple_apparel' ? (
                      <Shirt className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="font-bold text-xs text-slate-900">
                      Category: {matchedShop.category}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-[11px] text-slate-700 space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Adaptive AI Suite Config:</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {matchedShop.complexity_reasoning}
                    </p>
                  </div>
                </div>

              </div>

              {/* Confirmation Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleConfirmShop}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Haan, Yahi Hai Meri Shop - Confirm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatchedShop(null)}
                  className="py-3 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  Dusri Link / Search
                </button>
              </div>

            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Paste your Google Maps URL above and click <strong>"Verify Link"</strong> to verify your shop.
              </p>
              <button
                type="button"
                onClick={handleUseGeolocation}
                disabled={isLocating}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Or Use Current Device GPS'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500">
          <span className="text-[11px]">zyroX Maps & Gemini AI Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

