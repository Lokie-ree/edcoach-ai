import { useEffect, useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  threshold?: number; // Minimum distance for a swipe
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

interface TouchInfo {
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
}

export function useSwipe<T extends HTMLElement = HTMLElement>(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = config;

  const touchInfo = useRef<TouchInfo>({
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
  });

  const ref = useRef<T>(null);

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    touchInfo.current.touchStartX = touch.clientX;
    touchInfo.current.touchStartY = touch.clientY;
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
    const touch = 'changedTouches' in e ? e.changedTouches[0] : e;
    touchInfo.current.touchEndX = touch.clientX;
    touchInfo.current.touchEndY = touch.clientY;
    handleSwipe();
  };

  const handleSwipe = () => {
    const { touchStartX, touchStartY, touchEndX, touchEndY } = touchInfo.current;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if swipe distance meets threshold
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      return;
    }

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events (if enabled)
    if (trackMouse) {
      element.addEventListener('mousedown', handleTouchStart);
      element.addEventListener('mousemove', handleTouchMove);
      element.addEventListener('mouseup', handleTouchEnd);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (trackMouse) {
        element.removeEventListener('mousedown', handleTouchStart);
        element.removeEventListener('mousemove', handleTouchMove);
        element.removeEventListener('mouseup', handleTouchEnd);
      }
    };
  }, [handlers, threshold, preventDefaultTouchmoveEvent, trackMouse]);

  return ref;
}

// Hook for detecting long press (useful for context menus on mobile)
export function useLongPress<T extends HTMLElement = HTMLElement>(
  onLongPress: () => void,
  onClick?: () => void,
  options: {
    threshold?: number; // milliseconds
    captureEvent?: boolean;
  } = {}
) {
  const { threshold = 400, captureEvent = true } = options;
  const ref = useRef<T>(null);
  const startTime = useRef<number>(0);
  const isLongPress = useRef<boolean>(false);

  const start = (e: TouchEvent | MouseEvent) => {
    if (captureEvent) {
      e.preventDefault();
    }
    startTime.current = Date.now();
    isLongPress.current = false;

    const timeout = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, threshold);

    const cleanup = () => {
      clearTimeout(timeout);
      document.removeEventListener('touchend', cleanup);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', cleanup);
      document.removeEventListener('mousemove', cleanup);
    };

    document.addEventListener('touchend', cleanup);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', cleanup);
    document.addEventListener('mousemove', cleanup);
  };

  const click = (e: TouchEvent | MouseEvent) => {
    if (captureEvent) {
      e.preventDefault();
    }
    if (!isLongPress.current && onClick) {
      onClick();
    }
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', start);
    element.addEventListener('mousedown', start);
    element.addEventListener('click', click);

    return () => {
      element.removeEventListener('touchstart', start);
      element.removeEventListener('mousedown', start);
      element.removeEventListener('click', click);
    };
  }, [onLongPress, onClick, threshold, captureEvent]);

  return ref;
}