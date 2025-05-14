import React from 'react';
import { PokemonCard } from './cardData';
import { RARITIES } from './cardData';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeSet: string;
  setActiveSet: (set: string) => void;
  activeRarity: string;
  setActiveRarity: (rarity: string) => void;
  cards: PokemonCard[];
  onResetCollection: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  activeSet,
  setActiveSet,
  activeRarity,
  setActiveRarity,
  cards,
  onResetCollection
}) => {
  // Get unique sets for filters
  const sets = ['all', ...Array.from(new Set(cards.map(card => card.set)))];
  const rarities = ['all', ...RARITIES.map(r => r.name)];
  
  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full p-2 border border-border-color rounded focus:ring-2 focus:ring-primary-color focus:border-primary-color"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Set</label>
          <select
            value={activeSet}
            onChange={(e) => setActiveSet(e.target.value)}
            className="w-full p-2 border border-border-color rounded focus:ring-2 focus:ring-primary-color focus:border-primary-color"
          >
            {sets.map(set => (
              <option key={set} value={set}>
                {set === 'all' ? 'All Sets' : set}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Rarity</label>
          <select
            value={activeRarity}
            onChange={(e) => setActiveRarity(e.target.value)}
            className="w-full p-2 border border-border-color rounded focus:ring-2 focus:ring-primary-color focus:border-primary-color"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'All Rarities' : rarity}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={onResetCollection}
          className="btn btn-danger"
        >
          Reset Collection
        </button>
      </div>
    </div>
  );
};

export default FilterControls;