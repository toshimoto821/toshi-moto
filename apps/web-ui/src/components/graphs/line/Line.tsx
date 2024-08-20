import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { jade, ruby } from "@radix-ui/colors";
import findLastIndex from "lodash/findLastIndex";
import { addDays, startOfDay } from "date-fns";
import { useBreakpoints } from "@lib/hooks/useBreakpoints";
import { IPlotData } from "@root/types";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setStreamPause } from "@lib/slices/price.slice";
import "./tooltip.css";
import {
  ONE_HUNDRED_MILLION,
  padBtcZeros,
  trimAddress,
  trim,
} from "@root/lib/utils";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";
import { selectForecast } from "@root/lib/slices/price.slice";
// https://observablehq.com/@d3/bar-line-chart
export type Plot = {
  x: number;
  y1: number;
  y1Sum: number;
  y1SumInDollars: number;
  y2: number;
};

export type ILine = {
  height: number;
  width: number;
  lineData: Plot[];
  plotData: IPlotData[];
  btcPrice: number; // current btc price
  // to show the net value of wallets set to true (y1)
  // otherwise the btcPrice (y2) is graphed
  graphAssetValue: boolean;
  ready: boolean;

  onSelectPlot: (plot: IPlotData, clearSelection: () => void) => void;
  onClearSelection: () => void;
  dots: boolean;
  showBtcAllocation: boolean;
};

// @todo make generic
export interface StackedBarData {
  address: string;
  txid: string;
  isUtxo: boolean;
  color: string;
  utxoBalance: number;
  vout: number;
  vin: number;
  value: number;
  date: Date;
  walletName: string;
  walletId: string;
  visible: boolean;
}

export interface StackedBar extends StackedBarData {
  groupedDate: number;
}

const fakeDate = d3.range(50).map((_, i) => ({
  x: i,
  y: Math.sin(i / 5) * 10 + Math.random() * 5,
}));

