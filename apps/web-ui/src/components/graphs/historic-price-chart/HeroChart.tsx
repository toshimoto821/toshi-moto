import { useRef, useEffect } from "react";
import {
  select,
  max,
  min,
  scaleLinear,
  scaleBand,
  line,
  area,
  pointers,
  axisLeft,
  axisRight,
  format,
  extent,
  // curveBasis,
  curveBumpX,
} from "d3";
import { jade, ruby } from "@radix-ui/colors";
import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import { useNumberObfuscation } from "@lib/hooks/useNumberObfuscation";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { useChartData } from "@lib/hooks/useChartData";
import { useWallets } from "@lib/hooks/useWallets";
import { IRawNode } from "@root/types";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setUI } from "@root/lib/slices/ui.slice";
import { addBufferItems, getNumBuffer } from "./hero-chart.utils";
import { useBreakpoints } from "@root/lib/hooks/useBreakpoints";

import {
  COLOR_NEGATIVE_CHANGE,
  COLOR_POSITIVE_CHANGE,
  COLOR_SELECTED,
} from "./VolumeChart";

interface IHeroChart {
  height: number;
  width: number;
  suppressLegengs?: boolean;
  suppressEvents?: boolean;
  bgColor?: string;
  id?: string;
  onMouseOver?: ({
    datum,
    index,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => void;
}

const grayRGB = "rgb(243 244 246)";
export const SELECTED_OPACITIY = 0.18;

export const HeroChart = (props: IHeroChart) => {
  const {
    height,
    width,
    suppressEvents,
    suppressLegengs,
    onMouseOver,
    bgColor = grayRGB,
    id = "hero-chart",
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const dispatch = useAppDispatch();
  const { btcPrice } = useBtcPrice();
  const { wallets } = useWallets();
  const privateNumber = useNumberObfuscation();
  const breakpoint = useBreakpoints();
  const { prices, loading, range, group } = useBtcHistoricPrices();
  const isLocked = useAppSelector((state) => state.ui.graphIsLocked);
  const selectedIndex = useAppSelector((state) => state.ui.graphSelectedIndex);

  const isMouseInteracting = useRef(false);

  const graphBtcAllocation = useAppSelector(
    (state) => state.ui.graphBtcAllocation
  );

  const netAssetValue = useAppSelector((state) => state.ui.netAssetValue);

  const { lineData } = useChartData({ btcPrice, wallets });

  const margin = { top: 10, right: 0, bottom: 10, left: 0 };

  const data = [...(prices || [])];
  const numBuffer = getNumBuffer(data.length, breakpoint);
  if (data.length) {
    // const len = data.length / 10;
    addBufferItems(lineData, numBuffer);

    addBufferItems(data, numBuffer);
  }

  const lastPrice = data[data.length - 1] || {};

  const lastRawNode = lineData[lineData.length - 1] || {};

  const range1 = [margin.left, width - margin.right];
  const domain1 = data.map((_, i) => i.toString());
  // console.log(range1, domain1);

  const xScale = scaleBand()
    // prices = [date, price, volume]
    .domain(domain1)
    .range(range1)
    .padding(0.1);

  let yExtent;

  if (netAssetValue) {
    yExtent = [
      min(
        lineData.map((d) => {
          return d.y1SumInDollars;
        })
      ),
      max(
        lineData.map((d) => {
          return d.y1SumInDollars;
        })
      ),
    ];
  } else {
    yExtent = [
      min(
        data.map((d) => {
          const volume = Math.min(
            parseFloat(d.closePrice),
            parseFloat(d.openPrice)
          );
          return volume;
        })
      ),
      max(
        data.map((d) => {
          return Math.max(parseFloat(d.closePrice), parseFloat(d.openPrice));
        })
      ),
    ];
  }

  const yScale = scaleLinear()
    .domain([yExtent[0]!, yExtent[1]!])
    .range([height - margin.top, margin.top]);

  const formatDefault = format("~s");
  const formatBtc = format(".4f");

  const yValueToUse = netAssetValue ? "y1SumInDollars" : "y2";

  const btcExt = extent(lineData, (d) => d.y1Sum) as [number, number];

  const diff = Math.abs(btcExt[0] - btcExt[1]);
  const d1 = diff === 0 ? 0 : btcExt[0];
  const d2 = btcExt[1];

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const top = yScale(lineData[lineData.length - 1]?.[yValueToUse]!);

  const btcScale = scaleLinear()
    .domain([d1, d2])
    .range([height - margin.bottom, top]);

  // this messes up the scale
  // was intending to use this to show the full scale
  // but it misalinged the btc line
  // key is to have the top of the btc line match the current price
  // const btcScaleFull = scaleLinear()
  //   .domain([d1, d2])
  //   .range([height - margin.bottom, margin.top]);

  const btcLine = line<IRawNode>()
    .x((_, i) => xScale(i.toString())!)
    .y((d) => {
      const t = d.y1Sum;
      const val = btcScale(t);
      return val;
    });

  const isPositiveChange = (i: number) => {
    let index = i;
    if (!data[i]) {
      index = data.length - numBuffer - 1;
    }

    const previousIndex = index - 1;
    const d = data[index];

    const price1 = parseFloat(d.closePrice);
    const previous = data[previousIndex];
    const price2 = previous ? parseFloat(previous.closePrice) : 0;
    const priceChange = i === 0 ? 0 : price1 > price2;

    return priceChange;
  };

  useEffect(() => {
    const render = () => {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      if (data.length === 0) {
        // @tood loading
        return;
      }

      // ---------------------------------------------------------------------//
      // Vars:
      const firstMetric = data[0];
      const lastMetric = data[data.length - 1];
      const direction =
        parseFloat(lastMetric.closePrice) > parseFloat(firstMetric.openPrice)
          ? 1
          : -1;

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Defs: Gradients
      const defs = svg.append("defs");
      const gradientGreen = defs
        .append("linearGradient")
        .attr("id", "gradient-green")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradientGreen
        .append("stop")
        .attr("id", "jade-stop")
        .attr("offset", "0%")
        .attr("stop-color", jade.jade11)
        .attr("stop-opacity", 1);

      gradientGreen
        .append("stop")
        .attr("id", "gray-stop-2")
        .attr("offset", "100%")
        .attr("stop-color", grayRGB)
        .attr("stop-opacity", 1);

      const gradientRed = defs
        .append("linearGradient")
        .attr("id", `gradient-red__${id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradientRed
        .append("stop")
        .attr("id", "ruby-stop")
        .attr("offset", "0%")
        .attr("stop-color", ruby.ruby11)
        .attr("stop-opacity", 1);

      gradientRed
        .append("stop")
        .attr("id", "gray-stop-2")
        .attr("offset", "100%")
        .attr("stop-color", grayRGB)
        .attr("stop-opacity", 1);

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Area chart
      // Adjust x-coordinates for line and area charts
      const adjustedX = (i: number) => xScale(i.toString())!;

      const areaGenerator = area<BinanceKlineMetric | IRawNode>()
        .x((_, i) => adjustedX(i))
        .y0(height)
        .y1((d, i) => {
          if (netAssetValue) {
            // cast d as IRawNode
            return yScale((d as IRawNode)[yValueToUse]);
          }

          if (i > data.length - numBuffer - 1) {
            return yScale(parseFloat((d as BinanceKlineMetric).closePrice));
          }
          return yScale(parseFloat((d as BinanceKlineMetric).openPrice));
        })
        .curve(curveBumpX);

      svg
        .append("path")
        .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
        .datum(netAssetValue ? lineData : data)
        .attr("class", "area")
        .attr("opacity", 0.2)
        .attr("d", areaGenerator)
        .attr(
          "fill",
          direction > 0 ? "url(#gradient-green)" : `url(#gradient-red__${id})`
        );

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//

      // Bar Chart
      svg
        .append("g")
        .attr("class", "bar-group")
        .selectAll(".bar")
        .data<BinanceKlineMetric | IRawNode>(netAssetValue ? lineData : data)
        .enter()

        .append("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => {
          const x = xScale(i.toString())! + xScale.bandwidth() / 2;

          return x;
        })
        .attr("y", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          // return priceChange >= 0 ? yScale(d[2]) : yScale(0);

          if (netAssetValue) {
            return yScale((d as IRawNode)[yValueToUse]);
          }

          const price = Math.max(
            parseFloat((d as BinanceKlineMetric).openPrice),
            parseFloat((d as BinanceKlineMetric).closePrice)
          );
          const y = yScale(price);
          return y;
        })
        .attr("width", xScale.bandwidth())

        .attr(
          "fill",
          direction > 0 ? "url(#gradient-green)" : `url(#gradient-red__${id})`
        )
        .attr("height", (d) => {
          if (netAssetValue) {
            return (
              height - margin.bottom - yScale((d as IRawNode)[yValueToUse])
            );
          }

          const price = parseFloat((d as BinanceKlineMetric).closePrice);
          return height - margin.bottom - yScale(price) + 50;
        })
        .attr("opacity", (_, i) => {
          if (selectedIndex === null) {
            if (i === data.length - numBuffer - 1) {
              return SELECTED_OPACITIY;
            }
            return 0;
          }
          return selectedIndex === i ? SELECTED_OPACITIY : 0;
        })
        .on("click", (_, kline) => {
          isMouseInteracting.current = false;
          if (suppressEvents) return;

          let index: number;
          if (netAssetValue) {
            index = lineData.findIndex((d) => d.x === (kline as IRawNode).x);
          } else {
            index = data.findIndex(
              (d) => d.openTime === (kline as BinanceKlineMetric).openTime
            );
          }
          if (index < 5) {
            index = 5;
          }

          const datum = data[index];
          if (isLocked) {
            dispatch(setUI({ graphIsLocked: false, graphSelectedIndex: null }));
          } else {
            dispatch(setUI({ graphIsLocked: true, graphSelectedIndex: index }));

            svg
              .selectAll(".bar")
              .attr("opacity", 0)
              .filter((_, i) => i === index)
              .attr("opacity", SELECTED_OPACITIY);
            if (onMouseOver) {
              onMouseOver({ datum, index });
            }
          }
        });

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Line chart
      const lineGenerator = line<BinanceKlineMetric | IRawNode>()
        .x((_, i) => xScale(i.toString())!)
        .y((d, i) => {
          if (netAssetValue) {
            return yScale((d as IRawNode)[yValueToUse]);
          } else {
            if (i > data.length - numBuffer - 1) {
              return yScale(parseFloat((d as BinanceKlineMetric).closePrice));
            }
            return yScale(parseFloat((d as BinanceKlineMetric).openPrice));
          }
        })
        .curve(curveBumpX);

      svg
        .append("path")
        .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
        .datum(netAssetValue ? lineData : data)
        .attr("class", "line")
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
        .attr("stroke-opacity", "0.5")
        .attr("stroke-width", 2);
      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Inverse Area chart
      const inverseAreaGenerator = area<BinanceKlineMetric | IRawNode>()
        .x((_, i) => {
          return adjustedX(i);
        })
        .y0(0)
        .y1((d, i) => {
          if (netAssetValue) {
            return yScale((d as IRawNode)[yValueToUse]);
          } else {
            if (i > data.length - numBuffer - 1) {
              return yScale(parseFloat((d as BinanceKlineMetric).closePrice));
            }
            return yScale(parseFloat((d as BinanceKlineMetric).openPrice));
          }
        })
        .curve(curveBumpX);

      svg
        .append("path")
        .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
        .datum(netAssetValue ? lineData : data)
        .attr("class", "inverse-area")
        .attr("d", inverseAreaGenerator)
        .attr("fill", bgColor); // Apply a semi-transparent white fill

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // cross hair lines
      const len = data.length ? data.length - numBuffer : 0;
      const x = xScale(len.toString())! + xScale.bandwidth() / 2;

      svg
        .append("line")
        .attr("id", "vertical-tooltip-line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.5)
        .attr("stroke-width", 0.5)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", x)
        .attr("x2", x);

      let y1: number;
      if (netAssetValue) {
        y1 = yScale(lastRawNode.y1SumInDollars || 0);
      } else {
        y1 = yScale(parseFloat(lastPrice.closePrice || "0"));
      }

      svg
        .append("line")
        .attr("id", "current-price-line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.5)
        .attr("stroke-width", 0.5)
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y1)
        .attr("y2", y1);

      const cx = x;
      const cy = btcScale(lastRawNode.y1Sum * btcPrice);
      if (graphBtcAllocation) {
        svg
          .append("circle")
          .attr("id", "orange-dot")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 3)
          .attr("opacity", 0.5)
          .attr("fill", "orange");
      }

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Binding movement

      svg
        .on("mouseenter touchstart", function () {
          isMouseInteracting.current = true;
        })
        .on("mousemove touchmove", function (event) {
          if (suppressEvents) return;

          const svg = select(svgRef.current);

          const [xy] = pointers(event);
          const [x] = xy;

          let index = Math.floor((x - margin.left) / xScale.step());
          if (index < 5 || index > data.length - numBuffer - 1) {
            index = data.length - numBuffer - 1;
          }
          if (!lineData[index]) {
            index = data.length - numBuffer - 1;
          }

          const veritcalLine = svg.select("#vertical-tooltip-line");

          const mid = xScale.bandwidth() / 2;
          veritcalLine
            .attr("opacity", 0.5)
            .attr("x1", x + mid)
            .attr("x2", x + mid);

          const currentPriceLine = svg.select("#current-price-line");
          let y1: number;

          if (netAssetValue) {
            y1 = yScale(lineData[index].y1SumInDollars);
          } else {
            y1 = yScale(parseFloat(data[index].closePrice));
          }
          currentPriceLine.attr("opacity", 0.5).attr("y1", y1).attr("y2", y1);

          const orangeDot = select("#orange-dot");
          const cy = btcScale(lineData[index].y1Sum * btcPrice);
          orangeDot.attr("cx", x + mid).attr("cy", cy);

          if (isLocked) return;

          let datum = data[index];
          if (!datum) {
            index = data.length - numBuffer - 1;
            datum = data[index];
          }

          svg
            .selectAll(".bar")
            .attr("opacity", 0)
            .filter((_, i) => i === index)
            .attr("opacity", SELECTED_OPACITIY);

          const volChart = select("#volume-chart");
          volChart
            .selectAll(".bar")
            // .attr("opacity", 0)
            .attr("fill", (_, i) =>
              isPositiveChange(i)
                ? COLOR_POSITIVE_CHANGE
                : COLOR_NEGATIVE_CHANGE
            )
            .filter((_, i) => i === index)
            // .attr("opacity", 0.18) // Reset all bars to original color
            .attr("fill", COLOR_SELECTED);

          if (onMouseOver) {
            onMouseOver({ datum, index: index - numBuffer });
          }
        })
        .on("mouseleave touchend", function () {
          isMouseInteracting.current = false;
          if (suppressEvents) return;
          const svg = select(svgRef.current);
          const index = data.length - numBuffer - 1;

          const veritcalLine = svg.select("#vertical-tooltip-line");
          const x = xScale(index.toString())! + xScale.bandwidth() * 1.5;
          veritcalLine.attr("opacity", 0.5).attr("x1", x).attr("x2", x);

          const currentPriceLine = svg.select("#current-price-line");
          let y1: number;
          if (netAssetValue) {
            y1 = yScale(lineData[index].y1SumInDollars);
          } else {
            y1 = yScale(parseFloat(data[index].closePrice));
          }
          currentPriceLine.attr("opacity", 0.5).attr("y1", y1).attr("y2", y1);

          const orangeDot = svg.select("#orange-dot");
          const cy = btcScale(lineData[index].y1Sum * btcPrice);
          orangeDot.attr("cx", x).attr("cy", cy);

          if (isLocked) return;
          // select(this).attr("fill", "transparent"); // Revert to original color

          svg
            .selectAll(".bar")
            .attr("opacity", 0)
            .filter((_, ind) => {
              if (ind < numBuffer || ind > data.length - numBuffer - 1) {
                return false;
              }
              return ind === index;
            })
            .attr("opacity", SELECTED_OPACITIY);

          const volChart = select("#volume-chart");
          volChart
            .selectAll(".bar")
            .attr("fill", (_, i) =>
              isPositiveChange(i)
                ? COLOR_POSITIVE_CHANGE
                : COLOR_NEGATIVE_CHANGE
            )
            .filter((_, i) => i === index)
            // .attr("opacity", 0.18) // Reset all bars to original color
            .attr("fill", COLOR_SELECTED);

          if (onMouseOver) {
            onMouseOver({ datum: data[index], index });
          }
        });
      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Current Price (bar - right)
      if (prices?.length) {
        const kline = prices[prices.length - 1];
        const h = yScale(parseFloat(kline.closePrice));

        // orange line
        svg
          .append("line")
          .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
          .attr("x1", width - margin.right)
          .attr("y1", h)
          .attr("x2", width)
          .attr("y2", h)
          // .attr("transform", `translate(${xScale.bandwidth() / -2}, 0)`)
          .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 4")
          .attr("stroke-opacity", 0.8)
          .attr("opacity", 0.8);
      }
      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Y2 Axis (right)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y2Axis = (g: any) => {
        const padding = { top: 1, right: 5, bottom: 1, left: 5 }; // Adjust as needed
        const textMargin = { top: 0, right: 5, bottom: 0, left: 0 };
        g.attr("transform", `translate(${width - 60},0)`)
          .call(
            axisRight(yScale)
              .tickFormat((d) => {
                return `$${
                  yValueToUse === "y1SumInDollars"
                    ? privateNumber(formatDefault(d))
                    : formatDefault(d)
                }`;
              })
              .ticks(5)
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call((g: any) => g.select(".domain").remove())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call((g: any) =>
            g
              .selectAll(".tick line")
              .attr("stroke", "gray")
              .attr("opacity", 0.6)
          )
          .selectAll("text")
          .attr(
            "transform",
            `translate(${textMargin.right}, ${textMargin.top})`
          )
          .attr("fill", "gray")
          .attr("font-size", "12px");

        g.selectAll(".tick").each(function (this: SVGTextElement) {
          const tick = select(this);
          if (!tick) return;
          const text = tick.select("text");
          if (!text) return;
          const bbox = (text.node() as SVGTextElement).getBBox();

          // Select existing rect elements or create new ones if they don't exist
          const rect = tick.selectAll("rect").data([bbox]);

          // Update existing rect elements
          // rect
          //   .attr("x", (d) => d.x - padding.left)
          //   .attr("y", (d) => d.y - padding.top)
          //   .attr("width", (d) => d.width + padding.left + padding.right)
          //   .attr("height", (d) => d.height + padding.top + padding.bottom)
          //   .attr("rx", 2) // radius of the corners in the x direction
          //   .attr("ry", 2) // radius of the corners in the y direction
          //   .attr("opacity", 0.7)
          //   .style("fill", "white");

          // Enter new rect elements if needed
          rect
            .enter()
            .insert("rect", "text")
            .attr("x", (d) => d.x - padding.left)
            .attr("y", (d) => d.y - padding.top)
            .attr("width", (d) => d.width + padding.left + padding.right)
            .attr("height", (d) => d.height + padding.top + padding.bottom)
            .attr("rx", 2) // radius of the corners in the x direction
            .attr("ry", 2) // radius of the corners in the y direction
            .attr("opacity", 0.6)
            .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
            .attr("stroke-opacity", 0.2)
            .attr(
              "transform",
              `translate(${textMargin.right}, ${textMargin.top})`
            )
            .style("fill", "white");

          // Remove any exiting rect elements
          rect.exit().remove();

          // text.attr("fill", "orange").attr("opacity", 1);
        });
      };
      if (!suppressLegengs) {
        svg.append("g").attr("id", "y2").call(y2Axis);
      }

      // ---------------------------------------------------------------------//
      if (graphBtcAllocation) {
        // BTC Allocation (line)
        svg
          .append("path")
          .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
          .attr("id", "btc-past-line")
          .attr("fill", "none")
          .attr("stroke", "orange")
          .attr("stroke-miterlimit", 1)
          .attr("stroke-opacity", "0.8")
          .attr("stroke-width", 1)
          .attr("d", btcLine(lineData));
      }

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // y1 (btc) axis (left)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y1Axis = (g: any) => {
        // const padding = { top: 1, right: 3, bottom: 1, left: 3 }; // Adjust as needed
        const textMargin = { top: 0, right: 0, bottom: 0, left: 5 };
        g.attr("transform", `translate(80,0)`)
          .call(
            axisLeft(btcScale)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .tickFormat((d: any) => {
                return `₿${privateNumber(formatBtc(d))}`;
              })
              .ticks(5)
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call((g: any) => g.select(".domain").remove())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .call((g: any) =>
            g
              .selectAll(".tick line")
              .attr("stroke", "orange")
              .attr("opacity", 1)
          )
          .selectAll("text")
          .attr("fill", "orange")
          .attr("opacity", 1)
          .attr(
            "transform",
            `translate(${textMargin.left * -1}, ${textMargin.top})`
          )
          .attr("font-size", "12px");

        const padding = { top: 1, right: 5, bottom: 1, left: 5 }; // Adjust as needed

        g.selectAll(".tick").each(function (this: SVGTextElement) {
          const tick = select(this);
          if (!tick) return;
          const text = tick.select("text");
          if (!text) return;
          const bbox = (text.node() as SVGTextElement).getBBox();
          const rect = tick.selectAll("rect").data([bbox]);
          // Update existing rect elements
          // rect
          //   .attr("x", (d) => d.x - padding.left)
          //   .attr("y", (d) => d.y - padding.top)
          //   .attr("width", (d) => d.width + padding.left + padding.right)
          //   .attr("height", (d) => d.height + padding.top + padding.bottom)
          //   .attr("rx", 2) // radius of the corners in the x direction
          //   .attr("ry", 2) // radius of the corners in the y direction
          //   .attr("opacity", 0.7)
          //   .style("fill", "white");

          // Enter new rect elements if needed
          rect
            .enter()
            .insert("rect", "text")
            .attr("x", (d) => d.x - padding.left)
            .attr("y", (d) => d.y - padding.top)
            .attr("width", (d) => d.width + padding.left + padding.right)
            .attr("height", (d) => d.height + padding.top + padding.bottom)
            .attr("rx", 2) // radius of the corners in the x direction
            .attr("ry", 2) // radius of the corners in the y direction
            .attr("opacity", 0.6)
            .attr("stroke", "orange")
            .attr("stroke-opacity", 1)
            .style("fill", "white")
            .attr(
              "transform",
              `translate(${textMargin.left * -1}, ${textMargin.top})`
            );

          // Remove any exiting rect elements
          rect.exit().remove();

          // Update text attributes
          text.attr("fill", "orange").attr("opacity", 1);
        });
      };
      if (graphBtcAllocation && !suppressLegengs) {
        svg.append("g").attr("id", "y1").call(y1Axis);
      }

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Current Price (bar - right)
      // if (prices?.length) {
      //   const t = yScale(yExtent[1]!);

      //   svg
      //     .append("rect")
      //     .attr("id", "live-price")
      //     .attr("x", width - 10)
      //     .attr("y", t)
      //     .attr("width", 10)
      //     .attr("height", height)
      //     .attr("opacity", 0.28)
      //     .attr("transform", `translate(0, 0)`)
      //     .attr(
      //       "fill",
      //       direction > 0 ? "url(#gradient-green)" : "url(#gradient-red)"
      //     )
      //     .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11);
      // }
    };

    if (!isMouseInteracting.current) {
      render();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loading,
    range,
    group,
    height,
    width,
    lastPrice.closeTime,
    selectedIndex,
    lastPrice.closePrice,
    yValueToUse,
    graphBtcAllocation,
  ]);

  return (
    <div>
      <svg
        id={id}
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          height: "auto",
          fontSize: 10,
        }}
        width={width}
        className=""
        ref={svgRef}
      />
    </div>
  );
};
