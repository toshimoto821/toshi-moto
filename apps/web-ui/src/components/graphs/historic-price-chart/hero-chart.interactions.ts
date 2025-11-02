import { select, pointers, type Selection } from "d3";
import { jade, ruby } from "@radix-ui/colors";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import type { IRawNode } from "@root/types";
import type { ChartMargin } from "./hero-chart.types";
import { SELECTED_OPACITY } from "./hero-chart.constants";

// Color constants for volume chart
const COLOR_NEGATIVE_CHANGE = "transparent";

type SVGSelection = Selection<SVGSVGElement, unknown, null, undefined>;

/**
 * Finds the Y position on a curve at a given X coordinate using binary search
 */
export const findCurveYAtX = (
  linePath: SVGPathElement | null,
  targetX: number,
  fallbackY: number
): number => {
  if (!linePath) return fallbackY;

  const pathLength = linePath.getTotalLength();
  let low = 0;
  let high = pathLength;

  // Binary search to find the point on the curve
  while (high - low > 1) {
    const midLength = (low + high) / 2;
    const point = linePath.getPointAtLength(midLength);

    if (point.x < targetX) {
      low = midLength;
    } else {
      high = midLength;
    }
  }

  const finalPoint = linePath.getPointAtLength((low + high) / 2);
  return finalPoint.y;
};

/**
 * Updates the position of crosshair lines and indicator dots
 */
export const updateCrosshairPosition = (
  svg: SVGSelection,
  x: number,
  curveY: number,
  btcCurveY: number
) => {
  const mid = 0;

  // Update vertical line
  svg
    .select("#vertical-tooltip-line")
    .attr("opacity", 0.5)
    .attr("x1", x + mid)
    .attr("x2", x + mid);

  // Update horizontal line
  svg
    .select("#current-price-line")
    .attr("opacity", 0.5)
    .attr("y1", curveY)
    .attr("y2", curveY);

  // Update dots
  svg
    .select("#orange-dot")
    .attr("cx", x + mid)
    .attr("cy", btcCurveY);
  svg
    .select("#green-dot")
    .attr("cx", x + mid)
    .attr("cy", curveY);

  // Show tick lines on hover
  svg.selectAll(".tick-line-hoverable").attr("opacity", 0.5);
};

/**
 * Hides the tick lines
 */
export const hideTickLines = (svg: SVGSelection) => {
  svg.selectAll(".tick-line-hoverable").attr("opacity", 0);
};

/**
 * Updates bar opacity to highlight the selected bar
 */
export const updateBarHighlight = (
  svg: SVGSelection,
  index: number,
  volumeChartId: string,
  direction: number,
  isPositiveChangeFn: (i: number) => boolean,
  numBuffer: number,
  dataLength: number,
  darkMode: boolean
) => {
  // Helper function to get color based on dark mode
  const getPositiveChangeColor = () => {
    return darkMode ? "rgba(80, 80, 80, 0.9)" : "rgba(209, 213, 219, 0.9)";
  };

  // Update main chart bars
  svg
    .selectAll(".bar")
    .attr("opacity", 0)
    .filter((_, i) => i === index)
    .attr("opacity", SELECTED_OPACITY);

  // Update volume chart bars
  const volChart = select(`#${volumeChartId}`);

  volChart.selectAll(".bar").attr("fill", (_, i) => {
    // Outside buffer range - transparent
    if (i < numBuffer || i > dataLength - numBuffer - 1) {
      return "transparent";
    }

    // First visible bar - use overall direction as we don't have previous data
    if (i === numBuffer) {
      if (i === index) {
        // Selected first bar - use overall direction
        return direction > 0 ? jade.jade11 : ruby.ruby11;
      }
      return getPositiveChangeColor();
    }

    // Selected index - use colored highlight based on that bar's price change
    if (i === index) {
      return isPositiveChangeFn(i) ? jade.jade11 : ruby.ruby11;
    }

    // All other bars - gray or transparent based on price change
    return isPositiveChangeFn(i)
      ? getPositiveChangeColor()
      : COLOR_NEGATIVE_CHANGE;
  });
};

/**
 * Calculates the index from mouse/touch position
 */
export const calculateIndexFromPosition = (
  x: number,
  xScale: d3.ScaleBand<string>,
  margin: ChartMargin,
  numBuffer: number,
  dataLength: number
): number => {
  const step = xScale.step();
  let index = Math.round((x - margin.left) / step) - 1;

  // Clamp the index to the valid range instead of falling back to the last index
  if (index < numBuffer) {
    index = numBuffer;
  } else if (index > dataLength - numBuffer - 1) {
    index = dataLength - numBuffer - 1;
  }
  // console.log("index:A", index, numBuffer, dataLength);

  return index;
};

/**
 * Creates the mousemove/touchmove handler
 */
