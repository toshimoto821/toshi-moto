import { useEffect, useMemo, useRef } from "react";
import { Flex, Separator, Button, IconButton } from "@radix-ui/themes";
// import * as d3 from "d3"
import { sub, add } from "date-fns";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { Line, type StackedBarData } from "./line/Line";
import { Wallet } from "@models/Wallet";
import { round, ONE_HUNDRED_MILLION } from "@lib/utils";
import { AppContext, WalletUIContext } from "@providers/AppProvider";
import { getGroupKey, addTime } from "./graph-utils";
import type {
  IChartTimeFrameRange,
  IChartTimeframeGroups,
} from "@machines/appMachine";
import type {
  IRawNode,
  IPlotType,
  IPlotData,
} from "@machines/walletListUIMachine";
import { useWindowFocus } from "@lib/hooks/useWindowFocus";
import {
  Cross2Icon,
  ZoomInIcon,
  ZoomOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";

type IHistoricPriceChart = {
  height: number;
  width: number;
  wallets: Wallet[];
  prices?: [number, number][];
  btcPrice?: number;
  selectedWallets: Set<string>;
  netAssetValue: boolean;
};

type Data = {
  date: Date;
  startDate: Date;
  endDate: Date;
  sum: number;
  avg: number;
  data: number[];
  i: number;
  key: string;
};

type Grouped = Record<string, Data>;
export const HistoricPriceChart = (props: IHistoricPriceChart) => {
  const { height, width, wallets, btcPrice, netAssetValue } = props;

  const clearSelectionRef = useRef<() => void>();
  const btcPrices = useBtcHistoricPrices();
  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];

  // @todo
  const { send } = AppContext.useActorRef();
  const walletActorRef = WalletUIContext.useActorRef();

  const refreshKey = useWindowFocus(1000 * 60 * 10); // every 10 minutes

  const selectedPlot = WalletUIContext.useSelector(
    (current) => current.context.plotData[current.context.selectedPlotIndex]
  );

  const showPlotDots = AppContext.useSelector(
    (current) => current.context.meta.showPlotDots
  );

  const showBtcAllocation = AppContext.useSelector(
    (current) => current.context.meta.showBtcAllocation
  );

  // this is kinda broken.  the chart flickers because the
  // group updates immediately but the data doesn't
  // the group should be driven off the data
  const chartTimeframeGroupState = AppContext.useSelector(
    (current) => current.context.meta.chartTimeframeGroup
  );
  const chartTimeFrameGroupRef = useRef<IChartTimeframeGroups>(
    chartTimeframeGroupState
  );

  const chartTimeframeRange = AppContext.useSelector(
    (current) => current.context.meta.chartTimeFrameRange
  );

  const chartStartDate = AppContext.useSelector(
    (current) => current.context.meta.chartStartDate
  );

  const chartEndDate = AppContext.useSelector(
    (current) => current.context.meta.chartEndDate
  );

  const chartTimeDiffInDays = AppContext.useSelector((current) =>
    Math.round(
      (current.context.meta.chartEndDate -
        current.context.meta.chartStartDate) /
        (1000 * 60 * 60 * 24)
    )
  );

  // add the current price
  let timeDiff = 1000 * 60 * 60 * 24;
  const now = new Date().getTime();
  if (prices?.length > 2 && btcPrice) {
    const lastPrice = prices[prices.length - 1][0];
    const secondToLastPrice = prices[prices.length - 2][0];

    timeDiff = lastPrice - secondToLastPrice;

    if (now - lastPrice < timeDiff) {
      const newLastPrice = lastPrice + timeDiff;
      prices.push([newLastPrice, btcPrice]);
    }
  }

  let chartTimeframeGroup = chartTimeframeGroupState; //"1D" as IChartTimeframeGroups;
  const roundedDiffInHours = Math.round(timeDiff / 1000 / 60 / 60);
  if (roundedDiffInHours === 0) {
    chartTimeFrameGroupRef.current = "5M";
  } else if (roundedDiffInHours === 1) {
    chartTimeFrameGroupRef.current = "1H";
  } else if (roundedDiffInHours === 24) {
    chartTimeFrameGroupRef.current = "1D";
  }

  chartTimeframeGroup = chartTimeFrameGroupRef.current;
  // let ct;
  // const timeDiffInDays = timeDiff / (1000 * 3600 * 24);
  // if (timeDiffInDays < 1) {
  //   ct = "1H";
  // } else {
  //   ct = "1D";
  // }

  const selectedTxs =
    AppContext.useSelector((current) => {
      return new Set(current.context.selectedTxs);
    }) || new Set();

  const dateToKeyFn = getGroupKey(chartTimeframeGroup);

  // group the prices into buckets (hours, or weeks based on range)
  const grouped = useMemo(() => {
    return prices?.reduce((acc, curr) => {
      const [date, price] = curr;
      const ts = new Date(date);
      // ts.setHours(0, 0, 0, 0);

      const key = dateToKeyFn(ts);

      if (acc[key]) {
        acc[key] = {
          date: acc[key].date,
          // think this is the key to the chart being off by one day
          startDate: new Date(Math.min(acc[key].startDate.getTime(), date)),
          // this is one date off, but it's fine for now
          endDate: new Date(Math.max(acc[key].endDate.getTime(), date)),
          sum: acc[key].sum + price,
          avg: (acc[key].sum + price) / (acc[key].data.length + 1),
          data: [...acc[key].data, price],
          i: acc[key].i + 1,
          key,
        };
      } else {
        const d = new Date(date);
        acc[key] = {
          date: d,
          startDate: d,
          endDate: addTime(chartTimeframeGroup, d),
          sum: price,
          avg: price,
          data: [price],
          i: 1,
          key,
        };
      }
      return acc;
    }, {} as Grouped);
  }, [
    btcPrice,
    prices.length,
    chartTimeframeGroup,
    selectedTxs.size,
    // prices?.[0]?.[0], // if first date changes, update
    prices?.[0]?.[1], // if first date changes, update
    refreshKey,
  ]);

  const filteredWallets =
    props.selectedWallets.size > 0
      ? wallets.filter((wallet) => {
          return props.selectedWallets.has(wallet.id);
        })
      : wallets;

  const groupedValues = Object.values(grouped || {});

  const node = groupedValues.map((d) => {
    return {
      x: d.date.getTime(),
      y1: 0, // not used
      y1Sum: 0,
      y1SumInDollars: 0,
      // y1, // shows the net value at the current price, not price of date range
      y2: round(d.avg, 2),
    } as IRawNode;
  });

  const { nodes, inputNodes } = useMemo(() => {
    const nodes = [] as StackedBarData[];
    const inputNodes = [] as StackedBarData[];
    // @loop 3 (p) (4 wallets)
    for (const wallet of filteredWallets) {
      // @loop 4 (q) (60 addresses each)
      for (const address of wallet.listAddresses) {
        // @loop 5 (r) (3 txs each)
        for (const tx of address.listTransactions) {
          const visible = selectedTxs.has(tx.txid); // ||  selectedTxs.size === 0 ||
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
    selectedTxs.size,
    netAssetValue,
    prices.length,
    props.selectedWallets,
    selectedPlot,
    refreshKey,
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
    for (const group of groupValues) {
      for (let i = nodesCopy.length - 1; i >= 0; i--) {
        const node = nodesCopy[i];
        if (
          node.vout > 0 &&
          node.date >= group.startDate &&
          node.date < group.endDate
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
        if (
          node.vin > 0 &&
          node.date >= group.startDate &&
          node.date < group.endDate
        ) {
          const ts = group.date.getTime();
          const nodeArr = inputOutputByDateMap.spent.get(ts) || [];
          inputOutputByDateMap.spent.set(ts, [...nodeArr, node]);
          inputNodesCopy.splice(i, 1);
        }
      }
    }

    return {
      inputOutputByDateMap,
      preVinSum,
      preVoutSum,
    };
  }, [
    nodes.length,
    inputNodes.length,
    selectedTxs.size,
    netAssetValue,
    groupedKeys.length,
    refreshKey,
    groupedKeys[0],
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
  }, [node, chartStartDate, groupedKeys[0]]);

  const plotData = useMemo(() => {
    const plotData = [] as IPlotData[];
    for (const n of allNodes) {
      const key = dateToKeyFn(n.date);
      const grp = grouped[key];

      // something is wrong with the date
      if (grp && n.visible) {
        const yValue = lineMap[key];
        if (yValue) {
          const plot = {
            x: grp.date.getTime(),
            type: n.type as IPlotType,
            value: n.vout || n.vin,
            node: yValue,
            data: n,
            grpSum: grp.sum,
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
    selectedTxs.size,
    refreshKey,
  ]);

  const handleUpdateTimeframe = (timeframe: IChartTimeFrameRange) => {
    return () => {
      send({
        type: "APP_MACHINE_UPDATE_CHART_RANGE",
        data: { group: timeframe },
      });
      walletActorRef.send({
        type: "SET_SELECTED_LOT_DATA_INDEX",
        data: { date: -1 },
      });
    };
  };

  const walletIds = filteredWallets.map((w) => w.id).join(",");
  useEffect(() => {
    walletActorRef.send({
      type: "SET_LINE_DATA",
      data: { lineData, plotData },
    });
  }, [
    lineData[0]?.x,
    lineData[0]?.y1SumInDollars,
    lineData.length,
    plotData.length,
    netAssetValue,
    chartTimeFrameGroupRef?.current,
    refreshKey,
    walletIds,
  ]);

  const onSelectPlot = (plot: IPlotData, clearSelection: () => void) => {
    // setSelectedPlot(plot);
    clearSelectionRef.current = clearSelection;
    walletActorRef.send({
      type: "SET_SELECTED_LOT_DATA_INDEX",
      data: { date: plot.x, clearSelection },
    });
  };

  const handleShiftTimeRange = (days: number, direction: "PAST" | "FUTURE") => {
    return () => {
      // const half = Math.floor(days / 2);
      if (direction === "PAST") {
        const startDate = sub(chartStartDate, { days: days });
        const endDate = add(startDate, { days });
        send({
          type: "APP_MACHINE_UPDATE_CHART_RANGE_BY_DATE",
          data: {
            chartStartDate: startDate.getTime(),
            chartEndDate: endDate.getTime(),
          },
        });
      } else if (direction === "FUTURE") {
        let startDate = new Date(chartEndDate);
        let endDate = add(startDate, { days: days });
        if (endDate.getTime() > now) {
          endDate = new Date(now);
          startDate = sub(endDate, { days });
        }
        send({
          type: "APP_MACHINE_UPDATE_CHART_RANGE_BY_DATE",
          data: {
            chartStartDate: startDate.getTime(),
            chartEndDate: endDate.getTime(),
          },
        });
      }
    };
  };

  const handleClearPlotSelection = () => {
    if (clearSelectionRef.current) {
      clearSelectionRef.current();

      walletActorRef.send({
        type: "SET_SELECTED_LOT_DATA_INDEX",
        data: { date: -1 },
      });
    }
  };

  const onClickZoomIn = () => {
    if (selectedPlot) {
      const date = selectedPlot.x;
      send({
        type: "APP_MACHINE_ZOOM_TO_DATE",
        data: {
          date,
          direction: "IN",
        },
      });
    }
  };

  const onClickZoomOut = () => {
    if (selectedPlot) {
      const date = selectedPlot.x;
      send({
        type: "APP_MACHINE_ZOOM_TO_DATE",
        data: {
          date,
          direction: "OUT",
        },
      });
    }
  };
  return (
    <div className="w-full h-full relative">
      <div className="absolute w-full z-40">
        <div className="flex px-6 pt-2">
          <div className="mr-2">
            <IconButton
              variant="outline"
              onClick={handleShiftTimeRange(chartTimeDiffInDays, "PAST")}
            >
              <ArrowLeftIcon />
            </IconButton>
          </div>
          <div className="mr-2">
            <IconButton
              disabled={
                chartEndDate > sub(now, { days: 1 }).getTime() ? true : false
              }
              variant="outline"
              onClick={handleShiftTimeRange(chartTimeDiffInDays, "FUTURE")}
            >
              <ArrowRightIcon />
            </IconButton>
          </div>
          <div className="flex-1"></div>
          {selectedPlot && (
            <>
              <div className="mr-2">
                <IconButton
                  variant="outline"
                  onClick={handleClearPlotSelection}
                >
                  <Cross2Icon />
                </IconButton>
              </div>
              <div className="mr-2">
                <IconButton
                  variant="outline"
                  onClick={onClickZoomOut}
                  disabled={chartTimeDiffInDays > 365 * 5}
                >
                  <ZoomOutIcon />
                </IconButton>
              </div>
              <div className="">
                <IconButton
                  variant="outline"
                  onClick={onClickZoomIn}
                  disabled={chartTimeDiffInDays <= 2}
                >
                  <ZoomInIcon />
                </IconButton>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ height }}>
        <Line
          graphAssetValue={netAssetValue}
          lineData={lineData}
          plotData={plotData}
          width={width}
          height={height}
          ready={!!prices.length && !!btcPrice}
          onSelectPlot={onSelectPlot}
          dots={showPlotDots}
          btcPrice={btcPrice ?? 0}
          showBtcAllocation={showBtcAllocation}
        />
      </div>
      <div className="flex justify-around mt-4">
        <Flex gap="4" align="center">
          <Button
            variant={chartTimeframeRange === "1D" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("1D")}
          >
            1D
          </Button>

          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "1W" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("1W")}
          >
            1W
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "1M" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("1M")}
          >
            1M
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "3M" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("3M")}
          >
            3M
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "1Y" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("1Y")}
          >
            1Y
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "2Y" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("2Y")}
          >
            2Y
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant={chartTimeframeRange === "5Y" ? "outline" : "ghost"}
            onClick={handleUpdateTimeframe("5Y")}
          >
            5Y
          </Button>
        </Flex>
      </div>
    </div>
  );
};
