import { useEffect } from "react";
import {
  NetworkContext,
  AppContext,
  BtcHistoricPriceContext,
} from "@providers/AppProvider";
// import { IChartTimeFrameRange } from "@machines/appMachine";
// import { rangeToDays } from "@root/components/graphs/graph-utils";

export const useBtcHistoricPrices = () => {
  const networkLoggerRef = NetworkContext.useActorRef();
  const walletActorRef = AppContext.useActorRef();
  // const unshiftTimeout = useRef<NodeJS.Timeout | null>(null);
  // const pushTimeout = useRef<NodeJS.Timeout | null>(null);
  const { send } = BtcHistoricPriceContext.useActorRef();

  // const current = BtcHistoricPriceContext.useSelector(
  //   (current) => current.value
  // );

  const meta = AppContext.useSelector((current) => current.context.meta);

  const { chartStartDate, chartEndDate, currency } = meta;

  const fromDate = chartStartDate;

  const from = Math.floor(fromDate / 1000);
  const to = Math.floor(chartEndDate / 1000);

  useEffect(() => {
    send({ type: "INIT", data: { networkLoggerRef, walletActorRef } });
  }, []);

  useEffect(() => {
    send({ type: "FETCH", data: { from, to, currency } });
  }, [from, to, currency]);

  const loading = BtcHistoricPriceContext.useSelector(
    (current) => current.context.loading
  );

  const prices = BtcHistoricPriceContext.useSelector(
    (current) => current.context.prices || []
  );

  const actions = {};
  return { prices, from, to, loading, actions };
};
