import React from 'react';

interface LogoTextProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoText = ({ className, width, height }: LogoTextProps) => {
  return (
    <div 
      className={`flex items-center justify-center bg-primary text-white font-bold rounded-md ${className}`}
      style={{ 
        width: width ? `${width}px` : '180px', 
        height: height ? `${height}px` : '60px',
        fontSize: width ? `${width / 10}px` : '18px'
      }}
    >
      S8 GARANTE
    </div>
  );
};