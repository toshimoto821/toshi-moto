import { useMemo } from "react";
import { Separator, Button } from "@radix-ui/themes";
import { scaleLinear, extent, interpolateRgb } from "d3";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";
import { setGraphByRange } from "@root/lib/slices/ui.slice";
import { type GraphTimeFrameRange } from "@root/lib/slices/ui.slice.types";

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
      dispatch(setGraphByRange(timeframe));
    };
  };

  const widths = useMemo(() => {
    // const diff = priceDiffs[timeframe];
    const maxWidth = 100 / Object.keys(priceDiffs).length;

    const values = Object.entries(priceDiffs);
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
    const values = Object.entries(priceDiffs);
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
    deselected: "soft",
  };
  return (
    <div className="flex space-x-2 items-center justify-end">
      <Button
        style={{
          width: `${widths.get("1D")}%`,
          color: colors.get("1D"),
        }}
        color="gray"
        variant={
          graphTimeFrameRange === "1D" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("1D")}
      >
        1D
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("1W")}%`,
          color: colors.get("1W"),
        }}
        variant={
          graphTimeFrameRange === "1W" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("1W")}
      >
        1W
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("1M")}%`,
          color: colors.get("1M"),
        }}
        variant={
          graphTimeFrameRange === "1M" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("1M")}
      >
        1M
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("3M")}%`,
          color: colors.get("3M"),
        }}
        variant={
          graphTimeFrameRange === "3M" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("3M")}
      >
        3M
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("1Y")}%`,
          color: colors.get("1Y"),
        }}
        variant={
          graphTimeFrameRange === "1Y" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("1Y")}
      >
        1Y
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("2Y")}%`,
          color: colors.get("2Y"),
        }}
        variant={
          graphTimeFrameRange === "2Y" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("2Y")}
      >
        2Y
      </Button>
      <Separator orientation="vertical" />
      <Button
        color="gray"
        style={{
          width: `${widths.get("5Y")}%`,
          color: colors.get("5Y"),
        }}
        variant={
          graphTimeFrameRange === "5Y" ? buttons.selected : buttons.deselected
        }
        onClick={handleUpdateTimeframe("5Y")}
      >
        5Y
      </Button>
    </div>
  );
};
