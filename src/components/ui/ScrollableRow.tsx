import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react";

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
 * -webkit-overflow-scrolling: touch, and GPU acceleration.
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

  // iOS Safari horizontal scroll - MUST be inline styles for webkit properties
  const scrollContainerStyle: CSSProperties = {
    display: 'flex',
    overflowX: 'scroll',  // 'scroll' not 'auto' for iOS Safari
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',  // momentum scroll on iOS
    scrollSnapType: 'x mandatory',  // optional but helps
    touchAction: 'pan-x',  // explicitly allow horizontal touch
    transform: 'translateZ(0)',  // force GPU layer
    WebkitTransform: 'translateZ(0)',  // webkit prefix
    willChange: 'scroll-position',
    overscrollBehaviorX: 'contain',
    scrollBehavior: 'smooth',
    width: '100%',  // explicit width
  };

  // Inner container style - children must not shrink
  const innerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    minWidth: 'max-content',
  };

  return (
    <div 
      className="relative w-full" 
      style={{ 
        touchAction: 'pan-x pan-y',
        // Parent must NOT have overflow: hidden
        overflow: 'visible',
      }}
    >
      {/* Left fade gradient - NO z-index to avoid blocking touches on iOS */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r ${fadeColor} to-transparent pointer-events-none transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />
      
      {/* Scrollable content - iOS Safari specific fixes via inline styles */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`hide-scrollbar ${className}`}
        style={scrollContainerStyle}
      >
        <div className={innerClassName} style={innerStyle}>
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
