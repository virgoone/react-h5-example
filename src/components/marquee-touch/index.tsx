import React, { useEffect, useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import './style.less';

interface MarqueeProps {
  repeat?: number;
  speed?: number;
  children: React.ReactNode;
}

interface Style {
  transform: string;
  transition: string;
  width?: string | number;
}

const Marquee: React.FC<MarqueeProps> = ({
  repeat = 4,
  speed = 0.5,
  children
}) => {
  const [inview, setInview] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRebounding, setIsRebounding] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  const marqueeBoxRef = useRef<HTMLDivElement>(null);
  const marqueeContentRef = useRef<HTMLDivElement>(null);
  const marqueeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number>();
  const directionRef = useRef(1); // 1 for right, -1 for left
  const touchStartXRef = useRef(0);
  const itemWidthRef = useRef(0);
  const offsetRef = useRef(0); // 用于动画中实时跟踪offset
  const intersectionObserverRef = useRef<IntersectionObserver>();

  const GAP = 6;

  const initSizes = useCallback(() => {
    const firstItem = marqueeItemsRef.current[0];
    if (!firstItem || firstItem.offsetWidth <= 0) {
      setReady(false);
      return;
    }

    setReady(true);
    const itemWidth = firstItem.offsetWidth + GAP;
    itemWidthRef.current = itemWidth;
    setContentWidth(itemWidth * repeat);
  }, [repeat]);

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      if (!ready) {
        initSizes();
      }

      if (!paused && inview && !isDragging && !isRebounding) {
        const newOffset = offsetRef.current - speed * directionRef.current;
        offsetRef.current = newOffset;
        setOffset(newOffset);

        if (directionRef.current > 0 && newOffset <= -itemWidthRef.current) {
          offsetRef.current = 0;
          setOffset(0);
        } else if (directionRef.current < 0 && newOffset >= 0) {
          offsetRef.current = -itemWidthRef.current + speed;
          setOffset(-itemWidthRef.current + speed);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [inview, isDragging, isRebounding, paused, ready, speed, initSizes]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const reboundLeft = useCallback(() => {
    setIsRebounding(true);
    const startOffset = offsetRef.current;
    const startTime = performance.now();
    const duration = 300;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        const newOffset = startOffset * (1 - elapsed / duration);
        offsetRef.current = newOffset;
        setOffset(newOffset);
        requestAnimationFrame(animate);
      } else {
        offsetRef.current = 0;
        setOffset(0);
        setIsRebounding(false);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = touchCurrentX - touchStartXRef.current;

    directionRef.current = deltaX > 0 ? 1 : -1;
    const newOffset = offsetRef.current + deltaX;

    // Constrain the offset
    if (newOffset > 0) {
      offsetRef.current = Math.min(newOffset, itemWidthRef.current);
    } else if (newOffset < -itemWidthRef.current) {
      offsetRef.current = Math.max(newOffset, -contentWidth);
    } else {
      offsetRef.current = newOffset;
    }
    setOffset(offsetRef.current);
    touchStartXRef.current = touchCurrentX;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetRef.current > 0) {
      reboundLeft();
    } else if (offsetRef.current < -itemWidthRef.current) {
      const newOffset = offsetRef.current + itemWidthRef.current;
      offsetRef.current = newOffset;
      setOffset(newOffset);
    }
    directionRef.current = 1;
  };

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      const isHidden = document.visibilityState !== 'visible';
      setPaused(isHidden);
      if (isHidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handlePageVisibilityChange);
    };
  }, [startAnimation, stopAnimation]);

  useEffect(() => {
    if ('IntersectionObserver' in window && marqueeBoxRef.current) {
      intersectionObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          setInview(entry.isIntersecting);
          if (entry.isIntersecting) {
            initSizes();
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      });

      intersectionObserverRef.current.observe(marqueeBoxRef.current);
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [initSizes, startAnimation, stopAnimation]);

  useEffect(() => {
    window.addEventListener('resize', initSizes);
    return () => {
      window.removeEventListener('resize', initSizes);
      stopAnimation();
    };
  }, [initSizes, stopAnimation]);

  const contentStyle: Style = {
    transform: `translate(${offset}px, 0)`,
    transition: 'all 0ms ease-in 0s',
    width: contentWidth || '100%',
  };

  return (
    <div
      ref={marqueeBoxRef}
      className={clsx('marquee-touch-box', {
        inview: inview,
        'no-inview': !inview,
        'animation-paused': paused,
      })}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="marquee-content" ref={marqueeContentRef} style={contentStyle}>
        {Array(repeat)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              ref={(el) => (marqueeItemsRef.current[index] = el)}
              className="marquee-item"
            >
              {children}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Marquee;