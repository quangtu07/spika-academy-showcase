
import { useEffect, useState } from 'react';

export const useCountAnimation = (
  targetValue: number,
  isVisible: boolean,
  duration = 2000,
  suffix = ''
) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentValue(0);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(easeOutCubic * targetValue);
      
      setCurrentValue(value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, isVisible, duration]);

  return `${currentValue}${suffix}`;
};
