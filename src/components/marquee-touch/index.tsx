import { useMemo, useEffect, useRef, useState } from 'react';
import cx from 'clsx'

import './style.less';

interface MarqueeTouchProps {
  repeat?: number;
  speed?: number;
  children?: React.ReactNode;
}

export default function MarqueeTouch({
  repeat = 4,
  speed = 0.5,
  children,
}: MarqueeTouchProps) {
  const [inview, setInview] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isRebounding, setIsRebounding] = useState(false);

  const gap = 6;
  const touchStartXRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const marqueeBoxRef = useRef<HTMLDivElement>(null);
  const marqueeItemsRef = useRef<HTMLDivElement[]>([]);
  const marqueeContentRef = useRef<HTMLDivElement>(null);

  const repeatData = Array(repeat)
    .fill(0)
    .map((_, index) => index);

  const contentStyle = useMemo(() => ({
    transform: `translate(${offset}px, 0)`,
    transition: 'all 0ms ease-in 0s',
    width: `${contentWidth}px`,
  }), [offset, contentWidth]);

  const initSizes = () => {
    if (marqueeItemsRef.current.length > 0) {
      const newItemWidth = marqueeItemsRef.current[0].offsetWidth + gap;
      setItemWidth(newItemWidth);
      setContentWidth(newItemWidth * repeat);
    }
  };

  const handlePageVisibilityChange = () => {
    const isPageVisible = document.visibilityState === 'visible';
    setPaused(!isPageVisible);
    if (isPageVisible) {
      startAnimation();
    } else {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const animate = () => {
      if (!paused && inview && !isDragging && !isRebounding) {
        setOffset((prev) => {
          const newOffset = prev - speed * direction;
          if (direction > 0 && newOffset <= -itemWidth) {
            return 0;
          } else if (direction < 0 && newOffset >= 0) {
            return -itemWidth + speed;
          }
          return newOffset;
        });
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = touchCurrentX - touchStartXRef.current;

    setDirection(deltaX > 0 ? 1 : -1);
    setOffset((prev) => {
      const newOffset = prev + deltaX;
      if (newOffset > 0) {
        return Math.min(newOffset, itemWidth);
      } else if (newOffset < -itemWidth) {
        return Math.max(newOffset, -contentWidth);
      }
      return newOffset;
    });

    touchStartXRef.current = touchCurrentX;
  };

  const reboundLeft = () => {
    setIsRebounding(true);
    const startOffset = offset;
    const startTime = performance.now();
    const duration = 300;
    const easeOutElastic = (x: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0
        ? 0
        : x === 1
          ? 1
          : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        const easeValue = easeOutElastic(progress);
        setOffset(startOffset * (1 - easeValue));
        requestAnimationFrame(animate);
      } else {
        setOffset(0);
        setIsRebounding(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > 0) {
      reboundLeft();
    } else if (offset < -itemWidth) {
      setOffset((prev) => prev + itemWidth);
    }
    setTimeout(() => {
      setDirection(1);
    }, 0);
  };

  useEffect(() => {
    initSizes();
    startAnimation();

    window.addEventListener('resize', initSizes);
    document.addEventListener('visibilitychange', handlePageVisibilityChange);

    if ('IntersectionObserver' in window) {
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

      if (marqueeBoxRef.current) {
        intersectionObserverRef.current.observe(marqueeBoxRef.current);
      }
    }

    return () => {
      stopAnimation();
      window.removeEventListener('resize', initSizes);
      document.removeEventListener(
        'visibilitychange',
        handlePageVisibilityChange,
      );
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={marqueeBoxRef}
      className={cx('marquee-box', {
        inview: inview,
        'no-inview': !inview,
        'animation-paused': paused,
      })}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={marqueeContentRef}
        className="marquee-content"
        style={contentStyle}
      >
        {repeatData.map((item) => (
          <div
            key={item}
            ref={(el) => {
              if (el) marqueeItemsRef.current[item] = el;
            }}
            className="marquee-item"
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
