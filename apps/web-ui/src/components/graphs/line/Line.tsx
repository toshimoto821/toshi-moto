import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { jade, ruby } from "@radix-ui/colors";
import { useBreakpoints } from "@lib/hooks/useBreakpoints";
import { IPlotData } from "@root/machines/walletListUIMachine";
import "./tooltip.css";
import { ONE_HUNDRED_MILLION, padBtcZeros, trimAddress } from "@root/lib/utils";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";
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
    dots,
    btcPrice,
    showBtcAllocation,
    // onScroll,
  } = props;

  const [activePlotTs, setActivePlotTs] = useState<number | null>(null);
  const privateNumber = useNumberObfuscation();

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

  let yValueToUse: "y1SumInDollars" | "y2" = graphAssetValue
    ? "y1SumInDollars"
    : "y2";

  const breakpoint = useBreakpoints();

  const grayRGB = "rgb(243 244 246)";

  const svgRef = useRef<SVGSVGElement>(null);
  const margin = {
    top: 70,
    right: 20,
    bottom: 10,
    left: 20,
  };

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
  const rScale = d3.scaleLinear().domain(plotExt).range([2, 3]);

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

  // @ts-ignore
  const xAxis = (g: any) => {
    const allTicks = x.ticks(3);

    g.attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)

          .tickValues(allTicks)
          // @ts-ignore
          .tickFormat(d3.timeFormat("%Y-%m-%d")) // Format the tick labels as needed
          .tickSizeOuter(0)
      )
      .call((g: any) => g.select(".domain").remove());
  };

  const formatK = d3.format("~s");
  const formatDefault = d3.format("~s");
  const formatBtc = d3.format(".4f");

  const y4Axis = (g: any) => {
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
          .tickFormat((d: any) => `₿${privateNumber(formatBtc(d / btcPrice))}`)
          .tickValues(tickValues)
      )
      .call((g: any) => g.select(".domain").remove())
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
      .call((g: any) => g.select(".domain").remove())
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
    svg
      .append("path")
      .datum(lineData)
      .attr("opacity", 0.2)
      .attr(
        "fill",
        `url(#${direction > 0 ? "gradient-green" : "gradient-red"})`
      )
      .attr("d", area);

    // Add the line
    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
      .attr("stroke-miterlimit", 1)
      .attr("stroke-opacity", "0.5")
      .attr("stroke-width", 1.5)
      .attr("d", line(lineData));

    // create tooltip on hover and mousemove (for mobile) to show the price/value

    const tooltip = d3.select("#price-tooltip");
    const lineTooltipTable = d3.select("#line-tooltip");
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

        if (xVal < 20) return;
        if (xVal > width - 20) return;

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
          if (matched.x !== activePlotTs) {
            setActivePlotTs(matched.x);
            onSelectPlot(matched, () => {
              setActivePlotTs(null);
              lineTooltipTable.style("opacity", 0);
              lineTooltipTable.style("left", 0);
              lineTooltipTable.style("top", 0);
            });
          }

          lineTooltipTable.style("opacity", 0.7);
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

        const top = 144;

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

        if (showBtcAllocation && btcAllocationDotRef.current) {
          btcAllocationDotRef.current
            .attr("cx", xVal)
            .attr("cy", y4(d.y1Sum * btcPrice!));
        }

        if (currentPriceLine.current) {
          currentPriceLine.current
            .attr("x1", 0)
            .attr("y1", y2(d[yValueToUse]))
            .attr("x2", width)
            .attr("y2", y2(d[yValueToUse]));
        }
      })
      .on("mouseout touchend", () => {
        tooltip.style("opacity", 0);
        // toolTipLine.style("opacity", 0);
        if (currentVerticalPriceLine.current) {
          currentVerticalPriceLine.current.style("opacity", 0);
        }
        // reset the current price to the last
        if (pulsingCircleRef.current) {
          const last = lineData[lineData.length - 1];
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

        if (showBtcAllocation && btcAllocationDotRef.current) {
          const last = lineData[lineData.length - 1];
          if (last) {
            const lastX = x(new Date(last.x));
            const lastY = y4(last.y1Sum * btcPrice!);
            btcAllocationDotRef.current.attr("cx", lastX).attr("cy", lastY);
          }
        }
      });
  };

  const renderPlots = () => {
    const svg = mainGroup.current;

    const lineTooltipTable = d3.select("#line-tooltip");
    const tooltipDatas = plotData.filter((plot) => plot.x === activePlotTs);
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
          // const xVal = x(new Date(d.x));
          // const x0 = x.invert(xVal);
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
          const r = rScale(d.value);
          return r;
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
        });

      if (activePlotTs) {
        if (tooltipDatas.length) {
          const tooltipData = tooltipDatas[0];
          const xVal = x(new Date(tooltipData.x));
          const yVal = y2(tooltipData.node[yValueToUse]);

          const padding = 5;

          // if the xVal is less than half the width of the graph
          // place the left style all the way on the right
          // otherwise place it on the left
          const tooltipWidth = Math.min(380, window.innerWidth * 0.9);
          const centeredXVal = xVal - tooltipWidth / 2;
          let left =
            centeredXVal + tooltipWidth > width
              ? width - tooltipWidth
              : centeredXVal;

          if (left < 0) {
            left = 0;
          }
          const lineHeights = tooltipDatas.length * 18;
          const offset = padding + lineHeights + 65;
          let top = yVal - offset;
          if (top < 100) {
            top = yVal + 15;
          }
          lineTooltipTable.style("top", `${top}px`);
          lineTooltipTable.style("left", `${left}px`);
          lineTooltipTable.style("width", `${tooltipWidth}px`);
          lineTooltipTable.style("height", `${lineHeights + 55}px`);
          lineTooltipTable.style("opacity", 0.7);

          const lineItems = tooltipDatas
            .map((node) => {
              return `
                <td>
                  ${node.data.walletName}
                </td>
                <td class="line-tooltip__header-mono">
                <a href="/#/${node.data.walletId}/${
                node.data.address
              }">${trimAddress(node.data.address)}</a>
                </td>
                <td class="line-tooltip__header-mono">${padBtcZeros(
                  node.data.vin / ONE_HUNDRED_MILLION
                )}</td>
                <td class="line-tooltip__header-mono">${padBtcZeros(
                  node.data.vout / ONE_HUNDRED_MILLION
                )}</td>
                <td class="line-tooltip__header-mono">$${d3.format(",.2f")(
                  (node.data.value / ONE_HUNDRED_MILLION) * node.node.y2
                )}</td>
              </tr>`;
            })
            .join("\n");
          lineTooltipTable.html(
            `
            <div>
            <table class="linetooltip__table">
              <thead>
                <tr>
                  <th style="text-align:left;">Wallet</th>
                  <th class="line-tooltip__header-mono">Address</th>
                  <th class="line-tooltip__header-mono">VIN</th>
                  <th class="line-tooltip__header-mono">VOUT</th>
                  <th class="line-tooltip__header-mono">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems}
              </tbody>
            </table>
            </div>

              <div class="line-tooltip__subtext">${format(
                tooltipData.data.date,
                "MMM do y, p"
              )}</div>
              </div>
            `
          );
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

    const btcLine = d3
      .line<Plot>()
      .x((d) => x(new Date(d.x)))
      .y((d) => {
        const val = y4(d.y1Sum * btcPrice);
        return val;
      });

    if (showBtcAllocation && btcPrice && lineData.length > 1) {
      svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-opacity", "0.8")
        .attr("stroke-width", 1)
        .attr("d", btcLine(lineData));
    }
  };

  const renderCurrentPrice = () => {
    const svg = mainGroup.current;
    if (!svg) return null;
    const direction =
      lineData[0]?.[yValueToUse] < lineData[lineData.length - 1]?.[yValueToUse]
        ? 1
        : -1;
    const last = lineData[lineData.length - 1];

    if (!last) return;
    const lastX = x(new Date(last.x));
    const lastY = y2(last[yValueToUse]);

    pulsingCircleRef.current = svg
      .append("circle")
      .attr("cx", lastX)
      .attr("cy", lastY)
      .attr("r", 3)
      .attr("opacity", 0.5)
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
    // use
    // if (svg && !zoomSet.current) {
    //   svg.call(zoom as any);
    //   zoomSet.current = true;
    // }

    // svg.call(d3.zoom().on("zoom", zoomed));

    svg.append("g").call(y2Axis);
    if (showBtcAllocation && btcPrice && ext3[1] > 0) {
      svg.append("g").call(y4Axis);
    }
  };

  useEffect(() => {
    if (width > 0 && height > 0) {
      render();
    }

    return () => {
      const svg = d3.select(svgRef.current);
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
  }, [height, width, lineData, breakpoint, activePlotTs, btcPrice, ext3[1]]);

  const onMouseLeave = () => {
    // const lineTooltipTable = d3.select("#line-tooltip");
    // lineTooltipTable
    //   .style("opacity", 0)
    //   .style("top", "0px")
    //   .style("left", "0px")
    //   .style("height", "0px");
    // setActivePlotTs(null);
  };
  return (
    <div className="relative" onMouseLeave={onMouseLeave}>
      <div
        id="price-tooltip"
        className={`absolute top-0 bg-gray-900 rounded text-xs text-white px-2 py-1 w-[240px] opacity-0 overflow-hidden z-40`}
      ></div>
      <div
        id="line-tooltip"
        className="absolute pt-2 top-0 right-0 bg-gray-900 rounded text-xs text-white px-2 py-1 w-[150px] h-[40px] opacity-0 overflow-hidden border-white border-2 z-40"
      ></div>
      <svg
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          maxWidth: "100%",
          height: "auto",
          fontSize: 10,
        }}
        width={width}
        ref={svgRef}
      />
    </div>
  );
};
