import React from 'react';
import { PokemonCard, getRarityColorClass } from './cardData';
import _ from 'lodash';

interface CardCollectionProps {
  cards: PokemonCard[];
  searchTerm: string;
  activeSet: string;
  activeRarity: string;
  onToggleCard: (id: string) => void;
}

const CardCollection: React.FC<CardCollectionProps> = ({ 
  cards, 
  searchTerm, 
  activeSet, 
  activeRarity, 
  onToggleCard 
}) => {
  // Filter cards based on search, set, and rarity
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSet = activeSet === 'all' || card.set === activeSet;
    const matchesRarity = activeRarity === 'all' || card.rarity === activeRarity;
    
    return matchesSearch && matchesSet && matchesRarity;
  });

  // Group cards by set
  const cardsBySet = _.groupBy(filteredCards, 'set');
  
  return (
    <>
      {/* Card Collection */}
      {Object.keys(cardsBySet).length > 0 ? (
        Object.keys(cardsBySet).map(setName => (
          <div key={setName} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 bg-gray-100 p-3 rounded-lg shadow-sm">
              {setName} ({cardsBySet[setName].filter(c => c.owned).length}/{cardsBySet[setName].length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cardsBySet[setName].map(card => (
                <div 
                  key={card.id}
                  className={`pokemon-card ${card.owned ? 'pokemon-card-owned' : 'pokemon-card-notowned'}`}
                  onClick={() => onToggleCard(card.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={card.owned} 
                        onChange={() => onToggleCard(card.id)}
                        className="h-4 w-4 text-primary-color rounded focus:ring-primary-color"
                      />
                      <div className="ml-3">
                        <div className="font-medium">{card.name}</div>
                        <div className="text-sm text-text-secondary">
                          <span className={`inline-block w-2 h-2 rounded-full ${getRarityColorClass(card.rarity)} mr-1`}></span>
                          {card.rarity} • #{card.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-12 h-12 flex items-center justify-center ${getRarityColorClass(card.rarity)} rounded`}>
                      <span className="text-xs text-gray-700">Card Art</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-lg text-text-secondary">
            No cards match your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </>
  );
};

export default CardCollection;