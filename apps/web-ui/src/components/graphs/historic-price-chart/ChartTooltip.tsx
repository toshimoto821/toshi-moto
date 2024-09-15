import { Button } from "@radix-ui/themes";
import { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import { useState } from "react";

interface IChartTooltip {
  kline: BinanceKlineMetric;
}
export const ChartTooltip = (props: IChartTooltip) => {
  const { kline } = props;
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="z-40 mt-1 absolute top-[50px] border left-2 w-3/5 bg-gray-700 border-white opacity-80 text-white rounded p-2">
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
      className="w-full bg-gray-700 text-xs text-white py-1 px-4 opacity-70 sticky top-[140px] z-40"
      onClick={() => setOpen(true)}
    >
      <div className="">
        <div className="flex space-x-2">
          <p>
            Open:{" "}
            <span className="font-mono">
              {new Date(kline.openTime).toLocaleDateString()}
            </span>
          </p>
          <p>|</p>
          <p>
            Close:{" "}
            <span className="font-mono">
              {new Date(kline.closeTime).toLocaleDateString()}
            </span>
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