export const createMouseMoveHandler = (
  svgRef: React.RefObject<SVGSVGElement | null>,
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  btcScale: d3.ScaleLinear<number, number>,
  data: BinanceKlineMetric[],
  lineData: IRawNode[],
  margin: ChartMargin,
  numBuffer: number,
  displayMode: string,
  isLocked: boolean,
  suppressEvents: boolean,
  darkMode: boolean,
  onMouseOver?: (params: { datum: BinanceKlineMetric; index: number }) => void
) => {
  return function (event: unknown) {
    if (suppressEvents) return;

    const svg = select(svgRef.current) as SVGSelection;
    const [xy] = pointers(event);
    const [x] = xy;

    const index = calculateIndexFromPosition(
      x,
      xScale,
      margin,
      numBuffer,
      data.length
    );

    if (!lineData[index]) {
      return;
    }

    // Calculate Y positions
    let y1: number;
    if (displayMode !== "standard") {
      y1 = yScale(lineData[index].y1SumInDollars);
    } else {
      y1 = yScale(parseFloat(data[index].closePrice));
    }

    // Get curve Y positions
    const linePath = svg.select(".line").node() as SVGPathElement;
    const lineOffset = xScale.bandwidth() / 2;
    const targetX = x - lineOffset;
    const curveY = findCurveYAtX(linePath, targetX, y1);

    const btcLinePath = svg.select("#btc-past-line").node() as SVGPathElement;
    const btcCurveY = findCurveYAtX(
      btcLinePath,
      x,
      btcScale(lineData[index].y1Sum)
    );

    updateCrosshairPosition(svg, x, curveY, btcCurveY);

    if (isLocked) return;

    const datum = data[index];
    if (!datum) return;

    const direction =
      parseFloat(data[data.length - 1].closePrice) >
      parseFloat(data[0].openPrice)
        ? 1
        : -1;

    const isPositiveChange = (i: number) => {
      let adjustedIndex = i;
      if (!data[i]) {
        adjustedIndex = data.length - numBuffer - 1;
      }

      const previousIndex = adjustedIndex - 1;
      const d = data[adjustedIndex];
      const price1 = parseFloat(d.closePrice);
      const previous = data[previousIndex];
      const price2 = previous ? parseFloat(previous.closePrice) : 0;
      return i === 0 ? false : price1 > price2;
    };

    updateBarHighlight(
      svg,
      index,
      "volume-chart",
      direction,
      isPositiveChange,
      numBuffer,
      data.length,
      darkMode
    );

    // console.log("index:B", index, numBuffer);
    if (onMouseOver) {
      onMouseOver({ datum, index: index - numBuffer });
    }
  };
};

/**
 * Creates the mouseleave/touchend handler
 */
export const createMouseLeaveHandler = (
  svgRef: React.RefObject<SVGSVGElement | null>,
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  btcScale: d3.ScaleLinear<number, number>,
  data: BinanceKlineMetric[],
  lineData: IRawNode[],
  numBuffer: number,
  displayMode: string,
  isLocked: boolean,
  suppressEvents: boolean,
  darkMode: boolean,
  onMouseOver?: (params: { datum: BinanceKlineMetric; index: number }) => void
) => {
  return function () {
    if (suppressEvents) return;

    const svg = select(svgRef.current) as SVGSelection;
    const index = data.length - numBuffer - 1;

    const x = (xScale(index.toString()) ?? 0) + xScale.bandwidth() * 1.5;

    let y1: number;
    if (displayMode !== "standard") {
      y1 = yScale(lineData[index].y1SumInDollars);
    } else {
      y1 = yScale(parseFloat(data[index].closePrice));
    }

    const btcLinePath = svg.select("#btc-past-line").node() as SVGPathElement;
    const btcCurveY = findCurveYAtX(
      btcLinePath,
      x,
      btcScale(lineData[index].y1Sum)
    );

    updateCrosshairPosition(svg, x, y1, btcCurveY);
    hideTickLines(svg);

    if (isLocked) return;

    const direction =
      parseFloat(data[data.length - 1].closePrice) >
      parseFloat(data[0].openPrice)
        ? 1
        : -1;

    const isPositiveChange = (i: number) => {
      let adjustedIndex = i;
      if (!data[i]) {
        adjustedIndex = data.length - numBuffer - 1;
      }

      const previousIndex = adjustedIndex - 1;
      const d = data[adjustedIndex];
      const price1 = parseFloat(d.closePrice);
      const previous = data[previousIndex];
      const price2 = previous ? parseFloat(previous.closePrice) : 0;
      return i === 0 ? false : price1 > price2;
    };

    updateBarHighlight(
      svg,
      index,
      "volume-chart",
      direction,
      isPositiveChange,
      numBuffer,
      data.length,
      darkMode
    );

    if (onMouseOver) {
      onMouseOver({ datum: data[index], index });
    }
  };
};

/**
 * Creates the click handler for bars
 */
export const createBarClickHandler = (
  data: BinanceKlineMetric[],
  lineData: IRawNode[],
  numBuffer: number,
  displayMode: string,
  isLocked: boolean,
  suppressEvents: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUI: any,
  onMouseOver?: (params: { datum: BinanceKlineMetric; index: number }) => void
) => {
  return (
    svg: SVGSelection,
    isMouseInteracting: React.MutableRefObject<boolean>
  ) => {
    svg.selectAll(".bar").on("click", (_, kline) => {
      isMouseInteracting.current = false;
      if (suppressEvents) return;

      let index: number;
      if (displayMode !== "standard") {
        index = lineData.findIndex((d) => d.x === (kline as IRawNode).x);
      } else {
        index = data.findIndex(
          (d) => d.openTime === (kline as BinanceKlineMetric).openTime
        );
      }

      if (index < numBuffer) {
        index = numBuffer;
      }

      const datum = data[index];

      if (isLocked) {
        dispatch(setUI({ graphIsLocked: false, graphSelectedIndex: null }));
      } else {
        dispatch(setUI({ graphIsLocked: true, graphSelectedIndex: index }));

        svg
          .selectAll(".bar")
          .attr("opacity", 0)
          .filter((_, i) => i === index)
          .attr("opacity", SELECTED_OPACITY);

        if (onMouseOver) {
          onMouseOver({ datum, index });
        }
      }
    });
  };
};
