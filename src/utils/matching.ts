import fuzzysort from 'fuzzysort';
import { InventoryItem } from '../types';

export interface MatchResult {
  matchScore: number; // 0 to 100
  item: InventoryItem | null;
  status: 'exact' | 'ambiguous' | 'not_found';
  candidates: { item: InventoryItem; score: number }[];
}

export function devanagariToHinglish(text: string): string {
  if (!text) return '';
  let str = text;
  const map: Record<string, string> = {
    'आशीर्वाद': 'aashirvaad',
    'अशिर्वाद': 'aashirvaad',
    'आशिरवाद': 'aashirvaad',
    'आटा': 'atta',
    'अत्ता': 'atta',
    'नमक': 'namak',
    'साल्ट': 'salt',
    'तेल': 'oil',
    'चावल': 'chawal',
    'राइस': 'rice',
    'दाल': 'dal',
    'चीनी': 'sugar',
    'शक्कर': 'sugar',
    'दूध': 'milk',
    'साबुन': 'soap',
    'चाय': 'chai',
    'बिस्किट': 'biscuit',
    'पैकेट': 'packet',
    'पैकेटों': 'packet',
    'बेचा': 'sold',
    'सेल': 'sell',
    'बिका': 'sold',
    'खरीदा': 'bought',
    'लाया': 'bought',
    'बचा': 'remaining',
    'स्टॉक': 'stock',
    'दो': '2',
    'एक': '1',
    'तीन': '3',
    'चार': '4',
    'पांच': '5',
    'दस': '10',
    'बीस': '20',
  };

  for (const [dev, eng] of Object.entries(map)) {
    str = str.replace(new RegExp(dev, 'g'), eng);
  }
  // Remove any leftover Devanagari unicode characters
  str = str.replace(/[\u0900-\u097F]/g, ' ');
  return str.trim();
}

const NOISE_WORDS = new Set([
  'aaj', 'kal', 'becha', 'bech', 'sold', 'sell', 'sale', 'khareeda', 'bought', 'aaya',
  'lia', 'manga', 'se', 'ko', 'ka', 'ke', 'ki', 'do', 'ek', 'teen', 'chaar', 'paanch',
  'packet', 'packets', 'pcs', 'pieces', 'kg', 'kilo', 'litre', 'liter', 'bottle',
  'rs', 'rupaye', 'rupees', 'bacha', 'bhi', 'hai', 'hua', 'hue', 'kaun', 'kitna',
  'gaya', 'gaye', 'diya', 'diye', 'de', 'remaining', 'stock', 'item'
]);

export function cleanItemName(rawName: string): string {
  if (!rawName) return '';
  // Convert Devanagari to Hinglish first
  let text = devanagariToHinglish(rawName).toLowerCase();
  text = text.replace(/[^a-z0-9\s]/gi, ' ');
  const tokens = text.split(/\s+/).filter(w => w.length > 0 && !NOISE_WORDS.has(w) && !/^\d+$/.test(w));
  if (tokens.length > 0) {
    return tokens.join(' ');
  }
  const rawTokens = rawName.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 0 && !NOISE_WORDS.has(w));
  return rawTokens.length > 0 ? rawTokens.join(' ') : rawName.trim();
}

export function matchInventoryItem(
  query: string,
  inventory: InventoryItem[]
): MatchResult {
  if (!query || !query.trim() || inventory.length === 0) {
    return { matchScore: 0, item: null, status: 'not_found', candidates: [] };
  }

  const cleanedQuery = cleanItemName(query);
  const rawQueryLower = devanagariToHinglish(query).toLowerCase().trim();

  // 1. Direct Token or Alias/Name Match (Score = 100)
  for (const item of inventory) {
    const itemNameLower = item.name.toLowerCase();
    const cleanItemNameLower = cleanItemName(item.name);

    // Exact string match or substring match on cleaned query
    if (
      itemNameLower.includes(cleanedQuery) ||
      cleanedQuery.includes(cleanItemNameLower) ||
      itemNameLower.includes(rawQueryLower) ||
      rawQueryLower.includes(itemNameLower)
    ) {
      return { matchScore: 100, item, status: 'exact', candidates: [{ item, score: 100 }] };
    }

    // Check alias list
    for (const alias of item.aliases || []) {
      const aliasLower = alias.toLowerCase();
      if (
        aliasLower.includes(cleanedQuery) ||
        cleanedQuery.includes(aliasLower) ||
        rawQueryLower.includes(aliasLower)
      ) {
        return { matchScore: 100, item, status: 'exact', candidates: [{ item, score: 100 }] };
      }
    }
  }

  // 2. Token Overlap Matching
  const queryTokens = cleanedQuery.split(/\s+/).filter(t => t.length > 2);
  if (queryTokens.length > 0) {
    for (const item of inventory) {
      const itemTokens = `${item.name} ${(item.aliases || []).join(' ')}`.toLowerCase().split(/\s+/);
      const matches = queryTokens.filter(qToken => itemTokens.some(iToken => iToken.includes(qToken) || qToken.includes(iToken)));
      if (matches.length > 0) {
        const overlapRatio = matches.length / queryTokens.length;
        if (overlapRatio >= 0.5) {
          return {
            matchScore: 92,
            item,
            status: 'exact',
            candidates: [{ item, score: 92 }]
          };
        }
      }
    }
  }

  // 3. Fuzzysort fallback
  const preparedList = inventory.map(item => ({
    item,
    searchString: `${item.name} ${(item.aliases || []).join(' ')}`
  }));

  const results = fuzzysort.go(cleanedQuery || rawQueryLower, preparedList, {
    key: 'searchString',
    limit: 5,
    threshold: -10000,
  });

  if (results.length === 0) {
    return { matchScore: 0, item: null, status: 'not_found', candidates: [] };
  }

  const scoredCandidates = results.map(res => {
    let normalizedScore = 100 + res.score;
    if (normalizedScore < 0) normalizedScore = Math.max(0, 100 + (res.score / 10));
    normalizedScore = Math.min(100, Math.round(normalizedScore));

    const nameLower = res.obj.item.name.toLowerCase();
    const aliasMatch = (res.obj.item.aliases || []).some(a => a.toLowerCase().includes(cleanedQuery) || cleanedQuery.includes(a.toLowerCase()));
    if (nameLower.includes(cleanedQuery) || aliasMatch) {
      normalizedScore = Math.max(normalizedScore, 88);
    }

    return {
      item: res.obj.item,
      score: normalizedScore
    };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  const best = scoredCandidates[0];

  if (best.score >= 70) {
    return {
      matchScore: best.score,
      item: best.item,
      status: 'exact',
      candidates: scoredCandidates
    };
  } else if (best.score >= 40) {
    return {
      matchScore: best.score,
      item: best.item,
      status: 'ambiguous',
      candidates: scoredCandidates.filter(c => c.score >= 35)
    };
  } else {
    return {
      matchScore: best.score,
      item: null,
      status: 'not_found',
      candidates: scoredCandidates
    };
  }
}

