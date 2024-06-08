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

  // const currency = AppContext.useSelector(
  //   (current) => current.context.meta.currency
  // );
  const currency = "usd";

  const priceUrl = AppContext.useSelector(
    (current) => current.context.meta.config.priceUrl
  );

  useEffect(() => {
    send({
      type: "INIT",
      data: { networkLoggerRef, walletActorRef, currency, uri: priceUrl },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(
    (_: Event | MouseEvent, currencyProp: ICurrency = currency) => {
      send({ type: "FETCH", data: { currency: currencyProp, uri: priceUrl } });
    },
    [send, currency, priceUrl]
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
