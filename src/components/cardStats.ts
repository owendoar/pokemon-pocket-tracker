// Collection Statistics Functions - Updated for new structure
import { PokemonCard, PokemonCardSet } from './cardData';

export interface CardSetStats {
  total: number;
  collected: number;
  missing: number;
  collectionPercent: string;
  newCardOddsSolg: number;
  newCardOddsLuna: number;
  byRarity: {
    [key: string]: {
      total: number;
      collected: number;
      percent: string;
    }
  }
}

// Calculate collection statistics for a mutable set
export const calculateStats = (cardSet: PokemonCardSet): CardSetStats => {
  const total = cardSet.getTotalCards();
  const ownedCards = cardSet.getOwnedCards();
  const collected = ownedCards.length;
  const missing = total - collected;
  const collectionPercent = total > 0 ? (collected / total) * 100 : 0;
  
  // Calculate pack odds for subsets (if they exist)
  let newCardOddsSolg = 50; // Default fallback
  let newCardOddsLuna = 50; // Default fallback
  
  // If the set has SOLG and LUNA subsets, calculate odds for each
  if (cardSet.subsets.includes('Solgaleo')) {
    newCardOddsSolg = calculateNewCardOdds(cardSet, 'Solgaleo');
  }
  if (cardSet.subsets.includes('Lunala')) {
    newCardOddsLuna = calculateNewCardOdds(cardSet, 'Lunala');
  }

  console.log(newCardOddsLuna);
  console.log(newCardOddsSolg);

  // If no specific subsets, calculate general odds
  if (!cardSet.subsets.includes('Solgaleo') && !cardSet.subsets.includes('Lunala')) {
    const overallOdds = calculateNewCardOdds(cardSet);
    newCardOddsSolg = overallOdds;
    newCardOddsLuna = overallOdds;
  }
  
  // Calculate stats by rarity using the set's rarities
  const byRarity: { [key: string]: { total: number; collected: number; percent: string } } = {};
  
  // Initialize rarity stats
  cardSet.rarities.forEach(rarity => {
    byRarity[rarity.name] = {
      total: 0,
      collected: 0,
      percent: '0'
    };
  });
  
  // Count cards by rarity
  cardSet.cards.forEach(card => {
    if (byRarity[card.rarity]) {
      byRarity[card.rarity].total += 1;
      if (card.owned) {
        byRarity[card.rarity].collected += 1;
      }
    }
  });
  
  // Calculate completion percentage for each rarity
  Object.keys(byRarity).forEach(rarity => {
    const rarityStats = byRarity[rarity];
    if (rarityStats.total > 0) {
      rarityStats.percent = ((rarityStats.collected / rarityStats.total) * 100).toFixed(2);
    }
  });
  
  return {
    total,
    collected,
    missing,
    collectionPercent: collectionPercent.toFixed(2),
    newCardOddsSolg: Math.round(newCardOddsSolg * 100) / 100,
    newCardOddsLuna: Math.round(newCardOddsLuna * 100) / 100,
    byRarity
  };
};

// Calculate odds of getting at least one new card from a pack
export const calculateNewCardOdds = (cardSet: PokemonCardSet, subset?: string): number => {
  const cardArray = cardSet.cards;
  const packOdds = cardSet.packOdds;

  const cardsByRarity: { [key: string]: { owned: number, total: number } } = {};
  
  // Initialize using the set's rarities
  cardSet.rarities.forEach(rarity => {
    cardsByRarity[rarity.name] = {
      owned: 0,
      total: 0
    };
  });
  
  // Count cards by rarity, optionally filtering by subset
  cardArray.forEach(card => {
    if (cardsByRarity[card.rarity] && (!subset || card.subset === subset || card.subset === cardSet.name)) {
      cardsByRarity[card.rarity].total += 1;
      if (card.owned) {
        cardsByRarity[card.rarity].owned += 1;
      }
    }
  });
  
  // Common slots (positions 1-3) - assuming first rarity is common
  const commonRarityName = cardSet.rarities[0]?.name || 'oneDiamond';
  const commonStats = cardsByRarity[commonRarityName];
  const commonProb = commonStats.total > 0 ? (commonStats.total - commonStats.owned) / commonStats.total : 0;
  
  // Calculate odds for different slots
  const slot4Odds = calculateNewSlotOdds(cardsByRarity, packOdds.slotFourOdds);
  const slot5Odds = calculateNewSlotOdds(cardsByRarity, packOdds.slotFiveOdds);
  
  // Probability of getting at least one new card
  const probAllOwned = (1 - commonProb) ** 3 * (1 - slot4Odds) * (1 - slot5Odds);
  const probAtLeastOneNew = 1 - probAllOwned;

  return probAtLeastOneNew * 100;
};

// Calculate the odds of getting a new card from a slot with multiple possible rarities
const calculateNewSlotOdds = (
  cardsByRarity: { [key: string]: { owned: number, total: number } },
  slotOdds: Record<string, number>
): number => {
  let weightedNewCardProb = 0;

  for (const [key, value] of Object.entries(slotOdds)) {
    const stats = cardsByRarity[key];

    if (stats && stats.total > 0) { 
      const unownedRatio = (stats.total - stats.owned) / stats.total;
      weightedNewCardProb += unownedRatio * value;
    }
  }
  
  return weightedNewCardProb;
};