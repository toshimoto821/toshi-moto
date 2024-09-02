import { useRef, useEffect, useState } from "react";
import { Text, Flex, Switch, Button } from "@radix-ui/themes";
import { format } from "date-fns";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import * as d3 from "d3";
import { DateRangeDialog } from "../dialogs/DateRangeDialog";
import { useWallets } from "@root/lib/hooks/useWallets";
import { ThinLine } from "@root/components/graphs/line/ThinLine";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { SelectionDropdown } from "./SelectionDropdown";
import { useElementDimensions } from "@root/lib/hooks/useElementDimensions";
import { formatPrice, padBtcZeros } from "@root/lib/utils";
import { currencySymbols } from "@root/lib/currencies";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";
import { useChartData } from "@root/lib/hooks/useChartData";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";
import { selectGraphRange } from "@root/lib/slices/navbar.slice";

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
    btcPrice: rawPrice,
    forcastPrice,
    change: btcChangePrice,
  } = useBtcPrice();
  // const dispatch = useAppDispatch();
  const btcPrice = forcastPrice ?? rawPrice;
  const { actions, data, wallets } = useWallets();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [defaultDateTab, setDefaultDateTab] = useState<"start" | "end">(
    "start"
  );

  const { lineData, plotData } = useChartData({
    wallets,
    btcPrice,
  });

  const uiState = useAppSelector(selectUI);
  const { netAssetValue } = uiState;
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

  const currency = "usd";
  const currencySymbol = currencySymbols[currency];

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
    // if (topHeaderToFifty.current) {
    //   topHeaderToFifty.current.style.opacity =
    //     "" + Math.max(1 - opacity / 100, 50 / 100);
    // }

    // if (myBtcRef.current) {
    //   myBtcRef.current.style.opacity = "" + (1 - opacity / 100);
    // }

    if (headerControlsRef.current) {
      headerControlsRef.current.style.opacity = "" + (1 - opacity / 100);
      if (opacity === 100) {
        headerControlsRef.current.style.display = "none";
      } else {
        headerControlsRef.current.style.display = "flex";
      }
    }

    // if (priceChangeRef.current) {
    //   priceChangeRef.current.style.opacity = "" + (1 - opacity / 100); //
    // }
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

  const handleSelectInputAddresses = () => {
    actions.selectInputAddresses();
  };

  // This was an attempt to better align the dates of the chart data.
  // however it was more confusing because the user would select
  // a particular date with the picker and the chart would not match that date
  // const firstDateAsNumber = prices.length ? prices[0][0] : meta.chartStartDate;
  // const lastDateAsNumber = prices.length
  //   ? prices[prices.length - 1][0]
  //   : meta.chartEndDate;

  const navbarRanges = useAppSelector(selectGraphRange);
  const firstDateAsNumber =
    navbarRanges.graphStartDate || uiState.graphStartDate;
  const lastDateAsNumber = navbarRanges.graphEndDate || uiState.graphEndDate;

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
            className={`absolute px-4 opacity-0 z-30 w-[${dimensions.width}]px`}
          >
            <ThinLine
              lineData={lineData}
              plotData={plotData}
              width={dimensions.width}
              height={chartHeight}
              graphAssetValue={netAssetValue}
              chartTimeframeGroup={uiState.graphTimeFrameGroup}
              showBtcAllocation={uiState.graphBtcAllocation}
              btcPrice={btcPrice ?? 0}
            />
          </div>
        )}
        <div
          className="flex flex-col absolute z-40 w-screen h-[140px]"
          ref={topHeaderToFifty}
        >
          <div className="flex px-4 pt-6 backface-visibility-none">
            <div ref={myBtcRef}>
              <Button
                variant="ghost"
                onClick={toggleBalance}
                data-testid="my-btc-btn"
              >
                <Text
                  size="4"
                  color="orange"
                  className={uiState.navbarBalanceVisibility ? "font-mono" : ""}
                >
                  {uiState.navbarBalanceVisibility
                    ? `₿${padBtcZeros(data.totalBalance)}`
                    : "My BTC"}
                </Text>
              </Button>
            </div>

            <div className="flex-1"></div>
            <div className="flex flex-col">
              <div className="flex items-center justify-end">
                <div className="flex items-center">
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
              </div>
            </div>
          </div>
          <div className="flex px-4 justify-between flex-1 backface-visibility-none font-mono">
            <div className=" flex flex-1 flex-col text-left">
              <Text
                data-testid="btc-price"
                className="font-bold font-mono"
                style={{ color: fontColor }}
                size="6"
              >
                {priceToShow > 0 &&
                  currencySymbol +
                    (netAssetValue
                      ? privateNumber(formatPrice(priceToShow))
                      : formatPrice(priceToShow))}
                {!priceToShow && currencySymbol + "..."}
              </Text>

              <Text size="1" color="gray">
                {netAssetValue ? "USD" : "BTC/USD"}
              </Text>
            </div>
            <div className="text-right">
              <div className="flex justify-end items-center">
                {priceToShow > 0 && valueChange && (
                  <div ref={priceChangeRef}>
                    <Text style={{ color: fontColor }} size="1">
                      {currencySymbol}
                      {netAssetValue
                        ? privateNumber(formatPrice(valueChange))
                        : formatPrice(valueChange)}
                    </Text>
                    {priceToShow > 0 &&
                      valueChange &&
                      priceToShow > 0 &&
                      valueChange &&
                      change < Infinity && (
                        <Text size="1" style={{ color: fontColor }}>
                          {" "}
                          /{" "}
                        </Text>
                      )}
                    {priceToShow > 0 && valueChange && change < Infinity && (
                      <Text className="" size="1" style={{ color: fontColor }}>
                        {change && change.toFixed(2) + "%"}
                      </Text>
                    )}
                    <div className="-mt-1">
                      <Text size="1" color="gray">
                        {uiState.graphTimeFrameRange} &Delta;
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border border-b-0 border-x-0 ">
            <div
              ref={headerControlsRef}
              className="flex justify-between px-4 text-gray-400 py-2"
            >
              <div className="flex">
                <div className="flex items-center">
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={onClickDate("start")}
                  >
                    <Text size="1" className="italic">
                      {format(firstDate, " pp, PP")}
                    </Text>
                  </Button>
                </div>
                <div className="flex items-center mx-2">
                  <ArrowRightIcon width={12} height={12} />
                </div>
                <div className="flex items-center">
                  <Button size="1" variant="ghost" onClick={onClickDate("end")}>
                    <Text size="1" className="italic">
                      {format(lastDate, "pp, PP")}
                    </Text>
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
