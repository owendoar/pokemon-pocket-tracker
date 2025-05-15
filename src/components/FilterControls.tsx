import React from 'react';
import { PokemonCard } from './cardData';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeSet: string;
  setActiveSet: (set: string) => void;
  activeRarity: string;
  setActiveRarity: (rarity: string) => void;
  cards: PokemonCard[];
  onResetCollection: () => void;
  onSetAllDiamondOwned: () => void;
  availableSubsets: string[];
  availableRarities: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  activeSet,
  setActiveSet,
  activeRarity,
  setActiveRarity,
  cards,
  onResetCollection,
  onSetAllDiamondOwned,
  availableSubsets,
  availableRarities
}) => {
  // Calculate filter statistics
  const totalCards = cards.length;
  const ownedCards = cards.filter(card => card.owned).length;
  const unownedCards = totalCards - ownedCards;
  
  // Quick filter functions
  const showAllCards = () => {
    setSearchTerm('');
    setActiveSet('all');
    setActiveRarity('all');
  };
  
  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-card">
      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subset</label>
          <select
            value={activeSet}
            onChange={(e) => setActiveSet(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableSubsets.map(subset => (
              <option key={subset} value={subset}>
                {subset === 'all' ? 'All Subsets' : subset}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
          <select
            value={activeRarity}
            onChange={(e) => setActiveRarity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableRarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'All Rarities' : rarity}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">Collection Overview:</span>
          <span className="text-green-600">{ownedCards} owned</span>
          <span className="text-red-600">{unownedCards} missing</span>
          <span className="text-gray-600">{((ownedCards / totalCards) * 100).toFixed(1)}% complete</span>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={showAllCards}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
          >
            Show All
          </button>
          <button
            onClick={() => setSearchTerm('')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            Clear Search
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {searchTerm && `Showing results for "${searchTerm}"`}
          {activeSet !== 'all' && ` in ${activeSet}`}
          {activeRarity !== 'all' && ` · ${activeRarity} rarity`}
        </div>
        
        <button
          onClick={onResetCollection}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reset Collection
        </button>

        <button
          onClick={onSetAllDiamondOwned}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Set All Diamond Owned
        </button>
      </div>
    </div>
  );
};

export default FilterControls;