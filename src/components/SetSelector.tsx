import React from 'react';

interface SetSelectorProps {
  currentSetId: string;
  setOptions: {id: string, name: string}[];
  onSetChange: (setId: string) => void;
  isSyncing: boolean;
  lastSyncTime: string;
  onManualSync: () => void;
  isConnected: boolean;
}

const SetSelector: React.FC<SetSelectorProps> = ({
  currentSetId,
  setOptions,
  onSetChange,
  isSyncing,
  lastSyncTime,
  onManualSync,
  isConnected
}) => {
  if (setOptions.length <= 1) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Set
          </label>
          <select
            value={currentSetId}
            onChange={(e) => onSetChange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
          >
            {setOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Sync Status</div>
            <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
              {isConnected ? '✓ Connected' : '⚠ Offline'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-600">Last Sync</div>
            <div className="font-medium">{lastSyncTime}</div>
          </div>
          
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetSelector;