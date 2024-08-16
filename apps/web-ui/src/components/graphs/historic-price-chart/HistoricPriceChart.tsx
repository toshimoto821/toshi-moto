/* eslint-disable react-hooks/exhaustive-deps */
import { useRef } from "react";
import debounce from "lodash/debounce";
import { Flex, Separator, Button } from "@radix-ui/themes";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { Line } from "../line/Line";
import { Wallet } from "@models/Wallet";
import { ChartLegend } from "./ChartLegend";
import type { IChartTimeFrameRange } from "@root/types";
import type { IForcastModelType } from "@lib/slices/price.slice";
import type { IPlotData } from "@root/types";
import { useChartData } from "@root/lib/hooks/useChartData";
import { generateRandomPriceSeries } from "../graph-utils";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setForecast, selectForecast } from "@lib/slices/price.slice";
import {
  selectUI,
  setGraphByRange,
  chartByDateRangeAction,
} from "@root/lib/slices/ui.slice";

type IHistoricPriceChart = {
  height: number;
  width: number;
  wallets: Wallet[];
  prices?: [number, number][];
  btcPrice?: number;
};

export const HistoricPriceChart = (props: IHistoricPriceChart) => {
  const { height, width, wallets, btcPrice } = props;
  const clearSelectionRef = useRef<() => void>();
  const btcPrices = useBtcHistoricPrices();
  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];
  const { graphTimeFrameRange, netAssetValue } = useAppSelector(selectUI);

  const dispatch = useAppDispatch();

  const { graphPlotDots: showPlotDots, graphBtcAllocation: showBtcAllocation } =
    useAppSelector(selectUI);

  const { forecastModel } = useAppSelector(selectForecast);

  const result = useChartData({
    btcPrice,
    wallets,
  });

  const chartTimeframeRange = graphTimeFrameRange;

  // add the current price
  let timeDiff = 1000 * 60 * 60 * 24;
  const now = new Date().getTime();
  if (prices?.length > 2 && btcPrice && !forecastModel) {
    const lastPrice = prices[prices.length - 1][0];
    const secondToLastPrice = prices[prices.length - 2][0];

    timeDiff = lastPrice - secondToLastPrice;

    if (now - lastPrice < timeDiff) {
      const newLastPrice = lastPrice + timeDiff;
      prices.push([newLastPrice, btcPrice]);
    }
  }

  const handleUpdateTimeframe = (timeframe: IChartTimeFrameRange) => {
    return () => {
      dispatch(setGraphByRange(timeframe));

      // @todo
      console.log("@todo implement");
      // walletActorRef.send({
      //   type: "SET_SELECTED_LOT_DATA_INDEX",
      //   data: { date: -1 },
      // });
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
    switch (forecastModel) {
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

    const forecastPrices = generateRandomPriceSeries({
      initialPrice: btcPrice!,
      gap: "1W",
      startDate,
      endDate,
      bullishFactor,
      bearishFactor,
    });
    dispatch(
      setForecast({
        forecastModel: nextModel,
        forecastPrices,
      })
    );
  };

  const { lineData, plotData } = result;

  const onSelectPlot = (plot: IPlotData, clearSelection: () => void) => {
    // setSelectedPlot(plot);
    clearSelectionRef.current = clearSelection;
    console.log("@todo implement", plot);
    // walletActorRef.send({
    //   type: "SET_SELECTED_LOT_DATA_INDEX",
    //   data: { date: plot.x, clearSelection },
    // });
  };

  const handleClearPlotSelection = () => {
    if (clearSelectionRef.current) {
      clearSelectionRef.current();
      console.log("@todo implement");
      // walletActorRef.send({
      //   type: "SET_SELECTED_LOT_DATA_INDEX",
      //   data: { date: -1 },
      // });
    }
  };

  const scaleValues = debounce((values: number[]) => {
    const [start, end] = values;
    // if (!historicBounds) return;
    if (!start || !end) {
      return;
    }

    dispatch(chartByDateRangeAction(start, end));
  }, 200);

  const handleRangeChange = (range: [Date, Date]) => {
    const values = range.map((d) => d.getTime());
    scaleValues(values);
  };

  const handleReset = () => {
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
            variant={forecastModel ? "outline" : "ghost"}
            onClick={handleForcast}
          >
            {forecastModel ?? "Forcast"}
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
        />
      </div>
      <div>
        <ChartLegend
          height={30}
          width={width}
          chartTimeFrameRange={graphTimeFrameRange}
          onChange={handleRangeChange}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};
