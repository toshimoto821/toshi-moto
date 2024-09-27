import * as d3 from "d3";
import type { StackedBar } from "./line/Line";
import type { IChartTimeFrameRange } from "@root/types";
import { GraphTimeFrameRange, GroupBy } from "@lib/slices/ui.slice.types";
import { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
let count = 0;

class Id {
  id: string;
  href: string;
  constructor(id: string) {
    this.id = id;
    this.href = new URL(`#${id}`, window.location.href) + "";
  }
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};

export function uid(name: string) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

export const addTime = (groupBy: GroupBy, date: Date) => {
  const d = new Date(date.getTime());

  switch (groupBy) {
    case "5m": {
      const minutes = d.getMinutes();
      const remainder = minutes % 5;
      const increment = remainder === 0 ? 0 : 5 - remainder;
      d.setMinutes(minutes + increment);
      return d;
    }
    case "15m": {
      const minutes = d.getMinutes();
      const remainder = minutes % 15;
      const increment = remainder === 0 ? 0 : 15 - remainder;
      d.setMinutes(minutes + increment);
      return d;
    }
    case "2h": {
      const minutes = d.getMinutes();
      if (minutes !== 0) {
        d.setHours(d.getHours() + 2);
        d.setMinutes(0);
      }
      return d;
    }
    case "4h": {
      const minutes = d.getMinutes();
      if (minutes !== 0) {
        d.setHours(d.getHours() + 4);
        d.setMinutes(0);
      }
      return d;
    }
    case "1d":
      d.setDate(d.getDate() + 1);
      return d;
    case "1w":
      d.setDate(d.getDate() + 7);
      return d;
    case "1M":
      d.setDate(d.getDate() + 30);
      return d;
    default:
      return date;
    // throw new Error("invalid group by for addTime");
  }
};

export const getGroupKey = (groupBy: GroupBy) => {
  const toString = (d: Date, groupBy: GroupBy) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    let key = `${year}-${month}-${day}`;
    if (
      groupBy === "12h" ||
      groupBy === "2h" ||
      groupBy === "1h" ||
      groupBy === "4h" ||
      groupBy === "6h" ||
      groupBy === "15m" ||
      groupBy === "5m"
    ) {
      key += `-${d.getHours()}`;
    }

    if (groupBy === "5m") {
      // round down to the nearest 5 minutes
      const minutes = d.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 5) * 5;
      key += `-${roundedMinutes}`;
    }

    if (groupBy === "15m") {
      // round down to the nearest 15 minutes
      const minutes = d.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      key += `-${roundedMinutes}`;
    }

    return key;
  };

  switch (groupBy) {
    case "5m":
      return (d: Date) => {
        // //round up the second to minute
        // if (d.getSeconds() >= 30) {
        //   d.setMinutes(d.getMinutes() + 1);
        // }
        return toString(d3.timeMinute(d), groupBy);
      };
    case "15m":
      return (d: Date) => {
        // //round up the second to minute
        // if (d.getSeconds() >= 30) {
        //   d.setMinutes(d.getMinutes() + 1);
        // }
        return toString(d3.timeMinute(d), groupBy);
      };
    case "1h":
    case "2h":
      return (d: Date) => {
        return toString(d3.timeHour(d), groupBy);
      };

    case "4h":
      return (d: Date) => {
        return toString(d3.timeHour(d), groupBy);
      };

    case "6h":
      return (d: Date) => {
        return toString(d3.timeHour(d), groupBy);
      };

    case "12h":
      return (d: Date) => {
        return toString(d3.timeHour(d), groupBy);
      };
    case "1d":
      return (d: Date) => {
        return toString(d3.timeDay(d), groupBy);
      };
    case "1w":
      return (d: Date) => {
        return toString(d3.timeWeek(d), groupBy);
      };
    case "1M":
      return (d: Date) => {
        return toString(d3.timeMonth(d), groupBy);
      };
    default:
      return (d: Date) => {
        return toString(d3.timeDay(d), groupBy);
      };
  }
};

const fader = (color: string) => d3.interpolateRgb(color, "#fff")(0.5);
export const colorScale = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

