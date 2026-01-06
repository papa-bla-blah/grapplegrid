import React, { useState } from 'react';

function GameBoard({ grid, gridSize, onCellUpdate, isValidPlacement }) {
  const [selectedValue, setSelectedValue] = useState(0);
  const [inputMode, setInputMode] = useState('click'); // click or keyboard

  const handleCellClick = (row, col) => {
    if (inputMode === 'click') {
      // Cycle through values 0-5
      const currentValue = grid[row][col];
      const nextValue = (currentValue + 1) % 6;
      
      if (isValidPlacement(row, col, nextValue)) {
        onCellUpdate(row, col, nextValue);
      } else {
        // Try to wrap to 0 if next value doesn't work
        if (nextValue !== 0 && isValidPlacement(row, col, 0)) {
          onCellUpdate(row, col, 0);
        }
      }
    } else {
      // Paint mode - use selected value
      if (isValidPlacement(row, col, selectedValue)) {
        onCellUpdate(row, col, selectedValue);
      }
    }
  };

  const handleKeyPress = (e, row, col) => {
    const key = e.key;
    if (key >= '0' && key <= '5') {
      const value = parseInt(key);
      if (isValidPlacement(row, col, value)) {
        onCellUpdate(row, col, value);
      }
    }
  };

  const getCellClass = (row, col) => {
    const value = grid[row][col];
    let className = 'grid-cell';
    if (value > 0) className += ' has-value';
    if (!isValidPlacement(row, col, (value + 1) % 6) && inputMode === 'click') {
      className += ' invalid-next';
    }
    return className;
  };

  const getColumnUsage = (col) => {
    const column = grid.map(row => row[col]);
    const used = [1, 2, 3, 4, 5].filter(num => column.includes(num));
    return used;
  };

  return (
    <div className="game-board-container">
      <div className="input-mode-selector">
        <label>
          <input 
            type="radio" 
            checked={inputMode === 'click'}
            onChange={() => setInputMode('click')}
          />
          Click to Cycle
        </label>
        <label>
          <input 
            type="radio" 
            checked={inputMode === 'paint'}
            onChange={() => setInputMode('paint')}
          />
          Paint Mode
        </label>
      </div>

      {inputMode === 'paint' && (
        <div className="value-selector">
          {[0, 1, 2, 3, 4, 5].map(val => (
            <button
              key={val}
              className={`value-btn ${selectedValue === val ? 'selected' : ''}`}
              onClick={() => setSelectedValue(val)}
            >
              {val}
            </button>
          ))}
        </div>
      )}

      <div className="grid-wrapper">
        <div className="column-headers">
          {Array(gridSize).fill(0).map((_, col) => (
            <div key={col} className="column-header">
              Col {col + 1}
              <div className="column-usage">
                {getColumnUsage(col).join(', ') || 'Empty'}
              </div>
            </div>
          ))}
        </div>

        <div 
          className="game-board"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`
          }}
        >
          {grid.map((row, rowIdx) => (
            row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={getCellClass(rowIdx, colIdx)}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onKeyPress={(e) => handleKeyPress(e, rowIdx, colIdx)}
                tabIndex={0}
              >
                <div className="cell-value">{cell}</div>
                <div className="cell-coords">{rowIdx},{colIdx}</div>
              </div>
            ))
          ))}
        </div>
      </div>

      <div className="instructions">
        <h4>Quick Input Methods:</h4>
        <ul>
          <li><strong>Click Mode:</strong> Click cells to cycle through 0-5</li>
          <li><strong>Paint Mode:</strong> Select a value, then click cells to paint</li>
          <li><strong>Keyboard:</strong> Focus a cell and press 0-5</li>
        </ul>
        <p><em>Column constraint: Each number 1-5 can only appear once per column (0 can repeat)</em></p>
      </div>
    </div>
  );
}

export default GameBoard;
