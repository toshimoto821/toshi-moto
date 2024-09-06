import * as d3 from "d3";
import type { StackedBar } from "./line/Line";
import type { IChartTimeframeGroups, IChartTimeFrameRange } from "@root/types";
import { GraphTimeFrameRange, GroupBy } from "@lib/slices/ui.slice.types";
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

export const addTime = (
  groupBy: IChartTimeframeGroups | GroupBy,
  date: Date
) => {
  const d = new Date(date.getTime());

  switch (groupBy) {
    case "5M": {
      const minutes = d.getMinutes();
      const remainder = minutes % 5;
      const increment = remainder === 0 ? 0 : 5 - remainder;
      d.setMinutes(minutes + increment);
      return d;
    }
    case "1H": {
      const minutes = d.getMinutes();
      if (minutes !== 0) {
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
      }
      return d;
    }
    case "1D":
      d.setDate(d.getDate() + 1);
      return d;
    case "1W":
      d.setDate(d.getDate() + 7);
      return d;
    default:
      return date;
    // throw new Error("invalid group by for addTime");
  }
};

export const getGroupKey = (groupBy: IChartTimeframeGroups | GroupBy) => {
  const toString = (d: Date, groupBy: IChartTimeframeGroups) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    let key = `${year}-${month}-${day}`;
    if (groupBy === "1H" || groupBy === "5M") {
      key += `-${d.getHours()}`;
    }

    if (groupBy === "5M") {
      // round to every 5 minutes
      const minutes = d.getMinutes();
      const roundedMinutes =
        minutes % 5 === 0 ? minutes : minutes + (5 - (minutes % 5));
      key += `-${roundedMinutes}`;
    }

    return key;
  };

  switch (groupBy) {
    case "5M":
      return (d: Date) => {
        // //round up the second to minute
        // if (d.getSeconds() >= 30) {
        //   d.setMinutes(d.getMinutes() + 1);
        // }
        return toString(d3.timeMinute(d), groupBy);
      };
    case "1H":
      return (d: Date) => {
        return toString(d3.timeHour(d), groupBy);
      };
    case "1D":
      return (d: Date) => {
        return toString(d3.timeDay(d), groupBy);
      };
    case "1W":
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

export function getMaxForStackedBar(
  data: StackedBar[],
  groupBy: IChartTimeframeGroups
) {
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
  range: IChartTimeframeGroups | GroupBy,
  nextDate: Date
) => {
  // @todo need to account for weekly and monthly
  // but graph doesn not group larger than by dat right now

  if (range === "1D") {
    return {
      start: d3.timeDay(start),
      end: d3.timeDay(end),
    };
  }

  if (range === "1H") {
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
  gap: "5M" | "1H" | "1D" | "1W";
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
}: IGenerateRandomPriceSeries): [number, number][] {
  let timeDifference;
  if (gap === "5M") {
    timeDifference = 5 * 60 * 1000;
  } else if (gap === "1H") {
    timeDifference = 60 * 60 * 1000;
  } else if (gap === "1D") {
    timeDifference = 24 * 60 * 60 * 1000;
  } else {
    timeDifference = 7 * 24 * 60 * 60 * 1000;
  }

  const count = Math.floor((endDate - startDate) / timeDifference);

  const prices = [[startDate, initialPrice]] as [number, number][];
  let date = startDate;
  for (let i = 1; i < count; i++) {
    date += timeDifference;
    const movement = Math.random() * 2 - 1;
    const priceChange =
      movement > 0 ? bullishFactor * movement : bearishFactor * movement;
    prices.push([date, prices[i - 1][1] * (1 + priceChange)]);
  }
  return prices;
}
