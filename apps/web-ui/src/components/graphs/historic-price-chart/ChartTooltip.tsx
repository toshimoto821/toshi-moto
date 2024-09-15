import { Button } from "@radix-ui/themes";
import { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import { useState } from "react";
import { selectGraphTimeframeRange } from "@lib/slices/ui.slice";
import { useAppSelector } from "@lib/hooks/store.hooks";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
interface IChartTooltip {
  kline: BinanceKlineMetric;
}
export const ChartTooltip = (props: IChartTooltip) => {
  let { kline } = props;
  const [open, setOpen] = useState(false);
  const range = useAppSelector(selectGraphTimeframeRange);

  const { prices } = useBtcHistoricPrices();
  if (prices?.length) {
    const lastPrice = prices[prices.length - 1];
    if (lastPrice.openTime === kline.openTime) {
      kline = lastPrice;
    }
  }

  const showTime = (time: number) => {
    if (range === "1D" || range === "1W") {
      return new Date(time).toLocaleTimeString(undefined, {
        year: undefined,
        month: undefined,
        day: undefined,
        hour: "2-digit",
        minute: "2-digit",
        second: undefined, // This will exclude seconds
        hour12: true, // Use 24-hour format, set to true for 12-hour format
      });
    }
    return new Date(time).toLocaleDateString();
  };

  if (open) {
    return (
      <div className="z-40 mt-1 absolute top-[50px] border left-2 w-3/5 bg-gray-500 border-white opacity-80 text-white rounded p-2">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <p className="font-semibold">Open:</p>
          <p className="col-span-2 text-right">
            {new Date(kline.openTime).toLocaleString()}
          </p>

          <p className="font-semibold">Close:</p>
          <p className="col-span-2 text-right">
            {new Date(kline.closeTime).toLocaleString()}
          </p>

          <p className="font-semibold">Open:</p>
          <p className="col-span-2 text-right">
            $
            {parseFloat(kline.openPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="font-semibold">Close:</p>
          <p className="col-span-2 text-right">
            $
            {parseFloat(kline.closePrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="font-semibold">High:</p>
          <p className="col-span-2 text-right">
            $
            {parseFloat(kline.highPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="font-semibold">Low:</p>
          <p className="col-span-2 text-right">
            $
            {parseFloat(kline.lowPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="font-semibold">Volume:</p>
          <p className="col-span-2 text-right">
            {parseFloat(kline.quoteAssetVolume).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            <Button
              size="1"
              variant="solid"
              color="gray"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      className="w-full bg-gray-500 text-xs text-white py-1 px-4 opacity-70 sticky top-[140px] z-40"
      onClick={() => setOpen(true)}
    >
      <div className="">
        <div className="flex space-x-2">
          <p>
            Open: <span className="font-mono">{showTime(kline.openTime)}</span>
          </p>
          <p>|</p>
          <p>
            Close:{" "}
            <span className="font-mono">{showTime(kline.closeTime)}</span>
          </p>
          <p>|</p>
          <p>
            Open Price:{" "}
            <span className="font-mono">
              $
              {parseFloat(kline.openPrice).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
          <p>|</p>
          <p>
            Close Price:{" "}
            <span className="font-mono">
              $
              {parseFloat(kline.closePrice).toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
      </div>
    </button>
  );
};
