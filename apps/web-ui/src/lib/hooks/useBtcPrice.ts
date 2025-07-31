import { useMemo } from "react";
import { useAppSelector } from "@lib/hooks/store.hooks";
import {
  useGetPriceQuery,
  useGetCirculatingSupplyQuery,
} from "../slices/api.slice";
import { selectBtcPrice } from "../slices/price.slice";
import { selectForecastEnabled, selectForecastData } from "../slices/ui.slice";

export const useBtcPrice = () => {
  const { refetch, isLoading: loading, error } = useGetPriceQuery();
  useGetCirculatingSupplyQuery();

  const {
    btcPrice,
    last_updated_at: updatedAt,
    usd_24h_change: change,
    circulatingSupply,
  } = useAppSelector(selectBtcPrice);

  const forecastEnabled = useAppSelector(selectForecastEnabled);
  const forecastData = useAppSelector(selectForecastData);

  // When forecast is enabled, use the last forecast price instead of real-time price
  const effectiveBtcPrice = useMemo(() => {
    if (forecastEnabled && forecastData.length > 0) {
      const lastForecastPrice = parseFloat(
        forecastData[forecastData.length - 1].closePrice
      );
      return lastForecastPrice;
    }
    return btcPrice;
  }, [forecastEnabled, forecastData, btcPrice]);

  // When forecast is enabled, use forecast timestamp instead of real-time timestamp
  const effectiveUpdatedAt = useMemo(() => {
    if (forecastEnabled && forecastData.length > 0) {
      return forecastData[forecastData.length - 1].closeTime;
    }
    return updatedAt;
  }, [forecastEnabled, forecastData, updatedAt]);

  const refresh = refetch;

  const updatedTime = effectiveUpdatedAt
    ? new Date(effectiveUpdatedAt).toLocaleString()
    : "";

  return {
    btcPrice: effectiveBtcPrice,
    loading,
    refresh,
    updatedAt: effectiveUpdatedAt,
    updatedTime,
    change,
    circulatingSupply,
    error,
    isForecastPrice: forecastEnabled && forecastData.length > 0,
  };
};
