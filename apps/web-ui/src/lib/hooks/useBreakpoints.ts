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
    window.addEventListener("resize", setResizedWindowBreakpoint);

    return () => {
      window.removeEventListener("resize", setResizedWindowBreakpoint);
    };
  }, []);

  return breakpoint;
}
