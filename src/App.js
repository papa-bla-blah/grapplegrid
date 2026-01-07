import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import GameBoard from './GameBoard';
import GameSettings from './GameSettings';
import ScoreDisplay from './ScoreDisplay';
import DataCollector from './DataCollector';

function App() {
  const [gameSettings, setGameSettings] = useState({
    gridSize: 5,
    budget: 50,
    numPlayers: 2,
    aiPlayers: [false, false, false, false],
    gameSpeed: 'normal'
  });

  const [gameState, setGameState] = useState('setup');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerGrids, setPlayerGrids] = useState([]);
  const [scores, setScores] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [rankedWinners, setRankedWinners] = useState([]);

  // Fixed AI placement - finds only valid placements
  const placeRandomCell = useCallback((grid, budget, gridSize, strategy = 'human') => {
    const remaining = budget - grid.flat().reduce((sum, val) => sum + val, 0);
    
    // Find cells that can actually accept values
    const validPlacements = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === 0) {
          const columnValues = grid.map(r => r[col]);
          const usedInColumn = new Set(columnValues.filter(v => v > 0));
          const validValues = [1, 2, 3, 4, 5].filter(v => !usedInColumn.has(v) && v <= remaining);
          
          if (validValues.length > 0) {
            validPlacements.push({ row, col, validValues });
          }
        }
      }
    }
    
    if (validPlacements.length === 0) return grid; // No valid moves
    
    // Pick a random valid placement
    const placement = validPlacements[Math.floor(Math.random() * validPlacements.length)];
    const { row, col, validValues } = placement;
    
    // Choose value based on strategy
    let value;
    if (strategy === 'aggressive') {
      value = Math.max(...validValues);
    } else if (strategy === 'conservative') {
      value = Math.min(...validValues);
    } else { // human-like
      const weights = [0.1, 0.2, 0.3, 0.25, 0.15];
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < validValues.length; i++) {
        cumulative += weights[validValues[i] - 1] || 0.2;
        if (rand <= cumulative) {
          value = validValues[i];
          break;
        }
      }
      value = value || validValues[0];
    }
    
    grid[row][col] = value;
    return grid;
  }, []);

  const executeAITurn = useCallback((playerIndex) => {
    const { budget, gridSize } = gameSettings;
    let grid = JSON.parse(JSON.stringify(playerGrids[playerIndex]));
    const strategies = ['human', 'aggressive', 'conservative'];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    let attempts = 0;
    const maxAttempts = gridSize * gridSize * 2; // Safety limit
    
    while (grid.flat().reduce((sum, val) => sum + val, 0) < budget && attempts < maxAttempts) {
      const oldSum = grid.flat().reduce((sum, val) => sum + val, 0);
      grid = placeRandomCell(grid, budget, gridSize, strategy);
      const newSum = grid.flat().reduce((sum, val) => sum + val, 0);
      
      // If no progress made, no valid moves left
      if (newSum === oldSum) break;
      
      attempts++;
    }
    
    return grid;
  }, [gameSettings, playerGrids, placeRandomCell]);

  const initializeGame = useCallback(() => {
    const { gridSize, numPlayers } = gameSettings;
    const newGrids = Array(numPlayers).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
    );
    setPlayerGrids(newGrids);
    setGameState('setup');
    setCurrentPlayer(0);
    setScores([]);
    setScoreBreakdown(null);
    setRankedWinners([]);
  }, [gameSettings]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameState === 'playing' && gameSettings.aiPlayers[currentPlayer]) {
      const speeds = { slow: 2000, normal: 1000, fast: 300, instant: 50 };
      const delay = speeds[gameSettings.gameSpeed] || 1000;
      
      const timer = setTimeout(() => {
        const aiGrid = executeAITurn(currentPlayer);
        const newGrids = [...playerGrids];
        newGrids[currentPlayer] = aiGrid;
        setPlayerGrids(newGrids);
        
        setTimeout(() => finishPlayerSetup(), delay / 2);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayer, gameSettings, playerGrids, executeAITurn]);

  const calculateRemainingBudget = (playerIndex) => {
    const grid = playerGrids[playerIndex];
    const used = grid.flat().reduce((sum, val) => sum + val, 0);
    return gameSettings.budget - used;
  };

  const isValidPlacement = (playerIndex, row, col, value) => {
    if (value > 0) {
      const column = playerGrids[playerIndex].map(r => r[col]);
      if (column.includes(value) && playerGrids[playerIndex][row][col] !== value) {
        return false;
      }
    }
    
    const currentValue = playerGrids[playerIndex][row][col];
    const budgetChange = value - currentValue;
    const remaining = calculateRemainingBudget(playerIndex);
    
    return remaining - budgetChange >= 0;
  };

  const updateCell = (playerIndex, row, col, value) => {
    if (!isValidPlacement(playerIndex, row, col, value)) return false;
    const newGrids = [...playerGrids];
    newGrids[playerIndex][row][col] = value;
    setPlayerGrids(newGrids);
    return true;
  };

  const finishPlayerSetup = () => {
    if (currentPlayer < gameSettings.numPlayers - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      setGameState('scoring');
      calculateScores();
    }
  };

  const calculateScores = () => {
    const { gridSize, numPlayers } = gameSettings;
    const playerScores = Array(numPlayers).fill(0);
    const cellResults = [];
    const breakdown = Array(numPlayers).fill(null).map(() => ({
      wins: 0,
      totalGap: 0,
      totalScore: 0,
      cellDetails: []
    }));

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellValues = playerGrids.map(grid => grid[row][col]);
        const maxValue = Math.max(...cellValues);
        const winners = cellValues.reduce((acc, val, idx) => {
          if (val === maxValue && val > 0) acc.push(idx);
          return acc;
        }, []);

        if (winners.length === 1) {
          const winnerIdx = winners[0];
          const winnerValue = cellValues[winnerIdx];
          const otherValues = cellValues.filter((_, idx) => idx !== winnerIdx);
          const secondHighest = Math.max(...otherValues, 0);
          const gap = winnerValue - secondHighest;
          const score = gap * gap;
          
          playerScores[winnerIdx] += score;
          breakdown[winnerIdx].wins += 1;
          breakdown[winnerIdx].totalGap += gap;
          breakdown[winnerIdx].totalScore += score;
          breakdown[winnerIdx].cellDetails.push({
            row, col, gap, score, value: winnerValue, secondPlace: secondHighest
          });
          
          cellResults.push({ row, col, winner: winnerIdx, gap, score, values: [...cellValues] });
        }
      }
    }

    setScores(playerScores);
    setScoreBreakdown(breakdown);
    
    const ranked = playerScores
      .map((score, idx) => ({ 
        player: idx, 
        score, 
        wins: breakdown[idx].wins, 
        avgGap: breakdown[idx].wins > 0 ? breakdown[idx].totalGap / breakdown[idx].wins : 0 
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, rank) => ({
        ...item,
        rank: rank + 1,
        gapMultiplier: item.avgGap.toFixed(2)
      }));
    
    setRankedWinners(ranked);
    
    const result = {
      timestamp: new Date().toISOString(),
      gridSize,
      budget: gameSettings.budget,
      numPlayers,
      playerGrids: JSON.parse(JSON.stringify(playerGrids)),
      scores: playerScores,
      cellResults,
      breakdown,
      ranked
    };
    setGameResults([...gameResults, result]);
  };

  const startNewGame = () => {
    initializeGame();
  };

  return (
    <div className="App">
      <h1>GrappleGrid Playtest</h1>
      
      {gameState === 'setup' && (
        <GameSettings 
          settings={gameSettings}
          onSettingsChange={setGameSettings}
          onStartGame={() => setGameState('playing')}
        />
      )}

      {gameState === 'playing' && (
        <div className="game-container">
          <h2>Player {currentPlayer + 1}'s Turn {gameSettings.aiPlayers[currentPlayer] ? '(AI)' : ''}</h2>
          <div className="budget-display">
            Budget Remaining: {calculateRemainingBudget(currentPlayer)} / {gameSettings.budget}
          </div>
          
          <GameBoard
            grid={playerGrids[currentPlayer]}
            gridSize={gameSettings.gridSize}
            onCellUpdate={(row, col, value) => updateCell(currentPlayer, row, col, value)}
            isValidPlacement={(row, col, value) => isValidPlacement(currentPlayer, row, col, value)}
          />
          
          {!gameSettings.aiPlayers[currentPlayer] && (
            <button 
              className="finish-btn"
              onClick={finishPlayerSetup}
              disabled={calculateRemainingBudget(currentPlayer) > 0}
            >
              Finish Setup {calculateRemainingBudget(currentPlayer) > 0 && '(Use all budget)'}
            </button>
          )}
        </div>
      )}

      {gameState === 'scoring' && (
        <div className="results-container">
          <h2>Game Results</h2>
          
          <div className="rankings">
            <h3>Final Rankings</h3>
            {rankedWinners.map(w => (
              <div key={w.player} className="rank-item">
                <strong>#{w.rank} Player {w.player + 1}</strong>: {w.score} points 
                ({w.wins} wins, avg gap: {w.gapMultiplier})
              </div>
            ))}
          </div>

          {scoreBreakdown && (
            <div className="score-breakdown">
              <h3>Score Breakdown</h3>
              {scoreBreakdown.map((bd, idx) => (
                <div key={idx} className="player-breakdown">
                  <h4>Player {idx + 1}</h4>
                  <p>Total Score: {bd.totalScore}</p>
                  <p>Cells Won: {bd.wins}</p>
                  <p>Total Gap: {bd.totalGap}</p>
                  <p>Average Gap: {bd.wins > 0 ? (bd.totalGap / bd.wins).toFixed(2) : 0}</p>
                  <details>
                    <summary>Cell Details ({bd.cellDetails.length} wins)</summary>
                    {bd.cellDetails.map((cell, i) => (
                      <div key={i} className="cell-detail">
                        [{cell.row},{cell.col}]: Value {cell.value} vs {cell.secondPlace}, 
                        Gap {cell.gap}, Score {cell.score}
                      </div>
                    ))}
                  </details>
                </div>
              ))}
            </div>
          )}
          
          <ScoreDisplay
            scores={scores}
            playerGrids={playerGrids}
            gridSize={gameSettings.gridSize}
          />
          
          <button className="new-game-btn" onClick={startNewGame}>
            New Game
          </button>
        </div>
      )}

      <DataCollector gameResults={gameResults} />
    </div>
  );
}

export default App;
