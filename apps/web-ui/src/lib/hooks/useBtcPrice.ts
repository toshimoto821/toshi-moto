import { useAppSelector } from "@lib/hooks/store.hooks";
import {
  useGetPriceQuery,
  useGetCirculatingSupplyQuery,
} from "../slices/api.slice";
import { selectBtcPrice, selectForecastPrice } from "../slices/price.slice";

export const useBtcPrice = () => {
  const { refetch, isLoading: loading, error } = useGetPriceQuery();
  useGetCirculatingSupplyQuery();

  const {
    btcPrice,
    last_updated_at: updatedAt,
    usd_24h_change: change,
    circulatingSupply,
  } = useAppSelector(selectBtcPrice);

  const refresh = refetch;

  const forcastPrice = useAppSelector(selectForecastPrice);

  const updatedTime = updatedAt ? new Date(updatedAt).toLocaleString() : "";
  return {
    btcPrice,
    forcastPrice,
    loading,
    refresh,
    updatedAt,
    updatedTime,
    change,
    circulatingSupply,
    error,
  };
};
