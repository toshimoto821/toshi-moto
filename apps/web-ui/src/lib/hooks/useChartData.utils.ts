import { Wallet } from "@models/Wallet";
import { round, ONE_HUNDRED_MILLION } from "@lib/utils";
import type { StackedBarData } from "@root/components/graphs/line/Line";
import type { IRawNode, IPlotType, IPlotData } from "@root/types";
import type { GroupBy } from "@lib/slices/ui.slice.types";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import {
  getGroupKey,
  getDatesForChartGroup,
} from "@components/graphs/graph-utils";

export type Data = {
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

export type Grouped = Record<string, Data>;

export type InputOutputByDateMap = {
  received: Map<number, StackedBarData[]>;
  spent: Map<number, StackedBarData[]>;
};

export type DisplayMode = "standard" | "netAsset" | "cagr";

export const groupPricesByTimeframe = (
  prices: BinanceKlineMetric[],
  graphTimeFrameGroup: GroupBy,
  forecastData: BinanceKlineMetric[],
  forecastEnabled: boolean
): Grouped => {
  const dateToKeyFn = getGroupKey(graphTimeFrameGroup);

  const isForecastData = (price: BinanceKlineMetric) => {
    if (!forecastEnabled || !forecastData?.length) return false;
    const forecastStartTime = forecastData[0].openTime;
    return price.openTime >= forecastStartTime;
  };

  return prices.reduce((acc, curr) => {
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
};

export const createTransactionNodes = (
  wallets: Wallet[],
  selectedTxs: string[],
  selectedWalletId?: string | null,
  graphPlotDots: boolean = false
): { nodes: StackedBarData[]; inputNodes: StackedBarData[] } => {
  const filteredWallets = selectedWalletId
    ? wallets.filter((wallet) => wallet.id === selectedWalletId)
    : wallets;

  const nodes: StackedBarData[] = [];
  const inputNodes: StackedBarData[] = [];

  for (const wallet of filteredWallets) {
    for (const address of wallet.listAddresses) {
      for (const tx of address.listTransactions) {
        const visible = graphPlotDots || selectedTxs.includes(tx.txid);
        const vout = tx.sumVout(address.address);
        const vin = tx.sumVin(address.address);
        const value = vout || vin;
        const isUtxo = wallet.hasUtxo(address.address);

        const nodeData = {
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
        };

        if (vout > 0 && tx.date) {
          nodes.push(nodeData as StackedBarData);
        }
        if (vin && tx.date) {
          inputNodes.push(nodeData as StackedBarData);
        }
      }
    }
  }

  return { nodes, inputNodes };
};

export const createInputOutputByDateMap = (
  nodes: StackedBarData[],
  inputNodes: StackedBarData[],
  grouped: Grouped,
  graphTimeFrameGroup: GroupBy
): {
  inputOutputByDateMap: InputOutputByDateMap;
  preVinSum: number;
  preVoutSum: number;
} => {
  const inputOutputByDateMap: InputOutputByDateMap = {
    received: new Map<number, StackedBarData[]>(),
    spent: new Map<number, StackedBarData[]>(),
  };

  const nodesCopy = nodes.slice();
  const inputNodesCopy = inputNodes.slice();
  const groupValues = Object.values(grouped);
  const [firstGroup] = groupValues;

  let preVoutSum = 0;
  let preVinSum = 0;

  if (firstGroup?.startDate) {
    for (const node of nodesCopy) {
      if (node.vout > 0 && node.date < firstGroup.startDate) {
        preVoutSum += node.vout;
      }
    }
    for (const node of inputNodesCopy) {
      if (node.vin > 0 && node.date < firstGroup.startDate) {
        preVinSum += node.vin;
      }
    }
  }

  for (let j = 0; j < groupValues.length; j++) {
    const group = groupValues[j];

    // Process received transactions
    for (let i = nodesCopy.length - 1; i >= 0; i--) {
      const node = nodesCopy[i];
      const { start, end } = getDatesForChartGroup(
        group.startDate,
        group.endDate,
        graphTimeFrameGroup,
        groupValues[j + 1]?.startDate
      );

      if (node.vout > 0 && node.date >= start && node.date < end) {
        const ts = group.date.getTime();
        const nodeArr = inputOutputByDateMap.received.get(ts) || [];
        inputOutputByDateMap.received.set(ts, [...nodeArr, node]);
        nodesCopy.splice(i, 1);
      }
    }

    // Process spent transactions
    for (let i = inputNodesCopy.length - 1; i >= 0; i--) {
      const node = inputNodesCopy[i];
      const { start, end } = getDatesForChartGroup(
        group.startDate,
        group.endDate,
        graphTimeFrameGroup,
        groupValues[j + 1]?.startDate
      );

      if (node.vin > 0 && node.date >= start && node.date < end) {
        const ts = group.date.getTime();
        const nodeArr = inputOutputByDateMap.spent.get(ts) || [];
        inputOutputByDateMap.spent.set(ts, [...nodeArr, node]);
        inputNodesCopy.splice(i, 1);
      }
    }
  }

  return { inputOutputByDateMap, preVinSum, preVoutSum };
};

export const calculateLineData = (
  grouped: Grouped,
  inputOutputByDateMap: InputOutputByDateMap,
  preVoutSum: number,
  preVinSum: number
): { lineData: IRawNode[]; lineMap: Record<string, IRawNode> } => {
  const groupedValues = Object.values(grouped);
  const lineMap: Record<string, IRawNode> = {};

  const node: IRawNode[] = groupedValues.map((d) => ({
    x: d.date.getTime(),
    y1: 0,
    y1Sum: 0,
    y1SumInDollars: 0,
    quoteAssetVolume: d.quoteAssetVolume,
    y2: round(d.last, 2),
    isForecast: d.isForecast,
  }));

  const dateToKeyFn = getGroupKey("1h" as GroupBy);

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
      intoSum = receivedTxs.reduce((acc, curr) => acc + curr.vout, 0);
    }
    n.y1 += intoSum;

    let outSum = 0;
    if (spentTxs?.length) {
      outSum = spentTxs.reduce((acc, curr) => acc + curr.vin, 0);
    }
    n.y1 -= outSum;
    n.y1Sum = n.y1 / ONE_HUNDRED_MILLION;
    n.y1SumInDollars = (n.y1 / ONE_HUNDRED_MILLION) * n.y2;

    const key = dateToKeyFn(new Date(n.x));
    lineMap[key] = n;
  }

  return { lineData: node, lineMap };
};

export const calculatePlotData = (
  allNodes: (StackedBarData & { type: string })[],
  grouped: Grouped,
  lineMap: Record<string, IRawNode>,
  graphTimeFrameGroup: GroupBy
): IPlotData[] => {
  const dateToKeyFn = getGroupKey(graphTimeFrameGroup);
  const plotData: IPlotData[] = [];

  for (const n of allNodes) {
    const key = dateToKeyFn(n.date);
    const grp = grouped[key];

    if (grp && n.visible) {
      const values = Object.values(lineMap).reverse();
      const yValue = values.find((v) => n.date.getTime() > v.x);

      if (yValue) {
        const plot: IPlotData = {
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
};

export const calculateCostBasisAndGains = (
  lineData: IRawNode[],
  forecastEnabled: boolean
) => {
  if (!lineData || lineData.length === 0) {
    return { gain: 0, percentGain: 0, totalInvested: 0, costBasis: 0 };
  }

  const calculationLineData = forecastEnabled
    ? lineData
    : lineData.filter((d) => !d.isForecast);

  if (calculationLineData.length === 0) {
    return { gain: 0, percentGain: 0, totalInvested: 0, costBasis: 0 };
  }

  let costBasis = 0;
  let totalInvested = 0;
  let firstBuyFound = false;
  let previousY1Sum = 0;

  for (const dataPoint of calculationLineData) {
    const currentY1Sum = dataPoint.y1Sum;

    if (!firstBuyFound && currentY1Sum > previousY1Sum) {
      firstBuyFound = true;
      const increase = currentY1Sum - previousY1Sum;
      costBasis += increase * dataPoint.y2;
      totalInvested += increase;
    } else if (firstBuyFound && currentY1Sum > previousY1Sum) {
      const increase = currentY1Sum - previousY1Sum;
      costBasis += increase * dataPoint.y2;
      totalInvested += increase;
    }

    previousY1Sum = currentY1Sum;
  }

  const lastDataPoint = calculationLineData[calculationLineData.length - 1];
  const currentValue = lastDataPoint.y1Sum * lastDataPoint.y2;

  const gain = currentValue - costBasis;
  const percentGain = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  return { gain, percentGain, totalInvested, costBasis };
};

export const calculatePercentageChange = (
  lineData: IRawNode[],
  displayMode: DisplayMode
) => {
  if (!lineData?.length) {
    return { percentageChange: 0, valueChange: 0 };
  }

  const key = displayMode !== "standard" ? "y1SumInDollars" : "y2";
  const firstPrice: number = lineData[0][key];
  const lastPrice = lineData[lineData.length - 1][key];

  const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const valueChange = lastPrice - firstPrice;

  return { percentageChange, valueChange };
};

export const calculateCAGR = (
  lineData: IRawNode[],
  displayMode: DisplayMode,
  includeForecasts = false
) => {
  if (!lineData?.length) {
    return { cagrPercentage: 0, cagrDollar: 0 };
  }

  const dataToUse = includeForecasts
    ? lineData
    : lineData.filter((d) => !d.isForecast);

  if (dataToUse.length === 0) {
    return { cagrPercentage: 0, cagrDollar: 0 };
  }

  let firstNonZeroIndex = 0;
  for (let i = 0; i < dataToUse.length; i++) {
    const key = displayMode !== "standard" ? "y1SumInDollars" : "y2";
    if (dataToUse[i][key] > 0) {
      firstNonZeroIndex = i;
      break;
    }
  }

  if (firstNonZeroIndex >= dataToUse.length) {
    return { cagrPercentage: 0, cagrDollar: 0 };
  }

  const { costBasis } = calculateCostBasisAndGains(dataToUse, includeForecasts);
  const lastDataPoint = dataToUse[dataToUse.length - 1];
  const currentValue = lastDataPoint.y1Sum * lastDataPoint.y2;

  const firstDate = new Date(dataToUse[firstNonZeroIndex].x);
  const lastDate = new Date(dataToUse[dataToUse.length - 1].x);

  const timeInYears =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const timeInDays =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  if (timeInDays < 30 || timeInYears <= 0 || costBasis <= 0) {
    return { cagrPercentage: 0, cagrDollar: 0 };
  }

  const cagrPercentage =
    (Math.pow(currentValue / costBasis, 1 / timeInYears) - 1) * 100;
  const totalValueChange = currentValue - costBasis;
  const cagrDollar = totalValueChange / timeInYears;

  return { cagrPercentage, cagrDollar };
};
