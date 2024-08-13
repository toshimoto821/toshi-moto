/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { Flex, Separator, Button } from "@radix-ui/themes";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { Line } from "../line/Line";
import { Wallet } from "@models/Wallet";
import { AppContext, WalletUIContext } from "@providers/AppProvider";
import { ChartLegend } from "./ChartLegend";
import type {
  IChartTimeFrameRange,
  IChartTimeframeGroups,
  IForcastModelType,
} from "@machines/appMachine";
import type { IPlotData } from "@machines/walletListUIMachine";
import { useWindowFocus } from "@lib/hooks/useWindowFocus";
import { useChartData } from "@root/lib/hooks/useChartData";
import { generateRandomPriceSeries } from "../graph-utils";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";

type IHistoricPriceChart = {
  height: number;
  width: number;
  wallets: Wallet[];
  prices?: [number, number][];
  btcPrice?: number;
  selectedWallets: Set<string>;
  netAssetValue: boolean;
};

export const HistoricPriceChart = (props: IHistoricPriceChart) => {
  const { height, width, wallets, btcPrice, netAssetValue, selectedWallets } =
    props;
  const clearSelectionRef = useRef<() => void>();
  const btcPrices = useBtcHistoricPrices();
  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];
  const { loadedChartTimeFrameRange } = btcPrices;

  const { send } = AppContext.useActorRef();
  const walletActorRef = WalletUIContext.useActorRef();

  const refreshKey = useWindowFocus(1000 * 60 * 10); // every 10 minutes
  const { graphPlotDots: showPlotDots, graphBtcAllocation: showBtcAllocation } =
    useAppSelector(selectUI);

  const forcastModel = AppContext.useSelector(
    (current) => current.context.meta.forcastModel
  );

  const result = useChartData({
    netAssetValue,
    btcPrice,
    wallets,
    selectedWallets,
  });
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
    (current) => current.context.meta.chartTimeFrameRange || "5Y"
  );

  // add the current price
  let timeDiff = 1000 * 60 * 60 * 24;
  const now = new Date().getTime();
  if (prices?.length > 2 && btcPrice && !forcastModel) {
    const lastPrice = prices[prices.length - 1][0];
    const secondToLastPrice = prices[prices.length - 2][0];

    timeDiff = lastPrice - secondToLastPrice;

    if (now - lastPrice < timeDiff) {
      const newLastPrice = lastPrice + timeDiff;
      prices.push([newLastPrice, btcPrice]);
    }
  }

  if (chartTimeframeRange === "1D") {
    chartTimeFrameGroupRef.current = "5M";
  } else if (chartTimeframeRange === "1W" || chartTimeframeRange === "1M") {
    chartTimeFrameGroupRef.current = "1H";
  } else if (chartTimeframeRange === "3M" || chartTimeframeRange === "1Y") {
    chartTimeFrameGroupRef.current = "1D";
  } else {
    chartTimeFrameGroupRef.current = "1W";
  }

  const filteredWallets =
    props.selectedWallets.size > 0
      ? wallets.filter((wallet) => {
          return props.selectedWallets.has(wallet.id);
        })
      : wallets;

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

  const handleForcast = () => {
    // this doesnt work great because async issues
    // for now just leaving the forcast to be based
    // off the current time range.
    // handleUpdateTimeframe("5Y")();
    const firstDate = prices[0][0];
    const lastDate = prices[prices.length - 1][0];
    const startDate = lastDate;
    const endDate = lastDate + (lastDate - firstDate);
    let nextModel = "SAYLOR" as IForcastModelType | null;
    let bullishFactor = 0.08;
    let bearishFactor = 0.001;
    switch (forcastModel) {
      case "SAYLOR":
        nextModel = "BULL";
        bullishFactor = 0.04;
        bearishFactor = 0.001;
        break;
      case "BULL":
        nextModel = "CRAB";
        bullishFactor = 0.12;
        bearishFactor = 0.1;
        break;
      case "CRAB":
        nextModel = "BEAR";
        bullishFactor = 0.01;
        bearishFactor = 0.04;
        break;
      case "BEAR":
        nextModel = null;
        break;
    }

    const forcastPrices = generateRandomPriceSeries({
      initialPrice: btcPrice!,
      gap: "1W",
      startDate,
      endDate,
      bullishFactor,
      bearishFactor,
    });
    send({
      type: "APP_MACHINE_UPDATE_FORCAST_MODEL",
      data: { forcastModel: nextModel, forcastPrices },
    });
  };

  const { lineData, plotData } = result;

  const walletIds = filteredWallets.map((w) => w.id).join(",");
  useEffect(() => {
    walletActorRef.send({
      type: "SET_LINE_DATA",
      data: {
        lineData,
        plotData,
      },
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
    forcastModel,
  ]);

  const onSelectPlot = (plot: IPlotData, clearSelection: () => void) => {
    // setSelectedPlot(plot);
    clearSelectionRef.current = clearSelection;
    walletActorRef.send({
      type: "SET_SELECTED_LOT_DATA_INDEX",
      data: { date: plot.x, clearSelection },
    });
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

  const scaleValues = debounce((values: number[]) => {
    const [start, end] = values;
    // if (!historicBounds) return;
    if (!start || !end) {
      walletActorRef.send({
        type: "SET_LINE_DATA",
        data: {
          lineData: [],
          plotData: [],
        },
      });
      return;
    }
    send({
      type: "APP_MACHINE_UPDATE_CHART_RANGE_BY_DATE",
      data: {
        chartStartDate: start,
        chartEndDate: end,
      },
    });
  }, 200);

  const handleRangeChange = (range: [Date, Date]) => {
    const values = range.map((d) => d.getTime());
    scaleValues(values);
  };

  const handleReset = () => {
    walletActorRef.send({
      type: "SET_LINE_DATA",
      data: {
        lineData: [],
        plotData: [],
      },
    });
    handleUpdateTimeframe(chartTimeframeRange)();
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute w-full z-40"></div>
      <div className="flex justify-between items-center px-6 md:container">
        <div className="flex">
          <div className="items-center flex px-2">
            {/* <Badge variant="outline">1 of n</Badge> */}
          </div>
        </div>
        <Flex
          gap={{
            initial: "2",
            md: "4",
          }}
          align="center"
        >
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
          <Separator orientation="vertical" />
          <Button
            variant={forcastModel ? "outline" : "ghost"}
            onClick={handleForcast}
          >
            {forcastModel ?? "Forcast"}
          </Button>
        </Flex>
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
          onClearSelection={handleClearPlotSelection}
          dots={showPlotDots}
          btcPrice={btcPrice ?? 0}
          showBtcAllocation={showBtcAllocation}
          forcastModel={forcastModel}
        />
      </div>
      <div>
        <ChartLegend
          height={30}
          width={width}
          chartTimeFrameRange={loadedChartTimeFrameRange}
          onChange={handleRangeChange}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};
