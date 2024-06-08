import { useEffect } from "react";
import {
  NetworkContext,
  AppContext,
  BtcHistoricPriceContext,
} from "@providers/AppProvider";
import { type IGroupBy } from "@machines/btcHistoricPriceMachine";

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

  const chartTimeFrameRange = meta.chartTimeFrameRange || "5Y";

  let groupBy: IGroupBy = "5M";
  if (chartTimeFrameRange === "1D") {
    groupBy = "5M";
  } else if (chartTimeFrameRange === "1W" || chartTimeFrameRange === "1M") {
    groupBy = "1H";
  } else if (chartTimeFrameRange === "3M" || chartTimeFrameRange === "1Y") {
    groupBy = "1D";
  } else {
    groupBy = "1W";
  }

  useEffect(() => {
    const to = setTimeout(() => {
      send({
        type: "INIT",
        data: { networkLoggerRef, walletActorRef },
      });
    }, 20);
    return () => {
      clearTimeout(to);
    };
  }, []);

  const uri = meta.config.historicalPriceUrl;

  useEffect(() => {
    const timeout = setTimeout(() => {
      send({
        type: "FETCH",
        data: {
          from,
          to,
          currency,
          uri,
          groupBy,
          chartTimeFrameRange: meta.chartTimeFrameRange,
        },
      });
    }, 20);

    return () => {
      clearTimeout(timeout);
    };
  }, [from, to, currency, uri, groupBy]);

  const loading = BtcHistoricPriceContext.useSelector(
    (current) => current.context.loading
  );

  const prices = BtcHistoricPriceContext.useSelector(
    (current) => current.context.prices || []
  );

  const lowerBoundDate = BtcHistoricPriceContext.useSelector(
    (current) => current.context.lowerBoundDate
  );
  const upperBoundDate = BtcHistoricPriceContext.useSelector(
    (current) => current.context.upperBoundDate
  );

  const loadedChartTimeFrameRange = BtcHistoricPriceContext.useSelector(
    (current) => current.context.chartTimeFrameRange
  );

  const actions = {};

  const bounds =
    lowerBoundDate && upperBoundDate
      ? {
          lowerBoundDate,
          upperBoundDate,
        }
      : null;
  return {
    prices,
    from,
    to,
    loading,
    actions,
    bounds,
    loadedChartTimeFrameRange,
  };
};
