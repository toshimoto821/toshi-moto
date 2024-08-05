import { AppContext } from "@providers/AppProvider";
import { useAppSelector } from "@lib/hooks/store.hooks";
import {
  useGetPriceQuery,
  useGetCirculatingSupplyQuery,
} from "../slices/api.slice";
import { selectBtcPrice } from "../slices/price.slice";

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

  const forcastModel = AppContext.useSelector((current) => {
    return current.context.meta.forcastModel;
  });

  const forcastPrices = AppContext.useSelector((current) => {
    return current.context.forcastPrices || [];
  });

  let forcastPrice = null;
  if (forcastModel && forcastPrices.length) {
    forcastPrice = forcastPrices[forcastPrices.length - 1][1];
  }

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
