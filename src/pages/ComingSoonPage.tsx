import React from 'react';
import type { ViewState } from '../types/app.types';

interface ComingSoonPageProps {
  onNavigate?: (view: ViewState) => void;
  reason?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = () => {
  const words = [
    { text: 'Registration', delay: 100 },
    { text: 'Opening', delay: 280 },
    { text: 'Soon', delay: 460 },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 select-none">
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-white tracking-[-0.035em] leading-[1.12] text-center flex flex-wrap justify-center gap-x-3 sm:gap-x-5 drop-shadow-sm">
        {words.map((item, idx) => (
          <span
            key={idx}
            className="inline-block animate-blur-word"
            style={{ animationDelay: `${item.delay}ms` }}
          >
            {item.text}
          </span>
        ))}
      </h1>
    </div>
  );
};
