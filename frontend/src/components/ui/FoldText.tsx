import React, { useState, useEffect } from 'react';

interface FoldTextProps {
  text: string;
  splitBy?: 'char' | 'words';
  hinge?: 'top' | 'bottom';
  trigger?: 'scroll' | 'mount' | 'hover';
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  fontSize?: string;
  fontWeight?: number;
  color?: string;
  className?: string;
}

export const FoldText: React.FC<FoldTextProps> = ({
  text,
  splitBy = 'char',
  hinge = 'top',
  duration = 0.65,
  stagger = 0.035,
  perspective = 700,
  creaseShading = 0.55,
  fontSize = 'clamp(2.5rem, 6vw, 4.5rem)',
  fontWeight = 800,
  color = '#0f172a',
  className = '',
}) => {
  const [unfolded, setUnfolded] = useState(false);

  useEffect(() => {
    // Unfold shortly after mount for smooth entrance
    const timer = setTimeout(() => {
      setUnfolded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const items = splitBy === 'char' ? text.split('') : text.split(' ');

  return (
    <span
      className={`inline-block select-none leading-[1.08] tracking-tight ${className}`}
      style={{
        fontSize,
        fontWeight,
        perspective: `${perspective}px`,
      }}
    >
      {items.map((token, i) => {
        // Special case for whitespace
        if (token === ' ') {
          return <span key={i} className="inline-block">&nbsp;</span>;
        }

        const isOrange = token === 'D' || token === 'e' || token === 'l' || token === 'i' || token === 'v' || token === 'r';
        const itemColor = isOrange ? '#ff7a00' : color;

        return (
          <span
            key={i}
            className="inline-block transition-transform duration-700"
            style={{
              transformOrigin: hinge === 'top' ? '50% 0%' : '50% 100%',
              transform: unfolded ? 'rotateX(0deg)' : hinge === 'top' ? 'rotateX(-88deg)' : 'rotateX(88deg)',
              opacity: unfolded ? 1 : 0.05,
              transitionDelay: `${i * stagger}s`,
              transitionDuration: `${duration}s`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              color: itemColor,
              textShadow: unfolded ? '0 1px 2px rgba(0,0,0,0.05)' : `0 10px 20px rgba(0,0,0,${creaseShading})`,
            }}
          >
            {token}
          </span>
        );
      })}
    </span>
  );
};

export default FoldText;
