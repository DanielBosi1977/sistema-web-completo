import React from 'react';
import { BRAND_COLORS } from '@/lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} aspect-square rounded-lg flex items-center justify-center text-white font-bold`}
        style={{ backgroundColor: BRAND_COLORS.primary }}
      >
        <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}>
          S8
        </span>
      </div>
      <div className="flex flex-col">
        <span 
          className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}
          style={{ color: BRAND_COLORS.primary }}
        >
          S8 Garante
        </span>
        <span className="text-xs text-gray-500 -mt-1">
          Fiança Locatícia
        </span>
      </div>
    </div>
  );
}