import React, { useMemo } from 'react';
import { PokemonCard, PokemonCardSet } from './cardData';
import _ from 'lodash';

interface CardCollectionProps {
  cards: PokemonCard[];
  searchTerm: string;
  activeSet: string; // Actually activeSubset
  activeRarity: string;
  onToggleCard: (id: string) => void;
  set: PokemonCardSet;
}

const CardCollection: React.FC<CardCollectionProps> = ({ 
  cards, 
  searchTerm, 
  activeSet, // Actually activeSubset
  activeRarity, 
  onToggleCard,
  set
}) => {
  // Memoize filtered cards to optimize performance
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            card.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubset = activeSet === 'all' || card.subset === activeSet;
      const matchesRarity = activeRarity === 'all' || card.rarity === activeRarity;
      
      return matchesSearch && matchesSubset && matchesRarity;
    });
  }, [cards, searchTerm, activeSet, activeRarity]);

  // Memoize grouped cards to optimize performance
  const cardsBySubset = useMemo(() => {
    return _.groupBy(filteredCards, 'subset');
  }, [filteredCards]);
  
  if (Object.keys(cardsBySubset).length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-lg text-gray-600">
          No cards match your filters. Try adjusting your search criteria.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {searchTerm && <div>Searched for: "{searchTerm}"</div>}
          {activeSet !== 'all' && <div>Subset: {activeSet}</div>}
          {activeRarity !== 'all' && <div>Rarity: {activeRarity}</div>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {Object.keys(cardsBySubset).map(subsetName => {
        const subsetCards = cardsBySubset[subsetName];
        const ownedCount = subsetCards.filter(c => c.owned).length;
        
        return (
          <div key={subsetName} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                <span>{subsetName}</span>
                <span className="text-lg">
                  <span className="text-green-600">{ownedCount}</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span>{subsetCards.length}</span>
                  <span className="text-sm ml-2 text-gray-600">
                    ({((ownedCount / subsetCards.length) * 100).toFixed(1)}%)
                  </span>
                </span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {subsetCards.map(card => (
                  <div 
                    key={card.id}
                    className={`pokemon-card ${card.owned ? 'pokemon-card-owned' : 'pokemon-card-notowned'} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => onToggleCard(card.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={card.owned} 
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleCard(card.id);
                          }}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium">{card.name}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${set.getRarityColor(card.rarity)} mr-1`}></span>
                            {card.rarity} • #{card.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-12 h-12 flex items-center justify-center ${set.getRarityColor(card.rarity)} rounded flex-shrink-0`}>
                        <span className="text-xs text-gray-700">Card</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardCollection;