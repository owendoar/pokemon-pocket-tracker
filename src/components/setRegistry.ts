// Set Registry - Simple registry for managing multiple sets
import { PokemonCardSet, PokemonCard } from './cardData';
import A3 from './data/celestial.json';
import A2b from './data/shining.json';
import A2a from './data/triumphant.json';
import A2 from './data/spacetime.json';
import A1a from './data/mythical.json';
import A1 from './data/genetic.json';


// Helper function to create cards from JSON data
function createCardsFromData(setData: any): PokemonCard[] {
  const cards: PokemonCard[] = [];
  const cardData = setData.cards;
  
  cardData.forEach((pokemon: any, index: number) => {
    if (cards.length < setData.totalCards) {
      cards.push({
        id: `${setData.tag}${(index + 1).toString().padStart(3, '0')}`,
        name: pokemon.name,
        set: setData.name,
        subset: pokemon.subset,
        rarity: pokemon.rarity,
        owned: false
      });
    }
  });
  
  return cards;
}

// Helper function to create a PokemonCardSet from JSON data
function createSetFromData(setData: any): PokemonCardSet {
  const cards = createCardsFromData(setData);
  
  // Extract subsets from cards or use provided subsets
  let subsets: string[] = [];
  if (setData.subsets) {
    subsets = setData.subsets;
  }
  
  return new PokemonCardSet(
    setData.tag,
    setData.name,
    cards,
    setData.packOdds,
    subsets,
    setData.rarities,
  );
}

// Registry class to manage multiple sets
export class SetRegistry {
  private static sets: Map<string, PokemonCardSet> = new Map();
  private static setDefinitions: Map<string, () => PokemonCardSet> = new Map();
  
  // Register a set with its data
  static registerSet(setId: string, setData: any): void {
    this.setDefinitions.set(setId, () => createSetFromData(setData));
  }
  
  // Get a set by ID (loads it if not already loaded)
  static getSet(setId: string): PokemonCardSet | null {
    // Return cached set if available
    if (this.sets.has(setId)) {
      return this.sets.get(setId)!;
    }
    
    // Try to load the set
    const setFactory = this.setDefinitions.get(setId);
    if (!setFactory) {
      console.warn(`Set '${setId}' not found in registry`);
      return null;
    }
    
    try {
      const set = setFactory();
      this.sets.set(setId, set);
      return set;
    } catch (error) {
      console.error(`Failed to create set '${setId}':`, error);
      return null;
    }
  }
  
  // Get all available set IDs
  static getAvailableSetIds(): string[] {
    return Array.from(this.setDefinitions.keys());
  }
  
  // Get all available sets as {id, name} pairs
  static getAvailableSetOptions(): {id: string, name: string}[] {
    return this.getAvailableSetIds().map(setId => {
      const set = this.getSet(setId);
      return {
        id: setId,
        name: set ? set.name : setId
      };
    });
  }
  
  // Clear all cached sets (useful for memory management)
  static clearCache(): void {
    this.sets.clear();
  }
}

// Initialize with the existing set data
SetRegistry.registerSet('A3', A3);
SetRegistry.registerSet('A2b', A2b);
SetRegistry.registerSet('A2a', A2a);
SetRegistry.registerSet('A2', A2);
SetRegistry.registerSet('A1a', A1a);
SetRegistry.registerSet('A1', A1);

// Export for convenience
export default SetRegistry;