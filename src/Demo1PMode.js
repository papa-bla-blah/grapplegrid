import React, { useState, useCallback } from 'react';
import GameBoard from './GameBoard';
import ScoreDisplay from './ScoreDisplay';
import './Demo1PMode.css';

function Demo1PMode() {
  const [screen, setScreen] = useState('setup'); // setup, playing, results
  const [numAI, setNumAI] = useState(3);
  const [gridSize] = useState(5);
  const [budget] = useState(40);
  
  const [humanGrid, setHumanGrid] = useState([]);
  const [aiGrids, setAiGrids] = useState([]);
  const [scores, setScores] = useState([]);
  const [breakdown, setBreakdown] = useState(null);

  const initializeGrid = () => {
    return Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  };

  const startGame = () => {
    setHumanGrid(initializeGrid());
    setScreen('playing');
  };

  const isValidPlacement = useCallback((row, col, value, grid) => {
    const testGrid = grid || humanGrid;
    
    if (value === 0) return true;
    
    const column = testGrid.map(r => r[col]);
    const alreadyHasValue = column.some((v, idx) => idx !== row && v === value);
    
    return !alreadyHasValue;
  }, [humanGrid]);

  const handleCellUpdate = (row, col, value) => {
    const newGrid = humanGrid.map((r, rIdx) => 
      r.map((c, cIdx) => (rIdx === row && cIdx === col) ? value : c)
    );
    setHumanGrid(newGrid);
  };

  const getBudgetUsed = (grid) => {
    return grid.flat().reduce((sum, val) => sum + val, 0);
  };

  const canSubmit = () => {
    return getBudgetUsed(humanGrid) === budget;
  };

  const generateAIGrid = (strategy) => {
    let grid = initializeGrid();
    let remaining = budget;

    while (remaining > 0) {
      const validCells = [];
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (grid[row][col] === 0) {
            const column = grid.map(r => r[col]);
            const used = new Set(column.filter(v => v > 0));
            const valid = [1, 2, 3, 4, 5].filter(v => !used.has(v) && v <= remaining);
            
            if (valid.length > 0) {
              validCells.push({ row, col, valid });
            }
          }
        }
      }
      
      if (validCells.length === 0) break;
      
      const cell = validCells[Math.floor(Math.random() * validCells.length)];
      let value;
      
      if (strategy === 'aggressive') {
        value = Math.max(...cell.valid);
      } else if (strategy === 'defensive') {
        value = Math.min(...cell.valid);
      } else if (strategy === 'balanced') {
        value = cell.valid[Math.floor(cell.valid.length / 2)];
      } else { // unpredictable
        value = cell.valid[Math.floor(Math.random() * cell.valid.length)];
      }
      
      grid[cell.row][cell.col] = value;
      remaining -= value;
    }
    
    return grid;
  };

  const calculateScores = (allGrids) => {
    const numPlayers = allGrids.length;
    const playerScores = Array(numPlayers).fill(0);
    const cellBreakdown = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const values = allGrids.map(g => g[row][col]);
        const max = Math.max(...values);
        
        if (max === 0) {
          cellBreakdown.push({ row, col, winner: null, gap: 0, values });
          continue;
        }
        
        const winners = values
          .map((v, idx) => ({ value: v, player: idx }))
          .filter(p => p.value === max);
        
        if (winners.length === 1) {
          const sorted = values.filter(v => v > 0).sort((a, b) => b - a);
          const gap = sorted.length > 1 ? sorted[0] - sorted[1] : sorted[0];
          
          playerScores[winners[0].player] += gap;
          cellBreakdown.push({ 
            row, col, 
            winner: winners[0].player, 
            gap, 
            values 
          });
        } else {
          cellBreakdown.push({ row, col, winner: null, gap: 0, values });
        }
      }
    }
    
    return { scores: playerScores, breakdown: cellBreakdown };
  };

  const handleSubmit = () => {
    // Generate AI grids
    const strategies = ['aggressive', 'defensive', 'balanced', 'unpredictable'];
    const aiGridList = [];
    
    for (let i = 0; i < numAI; i++) {
      const strategy = strategies[i % strategies.length];
      aiGridList.push(generateAIGrid(strategy));
    }
    
    setAiGrids(aiGridList);
    
    // Calculate scores
    const allGrids = [humanGrid, ...aiGridList];
    const result = calculateScores(allGrids);
    
    setScores(result.scores);
    setBreakdown(result.breakdown);
    setScreen('results');
  };

  const handlePlayAgain = () => {
    setHumanGrid([]);
    setAiGrids([]);
    setScores([]);
    setBreakdown(null);
    setScreen('setup');
  };

  // Setup Screen
  if (screen === 'setup') {
    return (
      <div className="demo-1p-setup">
        <h1>NUMBAROW</h1>
        <h2>Single Player Mode</h2>
        
        <div className="setup-panel">
          <div className="setting">
            <label>Grid Size:</label>
            <div className="value">5×5</div>
          </div>
          
          <div className="setting">
            <label>Budget:</label>
            <div className="value">{budget} points</div>
          </div>
          
          <div className="setting">
            <label>AI Opponents:</label>
            <div className="ai-selector">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  className={numAI === n ? 'selected' : ''}
                  onClick={() => setNumAI(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button className="start-btn" onClick={startGame}>
          START GAME
        </button>
        
        <div className="rules">
          <h3>Quick Rules:</h3>
          <ul>
            <li>Place numbers 0-5 on the grid</li>
            <li>Column rule: 1-5 only once per column (0 unlimited)</li>
            <li>Spend exactly {budget} points</li>
            <li>Click to cycle values or right-click for radial menu</li>
            <li>Highest value wins each cell, score = gap</li>
          </ul>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (screen === 'playing') {
    const budgetUsed = getBudgetUsed(humanGrid);
    const budgetRemaining = budget - budgetUsed;

    return (
      <div className="demo-1p-playing">
        <div className="game-header">
          <h2>Your Turn</h2>
          <div className="opponent-count">vs {numAI} AI Opponents</div>
        </div>
        
        <div className="budget-display">
          <div className="budget-bar">
            <div 
              className="budget-fill"
              style={{ width: `${(budgetUsed / budget) * 100}%` }}
            />
          </div>
          <div className="budget-text">
            <span className="used">{budgetUsed}</span> / {budget} points
            <span className={`remaining ${budgetRemaining === 0 ? 'complete' : ''}`}>
              ({budgetRemaining} remaining)
            </span>
          </div>
        </div>

        <GameBoard
          grid={humanGrid}
          gridSize={gridSize}
          onCellUpdate={handleCellUpdate}
          isValidPlacement={(row, col, value) => isValidPlacement(row, col, value, humanGrid)}
        />

        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!canSubmit()}
        >
          {canSubmit() ? 'SUBMIT GRID' : `Need ${budgetRemaining} more points`}
        </button>
      </div>
    );
  }

  // Results Screen
  if (screen === 'results') {
    const playerNames = ['You', ...Array(numAI).fill(0).map((_, i) => `AI ${i + 1}`)];
    const rankedPlayers = scores
      .map((score, idx) => ({ player: idx, score, name: playerNames[idx] }))
      .sort((a, b) => b.score - a.score);

    const winner = rankedPlayers[0];
    const youRank = rankedPlayers.findIndex(p => p.player === 0) + 1;

    return (
      <div className="demo-1p-results">
        <div className="result-header">
          <h1>{winner.player === 0 ? '🏆 YOU WIN! 🏆' : '😞 YOU LOST'}</h1>
          <div className="rank">You placed #{youRank} of {numAI + 1}</div>
        </div>

        <div className="scoreboard">
          <h3>Final Scores</h3>
          {rankedPlayers.map((p, idx) => (
            <div key={p.player} className={`score-row ${p.player === 0 ? 'you' : ''}`}>
              <span className="rank-num">#{idx + 1}</span>
              <span className="player-name">{p.name}</span>
              <span className="score">{p.score} pts</span>
            </div>
          ))}
        </div>

        <div className="grid-comparison">
          <h3>Grid Comparison</h3>
          <div className="grids-row">
            <div className="grid-preview">
              <h4>Your Grid</h4>
              <div className="mini-grid">
                {humanGrid.map((row, rIdx) => (
                  <div key={rIdx} className="mini-row">
                    {row.map((cell, cIdx) => (
                      <div key={cIdx} className="mini-cell">{cell}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {aiGrids.slice(0, 3).map((grid, idx) => (
              <div key={idx} className="grid-preview">
                <h4>AI {idx + 1}</h4>
                <div className="mini-grid">
                  {grid.map((row, rIdx) => (
                    <div key={rIdx} className="mini-row">
                      {row.map((cell, cIdx) => (
                        <div key={cIdx} className="mini-cell">{cell}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-actions">
          <button className="play-again-btn" onClick={handlePlayAgain}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default Demo1PMode;
