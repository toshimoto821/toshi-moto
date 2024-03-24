import * as d3 from "d3";
import type { StackedBar } from "./line/Line";
import type {
  IChartTimeframeGroups,
  IChartTimeFrameRange,
} from "@root/machines/appMachine";
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

export const addTime = (groupBy: IChartTimeframeGroups, date: Date) => {
  const d = new Date(date.getTime());
  switch (groupBy) {
    case "5M":
      d.setMinutes(d.getMinutes() + 5);
      return d;
    case "1H":
      d.setHours(d.getHours() + 1);
      return d;
    case "1D":
      d.setDate(d.getDate() + 1);
      return d;
    default:
      return date;
    // throw new Error("invalid group by for addTime");
  }
};

export const getGroupKey = (groupBy: IChartTimeframeGroups) => {
  const toString = (d: Date, groupBy: IChartTimeframeGroups) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    let key = `${year}-${month}-${day}`;
    if (groupBy === "1H" || groupBy === "1D" || groupBy === "5M") {
      key += `-${d.getHours()}`;
    }

    if (groupBy === "5M") {
      // round to every 5 minutes
      key += `-${d.getMinutes() - (d.getMinutes() % 5)}`;
    }

    return key;
  };

  switch (groupBy) {
    case "5M":
      return (d: Date) => {
        //round up the second to minute
        if (d.getSeconds() >= 30) {
          d.setMinutes(d.getMinutes() + 1);
        }
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
