import React, { useState, useCallback, useEffect, useRef } from 'react';

// Numarow Simulation Panel with Human Player Support
// Single-device human play + AI opponents

function SimulationPanel() {
  // === GAME CONFIG ===
  const [gridSize, setGridSize] = useState(5);
  const [numPlayers, setNumPlayers] = useState(4);
  const [isHumanPlayer, setIsHumanPlayer] = useState(false);
  const [budget, setBudget] = useState(40);
  
  // === MATCH STATE ===
  const [matchState, setMatchState] = useState('idle'); // idle, placing, showdown, complete
  const [playerGrids, setPlayerGrids] = useState([]);
  const [playerStrategies, setPlayerStrategies] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [playerReady, setPlayerReady] = useState([]);
  const [scores, setScores] = useState([]);
  const [matchLog, setMatchLog] = useState([]);
  const [winner, setWinner] = useState(null);
  
  // === HUMAN PLAYER STATE ===
  const [humanGrid, setHumanGrid] = useState([]);
  const [humanBudgetSpent, setHumanBudgetSpent] = useState(0);
  const [countdown, setCountdown] = useState(35);
  const [humanReady, setHumanReady] = useState(false);
  const countdownRef = useRef(null);

  // === STRATEGY PRESETS ===
  const strategies = {
    spread: { name: 'Spread', desc: 'Even distribution across grid' },
    cluster: { name: 'Cluster', desc: 'Group high values together' },
    aggressive: { name: 'Aggressive', desc: 'Max values, corners/edges' },
    defensive: { name: 'Defensive', desc: 'Mid values, center focus' },
    random: { name: 'Random', desc: 'Unpredictable placement' },
  };

  // Budget presets by grid size
  const budgetPresets = {
    4: { low: 25, mid: 30, high: 35 },
    5: { low: 35, mid: 40, high: 50 },
    6: { low: 50, mid: 60, high: 70 }
  };

  // Generate player names
  const generatePlayerNames = useCallback((count, humanFirst) => {
    const aiNames = ['Nova', 'Axel', 'Zara', 'Blitz', 'Echo', 'Vex', 'Kira', 'Jolt', 
                     'Raze', 'Flux', 'Nyx', 'Bolt', 'Cipher', 'Dax', 'Ember', 'Frost',
                     'Ghost', 'Havoc', 'Ion', 'Jinx'];
    const shuffled = [...aiNames].sort(() => Math.random() - 0.5);
    const names = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && humanFirst) {
        names.push('You');
      } else {
        names.push(shuffled[i] || `Bot ${i}`);
      }
    }
    return names;
  }, []);

  // === CORE GAME LOGIC ===
  
  const canPlace = (grid, row, col, value) => {
    if (value === 0) return true;
    const column = grid.map(r => r[col]);
    return !column.includes(value);
  };

  const getValidValues = (grid, row, col, remainingBudget) => {
    const valid = [0];
    for (let v = 1; v <= 5; v++) {
      if (v <= remainingBudget && canPlace(grid, row, col, v)) {
        valid.push(v);
      }
    }
    return valid;
  };

  const getRemainingBudget = (grid, totalBudget) => {
    return totalBudget - grid.flat().reduce((sum, v) => sum + v, 0);
  };

  // === AI STRATEGIES ===
  
  const executeStrategy = useCallback((strategy, gridSize, totalBudget) => {
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    let remaining = totalBudget;
    
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        cells.push({ r, c });
      }
    }

    let orderedCells, valueSelector;

    switch (strategy) {
      case 'spread':
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => valid[Math.floor(valid.length / 2)] || 0;
        break;
      
      case 'cluster':
        const center = Math.floor(gridSize / 2);
        orderedCells = [...cells].sort((a, b) => {
          const distA = Math.abs(a.r - center) + Math.abs(a.c - center);
          const distB = Math.abs(b.r - center) + Math.abs(b.c - center);
          return distA - distB;
        });
        valueSelector = (valid) => Math.max(...valid);
        break;
      
      case 'aggressive':
        orderedCells = [...cells].sort((a, b) => {
          const edgeA = (a.r === 0 || a.r === gridSize-1 ? 1 : 0) + (a.c === 0 || a.c === gridSize-1 ? 1 : 0);
          const edgeB = (b.r === 0 || b.r === gridSize-1 ? 1 : 0) + (b.c === 0 || b.c === gridSize-1 ? 1 : 0);
          return edgeB - edgeA;
        });
        valueSelector = (valid) => Math.max(...valid);
        break;
      
      case 'defensive':
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

    for (const { r, c } of orderedCells) {
      if (remaining <= 0) break;
      const valid = getValidValues(grid, r, c, remaining);
      if (valid.length > 1) {
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

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cellValues = grids.map((g, idx) => ({ player: idx, value: g[r][c] }));
        cellValues.sort((a, b) => b.value - a.value);
        
        const highest = cellValues[0].value;
        const winners = cellValues.filter(cv => cv.value === highest);
        
        if (winners.length === 1 && highest > 0) {
          const second = cellValues[1].value;
          const gap = highest - second;
          playerScores[winners[0].player] += gap;
        }
      }
    }

    return { scores: playerScores };
  }, []);

  // === COUNTDOWN TIMER ===
  
  useEffect(() => {
    if (matchState === 'placing' && isHumanPlayer && !humanReady) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleHumanReady(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [matchState, isHumanPlayer, humanReady]);

  // Simulate AI "ready" status progressively
  useEffect(() => {
    if (matchState === 'placing' && playerReady.length > 0) {
      const aiIndexes = playerReady.map((ready, idx) => ({ idx, ready }))
        .filter(p => p.idx > 0 || !isHumanPlayer) // AI players
        .filter(p => !p.ready);
      
      if (aiIndexes.length > 0) {
        const randomDelay = 2000 + Math.random() * 8000; // 2-10 seconds
        const timeout = setTimeout(() => {
          const toReady = aiIndexes[Math.floor(Math.random() * aiIndexes.length)].idx;
          setPlayerReady(prev => {
            const next = [...prev];
            next[toReady] = true;
            return next;
          });
        }, randomDelay);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [matchState, playerReady, isHumanPlayer]);

  // Check if all players ready
  useEffect(() => {
    if (matchState === 'placing' && playerReady.every(r => r)) {
      setTimeout(() => triggerShowdown(), 1000);
    }
  }, [playerReady, matchState]);

  // === MATCH CONTROLS ===
  
  const startMatch = useCallback(() => {
    const names = generatePlayerNames(numPlayers, isHumanPlayer);
    setPlayerNames(names);
    setPlayerReady(Array(numPlayers).fill(false));
    
    const strats = [];
    const stratKeys = Object.keys(strategies);
    
    for (let i = 0; i < numPlayers; i++) {
      if (i === 0 && isHumanPlayer) {
        strats.push('human');
      } else {
        strats.push(stratKeys[Math.floor(Math.random() * stratKeys.length)]);
      }
    }
    setPlayerStrategies(strats);

    // Generate grids for AI players immediately
    const grids = strats.map((strat, idx) => {
      if (strat === 'human') {
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
      }
      return executeStrategy(strat, gridSize, budget);
    });

    setPlayerGrids(grids);
    
    // Human player setup
    if (isHumanPlayer) {
      setHumanGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)));
      setHumanBudgetSpent(0);
      setHumanReady(false);
      setCountdown(35);
    }
    
    setMatchState('placing');
    setScores([]);
    setWinner(null);
    setMatchLog([`Match started: ${numPlayers} players, ${gridSize}×${gridSize} grid, ${budget} budget`]);
  }, [numPlayers, gridSize, budget, isHumanPlayer, executeStrategy, generatePlayerNames]);

  const handleCellClick = (row, col) => {
    if (!isHumanPlayer || humanReady || matchState !== 'placing') return;
    
    const currentValue = humanGrid[row][col];
    const remaining = budget - humanBudgetSpent + currentValue; // Add back current value
    
    // Cycle to next valid value
    let nextValue = (currentValue + 1) % 6;
    let attempts = 0;
    
    while (attempts < 6) {
      if (nextValue === 0) {
        // 0 is always valid
        break;
      }
      if (nextValue <= remaining && canPlace(humanGrid, row, col, nextValue)) {
        break;
      }
      nextValue = (nextValue + 1) % 6;
      attempts++;
    }
    
    if (attempts >= 6) nextValue = 0; // Fallback to 0
    
    const newGrid = humanGrid.map((r, ri) => 
      r.map((c, ci) => (ri === row && ci === col) ? nextValue : c)
    );
    
    setHumanGrid(newGrid);
    setHumanBudgetSpent(newGrid.flat().reduce((sum, v) => sum + v, 0));
  };

  const handleHumanReady = useCallback(() => {
    if (humanReady) return;
    
    setHumanReady(true);
    setPlayerReady(prev => {
      const next = [...prev];
      next[0] = true;
      return next;
    });
    
    // Update the grid with human's choices
    setPlayerGrids(prev => {
      const next = [...prev];
      next[0] = humanGrid;
      return next;
    });
    
    setMatchLog(prev => [...prev, 'You locked in your grid!']);
  }, [humanReady, humanGrid]);

  const triggerShowdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    setMatchState('showdown');
    setMatchLog(prev => [...prev, 'SHOWDOWN!']);

    setTimeout(() => {
      const { scores: finalScores } = calculateScores(playerGrids);
      setScores(finalScores);
      
      const maxScore = Math.max(...finalScores);
      const winners = finalScores.map((s, i) => s === maxScore ? i : -1).filter(i => i >= 0);
      
      setWinner(winners.length === 1 ? winners[0] : 'tie');
      setMatchState('complete');
      setMatchLog(prev => [
        ...prev,
        `Scores: ${finalScores.map((s, i) => `${playerNames[i]}:${s}`).join(' | ')}`,
        winners.length === 1 ? `🏆 ${playerNames[winners[0]]} wins!` : `TIE!`
      ]);
    }, 800);
  }, [playerGrids, calculateScores, playerNames]);

  const interruptMatch = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setMatchState('idle');
    setMatchLog(prev => [...prev, 'Match interrupted']);
  };

  const resetAll = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setMatchState('idle');
    setPlayerGrids([]);
    setScores([]);
    setWinner(null);
    setMatchLog([]);
    setPlayerStrategies([]);
    setHumanGrid([]);
    setHumanBudgetSpent(0);
    setHumanReady(false);
    setCountdown(35);
  };

  // Calculate font size for player list based on count
  const getPlayerFontSize = () => {
    if (numPlayers <= 6) return '1rem';
    if (numPlayers <= 10) return '0.9rem';
    if (numPlayers <= 15) return '0.8rem';
    return '0.7rem';
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

      {/* CONTROL PANEL - Only show when idle */}
      {matchState === 'idle' && (
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
                {[2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n}</option>)}
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
            <label className="human-toggle">
              <input 
                type="checkbox" 
                checked={isHumanPlayer} 
                onChange={e => setIsHumanPlayer(e.target.checked)}
              />
              Play as Human (P1)
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
            <button onClick={startMatch} className="btn-start">
              ▶ New Match
            </button>
          </div>
        </div>
      )}

      {/* GAME AREA - During match */}
      {matchState === 'placing' && (
        <div className="game-area">
          {/* Left side - Player List */}
          <div className="player-list-panel">
            <div className="countdown-display">
              <div className={`countdown-number ${countdown <= 10 ? 'urgent' : ''}`}>
                {countdown}
              </div>
              <div className="countdown-label">seconds</div>
            </div>
            
            <div className="players-list" style={{ fontSize: getPlayerFontSize() }}>
              {playerNames.map((name, idx) => (
                <div 
                  key={idx} 
                  className={`player-row ${playerReady[idx] ? 'ready' : 'waiting'}`}
                >
                  <span className="ready-indicator">
                    {playerReady[idx] ? '✓' : '○'}
                  </span>
                  <span className="player-name">{name}</span>
                  {idx > 0 && <span className="ai-badge">AI</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Center - Human Grid (if human player) */}
          {isHumanPlayer && (
            <div className="human-grid-area">
              <div className="budget-display">
                <div className="budget-remaining">
                  {budget - humanBudgetSpent}
                </div>
                <div className="budget-label">points left</div>
                <div className="budget-bar">
                  <div 
                    className="budget-fill" 
                    style={{ width: `${((budget - humanBudgetSpent) / budget) * 100}%` }}
                  />
                </div>
              </div>

              <div 
                className={`human-grid ${humanReady ? 'locked' : 'active'}`}
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`
                }}
              >
                {humanGrid.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const validValues = getValidValues(humanGrid, rIdx, cIdx, budget - humanBudgetSpent + cell);
                    const hasOptions = validValues.length > 1;
                    
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`grid-cell v${cell} ${hasOptions ? 'has-options' : ''} ${humanReady ? 'disabled' : ''}`}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                      >
                        <span className="cell-value">{cell}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <button 
                className={`btn-ready ${humanReady ? 'done' : ''}`}
                onClick={handleHumanReady}
                disabled={humanReady}
              >
                {humanReady ? '✓ LOCKED IN' : '🔒 DONE - Lock Grid'}
              </button>
            </div>
          )}

          {/* AI Only Mode - Show waiting state */}
          {!isHumanPlayer && (
            <div className="ai-waiting-area">
              <div className="ai-battle-icon">🤖 vs 🤖</div>
              <p>AI Players are placing their numbers...</p>
              <button className="btn-showdown-now" onClick={triggerShowdown}>
                ⚔ Force Showdown Now
              </button>
            </div>
          )}

          {/* Right side - Quick controls */}
          <div className="quick-controls">
            <button onClick={interruptMatch} className="btn-interrupt-small">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* SHOWDOWN ANIMATION */}
      {matchState === 'showdown' && (
        <div className="showdown-screen">
          <div className="showdown-text">⚔ SHOWDOWN ⚔</div>
        </div>
      )}

      {/* RESULTS */}
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
                  <span className="player-label">{playerNames[pIdx]}</span>
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
                : `🏆 ${playerNames[winner]} wins with ${scores[winner]} points!`
              }
            </div>
          )}

          <div className="action-buttons" style={{ marginTop: 20 }}>
            <button onClick={startMatch} className="btn-start">
              ▶ Play Again
            </button>
            <button onClick={resetAll} className="btn-reset">
              ↺ New Setup
            </button>
          </div>
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
