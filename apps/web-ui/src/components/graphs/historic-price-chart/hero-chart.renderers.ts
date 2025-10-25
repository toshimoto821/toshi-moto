import { jade, ruby } from "@radix-ui/colors";
import {
  area,
  line,
  curveBumpX,
  axisLeft,
  axisRight,
  format,
  select,
  type Selection,
} from "d3";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import type { IRawNode, IPlotData } from "@root/types";
import type { ChartMargin } from "./hero-chart.types";
import { SELECTED_OPACITY, AXIS_CONFIG } from "./hero-chart.constants";
import { calculateOptimalTicks } from "./hero-chart.scales";

type SVGSelection = Selection<SVGSVGElement | null, unknown, null, undefined>;

/**
 * Renders the BTC allocation area chart (orange area behind the main chart)
 */
export const renderBtcArea = (
  svg: SVGSelection,
  lineData: IRawNode[],
  xScale: d3.ScaleBand<string>,
  btcScale: d3.ScaleLinear<number, number>,
  height: number,
  id: string
) => {
  const btcAreaGenerator = area<IRawNode>()
    .x((_, i) => (xScale(i.toString()) ?? 0) + xScale.bandwidth() / 2)
    .y0(height)
    .y1((d) => btcScale(d.y1Sum))
    .curve(curveBumpX);

  svg
    .append("path")
    .datum(lineData)
    .attr("class", "btc-area")
    .attr("opacity", 0.15)
    .attr("d", btcAreaGenerator)
    .attr("fill", `url(#gradient-orange__${id})`);
};

/**
 * Renders the main price area chart
 */
