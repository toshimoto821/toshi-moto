import { useRef, useEffect, useState } from "react";
import { Text, Flex, Switch, Separator, Button } from "@radix-ui/themes";
import { IconButton } from "@radix-ui/themes";
import { format } from "date-fns";
import {
  UpdateIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import * as d3 from "d3";
import { DateRangeDialog } from "../dialogs/DateRangeDialog";
import { useWallets } from "@root/lib/hooks/useWallets";
import { ThinLine } from "@root/components/graphs/line/ThinLine";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { SelectionDropdown } from "./SelectionDropdown";
import { Popover } from "@root/components/popover/Popover";
import { useElementDimensions } from "@root/lib/hooks/useElementDimensions";
import { formatPrice, padBtcZeros } from "@root/lib/utils";
import { currencySymbols } from "@root/lib/currencies";
import { cn } from "@root/lib/utils";
import { WalletUIContext, AppContext } from "@root/providers/AppProvider";
import { AppMachineMeta } from "@root/machines/appMachine";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";

const colorScale = d3
  .scaleLinear<string>()
  .domain([-5, 0, 5])
  .range(["red", "gray", "green"])
  .interpolate(d3.interpolateRgb);

// const heightScale = d3
//   .scaleLinear()
//   .domain([50, 100]) // Input range
//   .range([70, 140]) // Output range
//   .clamp(true); //

const opacityScale = d3
  .scaleLinear()
  .domain([20, 400]) // Input range
  .range([0, 100]) // Output range
  .clamp(true); //

const bottomScale = d3
  .scaleLinear()
  .domain([0, 420]) // Input range
  .range([160, 0]) // Output range
  .clamp(true); //

export const Navbar = () => {
  const {
    refresh,
    btcPrice: rawPrice,
    forcastPrice,
    change: btcChangePrice,
    loading,
    updatedTime,
  } = useBtcPrice();
  const btcPrice = forcastPrice ?? rawPrice;
  const { netAssetValue, actions, data, ui, wallets } = useWallets();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [defaultDateTab, setDefaultDateTab] = useState<"start" | "end">(
    "start"
  );
  const privateNumber = useNumberObfuscation();
  // const [chartOpacity, setChartOpacity] = useState(0);
  const lineWrapperRef = useRef<HTMLDivElement>(null);
  const topHeaderToFifty = useRef<HTMLDivElement>(null);
  const myBtcRef = useRef<HTMLDivElement>(null);
  const headerControlsRef = useRef<HTMLDivElement>(null);
  const priceChangeRef = useRef<HTMLDivElement>(null);

  const chartHeight = 140;

  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(containerRef);

  const meta = AppContext.useSelector((current) => current.context.meta);

  const lineData = WalletUIContext.useSelector(
    (current) => current.context.lineData
  );

  const plotData = WalletUIContext.useSelector(
    (current) => current.context.plotData
  );

  // const currency = AppContext.useSelector(
  //   (current) => current.context.meta.currency
  // );
  const currency = "usd";
  const currencySymbol = currencySymbols[currency];

  const { send } = AppContext.useActorRef();
  const walletActorRef = WalletUIContext.useActorRef();

  let change = btcChangePrice;
  let valueChange;
  if (lineData?.length) {
    const key = netAssetValue ? "y1SumInDollars" : "y2";
    const firstPrice: number = lineData[0][key];
    const lastPrice = lineData[lineData.length - 1][key];

    const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    change = percentageChange;
    valueChange = lastPrice - firstPrice;
  }

  let priceToShow = btcPrice;
  if (netAssetValue) {
    priceToShow = data.totalBalance * btcPrice;
  }
  const fontColor = colorScale(change ?? 0);

  // you cant rerender react so much cause its janky
  // so we use a ref to update style manually
  const onScroll = () => {
    const scrollPosition = window.scrollY;
    // const height = heightScale(scrollPosition);
    const opacity = opacityScale(scrollPosition);
    const bottom = bottomScale(scrollPosition);
    // chartOpacityRef.current = opacity;

    if (lineWrapperRef.current) {
      lineWrapperRef.current.style.opacity = `${opacity / 100}`;
      lineWrapperRef.current.style.transform = `translate(0, ${bottom}px)`;
    }
    if (topHeaderToFifty.current) {
      topHeaderToFifty.current.style.opacity =
        "" + Math.max(1 - opacity / 100, 50 / 100);
    }

    if (myBtcRef.current) {
      myBtcRef.current.style.opacity = "" + (1 - opacity / 100);
    }

    if (headerControlsRef.current) {
      headerControlsRef.current.style.opacity = "" + (1 - opacity / 100);
      if (opacity === 100) {
        headerControlsRef.current.style.display = "none";
      } else {
        headerControlsRef.current.style.display = "flex";
      }
    }

    if (priceChangeRef.current) {
      priceChangeRef.current.style.opacity = "" + (1 - opacity / 100); //
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      // onScroll.cancel();
    };
  }, []);

  const toggleBalance = () => {
    actions.toggleBalanceVisibility();
  };

  const onClickDate = (defaultTab: "start" | "end") => {
    return () => {
      setDateRangeOpen(true);
      setDefaultDateTab(defaultTab);
    };
  };

  const handleClose = () => {
    setDateRangeOpen(false);
  };

  const handleClearSelected = () => {
    send({
      type: "APP_MACHINE_CLEAR_SELECTED_TXS",
    });
    walletActorRef.send({
      type: "SET_SELECTED_LOT_DATA_INDEX",
      data: { date: -1 },
    });
  };

  const handleSelectInputAddresses = () => {
    actions.selectInputAddresses(true);
  };

  const handleUpdateMeta = ({
    showPlotDots,
    showBtcAllocation,
    privatePrice,
  }: Partial<AppMachineMeta>) => {
    actions.updateMeta({ showPlotDots, showBtcAllocation, privatePrice });
  };

  // This was an attempt to better align the dates of the chart data.
  // however it was more confusing because the user would select
  // a particular date with the picker and the chart would not match that date
  // const firstDateAsNumber = prices.length ? prices[0][0] : meta.chartStartDate;
  // const lastDateAsNumber = prices.length
  //   ? prices[prices.length - 1][0]
  //   : meta.chartEndDate;

  const firstDateAsNumber = meta.chartStartDate;
  const lastDateAsNumber = meta.chartEndDate;

  const firstDate = new Date(firstDateAsNumber);
  const lastDate = new Date(lastDateAsNumber);

  return (
    <>
      <div
        className={`fixed z-50 h-[${chartHeight}px] bg-white drop-shadow-sm overflow-hidden  border-b w-screen backface-visibility-none`}
        ref={containerRef}
      >
        {lineData && (
          <div
            ref={lineWrapperRef}
            className={`absolute opacity-0 z-30 w-[${dimensions.width}]px`}
          >
            <ThinLine
              lineData={lineData}
              plotData={plotData}
              width={dimensions.width}
              height={chartHeight}
              graphAssetValue={netAssetValue}
              chartTimeframeGroup={meta.chartTimeframeGroup}
              showBtcAllocation={meta.showBtcAllocation}
              btcPrice={btcPrice ?? 0}
            />
          </div>
        )}
        <div
          className="flex flex-col absolute z-40 w-screen h-[140px]"
          ref={topHeaderToFifty}
        >
          <div className="flex px-6 pt-6 backface-visibility-none">
            <div className="flex flex-col text-right">
              <Text
                data-testid="btc-price"
                className="font-bold"
                style={{ color: fontColor }}
              >
                {priceToShow > 0 &&
                  currencySymbol +
                    (netAssetValue
                      ? privateNumber(formatPrice(priceToShow))
                      : formatPrice(priceToShow))}
                {!priceToShow && currencySymbol + "..."}
              </Text>
              {priceToShow > 0 && valueChange && (
                <div ref={priceChangeRef} className="text-right -mt-2">
                  <Text style={{ color: fontColor }} size="1">
                    {currencySymbol}
                    {netAssetValue
                      ? privateNumber(formatPrice(valueChange))
                      : formatPrice(valueChange)}
                  </Text>
                </div>
              )}
            </div>
            <div className="flex items-start">
              {change < Infinity && (
                <Text
                  className="flex items-center"
                  size="1"
                  style={{ color: fontColor }}
                >
                  {change < Infinity && change && change > 0 && change ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                  {change && change.toFixed(2) + "%"}
                </Text>
              )}
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-col">
              <div className="flex items-center justify-end">
                <div className="flex items-center mr-2">
                  <Text as="label" size="2">
                    <Flex gap="2">
                      Net
                      <Switch
                        disabled={wallets.length === 0}
                        checked={netAssetValue}
                        onClick={() => actions.toggleNetAssetValue()}
                      />{" "}
                    </Flex>
                  </Text>
                </div>
                <div className="mr-2 flex items-center">
                  <Separator orientation="vertical" />
                </div>
                <div className="flex items-center">
                  <IconButton variant="ghost" onClick={refresh}>
                    <UpdateIcon
                      className={cn({
                        "animate-spin": loading,
                      })}
                    />
                  </IconButton>
                </div>
              </div>
              <div className="-mt-1">
                <Popover
                  text={(classNames) => (
                    <Text size="1" color="gray" className={classNames}>
                      <i>{updatedTime}</i>
                    </Text>
                  )}
                  title="Last Updated Time"
                >
                  This is the BTC price last updated at {updatedTime}. This is
                  cached every 5 minutes to save resources on the server
                  receiving too many requests.
                </Popover>
              </div>
            </div>
          </div>
          <div className="md:container md:mx-auto flex px-6 justify-between flex-1 backface-visibility-none">
            <div className=""></div>
            <div
              ref={myBtcRef}
              className={`md:container md:mx-auto flex items-start transition-opacity justify-center px-6 flex-1`}
            >
              <Button variant="ghost">
                <Text size="6" color="orange" onClick={toggleBalance}>
                  {ui.balanceVisible ? padBtcZeros(data.totalBalance) : "My"}
                  &nbsp;BTC
                </Text>
              </Button>
            </div>
            <div></div>
          </div>
          <div className="border border-b-0 border-x-0 ">
            <div
              ref={headerControlsRef}
              className="md:container flex justify-between px-4 text-gray-400 py-2"
            >
              <div className="flex">
                <div className="flex items-center">
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={onClickDate("start")}
                  >
                    <Text size="1">{format(firstDate, "PP")}</Text>
                  </Button>
                </div>
                <div className="flex items-center mx-2">
                  <ArrowRightIcon width={12} height={12} />
                </div>
                <div className="flex items-center">
                  <Button size="1" variant="ghost" onClick={onClickDate("end")}>
                    <Text size="1">{format(lastDate, "PP")}</Text>
                  </Button>
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="mr-2 text-xs">{/* <CurrencyDropdown /> */}</div>
              <div className="mr-2">
                {/* <Separator orientation="vertical" /> */}
              </div>
              <div>
                <div className="flex items-center">
                  <SelectionDropdown
                    onClickUpdateMeta={handleUpdateMeta}
                    onClearSelection={handleClearSelected}
                    onClickToggleInputAddresses={handleSelectInputAddresses}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DateRangeDialog
          open={dateRangeOpen}
          onClose={handleClose}
          defaultTab={defaultDateTab}
        />
      </div>
    </>
  );
};
