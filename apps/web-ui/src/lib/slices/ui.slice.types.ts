import type { ICurrency } from "@root/types";

export interface UIState {
  currency: ICurrency;
  graphTimeFrameRange: GraphTimeFrameRange;
  graphTimeFrameGroup: GroupBy;
  graphStartDate: number;
  graphEndDate: number;
  graphBtcAllocation: boolean;
  graphPlotDots: boolean;
  graphSelectedTransactions: string[];
  netAssetValue: boolean;
  privatePrice: boolean;
}

export type GraphTimeFrameRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "2Y"
  | "5Y"
  | "ALL";

export type GroupBy = "5M" | "1H" | "1D" | "1W";
