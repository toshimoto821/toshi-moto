import { forwardRef } from "react";
type IGraphHoverCard = {};

export const GraphHoverCard = forwardRef<HTMLDivElement, IGraphHoverCard>(
  (_, ref) => {
    return (
      <div
        className="graph-hover-tooltip absolute bg-gray-600 bg-opacity-75 rounded p-2 shadow-md w-[200px] text-white opacity-0"
        ref={ref}
      ></div>
    );
  }
);
