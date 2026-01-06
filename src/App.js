import React, { useState, useEffect } from 'react';
import './App.css';
import GameBoard from './GameBoard';
import GameSettings from './GameSettings';
import ScoreDisplay from './ScoreDisplay';
import DataCollector from './DataCollector';

function App() {
  const [gameSettings, setGameSettings] = useState({
    gridSize: 5,
    budget: 50,
    numPlayers: 2
  });

  const [gameState, setGameState] = useState('setup'); // setup, playing, scoring
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerGrids, setPlayerGrids] = useState([]);
  const [scores, setScores] = useState([]);
  const [gameResults, setGameResults] = useState([]);

  // Initialize grids when settings change
  useEffect(() => {
    initializeGame();
  }, [gameSettings]);

  const initializeGame = () => {
    const { gridSize, numPlayers } = gameSettings;
    const newGrids = Array(numPlayers).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))
    );
    setPlayerGrids(newGrids);
    setGameState('setup');
    setCurrentPlayer(0);
    setScores([]);
  };

  const calculateRemainingBudget = (playerIndex) => {
    const grid = playerGrids[playerIndex];
    const used = grid.flat().reduce((sum, val) => sum + val, 0);
    return gameSettings.budget - used;
  };

  const isValidPlacement = (playerIndex, row, col, value) => {
    // Check column constraint - each number 1-5 only once per column (0 can repeat)
    if (value > 0) {
      const column = playerGrids[playerIndex].map(r => r[col]);
      if (column.includes(value) && playerGrids[playerIndex][row][col] !== value) {
        return false;
      }
    }
    
    // Check budget
    const currentValue = playerGrids[playerIndex][row][col];
    const budgetChange = value - currentValue;
    const remaining = calculateRemainingBudget(playerIndex);
    
    return remaining - budgetChange >= 0;
  };

  const updateCell = (playerIndex, row, col, value) => {
    if (!isValidPlacement(playerIndex, row, col, value)) {
      return false;
    }

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

    // Compare each cell
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellValues = playerGrids.map(grid => grid[row][col]);
        const maxValue = Math.max(...cellValues);
        
        // Find winners (players with max value)
        const winners = cellValues.reduce((acc, val, idx) => {
          if (val === maxValue && val > 0) acc.push(idx);
          return acc;
        }, []);

        if (winners.length === 1) {
          // Single winner
          const winnerIdx = winners[0];
          const winnerValue = cellValues[winnerIdx];
          
          // Find second highest
          const otherValues = cellValues.filter((_, idx) => idx !== winnerIdx);
          const secondHighest = Math.max(...otherValues, 0);
          
          const gap = winnerValue - secondHighest;
          const score = gap * gap; // Gap squared
          
          playerScores[winnerIdx] += score;
          
          cellResults.push({
            row, col, winner: winnerIdx, gap, score, values: [...cellValues]
          });
        }
        // Ties result in 0 points for everyone
      }
    }

    setScores(playerScores);
    
    // Save game result for data collection
    const result = {
      timestamp: new Date().toISOString(),
      gridSize,
      budget: gameSettings.budget,
      numPlayers,
      playerGrids: JSON.parse(JSON.stringify(playerGrids)),
      scores: playerScores,
      cellResults
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
          <h2>Player {currentPlayer + 1}'s Turn</h2>
          <div className="budget-display">
            Budget Remaining: {calculateRemainingBudget(currentPlayer)} / {gameSettings.budget}
          </div>
          
          <GameBoard
            grid={playerGrids[currentPlayer]}
            gridSize={gameSettings.gridSize}
            onCellUpdate={(row, col, value) => updateCell(currentPlayer, row, col, value)}
            isValidPlacement={(row, col, value) => isValidPlacement(currentPlayer, row, col, value)}
          />
          
          <button 
            className="finish-btn"
            onClick={finishPlayerSetup}
            disabled={calculateRemainingBudget(currentPlayer) > 0}
          >
            Finish Setup {calculateRemainingBudget(currentPlayer) > 0 && '(Use all budget)'}
          </button>
        </div>
      )}

      {gameState === 'scoring' && (
        <div className="results-container">
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
