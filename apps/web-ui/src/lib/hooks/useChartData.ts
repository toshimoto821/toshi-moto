import { useMemo } from "react";
import { Wallet } from "@models/Wallet";
import { useBtcHistoricPrices } from "./useBtcHistoricPrices";
import { useAppSelector } from "./store.hooks";
import { selectUI } from "../slices/ui.slice";
import {
  groupPricesByTimeframe,
  createTransactionNodes,
  createInputOutputByDateMap,
  calculateLineData,
  calculatePlotData,
  calculateCostBasisAndGains,
  calculatePercentageChange,
  calculateCAGR,
  type Grouped,
} from "./useChartData.utils";

type IUseChartData = {
  btcPrice?: number;
  wallets: Wallet[];
};

/**
 * Custom hook that processes wallet transaction data and BTC price history
 * to generate chart data, financial metrics, and performance statistics.
 *
 * Main responsibilities:
 * 1. Group BTC prices by timeframe (hourly, daily, weekly, etc.)
 * 2. Process wallet transactions into received/spent nodes
 * 3. Calculate cumulative BTC balance over time
 * 4. Compute financial metrics (gains, CAGR, percentage changes)
 * 5. Generate plot data for chart visualization
 */
export const useChartData = (opts: IUseChartData) => {
  const { wallets } = opts;

  // ============================================================================
  // STATE & CONTEXT
  // ============================================================================
  const {
    graphSelectedTransactions: selectedTxs,
    displayMode,
    selectedWalletId,
    forecastEnabled,
  } = useAppSelector(selectUI);

  const btcPrices = useBtcHistoricPrices();
  const {
    group: graphTimeFrameGroup,
    forecastData = [],
    prices = [],
  } = btcPrices;

  // ============================================================================
  // STEP 1: GROUP BTC PRICES BY TIMEFRAME
  // ============================================================================
  // Groups raw price data into buckets (e.g., hourly, daily) based on the selected timeframe
  const groupedPrices: Grouped = useMemo(() => {
    if (!prices.length || !graphTimeFrameGroup) return {};

    return groupPricesByTimeframe(
      prices,
      graphTimeFrameGroup,
      forecastData,
      forecastEnabled
    );
  }, [prices, graphTimeFrameGroup, forecastData, forecastEnabled]);

  // ============================================================================
  // STEP 2: EXTRACT TRANSACTION NODES FROM WALLETS
  // ============================================================================
  // Processes all wallet transactions into two arrays:
  // - nodes: transactions where BTC was received (vout)
  // - inputNodes: transactions where BTC was spent (vin)
  const { nodes: receivedNodes, inputNodes: spentNodes } = useMemo(() => {
    return createTransactionNodes(wallets, selectedTxs, selectedWalletId);
  }, [wallets, selectedTxs, selectedWalletId]);

  // ============================================================================
  // STEP 3: MAP TRANSACTIONS TO TIME BUCKETS
  // ============================================================================
  // Organizes transactions into the same time buckets as the grouped prices
  // Also calculates any transactions that occurred before the chart start date
  const { inputOutputByDateMap, preVinSum, preVoutSum } = useMemo(() => {
    if (!graphTimeFrameGroup) {
      return {
        inputOutputByDateMap: {
          received: new Map(),
          spent: new Map(),
        },
        preVinSum: 0,
        preVoutSum: 0,
      };
    }

    return createInputOutputByDateMap(
      receivedNodes,
      spentNodes,
      groupedPrices,
      graphTimeFrameGroup
    );
  }, [receivedNodes, spentNodes, groupedPrices, graphTimeFrameGroup]);

  // ============================================================================
  // STEP 4: CALCULATE CUMULATIVE BTC BALANCE OVER TIME
  // ============================================================================
  // Creates the main line chart data showing BTC balance at each time point
  // y1 = cumulative BTC balance (in satoshis)
  // y2 = BTC price at that time
  const { lineData, lineMap } = useMemo(() => {
    return calculateLineData(
      groupedPrices,
      inputOutputByDateMap,
      preVoutSum,
      preVinSum
    );
  }, [groupedPrices, inputOutputByDateMap, preVoutSum, preVinSum]);

  // ============================================================================
  // STEP 5: GENERATE PLOT POINTS FOR INDIVIDUAL TRANSACTIONS
  // ============================================================================
  // Creates scatter plot points for each visible transaction on the chart
  const allTransactionNodes = useMemo(
    () => [
      ...spentNodes.map((n) => ({ ...n, type: "VIN" })),
      ...receivedNodes.map((n) => ({ ...n, type: "VOUT" })),
    ],
    [spentNodes, receivedNodes]
  );

  const plotData = useMemo(() => {
    if (!graphTimeFrameGroup) return [];

    return calculatePlotData(
      allTransactionNodes,
      groupedPrices,
      lineMap,
      graphTimeFrameGroup
    );
  }, [allTransactionNodes, groupedPrices, lineMap, graphTimeFrameGroup]);

  // ============================================================================
  // STEP 6: CALCULATE FINANCIAL METRICS
  // ============================================================================

  // Calculate gains and cost basis
  const { gain, percentGain, totalInvested } = useMemo(() => {
    return calculateCostBasisAndGains(lineData, forecastEnabled);
  }, [lineData, forecastEnabled]);

  // Calculate percentage change over the time period
  const { percentageChange, valueChange } = useMemo(() => {
    return calculatePercentageChange(lineData, displayMode);
  }, [lineData, displayMode]);

  // Calculate historical CAGR (Compound Annual Growth Rate)
  const { cagrPercentage, cagrDollar } = useMemo(() => {
    return calculateCAGR(lineData, displayMode, false);
  }, [lineData, displayMode]);

  // Calculate projected CAGR when forecast is enabled
  const {
    cagrPercentage: projectedCagrPercentage,
    cagrDollar: projectedCagrDollar,
  } = useMemo(() => {
    if (!forecastEnabled) {
      return { cagrPercentage: 0, cagrDollar: 0 };
    }
    return calculateCAGR(lineData, displayMode, true);
  }, [lineData, displayMode, forecastEnabled]);

  // ============================================================================
  // RETURN ALL COMPUTED DATA
  // ============================================================================
  return {
    plotData,
    lineData,
    loading: btcPrices.loading,
    gain,
    percentGain,
    totalInvested,
    percentageChange,
    valueChange,
    cagrPercentage,
    cagrDollar,
    forecastEnabled,
    projectedCagrPercentage,
    projectedCagrDollar,
  };
};
