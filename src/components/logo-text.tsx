import React from 'react';
import Image from 'next/image';

interface LogoTextProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoText = ({ className, width = 180, height = 60 }: LogoTextProps) => {
  const logoUrl = "https://lpotufpuptsgljekrzaf.supabase.co/storage/v1/object/public/media/app-2/images/1754326164627-ek8ut5hc6.JPG";
  
  return (
    <div className={className}>
      <Image 
        src={logoUrl} 
        alt="S8 Garante" 
        width={width} 
        height={height}
        style={{
          objectFit: 'contain',
          width: `${width}px`,
          height: 'auto'
        }}
        priority
      />
    </div>
  );
};