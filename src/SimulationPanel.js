import React, { useState, useCallback, useEffect, useRef } from 'react';

// Numarow - Player Screen: Setup & Showdown
// Chrome grid, overlay player list, heartbeat timer

function SimulationPanel() {
  // === GAME CONFIG ===
  const [gridSize, setGridSize] = useState(5);
  const [numPlayers, setNumPlayers] = useState(4);
  const [isHumanPlayer, setIsHumanPlayer] = useState(true);
  const [budget, setBudget] = useState(40);
  
  // === SCREEN STATE ===
  const [screen, setScreen] = useState('config'); // config, setup, showdown
  const [showPlayerOverlay, setShowPlayerOverlay] = useState(false);
  
  // === MATCH STATE ===
  const [playerGrids, setPlayerGrids] = useState([]);
  const [playerStrategies, setPlayerStrategies] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [playerReady, setPlayerReady] = useState([]);
  const [scores, setScores] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [matchLog, setMatchLog] = useState([]);
  
  // === HUMAN PLAYER STATE ===
  const [humanGrid, setHumanGrid] = useState([]);
  const [humanBudgetSpent, setHumanBudgetSpent] = useState(0);
  const [countdown, setCountdown] = useState(35);
  const [humanReady, setHumanReady] = useState(false);
  const [heartbeatSpeed, setHeartbeatSpeed] = useState(1); // 1 = normal, increases
  const countdownRef = useRef(null);
  const audioRef = useRef(null);

  // === STRATEGIES ===
  const strategies = {
    spread: 'Spread',
    cluster: 'Cluster', 
    aggressive: 'Aggressive',
    defensive: 'Defensive',
    random: 'Random',
  };

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
        names.push(shuffled[i] || `Bot${i}`);
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

  // === AI STRATEGY EXECUTION ===
  
  const executeStrategy = useCallback((strategy, gridSize, totalBudget) => {
    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    let remaining = totalBudget;
    
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        cells.push({ r, c });
      }
    }

    const getValidVals = (g, r, c, rem) => {
      const valid = [0];
      for (let v = 1; v <= 5; v++) {
        if (v <= rem && !g.map(row => row[c]).includes(v)) valid.push(v);
      }
      return valid;
    };

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
      default:
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => valid[Math.floor(Math.random() * valid.length)];
    }

    for (const { r, c } of orderedCells) {
      if (remaining <= 0) break;
      const valid = getValidVals(grid, r, c, remaining);
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
  
  const calculateScores = useCallback((grids, names) => {
    const numP = grids.length;
    const size = grids[0].length;
    const playerScores = Array(numP).fill(0);

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

    // Create rankings
    const ranked = playerScores.map((score, idx) => ({
      idx,
      name: names[idx],
      score,
      grid: grids[idx]
    })).sort((a, b) => b.score - a.score);

    // Assign places (handling ties)
    let place = 1;
    ranked.forEach((p, i) => {
      if (i > 0 && p.score < ranked[i-1].score) {
        place = i + 1;
      }
      p.place = place;
    });

    return { scores: playerScores, rankings: ranked };
  }, []);

  // === COUNTDOWN & HEARTBEAT ===
  
  useEffect(() => {
    if (screen === 'setup' && isHumanPlayer && !humanReady) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleHumanReady();
            return 0;
          }
          
          // Heartbeat speeds up as time decreases
          if (prev <= 5) {
            setHeartbeatSpeed(3); // Very fast
          } else if (prev <= 10) {
            setHeartbeatSpeed(2); // Fast
          } else if (prev <= 20) {
            setHeartbeatSpeed(1.5); // Medium
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [screen, isHumanPlayer, humanReady]);

  // AI ready progression
  useEffect(() => {
    if (screen === 'setup' && playerReady.length > 0) {
      const aiIndexes = playerReady.map((ready, idx) => ({ idx, ready }))
        .filter(p => p.idx > 0 || !isHumanPlayer)
        .filter(p => !p.ready);
      
      if (aiIndexes.length > 0) {
        const randomDelay = 1500 + Math.random() * 6000;
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
  }, [screen, playerReady, isHumanPlayer]);

  // All ready check
  useEffect(() => {
    if (screen === 'setup' && playerReady.length > 0 && playerReady.every(r => r)) {
      setTimeout(() => triggerShowdown(), 800);
    }
  }, [playerReady, screen]);

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

    const grids = strats.map((strat) => {
      if (strat === 'human') {
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
      }
      return executeStrategy(strat, gridSize, budget);
    });

    setPlayerGrids(grids);
    
    if (isHumanPlayer) {
      setHumanGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)));
      setHumanBudgetSpent(0);
      setHumanReady(false);
      setCountdown(35);
      setHeartbeatSpeed(1);
    }
    
    setScreen('setup');
    setScores([]);
    setRankings([]);
    setShowPlayerOverlay(false);
    setMatchLog([`${numPlayers} players, ${gridSize}×${gridSize}, ${budget} budget`]);
  }, [numPlayers, gridSize, budget, isHumanPlayer, executeStrategy, generatePlayerNames]);

  const handleCellClick = (row, col) => {
    if (!isHumanPlayer || humanReady || screen !== 'setup') return;
    
    const currentValue = humanGrid[row][col];
    const remaining = budget - humanBudgetSpent + currentValue;
    
    let nextValue = (currentValue + 1) % 6;
    let attempts = 0;
    
    while (attempts < 6) {
      if (nextValue === 0) break;
      if (nextValue <= remaining && canPlace(humanGrid, row, col, nextValue)) break;
      nextValue = (nextValue + 1) % 6;
      attempts++;
    }
    
    if (attempts >= 6) nextValue = 0;
    
    const newGrid = humanGrid.map((r, ri) => 
      r.map((c, ci) => (ri === row && ci === col) ? nextValue : c)
    );
    
    setHumanGrid(newGrid);
    setHumanBudgetSpent(newGrid.flat().reduce((sum, v) => sum + v, 0));
  };

  const handleHumanReady = useCallback(() => {
    if (humanReady) return;
    
    setHumanReady(true);
    setHeartbeatSpeed(0); // SILENT
    setPlayerReady(prev => {
      const next = [...prev];
      next[0] = true;
      return next;
    });
    
    setPlayerGrids(prev => {
      const next = [...prev];
      next[0] = humanGrid;
      return next;
    });
  }, [humanReady, humanGrid]);

  const triggerShowdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setHeartbeatSpeed(0);
    
    // Brief pause then showdown
    setScreen('showdown');
    
    setTimeout(() => {
      const { scores: finalScores, rankings: finalRankings } = calculateScores(playerGrids, playerNames);
      setScores(finalScores);
      setRankings(finalRankings);
    }, 1500);
  }, [playerGrids, playerNames, calculateScores]);

  const resetToConfig = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setScreen('config');
    setPlayerGrids([]);
    setScores([]);
    setRankings([]);
    setHumanGrid([]);
    setHumanBudgetSpent(0);
    setHumanReady(false);
  };

  // Player list font size calculation
  const getPlayerListStyle = () => {
    const baseSize = numPlayers <= 6 ? 1 : numPlayers <= 10 ? 0.9 : numPlayers <= 14 ? 0.8 : 0.7;
    return { fontSize: `${baseSize}rem` };
  };

  // === RENDER: CONFIG SCREEN ===
  if (screen === 'config') {
    return (
      <div className="numarow-app">
        <header className="app-header">
          <h1>Numarow</h1>
          <p className="tagline">Tactical quick-clash for petty cash (possibly)</p>
        </header>

        <div className="rules-box">
          <strong>Rules:</strong> Place 0-5 in cells. Budget limits total. 
          Each 1-5 once per column. Highest unique value wins cell (points = gap). Most points wins.
        </div>

        <div className="config-panel">
          <div className="config-row">
            <label>
              Grid
              <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))}>
                <option value={4}>4×4</option>
                <option value={5}>5×5</option>
                <option value={6}>6×6</option>
              </select>
            </label>

            <label>
              Players
              <select value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))}>
                {[2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <label>
              Budget
              <input 
                type="number" 
                value={budget} 
                onChange={e => setBudget(Number(e.target.value))}
                min={20} max={100}
              />
            </label>
          </div>

          <div className="config-row">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isHumanPlayer} 
                onChange={e => setIsHumanPlayer(e.target.checked)}
              />
              Play as Human
            </label>
            
            <div className="preset-btns">
              {budgetPresets[gridSize] && Object.entries(budgetPresets[gridSize]).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => setBudget(val)}
                  className={budget === val ? 'active' : ''}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startMatch} className="btn-start">
            START MATCH
          </button>
        </div>
      </div>
    );
  }

  // === RENDER: SETUP SCREEN ===
  if (screen === 'setup') {
    const readyCount = playerReady.filter(r => r).length;
    
    return (
      <div className="numarow-app setup-screen">
        {/* Heartbeat indicator (visual - audio to be added) */}
        <div className={`heartbeat-pulse speed-${Math.floor(heartbeatSpeed)}`} />
        
        {/* Top bar */}
        <div className="setup-topbar">
          <div className="timer-display">
            <span className={`timer-num ${countdown <= 10 ? 'urgent' : ''}`}>{countdown}</span>
            <span className="timer-label">sec</span>
          </div>
          
          <div className="ready-count">
            {readyCount}/{numPlayers} Ready
          </div>
          
          <button 
            className="btn-players-tab"
            onClick={() => setShowPlayerOverlay(!showPlayerOverlay)}
          >
            👥 Players
          </button>
        </div>

        {/* Budget Display */}
        <div className="budget-display">
          <div className="budget-num">{budget - humanBudgetSpent}</div>
          <div className="budget-label">points left</div>
        </div>

        {/* THE CHROME GRID */}
        <div className="grid-container">
          <div 
            className={`chrome-grid ${humanReady ? 'locked' : ''}`}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`
            }}
          >
            {humanGrid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`chrome-cell v${cell} ${humanReady ? 'disabled' : ''}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                >
                  <span className="cell-num">{cell}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Done Button */}
        <button 
          className={`btn-done ${humanReady ? 'locked' : ''}`}
          onClick={handleHumanReady}
          disabled={humanReady}
        >
          {humanReady ? '✓ LOCKED' : 'DONE'}
        </button>

        {/* Cancel */}
        <button className="btn-cancel" onClick={resetToConfig}>
          ✕ Cancel
        </button>

        {/* PLAYER OVERLAY */}
        {showPlayerOverlay && (
          <div className="player-overlay" onClick={() => setShowPlayerOverlay(false)}>
            <div className="player-overlay-content" onClick={e => e.stopPropagation()}>
              <h3>Players</h3>
              <div className="player-grid" style={getPlayerListStyle()}>
                {playerNames.map((name, idx) => (
                  <div 
                    key={idx} 
                    className={`player-item ${playerReady[idx] ? 'ready' : 'waiting'}`}
                  >
                    <span className="ready-mark">{playerReady[idx] ? '✓' : '○'}</span>
                    <span className="p-name">{name}</span>
                  </div>
                ))}
              </div>
              <button className="btn-close-overlay" onClick={() => setShowPlayerOverlay(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === RENDER: SHOWDOWN SCREEN ===
  if (screen === 'showdown') {
    return (
      <div className="numarow-app showdown-screen">
        {rankings.length === 0 ? (
          // Pre-reveal animation
          <div className="showdown-intro">
            <div className="showdown-title">SHOWDOWN</div>
            <div className="showdown-subtitle">Revealing grids...</div>
          </div>
        ) : (
          // Results
          <div className="results-container">
            <h2 className="results-title">RESULTS</h2>
            
            {/* Winner announcement */}
            <div className="winner-announce">
              {rankings[0].place === rankings[1]?.place 
                ? `TIE! ${rankings.filter(r => r.place === 1).map(r => r.name).join(' & ')}`
                : `🏆 ${rankings[0].name} WINS!`
              }
            </div>
            
            {/* Rankings with thumbnails */}
            <div className="rankings-grid">
              {rankings.map((player, idx) => (
                <div 
                  key={player.idx}
                  className={`rank-card ${player.place === 1 ? 'winner' : ''} ${player.name === 'You' ? 'is-you' : ''}`}
                >
                  <div className="rank-header">
                    <span className="rank-place">#{player.place}</span>
                    <span className="rank-name">{player.name}</span>
                    <span className="rank-score">{player.score} pts</span>
                  </div>
                  <div className="rank-strategy">{playerStrategies[player.idx]}</div>
                  <div 
                    className="thumb-grid"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`
                    }}
                  >
                    {player.grid.flat().map((cell, i) => (
                      <div key={i} className={`thumb-cell v${cell}`}>{cell}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="results-actions">
              <button onClick={startMatch} className="btn-again">
                Play Again
              </button>
              <button onClick={resetToConfig} className="btn-setup">
                New Setup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SimulationPanel;
