"use client"
// Example of how to use the updated card data in the PokemonCardTracker component

import React, { useState, useEffect } from 'react';
import { PokemonCard, CELESTIAL_SET, CELESTIAL_CARDS } from './cardData';
import pokemonData from './pokemonData.json';
import { calculateStats } from './cardStats';
import CollectionStatsComponent from './CollectionStats';
import PackSimulator from './PackSimulator';
import FilterControls from './FilterControls';
import CardCollection from './CardCollection';

export default function PokemonCardTracker(): JSX.Element {
  // State variables
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSet, setActiveSet] = useState<string>('all');
  const [activeRarity, setActiveRarity] = useState<string>('all');
  const [collectionStats, setCollectionStats] = useState(calculateStats(CELESTIAL_SET));
  const [availableSets, setAvailableSets] = useState<string[]>([]);

  // Load cards from localStorage or initialize with base set
  useEffect(() => {
    try {
      // Check if we have saved cards in localStorage
      const savedCards = localStorage.getItem('pokemonCards');
      
      if (savedCards) {
        // If we have saved cards, use them
        const parsedCards = JSON.parse(savedCards);
        setCards(parsedCards);
        
        // Create a copy of CELESTIAL_SET with our saved cards for stats calculation
        const updatedSet = {...CELESTIAL_SET, cards: parsedCards};
        const savedStats = calculateStats(updatedSet);
        setCollectionStats(savedStats);
        
        // Extract available sets from saved cards
        const sets = Array.from(new Set(parsedCards.map((card: PokemonCard) => card.set)));
        setAvailableSets(['all', ...sets]);
      } else {
        // If no saved cards, initialize with the base set
        setCards(CELESTIAL_SET.cards);
        const initialStats = calculateStats(CELESTIAL_SET);
        setCollectionStats(initialStats);
        
        // Save to localStorage
        localStorage.setItem('pokemonCards', JSON.stringify(CELESTIAL_SET.cards));
        
        // Set available sets
        setAvailableSets(['all', CELESTIAL_SET.cards[0].set]);
      }
    } catch (err) {
      console.error('Failed to initialize collection', err);
      // Fallback to default cards if there's an error
      setCards(CELESTIAL_SET.cards);
      const initialStats = calculateStats(CELESTIAL_SET);
      setCollectionStats(initialStats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle card owned status
  const toggleCard = (id: string): void => {
    const updatedCards = cards.map(card => 
      card.id === id ? { ...card, owned: !card.owned } : card
    );
    const updatedSet = {...CELESTIAL_SET, cards: updatedCards};
    setCards(updatedCards);
    localStorage.setItem('pokemonCards', JSON.stringify(updatedCards));
    const updatedStats = calculateStats(updatedSet);
    setCollectionStats(updatedStats);
  };

  // Reset collection (mark all as not owned)
  const resetCollection = (): void => {
    if (window.confirm('Are you sure you want to reset your collection? This will mark all cards as not owned.')) {
      const resetCards = cards.map(card => ({ ...card, owned: false }));
      setCards(resetCards);
      localStorage.setItem('pokemonCards', JSON.stringify(resetCards));
      const resetStats = calculateStats({...CELESTIAL_SET, cards: resetCards});
      setCollectionStats(resetStats);
    }
  };
  
  // Add cards from pack to collection
  const addCardsToCollection = (packCards: PokemonCard[]): void => {
    const updatedCards = cards.map(card => {
      const packCard = packCards.find(pc => pc.id === card.id);
      if (packCard) {
        return { ...card, owned: true };
      }
      return card;
    });
    
    setCards(updatedCards);
    localStorage.setItem('pokemonCards', JSON.stringify(updatedCards));
    const updatedStats = calculateStats({...CELESTIAL_SET, cards: updatedCards});
    setCollectionStats(updatedStats);
  };
  
  // Display information about available Pokémon and rarities
  const showCardDatabase = (): void => {
    alert(`Card Database Information:
    - Total Pokémon: ${pokemonData.pokemonWithRarities.length}
    - Total Rarities: ${pokemonData.rarities.length}
    - Sets: ${pokemonData.sets.map(set => set.name).join(', ')}
    `);
  };
  
  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-center mb-8">Pokémon Card Collection Tracker</h1>
      
      {/* Collection Statistics */}
      <CollectionStatsComponent stats={collectionStats} />
      
      {/* Pack Simulator */}
      <PackSimulator 
        cards={cards} 
        onAddToCollection={addCardsToCollection}
      />
      
      {/* Database Info Button */}
      <div className="text-center mb-4">
        <button 
          onClick={showCardDatabase}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          Show Card Database Info
        </button>
      </div>
      
      {/* Filters */}
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeSet={activeSet}
        setActiveSet={setActiveSet}
        activeRarity={activeRarity}
        setActiveRarity={setActiveRarity}
        cards={cards}
        onResetCollection={resetCollection}
        availableSets={availableSets}
      />
      
      {/* Card Collection */}
      <CardCollection
        cards={cards}
        searchTerm={searchTerm}
        activeSet={activeSet}
        activeRarity={activeRarity}
        onToggleCard={toggleCard}
      />
    </div>
  );
}