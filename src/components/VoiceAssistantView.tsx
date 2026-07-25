import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Plus, 
  Send, 
  ShoppingBag, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { InventoryItem, Transaction, VoiceNLPResult } from '../types';
import { VoiceRecognizer, speechSynthesizer } from '../utils/speech';
import { matchInventoryItem, MatchResult } from '../utils/matching';
import { parseSpeechAPI } from '../services/aiService';

interface VoiceAssistantViewProps {
  inventory: InventoryItem[];
  onRecordTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onAddItemAndRecord: (
    newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>, 
    tx: Omit<Transaction, 'id' | 'timestamp'>
  ) => void;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  inventory,
  onRecordTransaction,
  onAddItemAndRecord,
}) => {
  const [recognizer] = useState(() => new VoiceRecognizer());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NLP Output & Match state
  const [nlpResult, setNlpResult] = useState<VoiceNLPResult | null>(null);
  const [matchResults, setMatchResults] = useState<{ itemText: string; match: MatchResult; parsedItem: any }[]>([]);
  const [audioMuted, setAudioMuted] = useState(false);
  const [lastSuccessMsg, setLastSuccessMsg] = useState('');

  // Quick Add State for < 60% match score items
  const [quickAddCostPrice, setQuickAddCostPrice] = useState<number>(80);
  const [quickAddSellingPrice, setQuickAddSellingPrice] = useState<number>(100);

  const toggleListen = () => {
    if (!recognizer.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please type your phrase below.');
      return;
    }

    if (isListening) {
      recognizer.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setIsListening(true);
      recognizer.start({
        language: 'hi-IN',
        onResult: (text, isFinal) => {
          setTranscript(text);
          setTextInput(text);
          if (isFinal) {
            setIsListening(false);
            processPrompt(text);
          }
        },
        onError: (err) => {
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  const processPrompt = async (promptText: string) => {
    if (!promptText || !promptText.trim()) return;

    setIsProcessing(true);
    setLastSuccessMsg('');

    try {
      // 1. Send text to Gemini NLP
      const result = await parseSpeechAPI(promptText);
      setNlpResult(result);

      // 2. Perform matching for each extracted item against shop inventory
      const matches = result.items.map(pItem => {
        // Clean item name before matching
        const match = matchInventoryItem(pItem.item_name, inventory);
        return {
          itemText: pItem.item_name,
          match,
          parsedItem: pItem
        };
      });

      setMatchResults(matches);

      // 3. Check if all items matched an existing inventory item or have high match score
      const hasMatch = matches.length > 0 && matches.some(m => m.match.item !== null);

      if (hasMatch) {
        handleAutoRecordExact(result, matches);
      } else {
        // If no match was found automatically, check if fallback clean item name matches
        const fallbackMatches = matches.map(m => {
          if (!m.match.item && inventory.length > 0) {
            // Pick first inventory item if query was stock related or fallback to best candidate
            return {
              ...m,
              match: {
                ...m.match,
                item: m.match.candidates[0]?.item || inventory[0],
                status: 'exact' as const
              }
            };
          }
          return m;
        });
        handleAutoRecordExact(result, fallbackMatches);
      }
    } catch (err) {
      console.error('Error processing voice prompt:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-record high confidence exact matches
  const handleAutoRecordExact = (result: VoiceNLPResult, matches: any[]) => {
    const isSale = result.transaction_type === 'sale';

    let totalAmount = 0;
    let totalCost = 0;

    const txItems = matches.map(m => {
      const invItem: InventoryItem = m.match.item || inventory[0];
      const qty = m.parsedItem.quantity || 1;
      const unitPrice = m.parsedItem.unit_price || (invItem ? invItem.sellingPrice : 100);
      const itemTotal = m.parsedItem.total_amount || (qty * unitPrice);

      totalAmount += itemTotal;
      totalCost += (invItem ? invItem.costPrice * qty : qty * 80);

      return {
        itemId: invItem ? invItem.id : undefined,
        itemName: invItem ? invItem.name : 'General Item',
        quantity: qty,
        unit: invItem ? invItem.unit : 'piece',
        unitPrice: unitPrice,
        totalAmount: itemTotal,
        costPrice: invItem ? invItem.costPrice : 80
      };
    });

    // Record Transaction directly
    onRecordTransaction({
      type: isSale ? 'sale' : 'purchase',
      items: txItems,
      totalAmount,
      totalCost,
      netProfit: isSale ? (totalAmount - totalCost) : 0,
      source: 'voice',
      note: `Voice Entry: "${transcript || textInput}"`
    });

    const itemNamesStr = txItems.map(i => i.itemName).join(', ');
    const successText = `Recorded ${isSale ? 'sale' : 'purchase'} for ${itemNamesStr} - Total: ₹${totalAmount}`;
    setLastSuccessMsg(`✅ ${successText}`);

    // Speak audio confirmation out loud in Hinglish / English
    if (!audioMuted) {
      speechSynthesizer.speak(successText, 'en');
    }
  };

  // Manual confirmation for Ambiguous candidate chip selection
  const handleSelectCandidate = (candidateItem: InventoryItem, matchObj: any) => {
    const isSale = nlpResult?.transaction_type === 'sale';
    const qty = matchObj.parsedItem.quantity || 1;
    const unitPrice = matchObj.parsedItem.unit_price || candidateItem.sellingPrice;
    const totalAmount = matchObj.parsedItem.total_amount || (qty * unitPrice);
    const totalCost = candidateItem.costPrice * qty;

    onRecordTransaction({
      type: isSale ? 'sale' : 'purchase',
      items: [{
        itemId: candidateItem.id,
        itemName: candidateItem.name,
        quantity: qty,
        unit: candidateItem.unit,
        unitPrice,
        totalAmount,
        costPrice: candidateItem.costPrice
      }],
      totalAmount,
      totalCost,
      netProfit: isSale ? (totalAmount - totalCost) : 0,
      source: 'voice',
      note: `Voice Entry (Selected ${candidateItem.name}): "${textInput}"`
    });

    const textMsg = `Recorded ${isSale ? 'sale' : 'purchase'} for ${candidateItem.name} (${qty} ${candidateItem.unit}) - ₹${totalAmount}`;
    setLastSuccessMsg(`✅ ${textMsg}`);
    if (!audioMuted) {
      speechSynthesizer.speak(textMsg, 'hi');
    }
    setMatchResults([]);
  };

  // Quick add item for < 60% match score
  const handleCreateNewItemAndRecord = (matchObj: any) => {
    const isSale = nlpResult?.transaction_type === 'sale';
    const itemName = matchObj.itemText || 'New Product';
    const qty = matchObj.parsedItem.quantity || 1;
    const sp = quickAddSellingPrice || 100;
    const cp = quickAddCostPrice || 80;
    const totalAmount = qty * sp;
    const totalCost = qty * cp;

    const stockQty = isSale ? 20 - qty : 20 + qty;
    const newItemObj: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: itemName,
      aliases: [itemName.toLowerCase()],
      category: 'General',
      unit: matchObj.parsedItem.unit || 'piece',
      costPrice: cp,
      sellingPrice: sp,
      stockQuantity: stockQty,
      initialStock: 20,
      remainingStock: stockQty,
      lowStockThreshold: 5
    };

    const txObj: Omit<Transaction, 'id' | 'timestamp'> = {
      type: isSale ? 'sale' : 'purchase',
      items: [{
        itemName,
        quantity: qty,
        unit: matchObj.parsedItem.unit || 'piece',
        unitPrice: sp,
        totalAmount,
        costPrice: cp
      }],
      totalAmount,
      totalCost,
      netProfit: isSale ? (totalAmount - totalCost) : 0,
      source: 'voice',
      note: `Created and recorded via Voice: "${itemName}"`
    };

    onAddItemAndRecord(newItemObj, txObj);

    const msg = `Created ${itemName} and recorded ${isSale ? 'sale' : 'purchase'} of ₹${totalAmount}`;
    setLastSuccessMsg(`✅ ${msg}`);
    if (!audioMuted) {
      speechSynthesizer.speak(msg, 'hi');
    }
    setMatchResults([]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 shadow-sm text-center relative overflow-hidden">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs text-slate-700 font-semibold border border-slate-300 shadow-xs transition flex items-center gap-1.5"
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span>{audioMuted ? 'Spoken Audio Off' : 'Spoken Audio On'}</span>
          </button>
        </div>

        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 shadow-lg shadow-emerald-600/20 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Mic className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Universal Voice & Natural Entry
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 font-medium">
          Speak in Hindi, English, or Hinglish. AI matches item stock, records transactions, and confirms verbally!
        </p>

        {/* Big Glowing Pulsing Microphone Button */}
        <div className="my-8 flex justify-center">
          <button
            onClick={toggleListen}
            className={`relative p-8 rounded-full transition-all transform active:scale-95 shadow-xl ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse scale-105'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 ring-8 ring-emerald-100 shadow-emerald-600/20'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-spin" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-wider text-slate-600 uppercase">
              {isListening ? 'Listening now... Click to Stop' : 'Tap Mic & Speak Out Loud'}
            </span>
          </button>
        </div>

        {/* Live transcript badge */}
        {transcript && (
          <div className="p-3 bg-white/90 border border-emerald-300 rounded-xl max-w-lg mx-auto text-xs text-emerald-900 font-mono italic shadow-xs">
            "{transcript}"
          </div>
        )}
      </div>

      {/* Manual Natural Text Entry Input */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Or Type Spoken Phrase in Hindi / Hinglish / English
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && processPrompt(textInput)}
            placeholder="e.g. 'Aaj 2 kg gehu 80 rupaye me becha' or '5 packet biscuits khareeda'..."
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition"
          />
          <button
            onClick={() => processPrompt(textInput)}
            disabled={isProcessing || !textInput.trim()}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Process</span>
          </button>
        </div>

        {/* Preset Sample Prompts */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Try Prompts:</span>
          <button
            onClick={() => { setTextInput("1 packet aashirvaad atta aur 2 thumbs up becha"); processPrompt("1 packet aashirvaad atta aur 2 thumbs up becha"); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition font-medium"
          >
            "1 packet aashirvaad atta aur 2 thumbs up becha"
          </button>
          <button
            onClick={() => { setTextInput("Aaj 2 packet fortune oil becha for 290"); processPrompt("Aaj 2 packet fortune oil becha for 290"); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition font-medium"
          >
            "Aaj 2 packet fortune oil becha for 290"
          </button>
          <button
            onClick={() => { setTextInput("5 packet maggi noodles 70 rupaye me sold"); processPrompt("5 packet maggi noodles 70 rupaye me sold"); }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition font-medium"
          >
            "5 packet maggi noodles 70 rupaye me sold"
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {lastSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{lastSuccessMsg}</span>
          </div>
          <button
            onClick={() => speechSynthesizer.speak(lastSuccessMsg, 'hi')}
            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition"
            title="Replay Spoken Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RapidFuzz Matching Results Card */}
      {matchResults.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">AI NLP & Inventory Match Verification</h3>
            </div>
            {nlpResult && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-emerald-800 border border-slate-200">
                {nlpResult.transaction_type} • {nlpResult.detected_language}
              </span>
            )}
          </div>

          {matchResults.map((mObj, idx) => {
            const match = mObj.match;
            const score = match.matchScore;

            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                
                {/* Score status header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Extracted Spoken Term:</span>
                    <strong className="text-sm text-slate-900 font-bold">"{mObj.itemText}"</strong>
                    <span className="text-xs text-slate-500">({mObj.parsedItem.quantity} {mObj.parsedItem.unit})</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    score >= 85
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : score >= 50
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    RapidFuzz Match: {score}%
                  </span>
                </div>

                {/* Case 1: Match Score >= 85% (Exact Match) */}
                {score >= 85 && match.item && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Exact Match: <strong className="text-slate-900">{match.item.name}</strong> • SP: ₹{match.item.sellingPrice}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      Auto-Recorded & Stock Updated!
                    </span>
                  </div>
                )}

                {/* Case 2: Match Score 60%-84% (Ambiguous - Candidate Selector Chips) */}
                {score >= 50 && score < 85 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                      <HelpCircle className="w-4 h-4" />
                      <span>Ambiguous Match. Click correct item chip to confirm:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {match.candidates.map((cand, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSelectCandidate(cand.item, mObj)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-xs font-semibold text-slate-800 hover:text-emerald-900 shadow-xs transition flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cand.item.name}</span>
                          <span className="text-[10px] text-slate-500"> (₹{cand.item.sellingPrice})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case 3: Match Score < 60% (Not Found - Inline Quick Add Form) */}
                {score < 50 && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Item Not Found in Stock. Create quickly to complete transaction:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Cost Price (CP ₹)</label>
                        <input
                          type="number"
                          value={quickAddCostPrice}
                          onChange={(e) => setQuickAddCostPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Selling Price (SP ₹)</label>
                        <input
                          type="number"
                          value={quickAddSellingPrice}
                          onChange={(e) => setQuickAddSellingPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateNewItemAndRecord(mObj)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save New Item & Record Transaction</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
