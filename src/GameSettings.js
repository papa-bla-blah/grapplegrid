import React from 'react';

function GameSettings({ settings, onSettingsChange, onStartGame }) {
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const presets = [
    { name: 'Tutorial (3x3)', gridSize: 3, budget: 20 },
    { name: 'Training (4x4)', gridSize: 4, budget: 35 },
    { name: 'Standard (5x5)', gridSize: 5, budget: 50 },
    { name: 'Advanced (6x6)', gridSize: 6, budget: 70 },
  ];

  return (
    <div className="game-settings">
      <h2>Game Configuration</h2>
      
      <div className="settings-grid">
        <div className="setting-group">
          <label>Grid Size:</label>
          <input 
            type="number" 
            min="3" 
            max="6" 
            value={settings.gridSize}
            onChange={(e) => updateSetting('gridSize', parseInt(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label>Budget:</label>
          <input 
            type="number" 
            min="10" 
            max="100" 
            value={settings.budget}
            onChange={(e) => updateSetting('budget', parseInt(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label>Number of Players:</label>
          <input 
            type="number" 
            min="2" 
            max="8" 
            value={settings.numPlayers}
            onChange={(e) => updateSetting('numPlayers', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="presets">
        <h3>Quick Presets:</h3>
        <div className="preset-buttons">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                updateSetting('gridSize', preset.gridSize);
                updateSetting('budget', preset.budget);
              }}
              className="preset-btn"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <button className="start-game-btn" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  );
}

export default GameSettings;
