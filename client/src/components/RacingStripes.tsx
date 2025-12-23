import React from 'react';
import './RacingStripes.css';

const RacingStripes = () => {
  return (
    <div className="racing-stripes-container">
      {/* Horizontal racing stripes */}
      <div className="racing-stripe stripe-1"></div>
      <div className="racing-stripe stripe-2"></div>
      <div className="racing-stripe stripe-3"></div>
      <div className="racing-stripe stripe-4"></div>
      <div className="racing-stripe stripe-5"></div>
      
      {/* Checkered pattern overlay */}
      <div className="checkered-overlay"></div>
      
      {/* Speed lines */}
      <div className="speed-lines">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="speed-line"
            style={{
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RacingStripes;
