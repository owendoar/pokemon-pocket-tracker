// Collection Statistics Functions
import { PokemonCard, CardSetStats, RARITIES, PokemonCardSet } from './cardData';
import { calculateNewCardOdds } from './packSimulator';

// Calculate collection statistics
export const calculateStats = (cardSet: PokemonCardSet): CardSetStats => {
  const cardArray = cardSet.cards ? cardSet.cards : [];
  const total = cardArray.length;
  const collected = cardArray.filter(card => card.owned).length;
  const missing = total - collected;
  const collectionPercent = total > 0 ? (collected / total) * 100 : 0;
  
  // Overall probability: Chance of pulling a card you don't have from a random card
  const overallOdds = total > 0 ? (missing / total) * 100 : 0;

  // Calculate pack odds (more complex calculation for pulling at least one new card from pack)
  let newCardOddsSolg = calculateNewCardOdds(cardSet, "SOLG");
  let newCardOddsLuna = calculateNewCardOdds(cardSet, "LUNA");

  newCardOddsSolg = Math.round(newCardOddsSolg * 100) / 100;
  newCardOddsLuna = Math.round(newCardOddsLuna * 100) / 100;
  
  // Calculate stats by rarity
  const byRarity: { [key: string]: { total: number; collected: number; percent: string } } = {};
  
  // Initialize rarity stats
  RARITIES.forEach(rarity => {
    byRarity[rarity.name] = {
      total: 0,
      collected: 0,
      percent: '0'
    };
  });
  
  // Count cards by rarity
  cardArray.forEach(card => {
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
    newCardOddsSolg,
    newCardOddsLuna,
    byRarity
  };
};