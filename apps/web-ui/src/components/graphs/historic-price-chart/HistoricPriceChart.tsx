import { useState } from "react";
import debounce from "lodash/debounce";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { ChartLegend } from "./ChartLegend";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
// import { selectForecast } from "@lib/slices/price.slice";
import {
  selectUI,
  setGraphByRange,
  chartByDateRangeAction,
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tooltipKline, setTooltipKline] = useState<BinanceKlineMetric | null>(
    null
  );
  const [mouseoverHeroIndex, setMouseOverHeroIndex] = useState<number | null>(
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

  const handleHoverHeroChart = ({
    index,
    datum,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => {
    setMouseOverHeroIndex(index);
    setTooltipKline(datum);
  };

  const handleMouseOverVolumeChart = ({
    index,
    datum,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => {
    setSelectedIndex(index);
    setTooltipKline(datum);
  };

  return (
    <div className="w-full h-full relative">
      <div className="flex justify-end items-center z-40 bg-gray-50 border-b border-t">
        <TimeRangeButtons loading={btcPrices.loading} />
      </div>
      {tooltipKline && !btcPrices.loading && (
        <ChartTooltip kline={tooltipKline} />
      )}
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
          onMouseOut={() => {
            setSelectedIndex(null);
            // setTooltipKline(null);
          }}
          selectedIndex={selectedIndex}
        />
      </div>
      <div
        className={cn("", {
          "opacity-50": btcPrices.loading,
        })}
      >
        <VolumeChart
          height={120}
          width={width}
          onMouseOver={handleMouseOverVolumeChart}
          onMouseOut={() => {
            setSelectedIndex(null);
            setTooltipKline(null);
          }}
          selectedIndex={mouseoverHeroIndex}
        />
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
