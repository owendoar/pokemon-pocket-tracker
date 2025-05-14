import React, { useState } from 'react';
import { PokemonCard } from './cardData';
import { PackSimulationResult, simulatePackOpening, simulateMultiplePacks } from './packSimulator';
import { getRarityColorClass } from './cardData';

interface PackSimulatorProps {
  cards: PokemonCard[];
  onAddToCollection: (cards: PokemonCard[]) => void;
}

const PackSimulator: React.FC<PackSimulatorProps> = ({ cards, onAddToCollection }) => {
  const [packSimulation, setPackSimulation] = useState<PackSimulationResult | null>(null);
  const [simulationCount, setSimulationCount] = useState<number>(1);
  
  // Simulate opening a pack
  const handleSimulatePackOpening = (): void => {
    const result = simulatePackOpening(cards);
    setPackSimulation(result);
  };
  
  // Add cards from pack to collection
  const handleAddPackToCollection = (): void => {
    if (!packSimulation) return;
    onAddToCollection(packSimulation.cards);
    setPackSimulation(null);
  };
  
  // Simulate opening multiple packs
  const handleSimulateMultiplePacks = (): void => {
    const count = Math.max(1, Math.min(100, simulationCount));
    const results = simulateMultiplePacks(cards, count);
    
    alert(`Simulation results for ${count} packs:
- Total new cards: ${results.totalNewCards} (avg ${results.avgNewCardsPerPack} per pack)
- Packs with at least one new card: ${results.packsWithNewCards} (${results.successPercentage}%)
- Estimated packs needed for a new card: ${results.estimatedPacksNeeded}`);
  };
  
  return (
    <div className="bg-yellow-50 p-6 rounded-lg mb-8 shadow-card">
      <h2 className="text-xl font-semibold mb-4">Pack Simulator</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={handleSimulatePackOpening}
          className="btn btn-primary flex-1"
        >
          Open a Pack
        </button>
        
        <div className="flex gap-2 flex-1">
          <input
            type="number"
            min="1"
            max="100"
            value={simulationCount}
            onChange={(e) => setSimulationCount(parseInt(e.target.value) || 1)}
            className="w-20 p-2 border border-border-color rounded focus:ring-2 focus:ring-primary-color focus:border-primary-color"
          />
          <button
            onClick={handleSimulateMultiplePacks}
            className="btn btn-primary flex-1"
          >
            Simulate Multiple Packs
          </button>
        </div>
      </div>
      
      {packSimulation && (
        <div className="bg-white p-4 rounded-lg border border-border-color">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pack Results</h3>
            <button
              onClick={handleAddPackToCollection}
              className="btn btn-success text-sm"
            >
              Add These Cards to Collection
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {packSimulation.cards.map((card, index) => (
              <div 
                key={`pack-${index}`}
                className={`pokemon-card ${card.owned ? 'border-gray-300' : 'border-green-500 bg-green-50'}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-full h-32 flex items-center justify-center ${getRarityColorClass(card.rarity)} rounded mb-2`}>
                    <span className="text-sm text-gray-700">{card.id}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{card.name}</div>
                    <div className="text-sm text-text-secondary">
                      {card.rarity} {!card.owned && <span className="text-success-color font-bold">• NEW!</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <span className="font-medium">New cards: </span>
            <span className={packSimulation.newCards > 0 ? "text-success-color font-bold" : ""}>{packSimulation.newCards}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackSimulator;