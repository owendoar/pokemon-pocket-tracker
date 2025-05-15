import React, { useMemo } from 'react';
import { PokemonCardSet } from './cardData';
import { calculateStats } from './cardStats';

interface CollectionStatsProps {
  set: PokemonCardSet;
}

const CollectionStats: React.FC<CollectionStatsProps> = ({ set }) => {
  // Use useMemo to compute stats only when the set's cards change
  const stats = useMemo(() => {
    return calculateStats(set);
  }, [set.cards, set.rarities]); // Dependency on both cards and rarities
  
  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-8 shadow-card">
      <h2 className="text-xl font-semibold mb-4">Collection Statistics</h2>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Cards</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cards Collected</div>
          <div className="stat-value text-green-600">{stats.collected}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cards Missing</div>
          <div className="stat-value text-red-600">{stats.missing}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Collection %</div>
          <div className="stat-value">{stats.collectionPercent}%</div>
        </div>
      </div>
      
      {/* Pack Odds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Pack Odds SOLG</div>
          <div className="stat-value text-blue-600">{stats.newCardOddsSolg}%</div>
          <div className="text-xs text-gray-600 mt-1">Chance of new card per pack</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pack Odds LUNA</div>
          <div className="stat-value text-blue-600">{stats.newCardOddsLuna}%</div>
          <div className="text-xs text-gray-600 mt-1">Chance of new card per pack</div>
        </div>
      </div>
      
      {/* Subset Stats */}
      {set.subsets.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Completion by Subset</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {set.subsets.map(subset => {
              const subsetCards = set.getCardsBySubset(subset);
              const subsetOwned = subsetCards.filter(card => card.owned).length;
              const subsetTotal = subsetCards.length;
              const subsetPercent = subsetTotal > 0 ? ((subsetOwned / subsetTotal) * 100).toFixed(1) : '0';
              
              return (
                <div key={subset} className="stat-card text-center">
                  <div className="font-semibold">{subset}</div>
                  <div className="text-lg">{subsetOwned}/{subsetTotal}</div>
                  <div className="text-sm text-gray-600">{subsetPercent}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Rarity Stats */}
      <h3 className="text-lg font-semibold mb-3">Completion by Rarity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {stats.byRarity && Object.entries(stats.byRarity).map(([rarityName, rarityData]) => (
          <div 
            key={rarityName} 
            className={`p-3 rounded ${set.getRarityColor(rarityName)} flex justify-between items-center`}
          >
            <span className="font-medium">{rarityName}</span>
            <div className="text-right">
              <div>{rarityData.collected}/{rarityData.total}</div>
              <div className="text-sm">({rarityData.percent}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionStats;