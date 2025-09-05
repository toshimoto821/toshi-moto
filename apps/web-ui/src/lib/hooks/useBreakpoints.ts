import { useState, useEffect } from "react";

export function useBreakpoints() {
  const [breakpoint, setBreakpoint] = useState(0);

  useEffect(() => {
    const setResizedWindowBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint(0);
      else if (width >= 640 && width < 768) setBreakpoint(1);
      else if (width >= 768 && width < 1024) setBreakpoint(2);
      else if (width >= 1024 && width < 1280) setBreakpoint(3);
      else setBreakpoint(4);
    };

    setResizedWindowBreakpoint();

    // Debounce resize events to prevent excessive re-renders on mobile
    // Use longer debounce for mobile keyboard events
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      // Longer timeout to handle mobile keyboard show/hide
      timeoutId = setTimeout(setResizedWindowBreakpoint, 300);
    };

    // Handle mobile keyboard events more gracefully
    const handleResize = () => {
      // On mobile, check if this is likely a keyboard event
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (isMobile) {
        // Use longer debounce for mobile to handle keyboard transitions
        debouncedResize();
      } else {
        // Desktop gets immediate response
        setResizedWindowBreakpoint();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return breakpoint;
}
