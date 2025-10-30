import { useState } from 'react';
import { brand } from '../brand/brand';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// BlaBlaCar-inspired sizing: optimized for navigation and headers
const sizeMap = {
  xs: 'h-7',   // 28px - Compact mobile headers
  sm: 'h-8',   // 32px - Standard mobile/desktop navigation (BlaBlaCar standard)
  md: 'h-10',  // 40px - Sidebar and prominent headers
  lg: 'h-12',  // 48px - Featured sections
  xl: 'h-16'   // 64px - Auth pages and hero sections
};

export function Logo({ size = 'sm', showText = true, className = '' }: LogoProps) {
  const [imgSrc, setImgSrc] = useState(
    brand.logo.preferOriginal ? brand.logo.originalPublicPath : brand.logo.primarySvg()
  );
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={imgSrc}
        alt={brand.logo.alt}
        className={`${sizeMap[size]} w-auto rounded-xl`}
        loading="eager"
        decoding="async"
        onError={() => setImgSrc(brand.logo.primarySvg())}
      />
      {showText && (
        <div>
          <h3 className="text-primary leading-tight">{brand.name}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{brand.taglineAr}</p>
        </div>
      )}
    </div>
  );
}
