import React, { useState, useRef, useEffect } from 'react';
import RadialMenu from './RadialMenu';

function GameBoard({ grid, gridSize, onCellUpdate, isValidPlacement }) {
  const [radialMenu, setRadialMenu] = useState(null);
  const longPressTimer = useRef(null);

  const handleMouseDown = (e, row, col) => {
    // Right click or long press for radial menu
    if (e.button === 2) {
      e.preventDefault();
      showRadialMenu(e, row, col);
      return;
    }

    // Left click - start long press timer
    longPressTimer.current = setTimeout(() => {
      showRadialMenu(e, row, col);
    }, 500);
  };

  const handleMouseUp = (e, row, col) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // If no radial menu, do quick click cycle
    if (!radialMenu && e.button === 0) {
      const currentValue = grid[row][col];
      const nextValue = (currentValue + 1) % 6;
      
      if (isValidPlacement(row, col, nextValue)) {
        onCellUpdate(row, col, nextValue);
      } else if (nextValue !== 0 && isValidPlacement(row, col, 0)) {
        onCellUpdate(row, col, 0);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const showRadialMenu = (e, row, col) => {
    setRadialMenu({
      position: { x: e.clientX, y: e.clientY },
      row,
      col,
      currentValue: grid[row][col]
    });
  };

  const handleRadialSelect = (value) => {
    if (radialMenu && isValidPlacement(radialMenu.row, radialMenu.col, value)) {
      onCellUpdate(radialMenu.row, radialMenu.col, value);
    }
    setRadialMenu(null);
  };

  const handleRadialClose = () => {
    setRadialMenu(null);
  };

  const getCellClass = (row, col) => {
    const value = grid[row][col];
    let className = 'grid-cell chrome-cell';
    if (value > 0) className += ' has-value';
    return className;
  };

  const getColumnUsage = (col) => {
    const column = grid.map(row => row[col]);
    const used = [1, 2, 3, 4, 5].filter(num => column.includes(num));
    return used;
  };

  return (
    <div className="game-board-container">
      <div className="instructions">
        <p><strong>Quick Click:</strong> Click to cycle 0→1→2→3→4→5</p>
        <p><strong>Radial Menu:</strong> Right-click or long-press for radial dial</p>
        <p><em>Column rule: 1-5 only once per column, 0 unlimited</em></p>
      </div>

      <div className="grid-wrapper">
        <div className="column-headers">
          {Array(gridSize).fill(0).map((_, col) => (
            <div key={col} className="column-header">
              <div className="column-usage">
                Used: {getColumnUsage(col).join(', ') || 'none'}
              </div>
            </div>
          ))}
        </div>

        <div 
          className="game-board"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: '4px'
          }}
          onContextMenu={handleContextMenu}
        >
          {grid.map((row, rowIdx) => (
            row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={getCellClass(rowIdx, colIdx)}
                onMouseDown={(e) => handleMouseDown(e, rowIdx, colIdx)}
                onMouseUp={(e) => handleMouseUp(e, rowIdx, colIdx)}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY, button: 0 };
                  handleMouseDown(fakeEvent, rowIdx, colIdx);
                }}
                onTouchEnd={(e) => {
                  handleMouseUp({ button: 0 }, rowIdx, colIdx);
                }}
              >
                <div className="cell-value">{cell}</div>
              </div>
            ))
          ))}
        </div>
      </div>

      {radialMenu && (
        <RadialMenu
          position={radialMenu.position}
          currentValue={radialMenu.currentValue}
          onSelect={handleRadialSelect}
          onClose={handleRadialClose}
        />
      )}
    </div>
  );
}

export default GameBoard;
