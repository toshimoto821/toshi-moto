import { useGetHistoricPriceQuery } from "../slices/api.slice";
import { useAppSelector } from "./store.hooks";
import {
  selectUI,
  selectGroupByHistoric,
  selectGraphDates,
  roundUpToNearHour,
} from "../slices/ui.slice";

export const useBtcHistoricPrices = () => {
  const { currency } = useAppSelector(selectUI);

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
    prices,
    from: data?.meta?.from,
    to: data?.meta?.to,
    range: data?.meta?.range,
    group: data?.meta?.groupBy,
    loading,
  };
};
