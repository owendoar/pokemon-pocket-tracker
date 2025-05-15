// Card Data Types and Classes
export interface PokemonCard {
  id: string;
  name: string;
  set: string;
  subset: string;
  rarity: string;
  owned: boolean;
}

export interface PackOdds {
  slotFourOdds: Record<string, number>;
  slotFiveOdds: Record<string, number>;
}

export interface RarityDefinition {
  name: string;
  color: string;
}

// PokemonCardSet class with methods
export class PokemonCardSet {
  public readonly tag: string;
  public readonly name: string;
  public cards: PokemonCard[];
  public readonly packOdds: PackOdds;
  public readonly subsets: string[];
  public readonly rarities: RarityDefinition[];
  
  constructor(
    tag: string,
    name: string,
    cards: PokemonCard[],
    packOdds: PackOdds,
    subsets: string[],
    rarities: RarityDefinition[],
  ) {
    this.tag = tag;
    this.name = name;
    this.cards = cards;
    this.packOdds = packOdds;
    this.subsets = subsets;
    this.rarities = rarities;
  }
  
  // Get total number of cards
  getTotalCards(): number {
    return this.cards.length;
  }
  
  // Get cards by rarity
  getCardsByRarity(rarity: string): PokemonCard[] {
    return this.cards.filter(card => card.rarity === rarity);
  }
  
  // Get cards by subset
  getCardsBySubset(subset: string): PokemonCard[] {
    return this.cards.filter(card => card.subset === subset);
  }
  
  // Get rarity counts
  getRarityCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.rarities.forEach(rarity => {
      counts[rarity.name] = 0;
    });
    
    this.cards.forEach(card => {
      if (counts[card.rarity] !== undefined) {
        counts[card.rarity]++;
      }
    });
    
    return counts;
  }
  
  // Get owned cards count
  getOwnedCards(): PokemonCard[] {
    return this.cards.filter(card => card.owned);
  }
  
  // Get completion percentage
  getCompletionPercentage(): number {
    const totalCards = this.getTotalCards();
    const ownedCards = this.getOwnedCards().length;
    return totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;
  }
  
  // Create a new set with updated card ownership
  updateCard(cardId: string, owned: boolean): void {
    this.cards[parseInt(cardId.slice(-3)) - 1].owned = owned;
  }
  
  updateCards(cardIds: string[], owned: boolean): void {
    cardIds.forEach(cardId => {
      this.cards[parseInt(cardId.slice(-3)) - 1].owned = owned;
    });
  }

  // Reset all cards to unowned (mutates the set)
  resetCollection(): void {
    this.cards.forEach(card => {
      card.owned = false;
    });
  }

  setAllDiamondOwned(): void {
    const thresholdIndex = this.rarities.findIndex(r => r.name === "fourDiamond");
    this.cards.forEach(card => {
      const cardRarityIndex = this.rarities.findIndex(r => r.name === card.rarity);
      card.owned = cardRarityIndex <= thresholdIndex;
    });
  }

  // Load ownership state from saved data
  loadOwnershipState(savedCards: {id: string, owned: boolean}[]): void {
    savedCards.forEach(savedCard => {
      const card = this.cards.find(c => c.id === savedCard.id);
      if (card) {
        card.owned = savedCard.owned;
      }
    });
  }

  // Get card by ID
  getCard(cardId: string): PokemonCard | undefined {
    return this.cards.find(c => c.id === cardId);
  }
  
  // Helper function to get color class based on rarity
  getRarityColor(rarity: string): string {
    const rarityDef = this.rarities.find(r => r.name === rarity);
    return rarityDef ? rarityDef.color : "bg-gray-200";
  };
}