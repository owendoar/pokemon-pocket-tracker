import React from 'react';
import { CollectionStats } from './cardData';
import { RARITIES, getRarityColorClass } from './cardData';

interface CollectionStatsProps {
  stats: CollectionStats;
}

const CollectionStatsComponent: React.FC<CollectionStatsProps> = ({ stats }) => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-8 shadow-card">
      <h2 className="text-xl font-semibold mb-4">Collection Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Cards</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cards Collected</div>
          <div className="stat-value text-success-color">{stats.collected}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cards Missing</div>
          <div className="stat-value text-danger-color">{stats.missing}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Collection %</div>
          <div className="stat-value">{stats.collectionPercent}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pack Odds Solg</div>
          <div className="stat-value text-primary-color">{stats.newCardOddsSolg}%</div>
          <div className="text-xs text-text-secondary mt-1">Chance of new card per pack</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pack Odds Luna</div>
          <div className="stat-value text-primary-color">{stats.newCardOddsLuna}%</div>
          <div className="text-xs text-text-secondary mt-1">Chance of new card per pack</div>
        </div>
      </div>
      
      {/* Rarity Stats */}
      <h3 className="text-lg font-semibold mb-3">Completion by Rarity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {RARITIES.map(rarity => {
          const rarityStats = stats.byRarity[rarity.name] || { total: 0, collected: 0, percent: '0' };
          return (
            <div 
              key={rarity.name} 
              className={`p-2 rounded ${getRarityColorClass(rarity.name)} flex justify-between items-center`}
            >
              <span className="font-medium">{rarity.name}</span>
              <span>
                {rarityStats.collected}/{rarityStats.total} ({rarityStats.percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionStatsComponent;