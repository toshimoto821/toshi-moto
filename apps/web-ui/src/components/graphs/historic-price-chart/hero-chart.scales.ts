import { scaleLinear, scaleBand, min, max, extent } from "d3";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import type { IRawNode } from "@root/types";
import type { ChartMargin, ChartScales } from "./hero-chart.types";

/**
 * Creates the X scale for the chart (band scale for discrete time points)
 */
export const createXScale = (
  dataLength: number,
  width: number,
  margin: ChartMargin
) => {
  const range = [margin.left, width - margin.right];
  const domain = Array.from({ length: dataLength }, (_, i) => i.toString());

  return scaleBand().domain(domain).range(range).padding(0.1);
};

/**
 * Calculates the Y extent (min/max) based on display mode
 */
export const calculateYExtent = (
  displayMode: string,
  lineData: IRawNode[],
  data: BinanceKlineMetric[]
): [number, number] => {
  if (displayMode !== "standard") {
    const minValue = min(lineData, (d) => d.y1SumInDollars) ?? 0;
    const maxValue = max(lineData, (d) => d.y1SumInDollars) ?? 0;
    return [minValue, maxValue];
  }

  const minValue =
    min(data, (d) =>
      Math.min(parseFloat(d.closePrice), parseFloat(d.openPrice))
    ) ?? 0;
  const maxValue =
    max(data, (d) =>
      Math.max(parseFloat(d.closePrice), parseFloat(d.openPrice))
    ) ?? 0;

  return [minValue, maxValue];
};

/**
 * Creates the Y scale for price data
 */
export const createYScale = (
  yExtent: [number, number],
  height: number,
  margin: ChartMargin
) => {
  return scaleLinear()
    .domain(yExtent)
    .range([height - margin.bottom, margin.top]);
};

/**
 * Creates the BTC scale for displaying BTC allocation
 */
export const createBtcScale = (
  lineData: IRawNode[],
  height: number,
  margin: ChartMargin,
  topY: number
) => {
  const btcExtent = extent(lineData, (d) => d.y1Sum) as [number, number];
  const diff = Math.abs(btcExtent[0] - btcExtent[1]);
  const d1 = diff === 0 ? 0 : btcExtent[0];
  const d2 = btcExtent[1];

  // When user has zero BTC (d1 === 0 && d2 === 0), position the line at the bottom
  return scaleLinear()
    .domain([d1, d2 === 0 ? 1 : d2]) // Ensure domain has some range when BTC is zero
    .range([height - margin.bottom, d2 === 0 ? height - margin.bottom : topY]);
};

/**
 * Creates all scales needed for the chart
 */
export const createChartScales = (
  data: BinanceKlineMetric[],
  lineData: IRawNode[],
  width: number,
  height: number,
  margin: ChartMargin,
  displayMode: string,
  yValueToUse: "y1SumInDollars" | "y2"
): ChartScales => {
  const xScale = createXScale(data.length, width, margin);
  const yExtent = calculateYExtent(displayMode, lineData, data);
  const yScale = createYScale(yExtent, height, margin);

  // Calculate top position for BTC scale
  const lastNode = lineData[lineData.length - 1];
  const topY = lastNode ? yScale(lastNode[yValueToUse]) : margin.top;

  const btcScale = createBtcScale(lineData, height, margin, topY);

  return { xScale, yScale, btcScale };
};

/**
 * Calculate optimal number of ticks based on available height
 */
export const calculateOptimalTicks = (
  height: number,
  minTickSpacing = 40
): number => {
  return Math.floor(height / minTickSpacing);
};
