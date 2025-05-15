// Pack Simulator Logic
import { PokemonCard, PokemonCardSet } from './cardData';

export interface PackSimulationResult {
  cards: PokemonCard[];
  newCards: number;
  rarityBreakdown: {
    [key: string]: number;
  };
}

// Calculate odds of getting at least one new card from a pack
export const calculateNewCardOdds = (cardSet: PokemonCardSet, subSet: String): number => {
  // Group cards by rarity and owned status
  const cardArray = cardSet.cards;
  const packOdds = cardSet.packOdds;

  const cardsByRarity: { [key: string]: { owned: number, total: number } } = {};
  
  cardSet.rarities.forEach(rarity => {
    cardsByRarity[rarity.name] = {
      owned: 0,
      total: 0
    };
  });
  
  cardArray.forEach(card => {
    
    if (cardsByRarity[card.rarity] && (card.subset == subSet || card.subset == cardSet.tag)) {
      cardsByRarity[card.rarity].total += 1;
      if (card.owned) {
        cardsByRarity[card.rarity].owned += 1;
      }
    }
  });
  
  // Common slots (positions 1-3)
  const commonStats = cardsByRarity["oneDiamond"];
  const commonProb = commonStats.total > 0 ? (commonStats.total - commonStats.owned) / commonStats.total : 0;
  
  // Calculate odds for slot 4 (uncommon or better, but weighted toward uncommon)
  const slot4Odds = calculateNewSlotOdds(cardsByRarity, packOdds.slotFourOdds);
  const slot5Odds = calculateNewSlotOdds(cardsByRarity, packOdds.slotFiveOdds);
  
  // Probability of getting at least one new card
  // 1 - probability of getting all owned cards
  const probAllOwned = (1 - commonProb) ** 3 * (1 - slot4Odds) * (1 - slot5Odds);
  const probAtLeastOneNew = 1 - probAllOwned;

  return probAtLeastOneNew * 100; // Convert to percentage
};

// Calculate the odds of getting a new card from a slot with multiple possible rarities
const calculateNewSlotOdds = (
  cardsByRarity: { [key: string]: { owned: number, total: number } },
  slotOdds: Record<string, number>
): number => {
  let weightedNewCardProb = 0;

  for (const [key, value] of Object.entries(slotOdds)) {
    const stats = cardsByRarity[key];

    if (stats.total > 0) { 
      const unownedRatio = (stats.total - stats.owned) / stats.total;
      weightedNewCardProb += unownedRatio * value;
    }
  }
  
  return weightedNewCardProb;
};

// Helper function for weighted random selection
export const weightedRandomIndex = (weights: number[]): number => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  
  return weights.length - 1;
};

// Simulate opening a pack
export const simulatePackOpening = (cardSet: PokemonCardSet): PackSimulationResult => {
  // Pack structure: 5 cards
  // Cards 1-3: Common
  // Card 4: Usually Uncommon (80%), sometimes Rare (15%) or Rare Holo (5%)
  // Card 5: Any non-common rarity based on weights
  
  const cards = cardSet.cards;
  const pack: PokemonCard[] = [];
  const rarityBreakdown: {[key: string]: number} = {};
  let newCardsCount = 0;
  
  // Cards 1-3: Commons
  for (let i = 0; i < 3; i++) {
    const commonCards = cards.filter(card => card.rarity === "Common");
    if (commonCards.length === 0) continue;
    
    const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
    pack.push(randomCard);
    
    rarityBreakdown["Common"] = (rarityBreakdown["Common"] || 0) + 1;
    if (!randomCard.owned) newCardsCount++;
  }
  
  // Card 4: Usually Uncommon
  const slotRarities = Object.keys(cardSet.packOdds.slotFourOdds);
  const slot4Weights = Object.values(cardSet.packOdds.slotFourOdds);
  const slot4RarityIndex = weightedRandomIndex(slot4Weights);
  const slot4Rarity = slotRarities[slot4RarityIndex];
  
  const slot4Cards = cards.filter(card => card.rarity === slot4Rarity);
  if (slot4Cards.length > 0) {
    const randomCard = slot4Cards[Math.floor(Math.random() * slot4Cards.length)];
    pack.push(randomCard);
    
    rarityBreakdown[slot4Rarity] = (rarityBreakdown[slot4Rarity] || 0) + 1;
    if (!randomCard.owned) newCardsCount++;
  }
  
  // Card 5: Rare slot (any non-common rarity)
  const slot5Weights = Object.values(cardSet.packOdds.slotFiveOdds);
  const slot5RarityIndex = weightedRandomIndex(slot5Weights);
  const slot5Rarity = slotRarities[slot5RarityIndex];
  
  const rareCards = cards.filter(card => card.rarity === slot5Rarity);
  if (rareCards.length > 0) {
    const randomCard = rareCards[Math.floor(Math.random() * rareCards.length)];
    pack.push(randomCard);
    
    rarityBreakdown[slot5Rarity] = (rarityBreakdown[slot5Rarity] || 0) + 1;
    if (!randomCard.owned) newCardsCount++;
  }
  
  return {
    cards: pack,
    newCards: newCardsCount,
    rarityBreakdown
  };
};