import { useCallback, useState } from "react";
import debounce from "lodash/debounce";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { ChartLegend } from "./ChartLegend";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
// import { selectForecast } from "@lib/slices/price.slice";
import {
  selectUI,
  setGraphByRange,
  chartByDateRangeAction,
  // setUI,
} from "@root/lib/slices/ui.slice";
import { cn } from "@root/lib/utils";
import { useGetHistoricPriceDiffQuery } from "@lib/slices/api.slice";
import { GraphTimeFrameRange } from "@root/lib/slices/ui.slice.types";
import { TimeRangeButtons } from "./TimeRangeButtons";
import { VolumeChart } from "./VolumeChart";
import { setRange } from "@lib/slices/navbar.slice";
import { HeroChart } from "./HeroChart";
import { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import { ChartTooltip } from "./ChartTooltip";

type IHistoricPriceChart = {
  height: number;
  width: number;
  btcPrice?: number;
};

export const HistoricPriceChart = (props: IHistoricPriceChart) => {
  const { height, width } = props;
  const btcPrices = useBtcHistoricPrices();

  const { prices } = btcPrices;
  let lastPrice: BinanceKlineMetric | null = null;
  if (prices?.length) {
    lastPrice = prices[prices.length - 1];
  }

  const [tooltipKline, setTooltipKline] = useState<BinanceKlineMetric | null>(
    null
  );

  const [tooltipSelectedIndex, setSelectedIndex] = useState<number | null>(
    null
  );

  const { graphTimeFrameRange } = useAppSelector(selectUI);

  const dispatch = useAppDispatch();

  useGetHistoricPriceDiffQuery();
  // console.log(response);
  const { previousGraphTimeFrameRange } = useAppSelector(selectUI);

  // const { forecastModel } = useAppSelector(selectForecast);

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

  const scaleValues = debounce((values: number[]) => {
    const [start, end] = values;
    // if (!historicBounds) return;
    if (!start || !end) {
      return;
    }

    dispatch(chartByDateRangeAction(start, end));
  }, 200);

  const handleRangeChange = (
    range: [BinanceKlineMetric, BinanceKlineMetric]
  ) => {
    const values = [range[0].openTime, range[1].closeTime];
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

  const handleBrushMove = ([k1, k2]: [
    BinanceKlineMetric,
    BinanceKlineMetric
  ]) => {
    dispatch(
      setRange({
        graphStartDate: k1.openTime,
        graphEndDate: k2.closeTime,
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

  const handleHoverHeroChart = useCallback(
    ({ datum, index }: { datum: BinanceKlineMetric; index: number }) => {
      setTooltipKline(datum);
      setSelectedIndex(index);
    },
    []
  );

  const handleMouseOverVolumeChart = useCallback(
    ({ datum, index }: { datum: BinanceKlineMetric; index: number }) => {
      setTooltipKline(datum);
      setSelectedIndex(index);
    },
    []
  );

  return (
    <div className="w-full h-full relative">
      <div className="flex justify-end items-center z-40 bg-gray-50 border-b border-t">
        <TimeRangeButtons loading={btcPrices.loading} />
      </div>
      <div className="sticky top-[140px]">
        <ChartLegend
          height={45}
          width={width}
          onChange={handleRangeChange}
          onReset={handleReset}
          onBrushMove={handleBrushMove}
          onBrushEnd={handleBrushEnd}
        />
      </div>

      <div
        style={{ height }}
        className={cn({
          "opacity-50": btcPrices.loading,
        })}
      >
        <HeroChart
          height={height}
          width={width}
          onMouseOver={handleHoverHeroChart}
        />
      </div>

      <div
        className={cn("", {
          "opacity-50": btcPrices.loading,
        })}
      >
        <VolumeChart
          height={60}
          width={width}
          onMouseOver={handleMouseOverVolumeChart}
        />
      </div>
      {(tooltipKline || lastPrice) && (
        <ChartTooltip
          kline={(tooltipKline || lastPrice)!}
          selectedIndex={tooltipSelectedIndex}
        />
      )}
    </div>
  );
};
