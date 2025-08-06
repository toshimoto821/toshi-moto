import { useRef, useEffect, useState } from "react";
import { Text, Button, DropdownMenu } from "@radix-ui/themes";
import { format } from "date-fns";
import { ArrowRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as d3 from "d3";
import { DateRangeDialog } from "../dialogs/DateRangeDialog";
import { useWallets } from "@root/lib/hooks/useWallets";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { SelectionDropdown } from "./SelectionDropdown";
import { useElementDimensions } from "@root/lib/hooks/useElementDimensions";
import { formatPrice, padBtcZeros } from "@root/lib/utils";
import { currencySymbols } from "@root/lib/currencies";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";
import { useChartData } from "@root/lib/hooks/useChartData";
import { useAppSelector, useAppDispatch } from "@root/lib/hooks/store.hooks";
import { selectUI, setUI } from "@root/lib/slices/ui.slice";
import { selectGraphRange } from "@root/lib/slices/navbar.slice";
import { HeroChart } from "../graphs/historic-price-chart/HeroChart";

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
  .range([0, 70]) // Output range
  .clamp(true); //

const opacityScaleFull = d3
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
    change: btcChangePrice,
    isForecastPrice,
  } = useBtcPrice();
  const dispatch = useAppDispatch();
  const btcPrice = rawPrice;
  const { actions, data, wallets } = useWallets();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [defaultDateTab, setDefaultDateTab] = useState<"start" | "end">(
    "start"
  );

  const {
    lineData,
    gain,
    percentGain,
    percentageChange,
    valueChange,
    cagrPercentage,
    cagrDollar,
    forecastEnabled,
    projectedCagrPercentage,
    projectedCagrDollar,
  } = useChartData({
    wallets,
    btcPrice,
  });

  // Calculate if time range is less than 30 days
  const timeRangeInDays = lineData?.length
    ? (lineData[lineData.length - 1].x - lineData[0].x) / (1000 * 60 * 60 * 24)
    : 0;
  const isShortRange = timeRangeInDays < 30;

  const uiState = useAppSelector(selectUI);
  const { displayMode } = uiState;
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
  // Use the values from useChartData hook instead of calculating locally
  if (lineData?.length) {
    change = percentageChange;
  }

  let priceToShow = btcPrice;
  let changeToShow = change;
  let valueChangeToShow = valueChange;
  let percentChangeToShow = change;

  if (displayMode === "netAsset") {
    priceToShow = data.totalBalance * btcPrice;
    changeToShow = percentGain || 0;
    valueChangeToShow = gain || 0;
    percentChangeToShow = percentGain || 0;
  } else if (displayMode === "cagr") {
    priceToShow = data.totalBalance * btcPrice;
    // Use projected CAGR values when forecast is enabled, otherwise use historical CAGR
    changeToShow = forecastEnabled
      ? projectedCagrPercentage || 0
      : cagrPercentage || 0;
    valueChangeToShow = forecastEnabled
      ? projectedCagrDollar || 0
      : cagrDollar || 0;
    percentChangeToShow = forecastEnabled
      ? projectedCagrPercentage || 0
      : cagrPercentage || 0;
  }

  const fontColor = colorScale(changeToShow ?? 0);

  // you cant rerender react so much cause its janky
  // so we use a ref to update style manually
  const onScroll = () => {
    const scrollPosition = window.scrollY;
    // const height = heightScale(scrollPosition);
    const opacity = opacityScale(scrollPosition);
    const opacityFull = opacityScaleFull(scrollPosition);
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

    const bottomNavOpacity = 1 - opacityFull / 100;
    if (headerControlsRef.current) {
      headerControlsRef.current.style.opacity = "" + (1 - opacityFull / 100);
      if (bottomNavOpacity === 0) {
        headerControlsRef.current.style.display = "none";
      } else {
        headerControlsRef.current.style.display = "block";
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

  const getDisplayModeLabel = () => {
    switch (displayMode) {
      case "standard":
        return forecastEnabled ? "BTC/USD (Forecast)" : "BTC/USD";
      case "netAsset":
        return forecastEnabled ? "Net Asset (Forecast)" : "Net Asset";
      case "cagr":
        return forecastEnabled ? "CAGR (Forecast)" : "CAGR";
      default:
        return "BTC/USD";
    }
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
    <div
      data-testid="navbar"
      className={`sticky top-0 z-50 h-[${chartHeight}px] bg-white drop-shadow-sm overflow-hidden border-b w-screen backface-visibility-none`}
      ref={containerRef}
    >
      {lineData && (
        <div
          ref={lineWrapperRef}
          className={`absolute opacity-0 z-30 w-[${dimensions.width}]px`}
        >
          {/* <HeroChartHeader height={chartHeight} width={dimensions.width} /> */}
          <HeroChart
            height={chartHeight}
            width={dimensions.width}
            bgColor="white"
            id="hero-chart-header"
            suppressEvents
            suppressLegengs
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
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost" size="1">
                      <Text size="2">{getDisplayModeLabel()}</Text>
                      <ChevronDownIcon width="12" height="12" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      shortcut={displayMode === "standard" ? "✓" : ""}
                      onSelect={() =>
                        dispatch(setUI({ displayMode: "standard" }))
                      }
                    >
                      <div>
                        <Text size="2" weight="bold">
                          Standard Bitcoin Value
                        </Text>
                        <Text size="1" color="gray" className="ml-1">
                          BTC price and change
                        </Text>
                      </div>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      shortcut={displayMode === "netAsset" ? "✓" : ""}
                      onSelect={() =>
                        dispatch(setUI({ displayMode: "netAsset" }))
                      }
                    >
                      <div>
                        <Text size="2" weight="bold">
                          Net Asset Value
                        </Text>
                        <Text size="1" color="gray" className="ml-1">
                          Total portfolio value
                        </Text>
                      </div>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      shortcut={displayMode === "cagr" ? "✓" : ""}
                      onSelect={() => dispatch(setUI({ displayMode: "cagr" }))}
                    >
                      <div>
                        <Text size="2" weight="bold">
                          CAGR
                        </Text>
                        <Text size="1" color="gray" className="ml-1">
                          Compound annual growth rate
                        </Text>
                      </div>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
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
                  (displayMode !== "standard"
                    ? privateNumber(formatPrice(priceToShow))
                    : formatPrice(priceToShow))}
              {!priceToShow && currencySymbol + "..."}
              {isForecastPrice && (
                <span className="ml-2 text-xs text-green-500 font-normal">
                  (Forecast)
                </span>
              )}
            </Text>

            <Text size="1" color="gray">
              {displayMode === "standard" ? "BTC/USD" : "USD"}
              {isForecastPrice && " • Forecast"}
            </Text>
          </div>
          <div className="text-right">
            <div className="flex justify-end items-center">
              {displayMode === "cagr" && isShortRange && (
                <Text size="1" color="gray">
                  CAGR disabled for &lt; 30 days
                </Text>
              )}
              {priceToShow > 0 && !!valueChangeToShow && (
                <div ref={priceChangeRef}>
                  <Text style={{ color: fontColor }} size="1">
                    {currencySymbol}
                    {displayMode !== "standard"
                      ? privateNumber(formatPrice(valueChangeToShow))
                      : formatPrice(valueChangeToShow)}
                  </Text>

                  <Text size="1" style={{ color: fontColor }}>
                    {" "}
                    /{" "}
                  </Text>

                  {priceToShow > 0 && valueChangeToShow && (
                    <Text className="" size="1" style={{ color: fontColor }}>
                      {displayMode !== "standard"
                        ? percentChangeToShow &&
                          percentChangeToShow.toFixed(2) + "%"
                        : changeToShow && changeToShow.toFixed(2) + "%"}
                    </Text>
                  )}
                  <div className="-mt-1">
                    <Text size="1" color="gray">
                      {forecastEnabled ? "10" : uiState.graphTimeFrameRange}
                      &Delta;
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border border-b-0 border-x-0 " ref={headerControlsRef}>
          <div className="flex justify-between px-4 text-gray-400 py-2">
            <div className="flex" data-testid="date-picker-container">
              <div className="flex items-center">
                <Button
                  size="1"
                  variant="ghost"
                  onClick={onClickDate("start")}
                  disabled={forecastEnabled}
                  className={
                    forecastEnabled ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Text size="1" className="font-mono">
                    {format(firstDate, "PP, hh:mm a")}
                  </Text>
                </Button>
              </div>
              <div className="flex items-center mx-2">
                <ArrowRightIcon width={12} height={12} />
              </div>
              <div className="flex items-center">
                <Button
                  size="1"
                  variant="ghost"
                  onClick={onClickDate("end")}
                  disabled={forecastEnabled}
                  className={
                    forecastEnabled ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Text size="1" className="font-mono">
                    {format(lastDate, "PP, hh:mm a")}
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
  );
};
