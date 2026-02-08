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
    <div className="relative">
      {/* Left fade gradient */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r ${fadeColor} to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      
      {/* Scrollable content */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`overflow-x-auto scroll-smooth overscroll-x-contain hide-scrollbar ${className}`}
      >
        <div className={`min-w-max ${innerClassName}`}>
          {children}
        </div>
      </div>
      
      {/* Right fade gradient */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l ${fadeColor} to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </div>
  );
}
