import React, { useState, useEffect, useRef } from 'react';
import './RadialMenu.css';

function RadialMenu({ position, onSelect, onClose, currentValue }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const menuRef = useRef(null);

  const values = [0, 1, 2, 3, 4, 5];
  const radius = 70; // Distance from center to value buttons
  const centerSize = 40; // Size of center circle

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!menuRef.current) return;
      
      const rect = menuRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < centerSize / 2) {
        setSelectedValue(null);
        return;
      }
      
      if (distance > radius + 20) {
        setSelectedValue(null);
        return;
      }
      
      // Calculate angle
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      
      // Divide circle into 6 segments (60 degrees each)
      const segmentAngle = 360 / 6;
      const segment = Math.floor((angle + segmentAngle / 2) / segmentAngle) % 6;
      
      setSelectedValue(values[segment]);
    };

    const handleMouseUp = () => {
      if (selectedValue !== null) {
        onSelect(selectedValue);
      } else {
        onClose();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedValue, onSelect, onClose]);

  // Calculate positions for each value button
  const getPosition = (index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180); // Start at top, go clockwise
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <div 
      className="radial-menu-overlay"
      style={{
        position: 'fixed',
        left: position.x - 100,
        top: position.y - 100,
        width: 200,
        height: 200,
        zIndex: 1000
      }}
    >
      <div className="radial-menu" ref={menuRef}>
        {/* Center circle showing current value */}
        <div className="radial-center">
          {currentValue}
        </div>
        
        {/* Value buttons arranged in circle */}
        {values.map((value, index) => {
          const pos = getPosition(index);
          const isSelected = selectedValue === value;
          
          return (
            <div
              key={value}
              className={`radial-value ${isSelected ? 'selected' : ''}`}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {value}
            </div>
          );
        })}
        
        {/* Visual guide lines */}
        <svg className="radial-guide" width="200" height="200">
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}

export default RadialMenu;
