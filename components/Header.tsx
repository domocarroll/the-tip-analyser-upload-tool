import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white sticky top-0 z-20 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-4 md:px-8 py-4 text-center max-w-7xl">
        <h1 
          style={{ 
            fontFamily: 'var(--font-family-primary)', 
            color: 'var(--primary-navy)',
            fontWeight: 800,
            letterSpacing: '0.05em'
          }} 
          className="text-2xl md:text-3xl tracking-wide uppercase"
        >
          thetipanalyser.com
        </h1>
      </div>
    </header>
  );
};
