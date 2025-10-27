import { forwardRef } from "react";

export const GraphHoverCard = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      className="graph-hover-tooltip absolute bg-gray-800 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-95 rounded-lg p-3 shadow-xl border border-gray-700 dark:border-gray-600 w-[220px] text-white opacity-0 pointer-events-none"
      ref={ref}
    ></div>
  );
});