export const renderPriceArea = (
  svg: SVGSelection,
  data: BinanceKlineMetric[] | IRawNode[],
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  height: number,
  displayMode: string,
  yValueToUse: "y1SumInDollars" | "y2",
  numBuffer: number,
  direction: number,
  id: string
) => {
  const areaGenerator = area<BinanceKlineMetric | IRawNode>()
    .x((_, i) => xScale(i.toString()) ?? 0)
    .y0(height)
    .y1((d, i) => {
      if (displayMode !== "standard") {
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
    .datum(data)
    .attr("class", "area")
    .attr("opacity", 0.2)
    .attr("d", areaGenerator)
    .attr(
      "fill",
      direction > 0 ? "url(#gradient-green)" : `url(#gradient-red__${id})`
    );
};

/**
 * Renders the main price line
 */
export const renderPriceLine = (
  svg: SVGSelection,
  data: BinanceKlineMetric[] | IRawNode[],
  xScale: d3.ScaleBand<string>,
  yScale: d3.ScaleLinear<number, number>,
  displayMode: string,
  yValueToUse: "y1SumInDollars" | "y2",
  numBuffer: number,
  direction: number
) => {
  const lineGenerator = line<BinanceKlineMetric | IRawNode>()
    .x((_, i) => xScale(i.toString()) ?? 0)
    .y((d, i) => {
      if (displayMode !== "standard") {
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
    .datum(data)
    .attr("class", "line")
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
    .attr("stroke-opacity", "0.5")
    .attr("stroke-width", 2);
};

/**
 * Renders interactive bars for mouse/touch events
 */
export const renderInteractiveBars = (
  svg: SVGSelection,
  data: BinanceKlineMetric[] | IRawNode[],
  xScale: d3.ScaleBand<string>,
  height: number,
  selectedIndex: number | null,
  numBuffer: number,
  direction: number,
  id: string
) => {
  svg
    .append("g")
    .attr("class", "bar-group")
    .selectAll(".bar")
    .data<BinanceKlineMetric | IRawNode>(
      data as (BinanceKlineMetric | IRawNode)[]
    )
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (_, i) => (xScale(i.toString()) ?? 0) + xScale.bandwidth() / 2)
    .attr("y", 0)
    .attr("width", xScale.bandwidth())
    .attr(
      "fill",
      direction > 0 ? "url(#gradient-green)" : `url(#gradient-red__${id})`
    )
    .attr("height", height)
    .attr("opacity", (_, i) => {
      if (selectedIndex === null) {
        if (i === data.length - numBuffer - 1) {
          return SELECTED_OPACITY;
        }
        return 0;
      }
      return selectedIndex === i ? SELECTED_OPACITY : 0;
    });
};

/**
 * Renders crosshair lines (vertical and horizontal)
 */
export const renderCrosshairs = (
  svg: SVGSelection,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // Vertical line
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

  // Horizontal line
  svg
    .append("line")
    .attr("id", "current-price-line")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "3,3")
    .attr("opacity", 0.5)
    .attr("stroke-width", 0.5)
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y)
    .attr("y2", y);
};

/**
 * Renders indicator dots on the chart
 */
export const renderIndicatorDots = (
  svg: SVGSelection,
  cx: number,
  cy: number,
  showBtcDot: boolean
) => {
  if (showBtcDot) {
    svg
      .append("circle")
      .attr("id", "orange-dot")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 3)
      .attr("opacity", 0.5)
      .attr("fill", "orange");
  }

  svg
    .append("circle")
    .attr("id", "green-dot")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 3)
    .attr("opacity", 0.5)
    .attr("fill", jade.jade11);
};

/**
 * Renders plot data points (transaction markers)
 */
export const renderPlotData = (
  svg: SVGSelection,
  plotData: IPlotData[],
  yScale: d3.ScaleLinear<number, number>,
  yValueToUse: "y1SumInDollars" | "y2",
  width: number,
  margin: ChartMargin
) => {
  const lines = svg.selectAll(".plot-line").data(plotData).enter();

  lines
    .append("line")
    .attr("x1", margin.left)
    .attr("y1", (d) => yScale(d.node[yValueToUse]))
    .attr("x2", width - margin.right)
    .attr("y2", (d) => yScale(d.node[yValueToUse]))
    .attr("stroke", (d) => d.data.color)
    .attr("class", "plot-line")
    .attr("stroke-dasharray", (d) => (d.type === "VOUT" ? "" : "3,3"))
    .attr("opacity", (d) => (d.data.visible ? 1 : 0))
    .attr("stroke-width", 0.5);
};

/**
 * Renders the current price indicator line
 */
export const renderCurrentPriceLine = (
  svg: SVGSelection,
  prices: BinanceKlineMetric[],
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  margin: ChartMargin,
  xScale: d3.ScaleBand<string>,
  direction: number
) => {
  if (!prices?.length) return;

  const kline = prices[prices.length - 1];
  const h = yScale(parseFloat(kline.closePrice));

  svg
    .append("line")
    .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
    .attr("x1", width - margin.right)
    .attr("y1", h)
    .attr("x2", width)
    .attr("y2", h)
    .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4 4")
    .attr("stroke-opacity", 0.8)
    .attr("opacity", 0.8);
};

/**
 * Renders the BTC allocation line
 */
export const renderBtcLine = (
  svg: SVGSelection,
  lineData: IRawNode[],
  xScale: d3.ScaleBand<string>,
  btcScale: d3.ScaleLinear<number, number>
) => {
  const btcLineGenerator = line<IRawNode>()
    .x((_, i) => (xScale(i.toString()) ?? 0) + xScale.bandwidth() / 2)
    .y((d) => btcScale(d.y1Sum));

  svg
    .append("path")
    .attr("id", "btc-past-line")
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-miterlimit", 1)
    .attr("stroke-opacity", "0.8")
    .attr("stroke-width", 1)
    .attr("d", btcLineGenerator(lineData));
};

/**
 * Renders the Y2 axis (price axis on the right)
 */
export const renderY2Axis = (
  svg: SVGSelection,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  yValueToUse: "y1SumInDollars" | "y2",
  privateNumber: (val: string) => string,
  direction: number
) => {
  const formatDefault = format("~s");
  const config = AXIS_CONFIG.y2;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const y2Axis = (g: any) => {
    g.attr("transform", `translate(${width - 60},0)`)
      .call(
        axisRight(yScale)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .tickFormat((d: any) => {
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
        g.selectAll(".tick line").attr("stroke", "gray").attr("opacity", 0.6)
      )
      .selectAll("text")
      .attr(
        "transform",
        `translate(${config.textMargin.right}, ${config.textMargin.top})`
      )
      .attr("fill", "gray")
      .attr("font-size", config.fontSize);

    g.selectAll(".tick").each(function (this: SVGTextElement) {
      const tick = select(this);
      const text = tick.select("text");
      if (!text.node()) return;

      const bbox = (text.node() as SVGTextElement).getBBox();
      const rect = tick.selectAll("rect").data([bbox]);

      rect
        .enter()
        .insert("rect", "text")
        .attr("x", (d) => d.x - config.padding.left)
        .attr("y", (d) => d.y - config.padding.top)
        .attr(
          "width",
          (d) => d.width + config.padding.left + config.padding.right
        )
        .attr(
          "height",
          (d) => d.height + config.padding.top + config.padding.bottom
        )
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("opacity", 0.6)
        .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
        .attr("stroke-opacity", 0.2)
        .attr(
          "transform",
          `translate(${config.textMargin.right}, ${config.textMargin.top})`
        )
        .style("fill", "white");

      rect.exit().remove();
    });
  };

  svg.append("g").attr("id", "y2").call(y2Axis);
};

/**
 * Renders the Y1 axis (BTC axis on the left)
 */
export const renderY1Axis = (
  svg: SVGSelection,
  btcScale: d3.ScaleLinear<number, number>,
  lineData: IRawNode[],
  data: BinanceKlineMetric[],
  yScale: d3.ScaleLinear<number, number>,
  height: number,
  margin: ChartMargin,
  displayMode: string,
  privateNumber: (val: string) => string,
  hasZeroBtc: boolean
) => {
  const formatBtc = format(".4f");
  const config = AXIS_CONFIG.y1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const y1Axis = (g: any) => {
    const last = data[data.length - 1];
    const val =
      displayMode !== "standard"
        ? yScale(lineData[lineData.length - 1].y1SumInDollars)
        : yScale(parseFloat(last.closePrice));

    const availableHeight = height - margin.top - margin.bottom - val;
    const optimalTicks = calculateOptimalTicks(availableHeight);

    const axis = axisLeft(btcScale)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tickFormat((d: any) => {
        if (hasZeroBtc) {
          return d === 0 ? `₿${privateNumber(formatBtc(0))}` : "";
        }
        return `₿${privateNumber(formatBtc(d))}`;
      })
      .ticks(hasZeroBtc ? 1 : Math.max(1, optimalTicks));

    if (hasZeroBtc) {
      axis.tickValues([0]);
    }

    g.attr("transform", `translate(${config.transform.x},0)`)
      .call(axis)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) => g.select(".domain").remove())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((g: any) =>
        g.selectAll(".tick line").attr("stroke", "orange").attr("opacity", 1)
      )
      .selectAll("text")
      .attr("fill", "orange")
      .attr("opacity", 1)
      .attr(
        "transform",
        `translate(${config.textMargin.left * -1}, ${config.textMargin.top})`
      )
      .attr("font-size", config.fontSize);

    g.selectAll(".tick").each(function (this: SVGTextElement) {
      const tick = select(this);
      const text = tick.select("text");
      if (!text.node()) return;

      const bbox = (text.node() as SVGTextElement).getBBox();
      const rect = tick.selectAll("rect").data([bbox]);

      rect
        .enter()
        .insert("rect", "text")
        .attr("x", (d) => d.x - config.padding.left)
        .attr("y", (d) => d.y - config.padding.top)
        .attr(
          "width",
          (d) => d.width + config.padding.left + config.padding.right
        )
        .attr(
          "height",
          (d) => d.height + config.padding.top + config.padding.bottom
        )
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("opacity", 0.6)
        .attr("stroke", "orange")
        .attr("stroke-opacity", 1)
        .style("fill", "white")
        .attr(
          "transform",
          `translate(${config.textMargin.left * -1}, ${config.textMargin.top})`
        );

      rect.exit().remove();
      text.attr("fill", "orange").attr("opacity", 1);
    });
  };

  svg.append("g").attr("id", "y1").call(y1Axis);
};
