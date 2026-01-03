import type { ICurrency } from "@root/types";
import type { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";

interface ToastMessage {
  line1: string;
  line2?: string;
}

export interface UIState {
  breakpoint: number;
  currency: ICurrency;
  debugMode: boolean;
  darkMode: boolean;
  filterUtxoOnly: string[];
  graphTimeFrameRange: GraphTimeFrameRange | null;
  previousGraphTimeFrameRange: GraphTimeFrameRange | null;
  graphTimeFrameGroup: GroupBy;
  graphStartDate: number;
  graphStartDateNext: number | null;
  graphEndDate: number;
  graphEndDateNext: number | null;
  graphBtcAllocation: boolean;
  graphPlotDots: boolean;
  graphSelectedTransactions: string[];
  graphIsLocked: boolean;
  graphSelectedIndex: number | null;
  graphShowAxisLines: boolean;
  navbarBalanceVisibility: boolean;
  displayMode: "standard" | "netAsset" | "cagr";
  privatePrice: boolean;
  selectedWalletId: string | null;
  toastOpen: boolean;
  toastMessage: ToastMessage | null;
  walletExpandedAddresses: string[];
  // Forecast functionality
  forecastEnabled: boolean;
  forecastCagr: number;
  forecastData: BinanceKlineMetric[];
}

export type GraphTimeFrameRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "2Y"
  | "5Y";

export type GroupBy =
  | "5m"
  | "15m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";
