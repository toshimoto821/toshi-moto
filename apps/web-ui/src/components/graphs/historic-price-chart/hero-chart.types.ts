import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import type { IRawNode } from "@root/types";

export interface IHeroChart {
  height: number;
  width: number;
  suppressLegengs?: boolean;
  suppressEvents?: boolean;
  bgColor?: string;
  id?: string;
  onMouseOver?: ({
    datum,
    index,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => void;
}

export type Plot = {
  x: number;
  y1: number;
  y1Sum: number;
  y1SumInDollars: number;
  y2: number;
  quoteAssetVolume: number;
};

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ChartScales = {
  xScale: d3.ScaleBand<string>;
  yScale: d3.ScaleLinear<number, number>;
  btcScale: d3.ScaleLinear<number, number>;
};

export type ChartData = {
  data: BinanceKlineMetric[];
  lineData: IRawNode[];
  numBuffer: number;
};

export type MousePosition = {
  x: number;
  y: number;
  index: number;
};
