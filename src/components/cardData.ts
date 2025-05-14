// Card Data Types and Database
import pokemonData from './pokemonData.json';

export interface PokemonCardSet {
  tag: String;
  cards: PokemonCard[];
  packOdds: packOdds;
  rarityCount: Record<string, number>;
  subsets: String[];
}

// Define TypeScript interfaces
export interface PokemonCard {
  id: string;
  name: string;
  set: string;
  subset: string;
  rarity: string;
  owned: boolean;
}

export interface packOdds {
  slotFourOdds: Record<string, number>
  slotFiveOdds: Record<string, number>
}

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

export interface RarityDefinition {
  name: string;
  color: string;
  weight?: number;
}

// Define card rarities with their distribution in pack slots
export const RARITIES: RarityDefinition[] = pokemonData.rarities;

// Generate card set function using the pre-assigned rarities
const generateCardSet = (setInfo: typeof pokemonData.sets[0]): PokemonCard[] => {
  const cards: PokemonCard[] = [];
  const pokemonWithRarities = pokemonData.pokemonWithRarities;
  
  // Determine how many cards to create
  const totalCards = setInfo.totalCards;
  
  // First, create basic cards for each Pokémon with their assigned rarity
  pokemonWithRarities.forEach((pokemon, index) => {
    if (cards.length < totalCards) {
      cards.push({
        id: `${setInfo.prefix}${(index + 1).toString().padStart(3, '0')}`,
        name: pokemon.name,
        set: setInfo.name,
        subset: pokemon.set,
        rarity: pokemon.rarity,
        owned: pokemon.owned
      });
    }
  });
  
  return cards;
};

// Generate the Celestial set using the first set definition
export const CELESTIAL_CARDS: PokemonCard[] = generateCardSet(pokemonData.sets[0]);

export const SHINY_SET_ODDS: packOdds = {
  slotFourOdds: {
    "twoDiamond": 0.89,
    "threeDiamond": 0.04952,
    "fourDiamond": 0.01666,
    "oneStar": 0.02572,
    "twoStar": 0.005,
    "threeStar": 0.00222,
    "oneRainbow": 0.00714,
    "twoRainbow": 0.00333,
    "crown": 0.0004
  },
  slotFiveOdds: {
    "twoDiamond": 0.56,
    "threeDiamond": 0.19810,
    "fourDiamond": 0.06664,
    "oneStar": 0.10288,
    "twoStar": 0.02,
    "threeStar": 0.00888,
    "oneRainbow": 0.02857,
    "twoRainbow": 0.01333,
    "crown": 0.0016
  }
}

// Generate the rarity counts based on our cards
export const calculateRarityCounts = (cards: PokemonCard[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  // Initialize counts
  RARITIES.forEach(rarity => {
    counts[rarity.name] = 0;
  });
  
  // Count cards by rarity
  cards.forEach(card => {
    if (counts[card.rarity] !== undefined) {
      counts[card.rarity]++;
    }
  });
  
  return counts;
}

export const CELESTIAL_SET: PokemonCardSet = {
  tag: "CELS",
  cards: CELESTIAL_CARDS,
  packOdds: SHINY_SET_ODDS,
  rarityCount: calculateRarityCounts(CELESTIAL_CARDS),
  subsets: ["SOLG", "LUNA"]
}

// Helper function to get color class based on rarity
export const getRarityColorClass = (rarity: string): string => {
  const rarityDef = RARITIES.find(r => r.name === rarity);
  return rarityDef ? rarityDef.color : "bg-gray-200";
};