import React, { useState } from 'react';

function ScoreDisplay({ scores, playerGrids, gridSize }) {
  const [showGrids, setShowGrids] = useState(false);

  const winner = scores.indexOf(Math.max(...scores));

  return (
    <div className="score-display">
      <h2>Game Results</h2>
      
      <div className="scores">
        {scores.map((score, idx) => (
          <div 
            key={idx} 
            className={`player-score ${idx === winner ? 'winner' : ''}`}
          >
            <h3>Player {idx + 1}</h3>
            <div className="score-value">{score} points</div>
            {idx === winner && <div className="winner-badge">🏆 Winner!</div>}
          </div>
        ))}
      </div>

      <button 
        className="toggle-grids-btn"
        onClick={() => setShowGrids(!showGrids)}
      >
        {showGrids ? 'Hide' : 'Show'} Player Grids
      </button>

      {showGrids && (
        <div className="all-grids">
          {playerGrids.map((grid, playerIdx) => (
            <div key={playerIdx} className="player-grid-display">
              <h4>Player {playerIdx + 1} Grid</h4>
              <div 
                className="grid-display"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`
                }}
              >
                {grid.map((row, rowIdx) => (
                  row.map((cell, colIdx) => (
                    <div key={`${rowIdx}-${colIdx}`} className="cell-display">
                      {cell}
                    </div>
                  ))
                ))}
              </div>
              <div className="grid-total">
                Total Used: {grid.flat().reduce((sum, val) => sum + val, 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoreDisplay;
