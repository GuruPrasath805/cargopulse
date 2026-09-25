import React, { useEffect, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
  className?: string;
  color?: string;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 35,
  animateBy = 'letters',
  direction = 'top',
  onAnimationComplete,
  className = '',
}) => {
  const [animatedIndices, setAnimatedIndices] = useState<number[]>([]);

  // Split into words so words never break in the middle
  const words = text.split(' ');
  const totalLetters = text.length;

  useEffect(() => {
    setAnimatedIndices([]);
    const totalTokens = animateBy === 'words' ? words.length : totalLetters;

    for (let i = 0; i < totalTokens; i++) {
      const timer = setTimeout(() => {
        setAnimatedIndices(prev => {
          const next = [...prev, i];
          if (next.length === totalTokens && onAnimationComplete) {
            onAnimationComplete();
          }
          return next;
        });
      }, i * delay);
    }
  }, [text, delay, animateBy]);

  let globalCharIndex = 0;

  return (
    <span className={`inline-block select-none ${className}`}>
      {words.map((word, wordIdx) => {
        const wordChars = word.split('');
        const isHighlightWord = word.toLowerCase().includes('deliver');

        const renderedWord = (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {wordChars.map((char, charIdx) => {
              const currentIndex = animateBy === 'words' ? wordIdx : globalCharIndex++;
              const isAnimated = animatedIndices.includes(currentIndex);
              const yOffset = direction === 'top' ? '-14px' : '14px';

              return (
                <span
                  key={charIdx}
                  style={{
                    display: 'inline-block',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.65, 0.3, 0.9)',
                    opacity: isAnimated ? 1 : 0,
                    filter: isAnimated ? 'blur(0px)' : 'blur(8px)',
                    transform: isAnimated ? 'translateY(0)' : `translateY(${yOffset})`,
                    color: isHighlightWord ? '#ff7a00' : undefined,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );

        // Account for space
        if (animateBy === 'letters' && wordIdx < words.length - 1) {
          globalCharIndex++;
        }

        return (
          <React.Fragment key={wordIdx}>
            {renderedWord}
            {wordIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </React.Fragment>
        );
      })}
    </span>
  );
};
