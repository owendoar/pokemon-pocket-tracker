"use client"
import React, { useState, useEffect } from 'react';
import { PokemonCard, PokemonCardSet } from './cardData';
import SetRegistry from './setRegistry';
import { firebaseService } from './firebaseService';
import CollectionStats from './CollectionStats';
import FilterControls from './FilterControls';
import CardCollection from './CardCollection';
import SetSelector from './SetSelector';

export default function PokemonCardTracker(): JSX.Element {
  // State variables
  const [currentSetId, setCurrentSetId] = useState<string>('A3');
  const [currentSet, setCurrentSet] = useState<PokemonCardSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSet, setActiveSet] = useState<string>('all');
  const [activeRarity, setActiveRarity] = useState<string>('all');
  const [setOptions, setSetOptions] = useState<{id: string, name: string}[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Add a counter to force re-renders when set is mutated
  const [updateCounter, setUpdateCounter] = useState<number>(0);

  // Force a re-render without changing the set reference
  const forceUpdate = () => setUpdateCounter(prev => prev + 1);

  // Load available sets on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize the app - load sets and current selection
  const initializeApp = async () => {
    try {
      // Get available set options
      const options = SetRegistry.getAvailableSetOptions();
      setSetOptions(options);
      
      // Load saved current set or default to first available
      const savedSetId = localStorage.getItem('currentSet');
      const initialSetId = savedSetId && options.find(opt => opt.id === savedSetId) 
        ? savedSetId 
        : options[0]?.id;
      
      await loadSet(initialSetId);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setErrorMessage('Failed to initialize application');
      setLoading(false);
    }
  };

  // Load a specific set and its saved data
  const loadSet = async (setId: string) => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Get the set definition
      const set = SetRegistry.getSet(setId);
      if (!set) {
        throw new Error(`Set ${setId} not found`);
      }
      
      setCurrentSetId(setId);
      
      console.log(`Loading collection for set ${setId} from Firebase...`);
      
      // Try to load saved progress from Firebase
      const savedCards = await firebaseService.loadCardsForSet(setId);
      
      if (savedCards && savedCards.length > 0) {
        console.log(`Loaded existing collection from Firebase for ${setId}`);
        // Load the ownership state into the set
        set.loadOwnershipState(savedCards);
        
        // Get metadata for sync info
        const metadata = await firebaseService.getSetMetadata(setId);
        if (metadata) {
          setLastSyncTime(new Date(metadata.lastUpdated).toLocaleString());
        }
      } else {
        console.log(`No collection found in Firebase for ${setId}, creating new one`);
        // Reset all cards to unowned (they should already be unowned from the registry)
        set.resetCollection();
        
        // Save the fresh collection to Firebase immediately
        const saveSuccess = await saveToFirebase(set);
        if (!saveSuccess) {
          setErrorMessage('Failed to save initial collection to Firebase');
        }
      }
      
      setCurrentSet(set);
      forceUpdate(); // Force initial render
      
      // Remove any old localStorage data for this set
      localStorage.removeItem(`pokemonCards_${setId}`);
      
      // Save current set selection
      localStorage.setItem('currentSet', setId);
      
    } catch (error) {
      console.error(`Failed to load set ${setId}:`, error);
      setErrorMessage(`Failed to load set ${setId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Save collection to Firebase
  const saveToFirebase = async (set: PokemonCardSet): Promise<boolean> => {
    setIsSyncing(true);
    setErrorMessage('');
    
    try {
      console.log(`Saving collection for ${currentSetId} to Firebase...`);
      const success = await firebaseService.saveCardsForSet(currentSetId, set);
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

  // Handle set change
  const handleSetChange = async (newSetId: string) => {
    if (newSetId !== currentSetId) {
      await loadSet(newSetId);
    }
  };

  // Toggle card owned status
  const toggleCard = async (id: string): Promise<void> => {
    if (!currentSet) return;
    
    // Get current card state
    const card = currentSet.getCard(id);
    if (!card) return;
    
    const oldOwnedState = card.owned;
    
    // Update the card immediately for responsiveness
    currentSet.updateCard(id, !oldOwnedState);
    
    // Trigger re-render by incrementing counter
    forceUpdate();
    
    // Save to Firebase (with error handling)
    const saveSuccess = await saveToFirebase(currentSet);
    if (!saveSuccess) {
      // If save failed, revert the local change
      currentSet.updateCard(id, oldOwnedState);
      forceUpdate();
    }
  };

  // Reset collection (mark all as not owned)
  const resetCollection = async (): Promise<void> => {
    if (!currentSet) return;
    
    if (window.confirm('Are you sure you want to reset your collection? This will mark all cards as not owned.')) {
      // Store current state for potential rollback
      const previousState = currentSet.cards.map(card => ({ id: card.id, owned: card.owned }));
      
      currentSet.resetCollection();
      forceUpdate();
      
      // Save to Firebase
      const saveSuccess = await saveToFirebase(currentSet);
      if (!saveSuccess) {
        // Rollback on failure
        currentSet.loadOwnershipState(previousState);
        forceUpdate();
      }
    }
  };

  const setAllDiamondOwned = async (): Promise<void> => {
    if (!currentSet) return;

    if (window.confirm('Are you sure you want to mark diamond cards as owned?')) {
      const previousState = currentSet.cards.map(card => ({ id: card.id, owned: card.owned }));

      currentSet.setAllDiamondOwned();
      forceUpdate();
      
      // Save to Firebase
      const saveSuccess = await saveToFirebase(currentSet);
      if (!saveSuccess) {
        // Rollback on failure
        currentSet.loadOwnershipState(previousState);
        forceUpdate();
      }
    }
  }
  
  // Add cards from pack to collection
  const addCardsToCollection = async (packCards: PokemonCard[]): Promise<void> => {
    if (!currentSet) return;
    
    // Store current state for potential rollback
    const cardIds = packCards.map(card => card.id);
    const previousState = cardIds.map(id => {
      const card = currentSet.getCard(id);
      return { id, owned: card?.owned || false };
    });
    
    // Update all cards at once
    const updatedCount = currentSet.updateCards(cardIds, true);
    forceUpdate();
    
    // Save to Firebase
    const saveSuccess = await saveToFirebase(currentSet);
    if (!saveSuccess) {
      // Rollback on failure
      previousState.forEach(({ id, owned }) => {
        currentSet.updateCard(id, owned);
      });
      forceUpdate();
    }
  };

  // Manual sync - reload from Firebase
  const handleManualSync = async () => {
    if (!currentSet) return;
    await loadSet(currentSetId);
  };

  // Retry loading when there's an error
  const retryLoad = async () => {
    await loadSet(currentSetId);
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
  
  if (!currentSet && errorMessage) {
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
  
  if (!currentSet) {
    return <div className="flex justify-center py-12">No set loaded</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto" key={updateCounter}>
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
      
      {/* Set Selector with Firebase Integration */}
      <SetSelector
        currentSetId={currentSetId}
        setOptions={setOptions}
        onSetChange={handleSetChange}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onManualSync={handleManualSync}
        isConnected={firebaseService.isUserSignedIn()}
      />
      
      {/* Collection Statistics */}
      <CollectionStats set={currentSet} />
      
      {/* Filters */}
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeSet={activeSet}
        setActiveSet={setActiveSet}
        activeRarity={activeRarity}
        setActiveRarity={setActiveRarity}
        cards={currentSet.cards}
        onResetCollection={resetCollection}
        onSetAllDiamondOwned={setAllDiamondOwned}
        availableSubsets={['all', ...currentSet.subsets]}
        availableRarities={['all', ...currentSet.rarities.map(r => r.name)]}
      />
      
      {/* Card Collection */}
      <CardCollection
        cards={currentSet.cards}
        searchTerm={searchTerm}
        activeSet={activeSet}
        activeRarity={activeRarity}
        onToggleCard={toggleCard}
        set={currentSet}
      />
    </div>
  );
}