const TOOLTIP_WIDTH = 240;
// note you have to manually change the value below because
// tailwind wont pickup the variable value
export const Line = (props: ILine) => {
  const {
    height,
    width,
    lineData,
    plotData,
    graphAssetValue,
    ready,
    onSelectPlot,
    onClearSelection,
    dots,
    btcPrice,
    showBtcAllocation,
    // onScroll,
  } = props;

  const dispatch = useAppDispatch();

  const [activePlotTs, setActivePlotTs] = useState<number | null>(null);
  const [focusedPlotTs, setFocusedPlotTs] = useState<number | null>(null);
  const privateNumber = useNumberObfuscation();
  const { forecastModel } = useAppSelector(selectForecast);

  const tomorrow = addDays(new Date(), 1);

  // Set time to 00:00:00 (start of the day)
  // this may cause issues
  const TOMORROW_START = startOfDay(tomorrow);

  // create a ref to store the circle
  const pulsingCircleRef = useRef<d3.Selection<
    SVGCircleElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const btcAllocationDotRef = useRef<d3.Selection<
    SVGCircleElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const currentPriceLine = useRef<d3.Selection<
    SVGLineElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const currentVerticalPriceLine = useRef<d3.Selection<
    SVGLineElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const mainGroup = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const yValueToUse: "y1SumInDollars" | "y2" = graphAssetValue
    ? "y1SumInDollars"
    : "y2";

  const breakpoint = useBreakpoints();
  plotData.sort((a, b) => a.x - b.x);
  const tooltipDatasIndex = plotData.findIndex(
    (plot) => plot.x === activePlotTs
  );
  const tooltipDatasLastIndex = findLastIndex(
    plotData,
    (plot) => plot.x === activePlotTs
  );
  const tooltipDatas = plotData.filter((plot) => plot.x === activePlotTs);

  const grayRGB = "rgb(243 244 246)";

  const svgRef = useRef<SVGSVGElement>(null);
  const margin = {
    top: 70,
    right: 0,
    bottom: 10,
    left: 0,
  };

  const last = lineData[lineData.length - 1];
  const tomorrowStart = TOMORROW_START.getTime();
  if (!forecastModel && last?.x > tomorrowStart) {
    last.x = tomorrowStart;
  }

  const xDomain = lineData.map((d) => new Date(d.x)) as Date[];
  const ext = d3.extent(lineData, (d) => d[yValueToUse]!) as [number, number];
  const xRange = [margin.left, width - margin.right];

  const x = d3
    // may need to change to time scale
    .scaleUtc()
    .domain(d3.extent(xDomain) as [Date, Date])
    .range(xRange);

  const plotExt = d3.extent(plotData, (d) => d.value) as [number, number];
  const y3 = d3.scaleLinear().domain(plotExt).range([0.25, 0.75]);
  // const rScale = d3.scaleLinear().domain(plotExt).range([2, 3]);

  const y1 = d3
    .scaleLinear()
    .domain([0, ext[1]])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line<Plot>()
    .x((d) => x(new Date(d.x)))
    .y((d) => y2(d[yValueToUse]!));

  // const ext = d3.extent(lineData, (d) => d[yValueToUse]!) as [number, number];
  const y2 = d3
    .scaleLinear()
    .domain(ext)
    .range([height - margin.bottom, margin.top]);

  const ext3 = d3.extent(lineData, (d) => d.y1Sum * btcPrice!) as [
    number,
    number
  ];
  const [, maxExt3] = ext3;

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const top = y2(lineData[lineData.length - 1]?.[yValueToUse]!);

  // if there is no difference between the min and maxå
  // it screws up the scale
  // so we set the bottom to 0
  const diff = Math.abs(ext3[0] - ext3[1]);
  const b = diff === 0 ? 0 : ext3[0];
  const y4 = d3
    .scaleLinear()
    .domain([b, ext3[1]])
    .range([height - margin.bottom, top]);

  // const xAxis = (g: any) => {
  //   const allTicks = x.ticks(3);

  //   g.attr("transform", `translate(0,${height - margin.bottom})`)
  //     .call(
  //       d3
  //         .axisBottom(x)

  //         .tickValues(allTicks)
  //         // @ts-expect-error d3 types are wrong ?
  //         .tickFormat(d3.timeFormat("%Y-%m-%d")) // Format the tick labels as needed
  //         .tickSizeOuter(0)
  //     )
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     .call((g: any) => g.select(".domain").remove());
  // };

  const formatK = d3.format("~s");
  const formatDefault = d3.format("~s");
  const formatBtc = d3.format(".4f");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const y4Axis = (g: any) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const lowest = lineData[lineData.length - 1]?.[yValueToUse]!;
    const px = y2(lowest);
    const calcScale = d3.scaleLinear().domain([height, 0]).range([1, 6]);
    const ticks = Math.round(calcScale(px));

    const domain = y4.domain();
    const tickValues = d3.range(
      domain[0],
      domain[1],
      (domain[1] - domain[0]) / ticks
    );

    g.attr("transform", `translate(${width - margin.right},0)`)
      .call(
        d3
          .axisLeft(y4)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .tickFormat((d: any) => `₿${privateNumber(formatBtc(d / btcPrice))}`)
          .tickValues(tickValues)
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) => g.select(".domain").remove())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) =>
        g.selectAll(".tick line").attr("stroke", "orange").attr("opacity", 1)
      )
      .selectAll("text")
      .attr("fill", "orange")
      .attr("opacity", 1);

    const padding = { top: 1, right: 5, bottom: 1, left: 5 }; // Adjust as needed

    g.selectAll(".tick").each(function (this: SVGTextElement) {
      const tick = d3.select(this);
      if (!tick) return;
      const text = tick.select("text");
      if (!text) return;
      const bbox = (text.node() as SVGTextElement).getBBox();

      tick
        .insert("rect", "text")
        .attr("x", bbox.x - padding.left)
        .attr("y", bbox.y - padding.top)
        .attr("width", bbox.width + padding.left + padding.right)
        .attr("height", bbox.height + padding.top + padding.bottom)
        .attr("rx", 2) // radius of the corners in the x direction
        .attr("ry", 2) // radius of the corners in the y direction
        // .attr("stroke", "orange")
        .attr("opacity", 0.4)
        .style("fill", "white");

      text.attr("fill", "orange").attr("opacity", 1);
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const y2Axis = (g: any) => {
    const padding = { top: 1, right: 5, bottom: 1, left: 5 }; // Adjust as needed
    g.attr("transform", `translate(20,0)`)

      .call(
        d3
          .axisRight(y2)
          .tickFormat((d) => {
            if (breakpoint > 2) {
              return `$${
                yValueToUse === "y1SumInDollars"
                  ? privateNumber(formatDefault(d))
                  : formatDefault(d)
              }`;
            } else {
              return `$${
                yValueToUse === "y1SumInDollars"
                  ? privateNumber(formatK(d))
                  : formatK(d)
              }`;
            }
          })
          .ticks(5)
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) => g.select(".domain").remove())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) =>
        g.selectAll(".tick line").attr("stroke", "gray").attr("opacity", 0.6)
      )
      .selectAll("text")
      .attr("fill", "gray");

    g.selectAll(".tick").each(function (this: SVGTextElement) {
      const tick = d3.select(this);
      if (!tick) return;
      const text = tick.select("text");
      if (!text) return;
      const bbox = (text.node() as SVGTextElement).getBBox();

      tick
        .insert("rect", "text")
        .attr("x", bbox.x - padding.left)
        .attr("y", bbox.y - padding.top)
        .attr("width", bbox.width + padding.left + padding.right)
        .attr("height", bbox.height + padding.top + padding.bottom)
        .attr("rx", 2) // radius of the corners in the x direction
        .attr("ry", 2) // radius of the corners in the y direction
        // .attr("stroke", "orange")
        .attr("opacity", 0.4)
        .style("fill", "white");

      // text.attr("fill", "orange").attr("opacity", 1);
    });
  };
  // .attr("opacity", 0.8);

  const createGradients = () => {
    const svg = d3.select(svgRef.current);

    const defs = svg.append("defs");

    if (defs) {
      const loaderGradient = defs
        .append("linearGradient")
        .attr("id", "loader-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      loaderGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "lightgray")
        .attr("stop-opacity", 1);

      loaderGradient
        .append("stop")
        .attr("offset", "70%")
        .attr("stop-color", grayRGB)
        .attr("stop-opacity", 1);
      // Create a pulse effect

      defs
        .append("marker")
        .attr("id", "arrowheadDown")
        .attr("viewBox", "0 -5 20 20") // Position and size of the arrowhead
        .attr("refX", 0)
        .attr("refY", 5)
        .attr("orient", "90deg")
        .attr("markerWidth", 40)
        .attr("markerHeight", 40)
        .append("svg:path")
        .attr("d", "M 0,0 L 10 ,5 L 0,10") // Shape of the arrowhead
        .attr("fill", ruby.ruby11);

      // Define the gradient
      const gradientRed = defs
        .append("linearGradient")
        .attr("id", "gradient-red")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      const gradientGreen = defs
        .append("linearGradient")
        .attr("id", "gradient-green")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      // console.log(lineData);
      // Set the gradient colors

      gradientRed
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", ruby.ruby11)
        .attr("stop-opacity", 1);

      gradientGreen
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", jade.jade11)
        .attr("stop-opacity", 1);

      gradientRed
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", grayRGB)
        .attr("stop-opacity", 1);

      gradientGreen
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", grayRGB)
        .attr("stop-opacity", 1);

      defs
        .append("marker")
        .attr("id", "arrowheadUp")
        .attr("viewBox", "-0 -5 20 20") // Position and size of the arrowhead
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 40)
        .attr("markerHeight", 40)
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5") // Shape of the arrowhead
        .attr("fill", "green");
    }
  };

  const renderLineArea = () => {
    const svg = mainGroup.current;
    const svgParent = d3.select(svgRef.current);
    if (!svg) return;

    const area = d3
      .area<Plot>()
      .x((d) => {
        const val = x(new Date(d.x));
        return val;
      })
      .y0(y1(0))
      .y1((d) => {
        const val = y2(d[yValueToUse]);
        return val;
      });

    const direction =
      lineData[0]?.[yValueToUse] < lineData[lineData.length - 1]?.[yValueToUse]
        ? 1
        : -1;
    // Add the area
    const now = new Date().getTime();
    const pastLineData = lineData.filter((d) => d.x <= now);
    const futureLineData = lineData.filter((d) => d.x > now);
    if (futureLineData?.length) {
      pastLineData.push(futureLineData[0]);
    }
    svg
      .append("path")
      .datum(lineData)
      .attr("opacity", 0.2)
      .attr(
        "fill",
        `url(#${direction > 0 ? "gradient-green" : "gradient-red"})`
      )
      // .attr('fill-opacity', 0.2)
      .attr("d", area);

    // Add the line
    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
      .attr("stroke-miterlimit", 1)
      .attr("stroke-opacity", "0.5")
      .attr("stroke-width", 1.5)
      .attr("d", line(pastLineData));

    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
      .attr("stroke-miterlimit", 1)
      .attr("stroke-opacity", "0.5")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "2,4")
      .attr("d", line(futureLineData));

    // svg
    //   .append("path")
    //   .datum(futureLineData)
    //   .attr("fill", "rgba(255, 255, 255, 0.8)") // semi-transparent white
    //   .attr("d", area);

    // create tooltip on hover and mousemove (for mobile) to show the price/value

    const tooltip = d3.select("#price-tooltip");
    // const lineTooltipTable = d3.select("#line-tooltip");
    currentVerticalPriceLine.current =
      currentVerticalPriceLine.current || svg.append("line");
    if (currentVerticalPriceLine.current) {
      currentVerticalPriceLine.current
        .classed("vertical-tooltip-line", true)
        .style("stroke", "black") // Change the color as needed
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .style("stroke-width", 0.5);
    }
    svgParent.on("touchstart", () => {
      dispatch(setStreamPause(true));
    });
    svgParent.on("touchend", () => {
      dispatch(setStreamPause(false));
    });
    svgParent
      .on("mousemove touchmove", function (event) {
        if (currentVerticalPriceLine.current) {
          currentVerticalPriceLine.current
            .classed("vertical-tooltip-line", true)
            .style("stroke", "black") // Change the color as needed
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .style("stroke-width", 0.5);
        }
        const bisect = d3.bisector((d: Plot) => new Date(d.x)).left;
        const [xAndYPotion] = d3.pointers(event, svg.node());
        const [xVal] = xAndYPotion;

        if (xVal > width) return;

        const x0 = x.invert(xVal);

        const i = bisect(lineData, x0, 1);
        const d0 = lineData[i - 1];

        const d1 = lineData[i];

        const matched = plotData.find((plot) => {
          const plotTime = d3.timeMinute(new Date(plot.x)).getTime();
          const d0Time = d3.timeMinute(new Date(d0.x)).getTime();

          // Calculate the difference in minutes
          const diffInMinutes = Math.abs(plotTime - d0Time) / (1000 * 60);

          // Check if the difference is less than or equal to 60 minutes
          return diffInMinutes <= 60;
        });

        if (matched) {
          setFocusedPlotTs(matched.x);
        } else {
          setFocusedPlotTs(null);
        }

        const dFirst = lineData[0];
        const changeVal =
          dFirst && d1 ? d1[yValueToUse] - dFirst[yValueToUse] : 1;
        const btcAllocation = d1?.y1Sum ?? 0;

        let d = d0;
        if (d1 && d1.x) {
          d =
            x0.getTime() - new Date(d0.x).getTime() >
            new Date(d1.x).getTime() - x0.getTime()
              ? d1
              : d0;
        }
        const date = new Date(d.x);
        const value = d3.format(",.2f")(d[yValueToUse]);
        const left = Math.min(xVal + 10, width - TOOLTIP_WIDTH / 2);
        const tooltipLeft = Math.min(
          Math.max(1, left - (TOOLTIP_WIDTH + 10) / 2),
          width - 186
        );

        const top = 180;

        tooltip
          .style("opacity", 0.7)
          .style("left", tooltipLeft + "px")
          .style("position", "fixed")
          .style("top", top + "px")
          .style("pointer-events", "none")

          // make the date format feb 6 at 7:00 pm
          // use date-fns

          .html(
            `<div id="tooltip_bubble">
            <div class="tooltip_bubble_price">
              <div>$${value}</div>
              <div class="tooltip_bubble_btc">&#8383;${padBtcZeros(
                btcAllocation
              )}</div>
            </div>
            <div class="tooltip_bubble_price">
                <div>
                  <span style="color:${
                    changeVal > 0 ? jade.jade11 : ruby.ruby11
                  }">$${d3.format(",.2f")(changeVal)}</span>
  
                </div>
                <div class="tooltip_bubble_btc">$${d3.format(",.2f")(
                  d.y1SumInDollars
                )}</div>
            </div>
              
            <div >
              
            </div>
            <div style="font-size:10px;text-align:center;">${format(
              date,
              "MMM do, p"
            )}</div></div>`
          );

        const leftX = Math.min(xVal + 10, xVal);

        if (currentVerticalPriceLine.current) {
          currentVerticalPriceLine.current
            .attr("x1", leftX)
            .attr("y1", 40) // Start at the top of the SVG
            .attr("x2", leftX)
            .style("pointer-events", "none")
            .attr("y2", height)
            .style("opacity", 0.5);
        }

        // move the current price line to the current price
        if (pulsingCircleRef.current) {
          pulsingCircleRef.current
            .attr("cx", xVal)
            .attr("cy", y2(d[yValueToUse]));
        }
        updateBtcDot(xVal, y4(d.y1Sum * btcPrice!));

        if (currentPriceLine.current) {
          currentPriceLine.current
            .attr("x1", 0)
            .attr("y1", y2(d[yValueToUse]))
            .attr("x2", width)
            .attr("y2", y2(d[yValueToUse]));
        }
      })
      .on("mouseout touchend", () => {
        dispatch(setStreamPause(false));
        tooltip.style("opacity", 0);
        // toolTipLine.style("opacity", 0);
        if (currentVerticalPriceLine.current) {
          currentVerticalPriceLine.current.style("opacity", 0);
        }
        // reset the current price to the last
        if (pulsingCircleRef.current) {
          const last = getLatestDateInPast(lineData);
          if (last) {
            const lastX = x(new Date(last.x));
            const lastY = y2(last[yValueToUse]);
            pulsingCircleRef.current
              .attr("cx", lastX)
              .attr("cy", lastY)
              .attr("r", 3);
          }
        }
        // move the line
        if (currentPriceLine.current) {
          const last = lineData[lineData.length - 1];
          if (last) {
            const lastY = y2(last[yValueToUse]);
            currentPriceLine.current
              .attr("x1", 0)
              .attr("y1", lastY)
              .attr("x2", width)
              .attr("y2", lastY);
          }
        }

        updateBtcDot();
      });
  };

  const renderPlots = () => {
    const svg = mainGroup.current;

    const lineTooltipTable = d3.select("#line-tooltip");

    if (svg && plotData?.length) {
      const bisect = d3.bisector((d: Plot) => new Date(d.x)).left;
      // const [xAndYPotion] = d3.pointers(event, svg.node());
      // const direction =
      //   lineData[0]?.[yValueToUse] <
      //   lineData[lineData.length - 1]?.[yValueToUse]
      //     ? 1
      //     : -1;
      svg
        .selectAll("plot")
        .data(plotData)
        .enter()
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", (d) => {
          const xVal = x(new Date(d.x));
          const x0 = x.invert(xVal);
          const i = bisect(lineData, x0, 1);
          const d0 = lineData[i];
          const val = y2(d0[yValueToUse]);
          if (d.type === "VOUT") return val;
          return val + 3;
        })
        .attr("x2", width - margin.right)
        .attr("y2", (d) => {
          const xVal = x(new Date(d.x));
          const x0 = x.invert(xVal);
          const i = bisect(lineData, x0, 1);
          const d0 = lineData[i];
          const val = y2(d0[yValueToUse]);
          if (d.type === "VOUT") return val;
          return val + 3;
        })
        .attr("stroke", (d) => {
          const color = d.data.color;
          return color;
        })
        .attr("class", "plot")
        .attr("stroke-dasharray", (d) => {
          if (d.type === "VOUT") return "";
          return "3,3";
        })
        // @todo opacity should be determined by the size of the btc
        // however need a scale for that
        .attr("opacity", (d) => {
          if (d.data.visible) {
            const opacity = y3(d.value);
            return opacity;
          }
          return 0;
        })
        .attr("stroke-width", 0.5);

      svg
        .selectAll("circle")
        .data(plotData)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
          const val = x(new Date(d.x));
          return val;
        })
        .attr("cy", (d) => {
          const xVal = x(new Date(d.x));
          const x0 = x.invert(xVal);
          const i = bisect(lineData, x0, 1);
          const d0 = lineData[i];
          const val = y2(d0[yValueToUse]);
          return val;
        })
        .attr("r", (d) => {
          // const r = rScale(d.value);

          if (d.x === focusedPlotTs) {
            return 7;
          }
          return 3;
        })
        .attr("fill", (d) => {
          // const redOrGreen = direction > 0 ? jade.jade11 : ruby.ruby11;

          if (d === tooltipDatas[0]) {
            return grayRGB;
          }
          return d.data.color;
        })
        .attr("stroke", (d) => {
          if (d === tooltipDatas[0]) {
            return d.data.color;
          }
          return "none";
        })
        // .attr("stroke", "gray")
        .attr("class", "plot-marker")
        .attr("stroke-width", 0.5)
        .attr("opacity", (d) => {
          if (!dots) return 0;
          if (d.data.visible) return 1;
          return 0;
        })
        // .on("mouseover", function () {
        //   d3.select(this).transition().duration(200).attr("r", 7); // Increase the radius size on hover
        // })
        // .on("mouseout", function () {
        //   // const r = rScale(d.value);
        //   d3.select(this).transition().duration(200).attr("r", 3); // Increase the radius size on hover
        // })
        .on("click", (_, d) => {
          closePriceTooltip();
          setActivePlotTs(d.x);
          onSelectPlot(d, () => {
            setActivePlotTs(null);
            lineTooltipTable.style("display", "none");
          });

          // the tooltip resets to 0,0 so if you enabled it right away
          // it flickers from top left
          setTimeout(() => {
            // closeTooltip();
            lineTooltipTable.style("dispaly", "block");
          }, 20);
          // alert("clicked");
        });

      if (activePlotTs) {
        if (tooltipDatas.length) {
          const tooltipData = tooltipDatas[0];
          const xVal = x(new Date(tooltipData.x));
          const yVal = y2(tooltipData.node[yValueToUse]);

          // const padding = 5;

          // if the xVal is less than half the width of the graph
          // place the left style all the way on the right
          // otherwise place it on the left
          const tooltipWidth = Math.min(380, window.innerWidth * 0.9);
          const centeredXVal = xVal - tooltipWidth / 2;
          let left =
            centeredXVal + tooltipWidth > width
              ? width - tooltipWidth - margin.right
              : centeredXVal;

          if (left < 0 || breakpoint < 2) {
            left = width / 2 - tooltipWidth / 2;
          }

          const lineHeights = tooltipDatas.length * 18;

          const top = yVal + 15;

          lineTooltipTable.style("top", `${top}px`);
          lineTooltipTable.style("left", `${left}px`);
          lineTooltipTable.style("width", `${tooltipWidth}px`);
          lineTooltipTable.style("height", `${lineHeights + 75}px`);
          lineTooltipTable.style("display", "block");

          const close = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
          const leftIcon =
            '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>';
          const rightIcon =
            '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>';
          const lineItems = tooltipDatas
            .map((node) => {
              return `
                <td>
                  ${trim(node.data.walletName)}
                </td>
                <td class="line-tooltip__table-header-mono">
                <a class="line-tooltip__link" href="/#/${node.data.walletId}/${
                node.data.address
              }">${trimAddress(node.data.address)}</a>
                </td>
                <td class="line-tooltip__table-header-mono">${padBtcZeros(
                  node.data.vin / ONE_HUNDRED_MILLION
                )}</td>
                <td class="line-tooltip__table-header-mono">${padBtcZeros(
                  node.data.vout / ONE_HUNDRED_MILLION
                )}</td>
                <td class="line-tooltip__table-header-mono">$${d3.format(
                  ",.2f"
                )((node.data.value / ONE_HUNDRED_MILLION) * node.node.y2)}</td>
              </tr>`;
            })
            .join("\n");
          let indexVal = `${tooltipDatasIndex + 1}`;
          if (tooltipDatas.length > 1) {
            indexVal += `-${tooltipDatasIndex + tooltipDatas.length}`;
          }
          lineTooltipTable.html(
            `
            <div>
            <div class="linetooltip__header">
              <div class="linetooltip__header-close"><button>${close}</button></div>
              <div class="linetooltip__header-spacer"></div>
              <div class="linetooltip__navigation">
                 <button ${
                   tooltipDatasIndex === 0 ? 'disabled="disabled"' : ""
                 }" class="linetooltip_navigation-previous">${leftIcon}</button>
                <div class="linetooltip_navigation--small">${indexVal} of ${
              plotData.length
            }</div>
                <button
                ${
                  tooltipDatasIndex + tooltipDatas.length < plotData.length
                    ? ""
                    : 'disabled="disabled"'
                }
                class="linetooltip_navigation-next">${rightIcon}</button>
              </div>
            </div>
            <div class="linetooltip__table-wrapper">
              <table class="linetooltip__table">
                <thead>
                  <tr>
                    <th style="text-align:left;">Wallet</th>
                    <th class="line-tooltip__table-header-mono">Address</th>
                    <th class="line-tooltip__table-header-mono">VIN</th>
                    <th class="line-tooltip__table-header-mono">VOUT</th>
                    <th class="line-tooltip__table-header-mono">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItems}
                </tbody>
              </table>
            </div>
            </div>

              <div class="line-tooltip__subtext">${format(
                tooltipData.data.date,
                "MMM do y, p"
              )}</div>
              </div>
            `
          );

          lineTooltipTable
            .select(".linetooltip__header-close > button")
            .on("click", () => {
              setActivePlotTs(null);
              onClearSelection();
            });
          lineTooltipTable
            .select(".linetooltip_navigation-previous")
            .on("click", () => {
              // setActivePlotTs(null);
              const prevPlot = plotData[tooltipDatasIndex - 1];
              setActivePlotTs(prevPlot.x);
              onSelectPlot(prevPlot, () => {
                setActivePlotTs(null);
                lineTooltipTable.style("display", "none");
                lineTooltipTable.style("left", 0);
                lineTooltipTable.style("top", 0);
              });
            });

          lineTooltipTable
            .select(".linetooltip_navigation-next")
            .on("click", () => {
              onClearSelection();
              const nextPlot = plotData[tooltipDatasLastIndex + 1];
              setActivePlotTs(nextPlot.x);
              onSelectPlot(nextPlot, () => {
                setActivePlotTs(null);
                // lineTooltipTable.style("opacity", 0);
                lineTooltipTable.style("left", 0);
                lineTooltipTable.style("top", 0);
              });
            });
        }
      }
    }
  };

  const updateBtcDot = (cx?: number, cy?: number) => {
    if (showBtcAllocation && btcAllocationDotRef.current) {
      if (cx && cy) {
        btcAllocationDotRef.current.attr("cx", cx).attr("cy", cy);
      } else {
        const last = getLatestDateInPast(lineData);
        if (last) {
          const lastX = x(new Date(last.x));
          const lastY = y4(last.y1Sum * btcPrice!);
          btcAllocationDotRef.current.attr("cx", lastX).attr("cy", lastY);
        }
      }
    }
  };
  const renderBtcAllocation = () => {
    const svg = mainGroup.current;
    if (!svg) return null;

    if (ext3[1] === 0) return null;

    btcAllocationDotRef.current = svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 3)
      .attr("opacity", 0.5)
      .attr("fill", "orange");

    updateBtcDot();

    const btcLine = d3
      .line<Plot>()
      .x((d) => x(new Date(d.x)))
      .y((d) => {
        const val = y4(d.y1Sum * btcPrice);
        return val;
      });

    if (showBtcAllocation && btcPrice && lineData.length > 1) {
      const firstFutureIndex = lineData.findIndex(
        (d) => d.x > new Date().getTime()
      );
      let lastDate = new Date().getTime();
      if (firstFutureIndex > -1) {
        lastDate = lineData[firstFutureIndex].x;
      }

      const pastLineData = lineData.filter((d) => d.x <= lastDate);
      const futureLineData = lineData.filter((d) => d.x >= lastDate);
      svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-opacity", "0.8")
        .attr("stroke-width", 1)
        .attr("d", btcLine(pastLineData));

      svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-opacity", "0.8")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,4")
        .attr("d", btcLine(futureLineData));
    }
  };

  const getLatestDateInPast = (lineData: Plot[]) => {
    const len = lineData.length;
    const now = new Date().getTime();
    if (forecastModel) {
      for (let i = len - 1; i >= 0; i--) {
        const current = lineData[i];
        if (current.x <= now) {
          if (lineData[i + 1]) {
            return lineData[i + 1];
          }
          return current;
        }
      }
    }

    return lineData[len - 1];
  };

  const renderCurrentPrice = () => {
    const svg = mainGroup.current;
    if (!svg) return null;
    const direction =
      lineData[0]?.[yValueToUse] < lineData[lineData.length - 1]?.[yValueToUse]
        ? 1
        : -1;
    const last = getLatestDateInPast(lineData);

    if (!last) return;
    const lastX = x(new Date(last.x));
    const lastY = y2(last[yValueToUse]);

    pulsingCircleRef.current = svg
      .append("circle")
      .attr("cx", lastX)
      .attr("cy", lastY)
      .attr("r", 3)
      .attr("opacity", 0.5)
      .attr("class", "no-select")
      .attr("fill", direction > 0 ? jade.jade11 : ruby.ruby11);

    // function pulse() {
    //   if (pulsingCircleRef.current) {
    //     pulsingCircleRef.current
    //       .transition()
    //       .duration(1000) // Duration of one pulse
    //       .attr("r", 10) // Increase the radius
    //       .transition()
    //       .duration(1000) // Duration of one pulse
    //       .attr("r", 2) // Decrease the radius
    //       .on("end", pulse); // When the transition ends, start it again
    //   }
    // }
    // pulse();

    // create a dashed line at current price
    currentPriceLine.current = svg
      .append("line")
      .classed("current-price-line", true)
      .attr("x1", 0)
      .attr("y1", lastY)
      .attr("x2", lastX)
      .attr("y2", lastY)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.5);
  };

  const renderLoaderGraph = () => {
    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleLinear().domain([0, 49]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-15, 15]).range([height, 0]);

    interface Datum {
      x: number;
      y: number;
    }
    // Create line generator
    const line = d3
      .line<Datum>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Create area generator
    const area = d3
      .area<Datum>()
      .x((d) => xScale(d.x))
      .y0(300)
      .y1((d) => yScale(d.y));

    // Append the area

    svg
      .append("path")
      .datum(fakeDate)
      .attr("opacity", 0.3)
      .attr("fill", "url(#loader-gradient)")
      .attr("d", area);

    // Append the line
    svg
      .append("path")
      .datum(fakeDate)
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("opacity", 0.8)
      .attr("d", line);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const render = () => {
    const svg = d3.select(svgRef.current);

    mainGroup.current = svg.append("g");
    // mainGroup.current.attr("transform", "translate(0,0)");
    createGradients();
    if (ready) {
      renderLineArea();
      renderPlots();
      renderBtcAllocation();
      renderCurrentPrice();
    } else {
      renderLoaderGraph();
    }

    svg.append("g").call(y2Axis);
    if (showBtcAllocation && btcPrice && maxExt3 > 0) {
      svg.append("g").call(y4Axis);
    }
  };

  useEffect(() => {
    if (width > 0 && height > 0) {
      render();
    }
    const svg = d3.select(svgRef.current);
    return () => {
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
      svg.selectAll("path").remove();
      svg.selectAll("defs").remove();
      svg.selectAll(".plot").remove();
      svg.selectAll("circle").remove();
      svg.selectAll("line").remove();
      svg.selectAll(".line-tooltip").remove();
      // zoom.on("zoom", null);
      if (pulsingCircleRef.current) {
        pulsingCircleRef.current.remove();
      }
      if (currentPriceLine.current) {
        currentPriceLine.current.remove();
      }

      if (currentVerticalPriceLine.current) {
        currentVerticalPriceLine.current.remove();
        currentVerticalPriceLine.current = null;
      }
    };
  }, [
    height,
    width,
    lineData,
    breakpoint,
    activePlotTs,
    btcPrice,
    maxExt3,
    forecastModel,
    focusedPlotTs,
    lineData.length,
    render,
  ]);

  function closePriceTooltip() {
    const tooltip = d3.select("#price-tooltip");
    tooltip.style("opacity", 0);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        const tooltip = d3.select("#price-tooltip");
        tooltip.style("opacity", 0);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onMouseLeave = () => {
    closePriceTooltip();
    setActivePlotTs(null);
  };

  return (
    <div className="relative" onMouseLeave={onMouseLeave}>
      <div
        id="price-tooltip"
        className={`absolute top-0 bg-gray-900 rounded text-xs text-white px-2 py-1 w-[240px] opacity-0 overflow-hidden z-40`}
      ></div>
      <div
        id="line-tooltip"
        className="absolute top-0 right-0 bg-gray-200 rounded text-xs text-gray w-[150px] h-[40px] hidden overflow-hidden border-gray-300 border z-40"
      ></div>
      <svg
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          maxWidth: "calc(100% - 40px)",
          height: "auto",
          fontSize: 10,
          marginLeft: "20px",
          marginRight: "20px",
        }}
        width={width}
        ref={svgRef}
      />
    </div>
  );
};
