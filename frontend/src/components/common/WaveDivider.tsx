import React from 'react';

export interface WaveDividerProps {
  color?: 'green' | 'coral' | 'both';
  className?: string;
  height?: number;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  color = 'both',
  className = '',
  height = 20,
}) => {
  return (
    <div className={`w-full overflow-hidden flex items-center justify-center py-2 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-4xl"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
      >
        {color === 'green' && (
          <path
            d="M0 20C150 5 300 35 450 20C600 5 750 35 900 20C1050 5 1150 30 1200 20"
            stroke="#1F7A5C"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        )}
        {color === 'coral' && (
          <path
            d="M0 20C150 35 300 5 450 20C600 35 750 5 900 20C1050 35 1150 10 1200 20"
            stroke="#EE6A4B"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        )}
        {color === 'both' && (
          <>
            <path
              d="M0 16C150 3 300 29 450 16C600 3 750 29 900 16C1050 3 1150 25 1200 16"
              stroke="#1F7A5C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M0 24C150 37 300 11 450 24C600 37 750 11 900 24C1050 37 1150 15 1200 24"
              stroke="#EE6A4B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
};
