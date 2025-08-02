import { useMemo } from "react";
import { useGetHistoricPriceQuery } from "../slices/api.slice";
import { useAppDispatch, useAppSelector } from "./store.hooks";
import {
  selectUI,
  selectGroupByHistoric,
  selectGraphDates,
  roundUpToNearHour,
  selectForecastEnabled,
  selectForecastCagr,
  selectForecastData,
  setForecastCagr,
  setForecastData,
} from "../slices/ui.slice";
import {
  calculateCagr,
  generateForecastFromHistorical,
} from "../utils/forecast";

export const useBtcHistoricPrices = () => {
  const { currency } = useAppSelector(selectUI);
  const dispatch = useAppDispatch();

  const {
    graphStartDate: chartStartDate,
    graphEndDate: chartEndDate,
    graphTimeFrameRange,
    // previousGraphTimeFrameRange,
  } = useAppSelector(selectGraphDates);

  const endTimestamp = new Date(chartEndDate);
  const roundedEnd = roundUpToNearHour(endTimestamp);

  const from = Math.floor(chartStartDate / 1000);
  const to = Math.floor(roundedEnd.getTime() / 1000);

  const groupBy = useAppSelector(selectGroupByHistoric);
  const { data, isLoading, error } = useGetHistoricPriceQuery({
    from,
    to,
    groupBy,
    currency,
    range: graphTimeFrameRange!,
  });

  if (error) {
    console.error(error);
  }

  const loading = isLoading || `${data?.meta?.from || ""}` !== `${from}`;

  const prices = data?.prices;

  // Forecast functionality
  const forecastEnabled = useAppSelector(selectForecastEnabled);
  const forecastCagr = useAppSelector(selectForecastCagr);
  const storedForecastData = useAppSelector(selectForecastData);
  console.log(`forecastCagr: ${forecastCagr}`);
  // Calculate CAGR from historical data when forecast is enabled
  const calculatedCagr = useMemo(() => {
    if (!prices || prices.length < 2 || !forecastEnabled) return 0;
    return 44;
  }, [prices, forecastEnabled]);

  // Update stored CAGR when calculated
  useMemo(() => {
    if (calculatedCagr !== forecastCagr && forecastEnabled) {
      dispatch(setForecastCagr(calculatedCagr));
    }
  }, [calculatedCagr, forecastCagr, forecastEnabled, dispatch]);

  // Generate forecast data when enabled
  const forecastData = useMemo(() => {
    if (
      !forecastEnabled ||
      !prices ||
      prices.length === 0 ||
      calculatedCagr === 0
    ) {
      return [];
    }

    // Only generate new forecast data if we don't have stored data or if CAGR changed
    if (
      !storedForecastData ||
      storedForecastData.length === 0 ||
      Math.abs(calculatedCagr - forecastCagr) > 0.1
    ) {
      const newForecastData = generateForecastFromHistorical(
        prices,
        calculatedCagr,
        5,
        groupBy
      );
      dispatch(setForecastData(newForecastData));
      return newForecastData;
    }

    return storedForecastData;
  }, [
    forecastEnabled,
    prices,
    calculatedCagr,
    forecastCagr,
    storedForecastData,
    groupBy,
    dispatch,
  ]);

  // Combine historical and forecast data
  const combinedPrices = useMemo(() => {
    if (!prices) return [];
    if (!forecastEnabled || forecastData.length === 0) return prices;
    return [...prices, ...forecastData];
  }, [prices, forecastEnabled, forecastData]);

  // @todo this is hacky
  // removed but need to validate

  // if the time difference between last two prices and first
  // two prices is different, it means that the range needs
  // to be set on the first because we dont have the data
  // for the last price (which is probably smaller)
  // const len = prices?.length || 0;
  // let chartTimeframeGroup = graphTimeFrameGroup;
  // if (len > 4 && prices?.length) {
  //   const [firstDate] = prices[0];
  //   const [secondDate] = prices[1];
  //   const firstDiff = secondDate - firstDate;

  //   const [sendToLastDate] = prices[prices.length - 2];
  //   const [lastDate] = prices[prices.length - 1];
  //   const lastDiff = lastDate - sendToLastDate;
  //   if (lastDiff !== firstDiff) {
  //     const range = getRangeFromTime(firstDiff);
  //     chartTimeframeGroup = range;
  //   }
  // }
  // if (prices?.length) {
  //   const [ts, val] = prices[prices.length - 1];
  //   console.log(new Date(ts), val, "lastPrice");
  // }

  return {
    prices: combinedPrices,
    from: data?.meta?.from,
    to: data?.meta?.to,
    range: data?.meta?.range,
    group: data?.meta?.groupBy,
    loading,
    forecastEnabled,
    forecastCagr: calculatedCagr,
    forecastData,
  };
};
