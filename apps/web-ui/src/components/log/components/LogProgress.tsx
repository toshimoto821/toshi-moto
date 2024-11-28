import { useEffect, useState } from "react";
import * as Progress from "@radix-ui/react-progress";

export const LogProgress = ({ max, value }: { max: number; value: number }) => {
  const [hidden, setHidden] = useState(false);
  const percent = value / max;
  useEffect(() => {
    if (isNaN(percent) || percent >= 1) {
      setTimeout(() => {
        setHidden(true);
      }, 2000);
    } else {
      setHidden(false);
    }
  }, [percent]);

  if (hidden) return null;

  return (
    <Progress.Root
      data-testid="log-progress"
      className="relative overflow-hidden bg-blue-300 w-screen h-[3px] border border-y-0 border-b-0"
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: "translateZ(0)",
      }}
      value={Math.min(value, max)}
      max={max}
    >
      <Progress.Indicator
        className="bg-white w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
        style={{ transform: `translateX(${percent * 100}%)` }}
      />
    </Progress.Root>
  );
};
