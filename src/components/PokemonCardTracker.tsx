"use client";

import { useState, useEffect } from 'react';
import { PokemonCard, CELESTIAL_SET } from './cardData';
import { calculateStats } from './cardStats';
import { firebaseService } from './firebaseService';
import CollectionStatsComponent from './CollectionStats';
import PackSimulator from './PackSimulator';
import FilterControls from './FilterControls';
import CardCollection from './CardCollection';

export default function PokemonCardTracker(): JSX.Element {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSet, setActiveSet] = useState<string>('all');
  const [activeRarity, setActiveRarity] = useState<string>('all');
  const [collectionStats, setCollectionStats] = useState(calculateStats(CELESTIAL_SET));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load cards from Firebase ONLY - no localStorage fallback
  useEffect(() => {
    initializeCollection();
  }, []);

  const initializeCollection = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      console.log('Initializing collection from Firebase...');
      
      // Always try to load from Firebase first
      const savedCardStates = await firebaseService.loadCards();
      
      if (savedCardStates && savedCardStates.length > 0) {
        console.log('Loading existing collection from Firebase');
        // Merge saved states with base card data
        const mergedCards = CELESTIAL_SET.cards.map(baseCard => {
          const savedCard = savedCardStates.find(sc => sc.id === baseCard.id);
          return {
            ...baseCard,
            owned: savedCard?.owned || false
          };
        });
        
        setCards(mergedCards);
        const stats = calculateStats({...CELESTIAL_SET, cards: mergedCards});
        setCollectionStats(stats);
        setLastSyncTime(new Date().toLocaleString());
      } else {
        console.log('No collection found in Firebase, creating new one');
        // If no saved cards in Firebase, create a fresh collection
        const freshCards = CELESTIAL_SET.cards.map(card => ({
          ...card,
          owned: false
        }));
        
        setCards(freshCards);
        const initialStats = calculateStats({...CELESTIAL_SET, cards: freshCards});
        setCollectionStats(initialStats);
        
        // Save the fresh collection to Firebase immediately
        const saveSuccess = await saveToFirebase(freshCards);
        if (saveSuccess) {
          console.log('New collection saved to Firebase');
        }
      }

      // Remove any localStorage data to prevent confusion
      localStorage.removeItem('pokemonCards');
      
    } catch (err) {
      console.error('Failed to initialize collection from Firebase:', err);
      setErrorMessage(`Failed to load collection from Firebase: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Don't fall back to default cards - let the user know there's an issue
      setCards([]);
      const emptyStats = calculateStats({...CELESTIAL_SET, cards: []});
      setCollectionStats(emptyStats);
    } finally {
      setLoading(false);
    }
  };

  // Save cards to Firebase
  const saveToFirebase = async (cardsToSave: PokemonCard[]) => {
    setIsSyncing(true);
    setErrorMessage('');
    
    try {
      console.log('Saving collection to Firebase...');
      const success = await firebaseService.saveCards(cardsToSave);
      if (success) {
        setLastSyncTime(new Date().toLocaleString());
        console.log('Collection saved successfully');
        return true;
      } else {
        setErrorMessage('Failed to save to Firebase. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setErrorMessage(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle card owned status
  const toggleCard = async (id: string): Promise<void> => {
    // Update local state immediately for responsiveness
    const updatedCards = cards.map(card => 
      card.id === id ? { ...card, owned: !card.owned } : card
    );
    const updatedSet = {...CELESTIAL_SET, cards: updatedCards};
    setCards(updatedCards);
    const updatedStats = calculateStats(updatedSet);
    setCollectionStats(updatedStats);

    // Save to Firebase (with error handling)
    const saveSuccess = await saveToFirebase(updatedCards);
    if (!saveSuccess) {
      // If save failed, revert the local change
      setCards(cards);
      setCollectionStats(calculateStats({...CELESTIAL_SET, cards}));
    }
  };

  // Reset collection (mark all as not owned)
  const resetCollection = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to reset your collection? This will mark all cards as not owned.')) {
      const resetCards = cards.map(card => ({ ...card, owned: false }));
      setCards(resetCards);
      const resetStats = calculateStats({...CELESTIAL_SET, cards: resetCards});
      setCollectionStats(resetStats);
      
      // Save to Firebase
      await saveToFirebase(resetCards);
    }
  };
  
  // Add cards from pack to collection
  const addCardsToCollection = async (packCards: PokemonCard[]): Promise<void> => {
    const updatedCards = cards.map(card => {
      const packCard = packCards.find(pc => pc.id === card.id);
      if (packCard) {
        return { ...card, owned: true };
      }
      return card;
    });
    
    setCards(updatedCards);
    const updatedStats = calculateStats({...CELESTIAL_SET, cards: updatedCards});
    setCollectionStats(updatedStats);
    
    // Save to Firebase
    await saveToFirebase(updatedCards);
  };

  // Sync button for manual sync
  const handleManualSync = async () => {
    // Force reload from Firebase
    await initializeCollection();
  };

  // Retry loading from Firebase
  const retryLoad = async () => {
    await initializeCollection();
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-lg">Loading your collection from Firebase...</div>
        <div className="text-sm text-gray-600 mt-2">
          {firebaseService.isUserSignedIn() ? 
            'Connected and loading data...' : 
            'Connecting to Firebase...'
          }
        </div>
      </div>
    );
  }
  
  if (cards.length === 0 && errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-lg">
          <h2 className="font-bold mb-2">Could not load collection</h2>
          <p>{errorMessage}</p>
        </div>
        <button 
          onClick={retryLoad}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry Loading
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-center mb-8">Pokémon Card Collection Tracker</h1>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
          <button 
            onClick={() => setErrorMessage('')}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Sync Status */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span>Last synced: {lastSyncTime}</span>
          {isSyncing && <span className="ml-2 text-blue-600">Syncing...</span>}
          {firebaseService.isUserSignedIn() ? (
            <span className="ml-2 text-green-600">✓ Connected to Firebase</span>
          ) : (
            <span className="ml-2 text-orange-600">⚠ Not connected to Firebase</span>
          )}
        </div>
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Reload from Firebase'}
        </button>
      </div>
      
      {/* Collection Statistics */}
      <CollectionStatsComponent stats={collectionStats} />
      
      {/* Pack Simulator */}
      <PackSimulator 
        cards={cards} 
        onAddToCollection={addCardsToCollection}
      />
      
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