import React, { useState } from 'react';

function DataCollector({ gameResults }) {
  const [showData, setShowData] = useState(false);

  const exportToCSV = () => {
    if (gameResults.length === 0) {
      alert('No game data to export yet!');
      return;
    }

    // Create CSV header
    const headers = [
      'Timestamp',
      'Grid Size',
      'Budget',
      'Num Players',
      'Winner',
      'Winner Score',
      'Score Gap',
      'Player 1 Score',
      'Player 2 Score',
      'Player 3 Score',
      'Player 4 Score',
      'Total Cells',
      'Winning Margin %'
    ];

    // Create CSV rows
    const rows = gameResults.map(result => {
      const winner = result.scores.indexOf(Math.max(...result.scores));
      const winnerScore = result.scores[winner];
      const secondPlace = Math.max(...result.scores.filter((_, idx) => idx !== winner));
      const scoreGap = winnerScore - secondPlace;
      const totalCells = result.gridSize * result.gridSize;
      const margin = ((scoreGap / winnerScore) * 100).toFixed(2);

      return [
        result.timestamp,
        result.gridSize,
        result.budget,
        result.numPlayers,
        winner + 1,
        winnerScore,
        scoreGap,
        result.scores[0] || 0,
        result.scores[1] || 0,
        result.scores[2] || 0,
        result.scores[3] || 0,
        totalCells,
        margin
      ];
    });

    // Combine into CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grapplegrid-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedJSON = () => {
    if (gameResults.length === 0) {
      alert('No game data to export yet!');
      return;
    }

    const jsonContent = JSON.stringify(gameResults, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grapplegrid-detailed-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatistics = () => {
    if (gameResults.length === 0) return null;

    const avgScores = gameResults.reduce((acc, result) => {
      const winner = result.scores.indexOf(Math.max(...result.scores));
      return acc + result.scores[winner];
    }, 0) / gameResults.length;

    const gridSizeBreakdown = gameResults.reduce((acc, result) => {
      acc[result.gridSize] = (acc[result.gridSize] || 0) + 1;
      return acc;
    }, {});

    return {
      totalGames: gameResults.length,
      avgWinningScore: avgScores.toFixed(2),
      gridSizeBreakdown
    };
  };

  const stats = getStatistics();

  return (
    <div className="data-collector">
      <button 
        className="toggle-data-btn"
        onClick={() => setShowData(!showData)}
      >
        📊 Data Collection ({gameResults.length} games)
      </button>

      {showData && (
        <div className="data-panel">
          <h3>Playtest Data</h3>
          
          {stats && (
            <div className="statistics">
              <div className="stat">
                <strong>Total Games:</strong> {stats.totalGames}
              </div>
              <div className="stat">
                <strong>Avg Winning Score:</strong> {stats.avgWinningScore}
              </div>
              <div className="stat">
                <strong>Grid Sizes Tested:</strong>
                <ul>
                  {Object.entries(stats.gridSizeBreakdown).map(([size, count]) => (
                    <li key={size}>{size}x{size}: {count} games</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="export-buttons">
            <button onClick={exportToCSV} className="export-btn">
              Export CSV (Spreadsheet)
            </button>
            <button onClick={exportDetailedJSON} className="export-btn">
              Export JSON (Detailed)
            </button>
          </div>

          <div className="recent-games">
            <h4>Recent Games:</h4>
            <div className="games-list">
              {gameResults.slice(-5).reverse().map((result, idx) => (
                <div key={idx} className="game-summary">
                  <span>{result.gridSize}x{result.gridSize}</span>
                  <span>Budget: {result.budget}</span>
                  <span>Winner Score: {Math.max(...result.scores)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataCollector;
