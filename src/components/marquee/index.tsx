import { useEffect, useRef, useState } from 'react';

import './style.less';

interface MarqueeListProps {
  repeat?: number;
  children?: React.ReactNode;
  duration?: string;
}

export default function MarqueeList({
  repeat = 4,
  children,
  duration = '20s',
}: MarqueeListProps) {
  const [inview, setInview] = useState(false);
  const [paused, setPaused] = useState(false);
  const observedElementRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const repeatData = Array(repeat)
    .fill(0)
    .map((_, index) => index);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      setPaused(document.visibilityState !== 'visible');
    };

    if ('IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          setInview(entry.isIntersecting);
        });
      });

      if (observedElementRef.current) {
        intersectionObserverRef.current.observe(observedElementRef.current);
      }
    } else {
      console.warn('IntersectionObserver is not supported in this browser.');
    }

    document.addEventListener('visibilitychange', handlePageVisibilityChange);

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      document.removeEventListener(
        'visibilitychange',
        handlePageVisibilityChange,
      );
    };
  }, []);

  return (
    <div
      ref={observedElementRef}
      className={`marquee-box ${inview ? 'inview' : 'no-inview'}`}
      style={{ '--duration': duration } as React.CSSProperties}
    >
      {repeatData.map((item) => (
        <div
          key={item}
          className={`marquee-item ${paused ? 'animation-paused' : ''}`}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
