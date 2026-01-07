import React, { useState, useCallback, useEffect } from 'react';

// Simulation Control Panel for Numarow/GrappleGrid
// Testing AI strategies, scoring outcomes, and game balance

function SimulationPanel() {
  // === GAME CONFIG ===
  const [gridSize, setGridSize] = useState(5);
  const [numPlayers, setNumPlayers] = useState(4);
  const [humanPlayers, setHumanPlayers] = useState([false, false]); // P1, P2 can be human
  const [budget, setBudget] = useState(40); // 40 for tighter strategy on 5x5
  
  // === MATCH STATE ===
  const [matchState, setMatchState] = useState('idle'); // idle, placing, showdown, complete
  const [playerGrids, setPlayerGrids] = useState([]);
  const [playerStrategies, setPlayerStrategies] = useState([]);
  const [scores, setScores] = useState([]);
  const [matchLog, setMatchLog] = useState([]);
  const [winner, setWinner] = useState(null);

  // === STRATEGY PRESETS ===
  const strategies = {
    spread: { name: 'Spread', desc: 'Even distribution across grid' },
    cluster: { name: 'Cluster', desc: 'Group high values together' },
    aggressive: { name: 'Aggressive', desc: 'Max values, corners/edges' },
    defensive: { name: 'Defensive', desc: 'Mid values, center focus' },
    random: { name: 'Random', desc: 'Unpredictable placement' },
    human: { name: 'Human', desc: 'Manual input' }
  };

  // Budget presets by grid size
  const budgetPresets = {
    4: { low: 25, mid: 30, high: 35 },
    5: { low: 35, mid: 40, high: 50 },
    6: { low: 50, mid: 60, high: 70 }
  };

  // === CORE GAME LOGIC ===
  
  // Check if value can be placed (column constraint: 1-5 once per column, 0 unlimited)
  const canPlace = (grid, row, col, value) => {
    if (value === 0) return true;
    const column = grid.map(r => r[col]);
    return !column.includes(value);
  };

  // Get valid values for a cell
  const getValidValues = (grid, row, col, remainingBudget) => {
    const valid = [0];
    for (let v = 1; v <= 5; v++) {
      if (v <= remainingBudget && canPlace(grid, row, col, v)) {
        valid.push(v);
      }
    }
    return valid;
  };

  // Calculate remaining budget
  const getRemainingBudget = (grid, totalBudget) => {
    return totalBudget - grid.flat().reduce((sum, v) => sum + v, 0);
  };

  // === AI STRATEGIES ===
  
  const executeStrategy = useCallback((strategy, gridSize, totalBudget) => {
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    let remaining = totalBudget;
    
    // Get all cells as coordinate pairs
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        cells.push({ r, c });
      }
    }

    // Strategy-specific ordering and value selection
    let orderedCells, valueSelector;

    switch (strategy) {
      case 'spread':
        // Checkerboard-like pattern, prefer middle values
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => valid[Math.floor(valid.length / 2)] || 0;
        break;
      
      case 'cluster':
        // Start from center, expand outward
        const center = Math.floor(gridSize / 2);
        orderedCells = [...cells].sort((a, b) => {
          const distA = Math.abs(a.r - center) + Math.abs(a.c - center);
          const distB = Math.abs(b.r - center) + Math.abs(b.c - center);
          return distA - distB;
        });
        valueSelector = (valid) => Math.max(...valid);
        break;
      
      case 'aggressive':
        // Corners and edges first, max values
        orderedCells = [...cells].sort((a, b) => {
          const edgeA = (a.r === 0 || a.r === gridSize-1 ? 1 : 0) + (a.c === 0 || a.c === gridSize-1 ? 1 : 0);
          const edgeB = (b.r === 0 || b.r === gridSize-1 ? 1 : 0) + (b.c === 0 || b.c === gridSize-1 ? 1 : 0);
          return edgeB - edgeA;
        });
        valueSelector = (valid) => Math.max(...valid);
        break;
      
      case 'defensive':
        // Center focus, mid-range values
        const mid = Math.floor(gridSize / 2);
        orderedCells = [...cells].sort((a, b) => {
          const distA = Math.max(Math.abs(a.r - mid), Math.abs(a.c - mid));
          const distB = Math.max(Math.abs(b.r - mid), Math.abs(b.c - mid));
          return distA - distB;
        });
        valueSelector = (valid) => {
          const filtered = valid.filter(v => v >= 2 && v <= 4);
          return filtered.length > 0 ? filtered[Math.floor(filtered.length / 2)] : valid[Math.floor(valid.length / 2)];
        };
        break;
      
      default: // random
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => valid[Math.floor(Math.random() * valid.length)];
    }

    // Place values following strategy
    for (const { r, c } of orderedCells) {
      if (remaining <= 0) break;
      const valid = getValidValues(grid, r, c, remaining);
      if (valid.length > 1) { // Has non-zero options
        const value = valueSelector(valid.filter(v => v > 0));
        if (value && value <= remaining) {
          grid[r][c] = value;
          remaining -= value;
        }
      }
    }

    return grid;
  }, []);

  // === SCORING ===
  
  const calculateScores = useCallback((grids) => {
    const numPlayers = grids.length;
    const size = grids[0].length;
    const playerScores = Array(numPlayers).fill(0);
    const breakdown = [];

    // Compare each cell across all players
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cellValues = grids.map((g, idx) => ({ player: idx, value: g[r][c] }));
        cellValues.sort((a, b) => b.value - a.value);
        
        // Winner is highest unique value
        const highest = cellValues[0].value;
        const winners = cellValues.filter(cv => cv.value === highest);
        
        if (winners.length === 1 && highest > 0) {
          // Clear winner - gets points equal to gap over second place
          const second = cellValues[1].value;
          const gap = highest - second;
          playerScores[winners[0].player] += gap;
          breakdown.push({
            cell: `${r},${c}`,
            winner: winners[0].player,
            gap,
            values: cellValues.map(cv => cv.value)
          });
        } else {
          // Tie - no points
          breakdown.push({
            cell: `${r},${c}`,
            winner: null,
            gap: 0,
            values: cellValues.map(cv => cv.value)
          });
        }
      }
    }

    return { scores: playerScores, breakdown };
  }, []);

  // === MATCH CONTROLS ===
  
  const startMatch = useCallback(() => {
    // Assign strategies
    const strats = [];
    const stratKeys = Object.keys(strategies).filter(s => s !== 'human');
    
    for (let i = 0; i < numPlayers; i++) {
      if (humanPlayers[i]) {
        strats.push('human');
      } else {
        strats.push(stratKeys[Math.floor(Math.random() * stratKeys.length)]);
      }
    }
    setPlayerStrategies(strats);

    // Generate grids for AI players
    const grids = strats.map((strat, idx) => {
      if (strat === 'human') {
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
      }
      return executeStrategy(strat, gridSize, budget);
    });

    setPlayerGrids(grids);
    setMatchState('placing');
    setScores([]);
    setWinner(null);
    setMatchLog([`Match started: ${numPlayers} players, ${gridSize}×${gridSize} grid, ${budget} budget`]);
  }, [numPlayers, gridSize, budget, humanPlayers, executeStrategy]);

  const triggerShowdown = useCallback(() => {
    setMatchState('showdown');
    setMatchLog(prev => [...prev, 'SHOWDOWN triggered!']);

    // Small delay for drama
    setTimeout(() => {
      const { scores: finalScores, breakdown } = calculateScores(playerGrids);
      setScores(finalScores);
      
      const maxScore = Math.max(...finalScores);
      const winners = finalScores.map((s, i) => s === maxScore ? i : -1).filter(i => i >= 0);
      
      setWinner(winners.length === 1 ? winners[0] : 'tie');
      setMatchState('complete');
      setMatchLog(prev => [
        ...prev,
        `Scores: ${finalScores.map((s, i) => `P${i+1}:${s}`).join(' | ')}`,
        winners.length === 1 ? `Winner: Player ${winners[0] + 1}` : `TIE between players ${winners.map(w => w+1).join(', ')}`
      ]);
    }, 500);
  }, [playerGrids, calculateScores]);

  const interruptMatch = () => {
    setMatchState('idle');
    setMatchLog(prev => [...prev, 'Match interrupted']);
  };

  const resetAll = () => {
    setMatchState('idle');
    setPlayerGrids([]);
    setScores([]);
    setWinner(null);
    setMatchLog([]);
    setPlayerStrategies([]);
  };

  // === RENDER ===
  
  return (
    <div className="simulation-panel">
      <header className="sim-header">
        <h1>Numarow</h1>
        <p className="tagline">Tactical quick-clash for petty cash (possibly)</p>
      </header>

      {/* RULES - Super Simple */}
      <div className="rules-box">
        <strong>Rules:</strong> Place 0-5 in grid cells. Budget limits total. Each 1-5 only once per column. 
        Highest unique value per cell wins (points = gap over 2nd place). Most points wins.
      </div>

      {/* CONTROL PANEL */}
      <div className="control-panel">
        <div className="config-row">
          <label>
            Grid:
            <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))}>
              <option value={4}>4×4</option>
              <option value={5}>5×5 (Main)</option>
              <option value={6}>6×6</option>
            </select>
          </label>

          <label>
            Players:
            <select value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))}>
              {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <label>
            Budget:
            <input 
              type="number" 
              value={budget} 
              onChange={e => setBudget(Number(e.target.value))}
              min={20} max={100}
              style={{width: 60}}
            />
          </label>
        </div>

        <div className="config-row">
          <label>
            <input 
              type="checkbox" 
              checked={humanPlayers[0]} 
              onChange={e => setHumanPlayers([e.target.checked, humanPlayers[1]])}
            />
            P1 Human
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={humanPlayers[1]} 
              onChange={e => setHumanPlayers([humanPlayers[0], e.target.checked])}
            />
            P2 Human
          </label>
          
          <div className="budget-presets">
            {budgetPresets[gridSize] && Object.entries(budgetPresets[gridSize]).map(([key, val]) => (
              <button 
                key={key} 
                onClick={() => setBudget(val)}
                className={budget === val ? 'active' : ''}
              >
                {key}: {val}
              </button>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={startMatch} 
            disabled={matchState === 'placing'}
            className="btn-start"
          >
            ▶ New Match
          </button>
          
          <button 
            onClick={triggerShowdown} 
            disabled={matchState !== 'placing'}
            className="btn-showdown"
          >
            ⚔ SHOWDOWN
          </button>
          
          <button 
            onClick={interruptMatch} 
            disabled={matchState === 'idle'}
            className="btn-interrupt"
          >
            ⏹ Interrupt
          </button>
          
          <button onClick={resetAll} className="btn-reset">
            ↺ Reset
          </button>
        </div>
      </div>

      {/* STRATEGY LEGEND */}
      <div className="strategy-legend">
        <strong>AI Strategies:</strong>
        {Object.entries(strategies).filter(([k]) => k !== 'human').map(([key, s]) => (
          <span key={key} className="strat-tag">{s.name}</span>
        ))}
      </div>

      {/* MATCH STATUS */}
      <div className="match-status">
        <span className={`status-badge ${matchState}`}>
          {matchState === 'idle' && '○ Ready'}
          {matchState === 'placing' && '● Placing...'}
          {matchState === 'showdown' && '⚔ Showdown!'}
          {matchState === 'complete' && '✓ Complete'}
        </span>
      </div>

      {/* RESULTS - Grid Thumbnails */}
      {matchState === 'complete' && (
        <div className="results-section">
          <h3>Match Results</h3>
          
          <div className="player-thumbnails">
            {playerGrids.map((grid, pIdx) => (
              <div 
                key={pIdx} 
                className={`player-thumb ${winner === pIdx ? 'winner' : ''} ${winner === 'tie' && scores[pIdx] === Math.max(...scores) ? 'tied' : ''}`}
              >
                <div className="thumb-header">
                  <span className="player-label">P{pIdx + 1}</span>
                  <span className="strategy-label">{playerStrategies[pIdx]}</span>
                  <span className="score-label">{scores[pIdx]} pts</span>
                </div>
                <div 
                  className="mini-grid"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`
                  }}
                >
                  {grid.flat().map((cell, idx) => (
                    <div key={idx} className={`mini-cell v${cell}`}>
                      {cell}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {winner !== null && (
            <div className="winner-banner">
              {winner === 'tie' 
                ? `TIE! Multiple players with ${Math.max(...scores)} points`
                : `🏆 Player ${winner + 1} wins with ${scores[winner]} points!`
              }
            </div>
          )}
        </div>
      )}

      {/* MATCH LOG */}
      <div className="match-log">
        <strong>Log:</strong>
        <div className="log-entries">
          {matchLog.map((entry, idx) => (
            <div key={idx} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SimulationPanel;
