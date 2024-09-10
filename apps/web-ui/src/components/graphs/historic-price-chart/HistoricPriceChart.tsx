import { useRef } from "react";
import debounce from "lodash/debounce";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { Line } from "../line/Line";
import { ChartLegend } from "./ChartLegend";

import type { IPlotData } from "@root/types";
import { useChartData } from "@root/lib/hooks/useChartData";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
// import { selectForecast } from "@lib/slices/price.slice";
import {
  selectUI,
  setGraphByRange,
  chartByDateRangeAction,
} from "@root/lib/slices/ui.slice";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { useWallets } from "@root/lib/hooks/useWallets";
import { cn } from "@root/lib/utils";
import { useGetHistoricPriceDiffQuery } from "@lib/slices/api.slice";
import { GraphTimeFrameRange } from "@root/lib/slices/ui.slice.types";
import { TimeRangeButtons } from "./TimeRangeButtons";
import { VolumeChart } from "./VolumeChart";
import { setRange } from "@lib/slices/navbar.slice";
type IHistoricPriceChart = {
  height: number;
  width: number;
  btcPrice?: number;
};

export const HistoricPriceChart = (props: IHistoricPriceChart) => {
  const { height, width } = props;
  const clearSelectionRef = useRef<() => void>();
  const btcPrices = useBtcHistoricPrices();
  const { wallets } = useWallets();
  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];
  const { graphTimeFrameRange, netAssetValue } = useAppSelector(selectUI);
  const { btcPrice } = useBtcPrice();
  const dispatch = useAppDispatch();

  useGetHistoricPriceDiffQuery();
  // console.log(response);
  const {
    graphPlotDots: showPlotDots,
    graphBtcAllocation: showBtcAllocation,
    previousGraphTimeFrameRange,
  } = useAppSelector(selectUI);

  // const { forecastModel } = useAppSelector(selectForecast);

  const result = useChartData({
    btcPrice,
    wallets,
  });

  const chartTimeframeRange = graphTimeFrameRange;

  // add the current price
  // let timeDiff = 1000 * 60 * 60 * 24;
  // const now = new Date().getTime();
  // if (prices?.length > 2 && btcPrice && !forecastModel) {
  //   const lastPrice = prices[prices.length - 1][0];
  //   const secondToLastPrice = prices[prices.length - 2][0];

  //   timeDiff = lastPrice - secondToLastPrice;

  //   if (now - lastPrice < timeDiff) {
  //     const newLastPrice = lastPrice + timeDiff;
  //     prices.push([newLastPrice, btcPrice]);
  //   }
  // }

  const handleUpdateTimeframe = (timeframe: GraphTimeFrameRange) => {
    return () => {
      dispatch(setGraphByRange(timeframe));
    };
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
    // this causes build issues when i dont assign a var first, dont know why
    // perhaps bundle issue?
    // const action = setRange({
    //   graphStartDate: null,
    //   graphEndDate: null,
    // });
    // console.log(action);
    // dispatch(action);
    handleUpdateTimeframe(
      chartTimeframeRange || previousGraphTimeFrameRange || "5Y"
    )();
  };

  const handleBrushMove = ([startTime, endTime]: [Date, Date]) => {
    dispatch(
      setRange({
        graphStartDate: startTime.getTime(),
        graphEndDate: endTime.getTime(),
      })
    );
  };
  const handleBrushEnd = () => {
    const action = setRange({
      graphStartDate: null,
      graphEndDate: null,
    });
    dispatch(action);
  };

  return (
    <div className="w-full h-full relative">
      <div className="flex justify-end items-center z-40 bg-gray-50 border-b border-t">
        <TimeRangeButtons loading={btcPrices.loading} />
      </div>
      <div
        style={{ height }}
        className={cn({
          "opacity-50": btcPrices.loading,
        })}
      >
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
      <div
        className={cn("", {
          "opacity-50": btcPrices.loading,
        })}
      >
        <VolumeChart height={120} width={width} />
      </div>
      <div>
        <ChartLegend
          height={30}
          width={width}
          onChange={handleRangeChange}
          onReset={handleReset}
          onBrushMove={handleBrushMove}
          onBrushEnd={handleBrushEnd}
        />
      </div>
    </div>
  );
};