export function getMaxForStackedBar(data: StackedBar[], groupBy: GroupBy) {
  const groups = data
    .filter((d) => d.visible)
    .reduce((acc, item) => {
      // Get the month and year from the date
      const dateKeyFn = getGroupKey(groupBy);
      const date = new Date(item.groupedDate);

      // Create a key for the month and year
      const key = dateKeyFn(date);

      // If the key doesn't exist in the accumulator, initialize it
      if (!acc[key]) {
        acc[key] = 0;
      }

      // Add the vout value to the accumulator
      acc[key] += item.vout;

      return acc;
    }, {} as Record<string, number>);
  return Math.max(...Object.values(groups));
}

export const rangeToDays = (range: IChartTimeFrameRange) => {
  switch (range) {
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "1Y":
      return 365;
    case "2Y":
      return 365 * 2;
    case "5Y":
      return 1825;
  }

  throw new Error("invalid range for rangeToDays");
};

export const getRangeFromTime = (time: number): GraphTimeFrameRange => {
  const oneDay = 1000 * 60 * 60 * 24;
  if (time <= oneDay) {
    return "1D";
  } else if (time <= oneDay * 7) {
    return "1W";
  } else if (time <= oneDay * 30) {
    return "1M";
  } else if (time <= oneDay * 90) {
    return "3M";
  } else if (time <= oneDay * 365) {
    return "1Y";
  } else if (time <= oneDay * 365 * 2) {
    return "2Y";
  }

  return "5Y";
};

export const getDatesForChartGroup = (
  start: Date,
  end: Date,
  range: GroupBy,
  nextDate: Date
) => {
  // @todo need to account for weekly and monthly
  // but graph doesn not group larger than by dat right now

  if (range === "1d") {
    return {
      start: d3.timeDay(start),
      end: d3.timeDay(end),
    };
  }

  if (range === "4h") {
    if (nextDate) {
      // last element wont be there
      const diff = nextDate.getTime() - end.getTime();
      // ms * sec * min === 1 hour
      if (diff > 1000 * 60 * 60) {
        return {
          start: d3.timeHour(start),
          end: d3.timeHour(nextDate),
        };
      }
    }
    return {
      start: d3.timeHour(start),
      end: d3.timeHour(end),
    };
  }

  return {
    start,
    end,
  };
};

type IGenerateRandomPriceSeries = {
  initialPrice: number;
  bullishFactor?: number;
  bearishFactor?: number;
  gap: "15M" | "1H" | "2H" | "4H" | "6H" | "12H" | "1D" | "1W";
  startDate: number;
  endDate: number;
};

export function generateRandomPriceSeries({
  initialPrice,
  bullishFactor = 0.04,
  bearishFactor = 0.001,
  gap,
  startDate,
  endDate,
}: IGenerateRandomPriceSeries): BinanceKlineMetric[] {
  let timeDifference;
  if (gap === "15M") {
    timeDifference = 15 * 60 * 1000;
  } else if (gap === "2H") {
    timeDifference = 2 * 60 * 60 * 1000;
  } else if (gap === "4H") {
    timeDifference = 4 * 60 * 60 * 1000;
  } else if (gap === "6H") {
    timeDifference = 4 * 60 * 60 * 1000;
  } else if (gap === "1D") {
    timeDifference = 24 * 60 * 60 * 1000;
  } else {
    timeDifference = 7 * 24 * 60 * 60 * 1000;
  }

  const count = Math.floor((endDate - startDate) / timeDifference);

  const prices = [
    createFakeKline(initialPrice, startDate),
  ] as BinanceKlineMetric[];
  let date = startDate;
  for (let i = 1; i < count; i++) {
    date += timeDifference;
    const movement = Math.random() * 2 - 1;
    const priceChange =
      movement > 0 ? bullishFactor * movement : bearishFactor * movement;

    const previous = prices[i - 1];
    const previousPrice = parseFloat(previous.closePrice);
    prices.push(createFakeKline(previousPrice * (1 + priceChange), date));
    // prices.push([date, prices[i - 1][1] * (1 + priceChange), vol]);
  }
  return prices;
}

export function createFakeKline(
  price: number,
  date: number,
  volume: number = 0
) {
  return {
    openTime: date,
    openPrice: price + "",
    highPrice: price + "",
    lowPrice: price + "",
    closePrice: price + "",
    volume: volume + "",
    closeTime: date,
    quoteAssetVolume: "0.0",
    numberOfTrades: 0,
    takerBuyBaseAssetVolume: "0.0",
    takerBuyQuoteAssetVolume: "0.0",
  };
}
