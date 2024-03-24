import { useEffect, useCallback, type MouseEvent } from "react";
import {
  NetworkContext,
  BtcPriceContext,
  AppContext,
} from "@providers/AppProvider";
import type { ICurrency } from "@root/types";
import { ONE_HUNDRED_MILLION } from "../utils";

export const useBtcPrice = () => {
  const networkLoggerRef = NetworkContext.useActorRef();
  const walletActorRef = AppContext.useActorRef();
  const { send } = BtcPriceContext.useActorRef();

  const currency = AppContext.useSelector(
    (current) => current.context.meta.currency
  );

  useEffect(() => {
    send({
      type: "INIT",
      data: { networkLoggerRef, walletActorRef, currency },
    });
  }, []);

  const refresh = useCallback(
    (_: Event | MouseEvent, currencyProp: ICurrency = currency) => {
      send({ type: "FETCH", data: { currency: currencyProp } });
    },
    [send, currency]
  );

  const change = BtcPriceContext.useSelector(
    (current) => current.context?.btcPrices?.[currency]?.change
  );

  const error = BtcPriceContext.useSelector(
    (current) => current.context?.error
  );

  const btcPrice = BtcPriceContext.useSelector(
    (current) => current.context?.btcPrices?.[currency]?.price
  );

  const circulatingSupply = BtcPriceContext.useSelector((current) =>
    current.context?.circulatingSupply
      ? current.context?.circulatingSupply / ONE_HUNDRED_MILLION
      : undefined
  );

  const updatedAt = BtcPriceContext.useSelector(
    (current) => current.context?.lastUpdatedAt
  );

  const loading = BtcPriceContext.useSelector(
    (current) => current.context?.loading
  );

  const updatedTime = updatedAt ? new Date(updatedAt).toLocaleTimeString() : "";

  return {
    btcPrice,
    loading,
    refresh,
    updatedAt,
    updatedTime,
    change,
    circulatingSupply,
    error,
  };
};
