import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LOGO_IMG = '/logo/logo.png';
const FAVICON_IMG = '/logo/favicon.png';

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { height: 22, iconSize: 24 },
    md: { height: 28, iconSize: 30 },
    lg: { height: 32, iconSize: 34 },
    xl: { height: 40, iconSize: 42 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={FAVICON_IMG}
          alt="QuickBit Live"
          style={{ width: currentSize.iconSize, height: currentSize.iconSize }}
          className="shrink-0 object-contain rounded-lg"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={LOGO_IMG}
        alt="QuickBit Live"
        style={{ height: currentSize.height, width: 'auto' }}
        className="object-contain shrink-0"
        draggable={false}
      />
    </div>
  );
};
