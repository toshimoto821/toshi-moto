import { useMemo, useEffect } from "react";
import { Button } from "@radix-ui/themes";
import { scaleLinear, extent, interpolateRgb } from "d3";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";
import { setRange } from "@root/lib/slices/navbar.slice";
import {
  setGraphByRange,
  resetGraphIfEmptyRange,
} from "@root/lib/slices/ui.slice";
import { type GraphTimeFrameRange } from "@root/lib/slices/ui.slice.types";
import { cn } from "@root/lib/utils";

const colorScale = scaleLinear<string>()
  .domain([-5, 0, 5])
  .range(["rgba(255, 0, 0, 1)", "rgba(128, 128, 128, 1)", "rgba(0, 128, 0, 1)"])
  .interpolate(interpolateRgb);

export const TimeRangeButtons = () => {
  const { graphTimeFrameRange } = useAppSelector(selectUI);
  const dispatch = useAppDispatch();

  const priceDiffs = useAppSelector((state) => state.price.priceDiffs);

  const { btcPrice } = useAppSelector((state) => state.price);

  const handleUpdateTimeframe = (timeframe: GraphTimeFrameRange) => {
    return () => {
      buzzBuzz();
      dispatch(setRange({ graphStartDate: null, graphEndDate: null }));
      dispatch(setGraphByRange(timeframe));
    };
  };

  useEffect(() => {
    const visbilityChange = () => {
      if (document.visibilityState === "visible" && graphTimeFrameRange) {
        dispatch(setGraphByRange(graphTimeFrameRange));
      }
    };
    document.addEventListener("visibilitychange", visbilityChange);
    return () => {
      document.removeEventListener("visibilitychange", visbilityChange);
    };
  }, [dispatch, graphTimeFrameRange]);

  useEffect(() => {
    // if the user selects a range and reloads,
    // need to reset the graph to the default range
    dispatch(resetGraphIfEmptyRange());
  }, [dispatch]);

  const buzzBuzz = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    } else {
      console.log("Vibration API is not supported on this device.");
    }
  };

  const widths = useMemo(() => {
    // const diff = priceDiffs[timeframe];
    const maxWidth = 100 / Object.keys(priceDiffs || {}).length;

    const values = Object.entries(priceDiffs || {});
    const absoluteValues = values.map((v) => Math.abs(v[1]));
    const [min, max] = extent(absoluteValues);
    const widthScale = scaleLinear()
      .domain([min!, max!]) // Input range
      .range([7, maxWidth]) // Output range
      .clamp(true);

    const ret = new Map<string, number>();
    for (const [key, value] of values) {
      const v = Math.abs(value);
      const scaled = widthScale(v);

      ret.set(key, scaled);
    }

    return ret;
  }, [priceDiffs]);

  const colors = useMemo(() => {
    const values = Object.entries(priceDiffs || {});
    const percentageValues: [string, number][] = values.map((v) => [
      v[0],
      (v[1] / btcPrice) * 100,
    ]);

    const ret = new Map<string, string>();
    for (const [key, value] of percentageValues) {
      const color = colorScale(value);

      ret.set(key, color);
    }
    return ret;
  }, [priceDiffs, btcPrice]);

  const buttons: Record<
    string,
    "classic" | "solid" | "soft" | "surface" | "outline" | "ghost"
  > = {
    selected: "surface",
    deselected: "outline",
  };

  const NavButton = ({ range }: { range: GraphTimeFrameRange }) => {
    return (
      <div
        style={{ width: `${widths.get(range)}%` }}
        className={cn("flex items-center justify-center w-full pb-1", {
          "border-b": graphTimeFrameRange === range,
          "border-orange-300": graphTimeFrameRange == range,
        })}
      >
        <Button
          style={{
            color: colors.get(range),
            width: "100%",
          }}
          color={graphTimeFrameRange === range ? "orange" : "gray"}
          variant={
            graphTimeFrameRange === range
              ? buttons.selected
              : buttons.deselected
          }
          className="bg-gray-400"
          onClick={handleUpdateTimeframe(range)}
        >
          {range}
        </Button>
      </div>
    );
  };
  return (
    <div className="flex space-x-2 items-center justify-end w-full pt-2 py-1 px-4">
      <NavButton range="1D" />

      <NavButton range="1W" />

      <NavButton range="1M" />

      <NavButton range="3M" />

      <NavButton range="1Y" />

      <NavButton range="2Y" />

      <NavButton range="5Y" />
    </div>
  );
};
