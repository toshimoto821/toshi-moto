import { useMemo } from "react";
import { Wallet } from "@models/Wallet";
import { round, ONE_HUNDRED_MILLION } from "@lib/utils";
import { useBtcHistoricPrices } from "./useBtcHistoricPrices";
import type { StackedBarData } from "@root/components/graphs/line/Line";
import type { IRawNode, IPlotType, IPlotData } from "@root/types";
import {
  getGroupKey,
  getDatesForChartGroup,
} from "@components/graphs/graph-utils";
import { useAppSelector } from "./store.hooks";
import { selectUI } from "../slices/ui.slice";

type IUseChartData = {
  btcPrice?: number;
  wallets: Wallet[];
};

type Data = {
  date: Date;
  startDate: Date;
  endDate: Date;
  sum: number;
  avg: number;
  last: number;
  quoteAssetVolume: number;
  data: number[];
  i: number;
  key: string;
  isForecast: boolean;
};

type Grouped = Record<string, Data>;

export const useChartData = (opts: IUseChartData) => {
  const { btcPrice, wallets } = opts;

  const {
    graphSelectedTransactions: selectedTxs,
    graphStartDate,
    graphEndDate,
    displayMode,
    selectedWalletId,
    forecastEnabled,
  } = useAppSelector(selectUI);

  const btcPrices = useBtcHistoricPrices();

  const { group: graphTimeFrameGroup, forecastData } = btcPrices;

  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];

  // const selectedPlot = WalletUIContext.useSelector(
  //   (current) => current.context.plotData[current.context.selectedPlotIndex]
  // );

  // this is kinda broken.  the chart flickers because the
  // group updates immediately but the data doesn't
  // the group should be driven off the data

  const chartTimeDiffInDays = Math.round(
    (graphStartDate - graphEndDate) / (1000 * 60 * 60 * 24)
  );

  // add the current price
  // let timeDiff = 1000 * 60 * 60 * 24;
  // const now = new Date().getTime();
  // if (prices?.length > 2 && btcPrice && !forecastModel) {
  //   const lastPrice = prices[prices.length - 1][0];
  //   const secondToLastPrice = prices[prices.length - 2][0];

  //   timeDiff = lastPrice - secondToLastPrice;

  //   if (lastPrice < now && now - lastPrice < timeDiff) {
  //     const newLastPrice = lastPrice + timeDiff;
  //     prices.pop();
  //     prices.push([newLastPrice, btcPrice]);
  //   }
  // }

  const dateToKeyFn = getGroupKey(graphTimeFrameGroup!);
  const last = prices[prices.length - 1];
  const lastTs = last ? new Date(last.closeTime).getTime() : null;

  const isForecastData = (price: any) => {
    if (!forecastEnabled || !forecastData.length) return false;
    const forecastStartTime = forecastData[0].openTime;
    return price.openTime >= forecastStartTime;
  };

  // group the prices into buckets (hours, or weeks based on range)
  const grouped = useMemo(() => {
    return prices?.reduce((acc, curr) => {
      const { closeTime, closePrice, quoteAssetVolume, openTime } = curr;
      const price = parseFloat(closePrice);
      const ts = new Date(closeTime);
      const key = dateToKeyFn(ts);

      if (acc[key]) {
        acc[key] = {
          ...acc[key],
          sum: acc[key].sum + price,
          avg: (acc[key].sum + price) / (acc[key].data.length + 1),
          last: price,
          quoteAssetVolume:
            acc[key].quoteAssetVolume + parseFloat(quoteAssetVolume),
          data: [...acc[key].data, price],
          i: acc[key].i + 1,
          key,
          isForecast: acc[key].isForecast || isForecastData(curr),
        };
      } else {
        acc[key] = {
          date: new Date(closeTime + 1),
          startDate: new Date(openTime),
          endDate: new Date(closeTime),
          sum: price,
          last: price,
          avg: price,
          data: [price],
          quoteAssetVolume: parseFloat(quoteAssetVolume),
          i: 1,
          key,
          isForecast: isForecastData(curr),
        };
      }
      return acc;
    }, {} as Grouped);
  }, [
    btcPrice,
    prices.length,
    graphTimeFrameGroup,
    selectedTxs.length,
    // prices?.[0]?.[0], // if first date changes, update
    prices?.[0]?.closePrice, // if first date changes, update
    chartTimeDiffInDays,
    lastTs,
    last?.closePrice,
    forecastEnabled,
    forecastData.length,
  ]);

  const filteredWallets = selectedWalletId
    ? wallets.filter((wallet) => {
        return wallet.id === selectedWalletId;
      })
    : wallets;

  const groupedValues = Object.values(grouped || {});

  const node = groupedValues.map((d) => {
    return {
      x: d.date.getTime(),
      y1: 0, // not used
      y1Sum: 0,
      y1SumInDollars: 0,
      quoteAssetVolume: d.quoteAssetVolume,
      // y1, // shows the net value at the current price, not price of date range
      y2: round(d.last, 2),
      isForecast: d.isForecast,
    } as IRawNode;
  });

  const totalTransactions = filteredWallets.reduce(
    (acc, wallet) => wallet.loadedTransactionCount + acc,
    0
  );
  const { nodes, inputNodes } = useMemo(() => {
    const nodes = [] as StackedBarData[];
    const inputNodes = [] as StackedBarData[];
    // @loop 3 (p) (4 wallets)
    for (const wallet of filteredWallets) {
      // @loop 4 (q) (60 addresses each)
      for (const address of wallet.listAddresses) {
        // @loop 5 (r) (3 txs each)
        for (const tx of address.listTransactions) {
          const visible = selectedTxs.includes(tx.txid); // ||  selectedTxs.size === 0 ||
          // if (selectedTxs.size === 0 || selectedTxs.has(tx.txid)) {
          const vout = tx.sumVout(address.address);
          const vin = tx.sumVin(address.address);
          const value = vout || vin;
          const isUtxo = wallet.hasUtxo(address.address);
          if (vout > 0 && tx.date) {
            nodes.push({
              address: address.address,
              isUtxo,
              color: wallet.color,
              txid: tx.txid,
              utxoBalance: address.balance,
              vout,
              vin,
              value,
              visible,
              date: tx.date,
              walletName: wallet.name,
              walletId: wallet.id,
            });
          }
          if (vin && tx.date) {
            inputNodes.push({
              address: address.address,
              isUtxo,
              color: wallet.color,
              txid: tx.txid,
              utxoBalance: address.balance,
              vout,
              vin,
              value,
              visible,
              date: tx.date,
              walletName: wallet.name,
              walletId: wallet.id,
            });
          }
          // }
        }
      }
    }
    return {
      nodes,
      inputNodes,
    };
  }, [
    filteredWallets.length,
    selectedTxs.length,
    displayMode,
    prices.length,
    selectedWalletId,
    chartTimeDiffInDays,
    totalTransactions,
    lastTs,
  ]);

  const allNodes = [
    ...inputNodes.map((n) => ({ ...n, type: "VIN" })),
    ...nodes.map((n) => ({ ...n, type: "VOUT" })),
  ];

  const groupedKeys = Object.keys(grouped);
  const { inputOutputByDateMap, preVinSum, preVoutSum } = useMemo(() => {
    // vin/vout is confusing because a vout means the address received btc
    // where a vin means the address sent btc. its not "going in" or "going out"
    // its vin == spent, vout == received
    const inputOutputByDateMap = {
      received: new Map<number, StackedBarData[]>(),
      spent: new Map<number, StackedBarData[]>(),
    };

    const nodesCopy = nodes.slice();
    const inputNodesCopy = inputNodes.slice();

    const groupValues = Object.values(grouped || {});
    const [firstGroup] = groupValues;
    // const preVouts = [] as StackedBarData[];
    let preVoutSum = 0;
    let preVinSum = 0;
    if (firstGroup?.startDate) {
      for (const node of nodesCopy) {
        if (node.vout > 0 && node.date < firstGroup?.startDate) {
          // preVouts.push(node);
          preVoutSum += node.vout;
        }
      }
      for (const node of inputNodesCopy) {
        if (node.vin > 0 && node.date < firstGroup?.startDate) {
          preVinSum += node.vin;
        }
      }
    }
    let j = 0;
    for (const group of groupValues) {
      for (let i = nodesCopy.length - 1; i >= 0; i--) {
        const node = nodesCopy[i];
        const { start, end } = getDatesForChartGroup(
          group.startDate,
          group.endDate,
          graphTimeFrameGroup!,
          groupValues[j + 1]?.startDate
        );
        if (
          node.vout > 0 &&
          // this date need to round to day

          node.date >= start &&
          node.date < end
        ) {
          const ts = group.date.getTime();
          const nodeArr = inputOutputByDateMap.received.get(ts) || [];
          inputOutputByDateMap.received.set(ts, [...nodeArr, node]);
          nodesCopy.splice(i, 1);
        }
      }

      // for (const node of inputNodes) {
      for (let i = inputNodesCopy.length - 1; i >= 0; i--) {
        const node = inputNodesCopy[i];
        const { start, end } = getDatesForChartGroup(
          group.startDate,
          group.endDate,
          graphTimeFrameGroup!,
          groupValues[j + 1]?.startDate
        );
        if (node.vin > 0 && node.date >= start && node.date < end) {
          const ts = group.date.getTime();
          const nodeArr = inputOutputByDateMap.spent.get(ts) || [];
          inputOutputByDateMap.spent.set(ts, [...nodeArr, node]);
          inputNodesCopy.splice(i, 1);
        }
      }
      j++;
    }

    return {
      inputOutputByDateMap,
      preVinSum,
      preVoutSum,
    };
  }, [
    nodes.length,
    inputNodes.length,
    selectedTxs.length,
    displayMode,
    groupedKeys.length,
    groupedKeys[0],
    chartTimeDiffInDays,
    totalTransactions,
    lastTs,
  ]);

  const { lineData, lineMap } = useMemo(() => {
    const lineMap = {} as Record<string, IRawNode>;

    for (let i = 0; i < node.length; i++) {
      const n = node[i];
      n.y1 =
        typeof node[i - 1]?.y1 !== "undefined"
          ? node[i - 1]?.y1
          : preVoutSum - preVinSum;

      const receivedTxs = inputOutputByDateMap.received.get(n.x);
      const spentTxs = inputOutputByDateMap.spent.get(n.x);
      let intoSum = 0;
      if (receivedTxs?.length) {
        // n.y1 += node[i - 1]?.y1 || 0;
        intoSum = receivedTxs.reduce((acc, curr) => {
          return acc + curr.vout;
        }, 0);
      }
      n.y1 += intoSum;
      let outSum = 0;
      if (spentTxs?.length) {
        outSum = spentTxs.reduce((acc, curr) => {
          return acc + curr.vin;
        }, 0);
      }
      n.y1 -= outSum;
      n.y1Sum = n.y1 / ONE_HUNDRED_MILLION;
      n.y1SumInDollars = (n.y1 / ONE_HUNDRED_MILLION) * n.y2;
      const key = dateToKeyFn(new Date(n.x));
      lineMap[key] = n;
    }

    return { lineData: node, lineMap };
  }, [node, graphStartDate, groupedKeys[0], prices.length, lastTs]);

  const plotData = useMemo(() => {
    const plotData = [] as IPlotData[];
    for (const n of allNodes) {
      const key = dateToKeyFn(n.date);
      const grp = grouped[key];

      // something is wrong with the date
      if (grp && n.visible) {
        const values = Object.values(lineMap).reverse();
        const yValue = values.find((v) => n.date.getTime() > v.x);
        // const yValue = lineMap[key];
        if (yValue) {
          const plot = {
            x: grp.date.getTime(),
            type: n.type as IPlotType,
            value: n.vout || n.vin,
            node: yValue,
            data: n,
            grpSum: grp.sum,
            isForecast: grp.isForecast,
          };
          plotData.push(plot);
        }
      }
    }
    return plotData;
  }, [
    allNodes,
    allNodes.length,
    allNodes[0]?.date?.getTime(),
    selectedTxs.length,
  ]);

  const { gain, percentGain, totalInvested } = useMemo(() => {
    if (!lineData || lineData.length === 0) {
      return { gain: 0, percentGain: 0 };
    }

    // Use all data (historical + forecast) when forecast is enabled, otherwise only historical
    const calculationLineData = forecastEnabled
      ? lineData // Include forecast data for projections
      : lineData.filter((d) => !d.isForecast); // Only historical data

    if (calculationLineData.length === 0) {
      return { gain: 0, percentGain: 0 };
    }

    let costBasis = 0;
    let totalInvested = 0;
    let firstBuyFound = false;
    let previousY1Sum = 0;

    // Loop through line data to find the first increase (buy) and calculate cost basis
    for (const dataPoint of calculationLineData) {
      const currentY1Sum = dataPoint.y1Sum;

      // Check if this is the first increase (buy)
      if (!firstBuyFound && currentY1Sum > previousY1Sum) {
        firstBuyFound = true;
        // Calculate cost basis from the increase
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2; // y2 is the BTC price at this time
        totalInvested += increase;
      } else if (firstBuyFound && currentY1Sum > previousY1Sum) {
        // Additional buys
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2;
        totalInvested += increase;
      }

      previousY1Sum = currentY1Sum;
    }

    // Calculate current value and gains (using last data point which could be forecast)
    const lastDataPoint = calculationLineData[calculationLineData.length - 1];
    const currentValue = lastDataPoint.y1Sum * lastDataPoint.y2;

    const gain = currentValue - costBasis;
    const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

    return { gain, percentGain, totalInvested };
  }, [lineData[lineData.length - 1]?.x, lineData[0]?.x, forecastEnabled]);

  const { percentageChange, valueChange } = useMemo(() => {
    if (!lineData?.length) {
      return { percentageChange: 0, valueChange: 0 };
    }

    const key = displayMode !== "standard" ? "y1SumInDollars" : "y2";
    const firstPrice: number = lineData[0][key];
    const lastPrice = lineData[lineData.length - 1][key];

    const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    const valueChange = lastPrice - firstPrice;

    return { percentageChange, valueChange };
  }, [
    lineData[lineData.length - 1]?.x,
    lineData[0]?.x,
    displayMode,
    selectedWalletId,
    gain,
    percentGain,
    totalInvested,
  ]);

  const { cagrPercentage, cagrDollar } = useMemo(() => {
    if (!lineData?.length) {
      return { cagrPercentage: 0, cagrDollar: 0 };
    }

    // Always use only historical data for CAGR calculation to keep it consistent
    const historicalLineData = lineData.filter((d) => !d.isForecast);

    if (historicalLineData.length === 0) {
      return { cagrPercentage: 0, cagrDollar: 0 };
    }

    // Find the first non-zero data point for CAGR calculation
    let firstNonZeroIndex = 0;
    for (let i = 0; i < historicalLineData.length; i++) {
      const key = displayMode !== "standard" ? "y1SumInDollars" : "y2";
      if (historicalLineData[i][key] > 0) {
        firstNonZeroIndex = i;
        break;
      }
    }

    // If no non-zero data points found, return 0
    if (firstNonZeroIndex >= historicalLineData.length) {
      return { cagrPercentage: 0, cagrDollar: 0 };
    }

    // Calculate cost basis using the same logic as gain calculation
    let costBasis = 0;
    let firstBuyFound = false;
    let previousY1Sum = 0;

    // Loop through line data to find the first increase (buy) and calculate cost basis
    for (const dataPoint of historicalLineData) {
      const currentY1Sum = dataPoint.y1Sum;

      // Check if this is the first increase (buy)
      if (!firstBuyFound && currentY1Sum > previousY1Sum) {
        firstBuyFound = true;
        // Calculate cost basis from the increase
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2; // y2 is the BTC price at this time
      } else if (firstBuyFound && currentY1Sum > previousY1Sum) {
        // Additional buys
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2;
      }

      previousY1Sum = currentY1Sum;
    }

    // Calculate current value using only historical data
    const lastDataPoint = historicalLineData[historicalLineData.length - 1];
    const currentValue = lastDataPoint.y1Sum * lastDataPoint.y2;

    const firstDate = new Date(historicalLineData[firstNonZeroIndex].x);
    const lastDate = new Date(
      historicalLineData[historicalLineData.length - 1].x
    );

    // Calculate time period in years
    const timeInYears =
      (lastDate.getTime() - firstDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);

    if (timeInYears <= 0 || costBasis <= 0) {
      return { cagrPercentage: 0, cagrDollar: 0 };
    }

    // Calculate CAGR percentage using cost basis: (final_value / initial_cost_basis)^(1/time_in_years) - 1
    const cagrPercentage =
      (Math.pow(currentValue / costBasis, 1 / timeInYears) - 1) * 100;

    // Calculate average annual dollar gain
    const totalValueChange = currentValue - costBasis;
    const cagrDollar = totalValueChange / timeInYears;

    return { cagrPercentage, cagrDollar };
  }, [
    lineData[lineData.length - 1]?.x,
    lineData[0]?.x,
    lineData.length,
    displayMode,
    selectedWalletId,
    gain,
    percentGain,
    totalInvested,
  ]);

  // Calculate projected CAGR when forecast is enabled
  const { projectedCagrPercentage, projectedCagrDollar } = useMemo(() => {
    if (!forecastEnabled || !lineData?.length) {
      return { projectedCagrPercentage: 0, projectedCagrDollar: 0 };
    }

    // Use all data (historical + forecast) for projected CAGR
    const allLineData = lineData;

    // Find the first non-zero data point for CAGR calculation
    let firstNonZeroIndex = 0;
    for (let i = 0; i < allLineData.length; i++) {
      const key = displayMode !== "standard" ? "y1SumInDollars" : "y2";
      if (allLineData[i][key] > 0) {
        firstNonZeroIndex = i;
        break;
      }
    }

    // If no non-zero data points found, return 0
    if (firstNonZeroIndex >= allLineData.length) {
      return { projectedCagrPercentage: 0, projectedCagrDollar: 0 };
    }

    // Calculate cost basis using the same logic as gain calculation
    let costBasis = 0;
    let firstBuyFound = false;
    let previousY1Sum = 0;

    // Loop through line data to find the first increase (buy) and calculate cost basis
    for (const dataPoint of allLineData) {
      const currentY1Sum = dataPoint.y1Sum;

      // Check if this is the first increase (buy)
      if (!firstBuyFound && currentY1Sum > previousY1Sum) {
        firstBuyFound = true;
        // Calculate cost basis from the increase
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2; // y2 is the BTC price at this time
      } else if (firstBuyFound && currentY1Sum > previousY1Sum) {
        // Additional buys
        const increase = currentY1Sum - previousY1Sum;
        costBasis += increase * dataPoint.y2;
      }

      previousY1Sum = currentY1Sum;
    }

    // Calculate projected value using last data point (which includes forecast)
    const lastDataPoint = allLineData[allLineData.length - 1];
    const projectedValue = lastDataPoint.y1Sum * lastDataPoint.y2;

    const firstDate = new Date(allLineData[firstNonZeroIndex].x);
    const lastDate = new Date(allLineData[allLineData.length - 1].x);

    // Calculate time period in years
    const timeInYears =
      (lastDate.getTime() - firstDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);

    if (timeInYears <= 0 || costBasis <= 0) {
      return { projectedCagrPercentage: 0, projectedCagrDollar: 0 };
    }

    // Calculate projected CAGR percentage
    const projectedCagrPercentage =
      (Math.pow(projectedValue / costBasis, 1 / timeInYears) - 1) * 100;

    // Calculate average annual dollar gain
    const totalValueChange = projectedValue - costBasis;
    const projectedCagrDollar = totalValueChange / timeInYears;

    return { projectedCagrPercentage, projectedCagrDollar };
  }, [
    lineData[lineData.length - 1]?.x,
    lineData[0]?.x,
    lineData.length,
    displayMode,
    forecastEnabled,
    selectedWalletId,
    gain,
    percentGain,
    totalInvested,
  ]);

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
