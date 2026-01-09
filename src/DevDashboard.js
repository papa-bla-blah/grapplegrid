import React, { useState, useCallback, useRef } from 'react';

// =============================================================
// NUMAROW DEV DASHBOARD CONTROLS v1.2
// Testing, debugging, and simulation tool
// =============================================================

function DevDashboard() {
  // === BOARD CONFIG ===
  const [gridRows, setGridRows] = useState(5);
  const [gridCols, setGridCols] = useState(5);
  const [setsPerMatch, setSetsPerMatch] = useState(1);
  const [matchesPerSession, setMatchesPerSession] = useState(1);
  const [totalBudget, setTotalBudget] = useState(40);
  
  // === PLAYER CONFIG ===
  const [numPlayers, setNumPlayers] = useState(4);
  const [player1Human, setPlayer1Human] = useState(false);
  
  // === STRATEGY DISTRIBUTION (percentages, must total 100) ===
  const [strategyDist, setStrategyDist] = useState({
    aggressive: 20,    // All out
    defensive: 20,     // Conservative
    minmax: 20,        // Min/Max risk
    balanced: 20,      // Balance spread
    unpredictable: 20  // Pretend to be human
  });
  
  // === SIMULATION STATE ===
  const [simState, setSimState] = useState('idle'); // idle, generating, ready, showdown, complete
  const [progress, setProgress] = useState(0);
  const [playerData, setPlayerData] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showMath, setShowMath] = useState(false);
  const [mathLog, setMathLog] = useState([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  
  const progressRef = useRef(null);

  // === STRATEGY DEFINITIONS ===
  const strategyInfo = {
    aggressive: { name: 'Aggressive', desc: 'All out - max values, edges/corners', color: '#ff4757' },
    defensive: { name: 'Defensive', desc: 'Conservative - mid values, center focus', color: '#3498db' },
    minmax: { name: 'Min/Max', desc: 'Risk strategy - extremes only (0,1,5)', color: '#9b59b6' },
    balanced: { name: 'Balanced', desc: 'Even spread across grid', color: '#2ecc71' },
    unpredictable: { name: 'Unpredictable', desc: 'Pretend to be human - erratic', color: '#f39c12' }
  };

  // === STRATEGY DISTRIBUTION HANDLERS ===
  const updateStrategyDist = (key, value) => {
    const newVal = Math.max(0, Math.min(100, parseInt(value) || 0));
    const newDist = { ...strategyDist, [key]: newVal };
    
    // Calculate total
    const total = Object.values(newDist).reduce((a, b) => a + b, 0);
    
    // If total !== 100, we'll show warning but allow it
    setStrategyDist(newDist);
  };

  const autoBalanceStrategies = () => {
    const keys = Object.keys(strategyDist);
    const perStrategy = Math.floor(100 / keys.length);
    const remainder = 100 - (perStrategy * keys.length);
    
    const newDist = {};
    keys.forEach((key, idx) => {
      newDist[key] = perStrategy + (idx === 0 ? remainder : 0);
    });
    setStrategyDist(newDist);
  };

  const getStrategyTotal = () => {
    return Object.values(strategyDist).reduce((a, b) => a + b, 0);
  };

  // === CORE GAME LOGIC ===
  
  const canPlace = (grid, row, col, value) => {
    if (value === 0) return true;
    const column = grid.map(r => r[col]);
    return !column.includes(value);
  };

  const getValidValues = (grid, row, col, remainingBudget, gridCols) => {
    const valid = [0];
    for (let v = 1; v <= 5; v++) {
      if (v <= remainingBudget && canPlace(grid, row, col, v)) {
        valid.push(v);
      }
    }
    return valid;
  };

  // === AI STRATEGY IMPLEMENTATIONS ===
  
  const executeStrategy = useCallback((strategy, rows, cols, budget) => {
    let grid = Array(rows).fill(null).map(() => Array(cols).fill(0));
    let remaining = budget;
    
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ r, c });
      }
    }

    const getValid = (g, r, c, rem) => {
      const valid = [0];
      for (let v = 1; v <= 5; v++) {
        if (v <= rem && !g.map(row => row[c]).includes(v)) valid.push(v);
      }
      return valid;
    };

    let orderedCells, valueSelector;

    switch (strategy) {
      case 'aggressive':
        // Corners and edges first, always max values
        orderedCells = [...cells].sort((a, b) => {
          const edgeA = (a.r === 0 || a.r === rows-1 ? 1 : 0) + (a.c === 0 || a.c === cols-1 ? 1 : 0);
          const edgeB = (b.r === 0 || b.r === rows-1 ? 1 : 0) + (b.c === 0 || b.c === cols-1 ? 1 : 0);
          return edgeB - edgeA;
        });
        valueSelector = (valid) => Math.max(...valid);
        break;

      case 'defensive':
        // Center first, prefer 2-4 values
        const centerR = Math.floor(rows / 2);
        const centerC = Math.floor(cols / 2);
        orderedCells = [...cells].sort((a, b) => {
          const distA = Math.abs(a.r - centerR) + Math.abs(a.c - centerC);
          const distB = Math.abs(b.r - centerR) + Math.abs(b.c - centerC);
          return distA - distB;
        });
        valueSelector = (valid) => {
          const mid = valid.filter(v => v >= 2 && v <= 4);
          return mid.length > 0 ? mid[Math.floor(mid.length / 2)] : valid[Math.floor(valid.length / 2)];
        };
        break;

      case 'minmax':
        // Only use 0, 1, or 5 - high risk
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => {
          if (valid.includes(5)) return 5;
          if (valid.includes(1)) return 1;
          return 0;
        };
        break;

      case 'balanced':
        // Even spread, use all values proportionally
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => valid[Math.floor(valid.length / 2)] || 0;
        break;

      case 'unpredictable':
      default:
        // Erratic - random delays in logic, occasional "mistakes"
        orderedCells = [...cells].sort(() => Math.random() - 0.5);
        valueSelector = (valid) => {
          // Sometimes pick suboptimal
          if (Math.random() < 0.3 && valid.length > 2) {
            return valid[Math.floor(Math.random() * (valid.length - 1))]; // Not always max
          }
          return valid[Math.floor(Math.random() * valid.length)];
        };
        break;
    }

    for (const { r, c } of orderedCells) {
      if (remaining <= 0) break;
      const valid = getValid(grid, r, c, remaining);
      if (valid.length > 1) {
        const value = valueSelector(valid.filter(v => v > 0));
        if (value && value <= remaining) {
          grid[r][c] = value;
          remaining -= value;
        }
      }
    }

    return { grid, spent: budget - remaining };
  }, []);

  // === ASSIGN STRATEGIES TO PLAYERS ===
  
  const assignStrategies = useCallback(() => {
    const strategies = [];
    const total = getStrategyTotal();
    
    if (total !== 100) {
      console.warn('Strategy distribution does not equal 100%');
    }

    // Calculate how many players per strategy
    const distribution = {};
    let assigned = 0;
    const stratKeys = Object.keys(strategyDist);
    
    stratKeys.forEach((key, idx) => {
      const count = Math.round((strategyDist[key] / 100) * numPlayers);
      distribution[key] = count;
      assigned += count;
    });

    // Adjust for rounding errors
    while (assigned < numPlayers) {
      const key = stratKeys[assigned % stratKeys.length];
      distribution[key]++;
      assigned++;
    }
    while (assigned > numPlayers) {
      for (const key of stratKeys) {
        if (distribution[key] > 0) {
          distribution[key]--;
          assigned--;
          break;
        }
      }
    }

    // Build strategy array
    for (const [strat, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        strategies.push(strat);
      }
    }

    // Shuffle
    return strategies.sort(() => Math.random() - 0.5);
  }, [strategyDist, numPlayers]);

  // === SCORING WITH MATH LOG ===
  
  const calculateScoresWithMath = useCallback((players, setIndex, matchIndex) => {
    const math = [];
    const rows = players[0].grid.length;
    const cols = players[0].grid[0].length;
    const scores = Array(players.length).fill(0);

    math.push(`\n${'='.repeat(60)}`);
    math.push(`SET ${setIndex + 1}, MATCH ${matchIndex + 1} - SCORING BREAKDOWN`);
    math.push(`${'='.repeat(60)}`);
    math.push(`Players: ${players.map(p => p.name).join(', ')}`);
    math.push(`Grid: ${rows}×${cols}, Budget: ${totalBudget}`);
    math.push('');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellValues = players.map((p, idx) => ({
          playerIdx: idx,
          name: p.name,
          value: p.grid[r][c]
        }));

        // Sort by value descending
        const sorted = [...cellValues].sort((a, b) => b.value - a.value);
        const highest = sorted[0].value;
        const winners = sorted.filter(cv => cv.value === highest);

        math.push(`Cell [${r},${c}]:`);
        math.push(`  Values: ${cellValues.map(cv => `${cv.name}=${cv.value}`).join(', ')}`);

        if (winners.length === 1 && highest > 0) {
          const second = sorted[1].value;
          const gap = highest - second;
          scores[winners[0].playerIdx] += gap;
          
          math.push(`  Winner: ${winners[0].name} (${highest})`);
          math.push(`  Second: ${sorted[1].name} (${second})`);
          math.push(`  Gap: ${highest} - ${second} = ${gap} points`);
          math.push(`  ${winners[0].name} score += ${gap}`);
        } else if (winners.length > 1) {
          math.push(`  TIE: ${winners.map(w => w.name).join(', ')} all have ${highest}`);
          math.push(`  No points awarded (tie)`);
        } else {
          math.push(`  All zeros - no points`);
        }
        math.push('');
      }
    }

    math.push(`${'─'.repeat(40)}`);
    math.push(`FINAL SCORES:`);
    players.forEach((p, idx) => {
      math.push(`  ${p.name}: ${scores[idx]} points`);
    });
    
    const maxScore = Math.max(...scores);
    const winners = players.filter((_, idx) => scores[idx] === maxScore);
    math.push('');
    if (winners.length === 1) {
      math.push(`🏆 WINNER: ${winners[0].name} with ${maxScore} points`);
    } else {
      math.push(`🤝 TIE: ${winners.map(w => w.name).join(' & ')} with ${maxScore} points`);
    }
    math.push(`${'='.repeat(60)}\n`);

    return { scores, math };
  }, [totalBudget]);

  // === GENERATE AI PLAYERS ===
  
  const generatePlayers = useCallback(async () => {
    setSimState('generating');
    setProgress(0);
    setMathLog([]);
    
    const strategies = assignStrategies();
    const players = [];
    const totalGames = setsPerMatch * matchesPerSession;
    let currentGame = 0;

    // Generate names
    const aiNames = ['Nova', 'Axel', 'Zara', 'Blitz', 'Echo', 'Vex', 'Kira', 'Jolt', 
                     'Raze', 'Flux', 'Nyx', 'Bolt', 'Cipher', 'Dax', 'Ember', 'Frost',
                     'Ghost', 'Havoc', 'Ion', 'Jinx'];
    const shuffledNames = [...aiNames].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numPlayers; i++) {
      const name = (i === 0 && player1Human) ? 'You' : shuffledNames[i] || `Bot${i}`;
      const strategy = (i === 0 && player1Human) ? 'human' : strategies[i];
      
      players.push({
        id: i,
        name,
        strategy,
        grids: [], // Will hold grid for each set/match
        scores: [],
        totalScore: 0
      });

      // Simulate progress
      setProgress(Math.round(((i + 1) / numPlayers) * 30));
      await new Promise(r => setTimeout(r, 50));
    }

    // Generate grids for all sets and matches
    const allResults = [];
    
    for (let match = 0; match < matchesPerSession; match++) {
      const matchData = { sets: [] };
      
      for (let set = 0; set < setsPerMatch; set++) {
        currentGame++;
        
        // Generate grids for this set
        const setGrids = players.map((player, idx) => {
          if (player.strategy === 'human') {
            // Empty grid for human
            return Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));
          }
          const { grid } = executeStrategy(player.strategy, gridRows, gridCols, totalBudget);
          return grid;
        });

        // Store grids
        players.forEach((player, idx) => {
          player.grids.push({ match, set, grid: setGrids[idx] });
        });

        matchData.sets.push({
          setIndex: set,
          grids: setGrids,
          scores: null // Will be calculated during showdown
        });

        setProgress(30 + Math.round((currentGame / totalGames) * 70));
        await new Promise(r => setTimeout(r, 30));
      }
      
      allResults.push(matchData);
    }

    setPlayerData(players);
    setMatchResults(allResults);
    setSimState('ready');
    setProgress(100);
  }, [numPlayers, player1Human, gridRows, gridCols, totalBudget, setsPerMatch, matchesPerSession, assignStrategies, executeStrategy]);

  // === EXECUTE SHOWDOWN ===
  
  const executeShowdown = useCallback(async () => {
    setSimState('showdown');
    setProgress(0);
    
    const allMath = [];
    const totalGames = setsPerMatch * matchesPerSession;
    let currentGame = 0;

    allMath.push('╔══════════════════════════════════════════════════════════╗');
    allMath.push('║          NUMAROW MATH LOG - FULL CALCULATION             ║');
    allMath.push('╚══════════════════════════════════════════════════════════╝');
    allMath.push(`Generated: ${new Date().toISOString()}`);
    allMath.push(`Config: ${gridRows}×${gridCols} grid, ${numPlayers} players, Budget: ${totalBudget}`);
    allMath.push(`Session: ${matchesPerSession} matches × ${setsPerMatch} sets = ${totalGames} games`);
    allMath.push('');

    const updatedResults = [...matchResults];
    const updatedPlayers = [...playerData];

    // Reset scores
    updatedPlayers.forEach(p => {
      p.scores = [];
      p.totalScore = 0;
    });

    for (let match = 0; match < matchesPerSession; match++) {
      for (let set = 0; set < setsPerMatch; set++) {
        currentGame++;
        
        // Get grids for this set
        const playersWithGrids = updatedPlayers.map(p => ({
          ...p,
          grid: p.grids.find(g => g.match === match && g.set === set)?.grid || []
        }));

        // Calculate scores with math
        const { scores, math } = calculateScoresWithMath(playersWithGrids, set, match);
        
        if (showMath) {
          allMath.push(...math);
        }

        // Store scores
        updatedResults[match].sets[set].scores = scores;
        scores.forEach((score, idx) => {
          updatedPlayers[idx].scores.push({ match, set, score });
          updatedPlayers[idx].totalScore += score;
        });

        setProgress(Math.round((currentGame / totalGames) * 100));
        await new Promise(r => setTimeout(r, 100));
      }
    }

    // Final summary
    allMath.push('\n' + '═'.repeat(60));
    allMath.push('FINAL SESSION SUMMARY');
    allMath.push('═'.repeat(60));
    
    const ranked = [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore);
    ranked.forEach((p, idx) => {
      allMath.push(`#${idx + 1} ${p.name} (${p.strategy}): ${p.totalScore} total points`);
    });

    setPlayerData(updatedPlayers);
    setMatchResults(updatedResults);
    setMathLog(allMath);
    setSimState('complete');
  }, [matchResults, playerData, setsPerMatch, matchesPerSession, gridRows, gridCols, numPlayers, totalBudget, showMath, calculateScoresWithMath]);

  // === CONTROLS ===
  
  const handleInterrupt = () => {
    setSimState('idle');
    setProgress(0);
  };

  const handleClearRestart = () => {
    setSimState('idle');
    setProgress(0);
    setPlayerData([]);
    setMatchResults([]);
    setSelectedPlayer(null);
    setMathLog([]);
    setCurrentSet(0);
    setCurrentMatch(0);
  };

  const exportMathLog = () => {
    const blob = new Blob([mathLog.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `numarow_math_log_${Date.now()}.txt`;
    a.click();
  };

  // === RENDER ===
  
  return (
    <div className="dev-dashboard">
      <header className="dev-header">
        <h1>🔧 Dev Dashboard Controls</h1>
        <span className="version">v1.2</span>
      </header>

      <div className="dev-panels">
        {/* LEFT PANEL - Configuration */}
        <div className="panel config-panel">
          <h2>Configuration</h2>
          
          {/* Board Size */}
          <div className="config-section">
            <h3>Board</h3>
            <div className="inline-inputs">
              <input 
                type="number" 
                value={gridRows} 
                onChange={e => setGridRows(Math.max(2, Math.min(9, parseInt(e.target.value) || 5)))}
                min={2} max={9}
              />
              <span>×</span>
              <input 
                type="number" 
                value={gridCols} 
                onChange={e => setGridCols(Math.max(2, Math.min(9, parseInt(e.target.value) || 5)))}
                min={2} max={9}
              />
            </div>
          </div>

          {/* Sets & Matches */}
          <div className="config-section">
            <h3>Games</h3>
            <div className="labeled-inputs">
              <label>
                Sets per Match:
                <input 
                  type="number" 
                  value={setsPerMatch} 
                  onChange={e => setSetsPerMatch(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                  min={1} max={9}
                />
              </label>
              <label>
                Matches:
                <input 
                  type="number" 
                  value={matchesPerSession} 
                  onChange={e => setMatchesPerSession(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                  min={1} max={9}
                />
              </label>
            </div>
            <div className="info-text">
              Total games: {setsPerMatch * matchesPerSession} (max 81)
            </div>
          </div>

          {/* Players */}
          <div className="config-section">
            <h3>Players: {numPlayers}</h3>
            <input 
              type="range" 
              value={numPlayers} 
              onChange={e => setNumPlayers(parseInt(e.target.value))}
              min={1} max={20}
              className="slider"
            />
            <label className="checkbox-row">
              <input 
                type="checkbox" 
                checked={player1Human} 
                onChange={e => setPlayer1Human(e.target.checked)}
              />
              Player 1 is Human
            </label>
          </div>

          {/* Budget */}
          <div className="config-section">
            <h3>Total Budget</h3>
            <input 
              type="number" 
              value={totalBudget} 
              onChange={e => setTotalBudget(Math.max(10, parseInt(e.target.value) || 40))}
              min={10} max={200}
              className="budget-input"
            />
          </div>
        </div>

        {/* CENTER PANEL - Strategies */}
        <div className="panel strategy-panel">
          <h2>Strategy Distribution</h2>
          
          <div className="strategy-list">
            {Object.entries(strategyInfo).map(([key, info]) => (
              <div key={key} className="strategy-row" style={{ borderLeftColor: info.color }}>
                <div className="strat-info">
                  <span className="strat-name">{info.name}</span>
                  <span className="strat-desc">{info.desc}</span>
                </div>
                <div className="strat-input">
                  <input 
                    type="number" 
                    value={strategyDist[key]} 
                    onChange={e => updateStrategyDist(key, e.target.value)}
                    min={0} max={100}
                  />
                  <span>%</span>
                </div>
              </div>
            ))}
          </div>

          <div className={`strategy-total ${getStrategyTotal() !== 100 ? 'invalid' : 'valid'}`}>
            Total: {getStrategyTotal()}% {getStrategyTotal() !== 100 && '(must be 100%)'}
          </div>

          <button className="btn-balance" onClick={autoBalanceStrategies}>
            Auto-Balance (20% each)
          </button>

          {/* Math Toggle */}
          <div className="math-toggle">
            <label className="checkbox-row">
              <input 
                type="checkbox" 
                checked={showMath} 
                onChange={e => setShowMath(e.target.checked)}
              />
              <strong>MATH</strong> - Show all calculations
            </label>
          </div>
        </div>

        {/* RIGHT PANEL - Actions & Results */}
        <div className="panel action-panel">
          <h2>Simulation</h2>

          {/* Control Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-interrupt" 
              onClick={handleInterrupt}
              disabled={simState === 'idle'}
            >
              ⏹ Interrupt
            </button>
            <button className="btn-clear" onClick={handleClearRestart}>
              ↺ Clear/Restart
            </button>
          </div>

          {/* Generate Button */}
          {(simState === 'idle') && (
            <button 
              className="btn-generate"
              onClick={generatePlayers}
              disabled={getStrategyTotal() !== 100}
            >
              🤖 Autoset AI Players
            </button>
          )}

          {/* Progress Bar */}
          {(simState === 'generating' || simState === 'showdown') && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">
                {simState === 'generating' ? 'Generating players...' : 'Calculating scores...'} {progress}%
              </div>
            </div>
          )}

          {/* Showdown Button */}
          {simState === 'ready' && (
            <button className="btn-showdown" onClick={executeShowdown}>
              ⚔️ SHOW DOWN
            </button>
          )}

          {/* Results Summary */}
          {simState === 'complete' && (
            <div className="results-summary">
              <h3>Results</h3>
              <div className="player-list">
                {[...playerData].sort((a, b) => b.totalScore - a.totalScore).map((player, rank) => (
                  <div 
                    key={player.id}
                    className={`player-row ${selectedPlayer === player.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    <span className="rank">#{rank + 1}</span>
                    <span className="name">{player.name}</span>
                    <span className="strategy" style={{ color: strategyInfo[player.strategy]?.color || '#888' }}>
                      {player.strategy}
                    </span>
                    <span className="score">{player.totalScore} pts</span>
                  </div>
                ))}
              </div>

              {showMath && (
                <button className="btn-export" onClick={exportMathLog}>
                  📄 Export Math Log
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM - Selected Player Grid View */}
      {selectedPlayer !== null && simState === 'complete' && (
        <div className="player-detail">
          <h3>
            {playerData[selectedPlayer]?.name}'s Grids
            <button className="btn-close" onClick={() => setSelectedPlayer(null)}>✕</button>
          </h3>
          
          <div className="grid-selector">
            {matchResults.map((match, mIdx) => (
              match.sets.map((set, sIdx) => (
                <button 
                  key={`${mIdx}-${sIdx}`}
                  className={`grid-btn ${currentMatch === mIdx && currentSet === sIdx ? 'active' : ''}`}
                  onClick={() => { setCurrentMatch(mIdx); setCurrentSet(sIdx); }}
                >
                  M{mIdx + 1}S{sIdx + 1}
                </button>
              ))
            ))}
          </div>

          <div className="grid-display">
            <div 
              className="detail-grid"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`
              }}
            >
              {playerData[selectedPlayer]?.grids
                .find(g => g.match === currentMatch && g.set === currentSet)?.grid
                .flat().map((cell, idx) => (
                  <div key={idx} className={`detail-cell v${cell}`}>{cell}</div>
                ))}
            </div>
            <div className="grid-score">
              Score this set: {playerData[selectedPlayer]?.scores
                .find(s => s.match === currentMatch && s.set === currentSet)?.score || 0}
            </div>
          </div>
        </div>
      )}

      {/* MATH LOG DISPLAY */}
      {showMath && mathLog.length > 0 && (
        <div className="math-log-panel">
          <h3>
            Math Log
            <button className="btn-close" onClick={() => setMathLog([])}>✕</button>
          </h3>
          <pre className="math-content">
            {mathLog.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DevDashboard;
