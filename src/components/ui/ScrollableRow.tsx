import { useState, useEffect, useRef, type ReactNode } from "react";

interface ScrollableRowProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  fadeColor?: string;
}

/**
 * A horizontally scrollable row with fade gradients at the edges
 * to indicate more content is available.
 * 
 * iOS Safari fix: Uses overflow-x: scroll (not auto), explicit touch-action,
 * and ensures no parent elements block touch events.
 */
export function ScrollableRow({ 
  children, 
  className = "", 
  innerClassName = "",
  fadeColor = "from-brand-mint" 
}: ScrollableRowProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScroll);
    if (container) {
      resizeObserver.observe(container);
    }
    
    // Also check on window resize
    window.addEventListener("resize", checkScroll);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Re-check when children change
  useEffect(() => {
    checkScroll();
  }, [children]);

  return (
    <div className="relative" style={{ touchAction: 'pan-x pan-y' }}>
      {/* Left fade gradient - NO z-index to avoid blocking touches on iOS */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r ${fadeColor} to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />
      
      {/* Scrollable content - iOS Safari specific fixes */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`hide-scrollbar ${className}`}
        style={{ 
          overflowX: 'scroll', // iOS Safari needs 'scroll' not 'auto'
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollBehavior: 'smooth',
          overscrollBehaviorX: 'contain',
          scrollPaddingInline: '1.5rem',
          // Hardware acceleration for smooth iOS scrolling
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
        }}
      >
        <div className={`min-w-max flex flex-nowrap ${innerClassName}`}>
          {children}
        </div>
      </div>
      
      {/* Right fade gradient - NO z-index to avoid blocking touches on iOS */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l ${fadeColor} to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
