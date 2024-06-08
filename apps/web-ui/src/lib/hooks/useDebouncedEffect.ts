import { useEffect, useRef } from "react";

export const useDebouncedEffect = (effect: () => void, delay: number) => {
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setTimeout(effect, delay);

    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, []);
};
