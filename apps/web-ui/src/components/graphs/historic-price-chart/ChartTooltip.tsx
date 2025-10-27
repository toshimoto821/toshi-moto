import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { format } from "d3";
import { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import { selectGraphTimeframeRange } from "@lib/slices/ui.slice";
import { useAppSelector } from "@lib/hooks/store.hooks";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { useChartData } from "@lib/hooks/useChartData";
import { useNumberObfuscation } from "@lib/hooks/useNumberObfuscation";
import { useWallets } from "@lib/hooks/useWallets";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
interface IChartTooltip {
  kline: BinanceKlineMetric;
  selectedIndex: number | null;
}

const formatValue = format(",.2f");
const formatBtc = format(",.8f");
const BTC_ORANGE = "#F7931A";

export const ChartTooltip = (props: IChartTooltip) => {
  let { kline } = props;
  const { selectedIndex } = props;

  const [open, setOpen] = useState(false);
  const range = useAppSelector(selectGraphTimeframeRange);
  const { btcPrice } = useBtcPrice();
  const { wallets } = useWallets();
  const { lineData } = useChartData({ btcPrice, wallets });
  const obfuscate = useNumberObfuscation();
  const { prices } = useBtcHistoricPrices();

  let rawNode =
    selectedIndex !== null
      ? lineData[selectedIndex]
      : lineData[lineData.length - 1];

  if (!rawNode) {
    rawNode = lineData[lineData.length - 1];
  }

  if (prices?.length) {
    const lastPrice = prices[prices.length - 1];
    if (lastPrice.openTime === kline.openTime) {
      kline = lastPrice;
    }
  }

  const showTime = (time: number) => {
    const opts = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: undefined, // This will exclude seconds
      hour12: true, // Use 24-hour format, set to true for 12-hour format
    } as Intl.DateTimeFormatOptions;
    if (range === "1D" || range === "1W") {
      return new Date(time).toLocaleTimeString(undefined, opts);
    }
    return new Date(time).toLocaleDateString(undefined, opts);
  };

  if (open) {
    return (
      <div className="z-40 mt-1 sticky top-0 border left-2 right-2 bg-gray-100 dark:bg-[#2d2d2d] border-gray-300 dark:border-[#404040] rounded p-2">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <p className="font-semibold">Open:</p>
          <p className="col-span-2 text-right">
            {new Date(kline.openTime).toLocaleString()}
          </p>

          <p className="font-semibold">Close:</p>
          <p className="col-span-2 text-right">
            {new Date(kline.closeTime).toLocaleString()}
          </p>

          <p className="font-semibold">BTC:</p>
          <p className="col-span-2 text-right">
            ₿{obfuscate(rawNode?.y1Sum || 0)}
          </p>

          <p className="font-semibold">BTC Value:</p>
          <p className="col-span-2 text-right">
            ${obfuscate(formatValue(rawNode?.y1SumInDollars || 0))}
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
      data-testid="chart-tooltip"
      className="w-full bg-gray-100 dark:bg-[#2d2d2d] text-xs py-2 px-4 sticky top-[140px] z-40 border-gray-300 dark:border-[#404040] border-b opacity-70"
      onClick={() => setOpen(true)}
    >
      <div className="">
        <div className="flex space-x-1 md:space-x-2 text-xs">
          <p>
            <span className="font-mono">{showTime(kline.closeTime)}</span>
          </p>
          <p>|</p>

          <p>
            BTC:{" "}
            <span className="font-mono" style={{ color: BTC_ORANGE }}>
              ₿{obfuscate(formatBtc(rawNode?.y1Sum || 0))}
            </span>
          </p>
          <p>|</p>

          <p>
            Value:{" "}
            <span className="font-mono">
              ${obfuscate(formatValue(rawNode?.y1SumInDollars || 0))}
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
