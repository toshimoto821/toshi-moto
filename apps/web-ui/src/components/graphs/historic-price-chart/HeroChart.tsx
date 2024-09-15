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

import {
  COLOR_NEGATIVE_CHANGE,
  COLOR_POSITIVE_CHANGE,
  COLOR_SELECTED,
} from "./VolumeChart";

interface IHeroChart {
  height: number;
  width: number;
  onMouseOver?: ({
    datum,
    index,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => void;
}

const grayRGB = "rgb(243 244 246)";
export const SELECTED_OPACITIY = 0.28;

export const HeroChart = (props: IHeroChart) => {
  const { height, width, onMouseOver } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const dispatch = useAppDispatch();
  const { btcPrice } = useBtcPrice();
  const { wallets } = useWallets();
  const privateNumber = useNumberObfuscation();
  const { prices, loading, range, group } = useBtcHistoricPrices();
  const isLocked = useAppSelector((state) => state.ui.graphIsLocked);
  const selectedIndex = useAppSelector((state) => state.ui.graphSelectedIndex);

  const { lineData } = useChartData({ btcPrice, wallets });

  const margin = { top: 10, right: 60, bottom: 0, left: 0 };

  const data = [...(prices || [])];

  const lastPrice = data[data.length - 1] || [];
  const xScale = scaleBand()
    // prices = [date, price, volume]
    .domain(data.map((_, i) => i.toString()))
    .range([margin.left, width - margin.right])
    .padding(0);

  const yExtent = [
    min(
      data.map((d) => {
        const volume = parseFloat(d.closePrice);
        return volume;
      })
    ),
    max(
      data.map((d) => {
        return parseFloat(d.closePrice);
      })
    ),
  ];

  const yScale = scaleLinear()
    .domain([yExtent[0]!, yExtent[1]!])
    .range([height - margin.top, margin.top]);

  const formatDefault = format("~s");
  const formatBtc = format(".4f");

  const yValueToUse = "y2" as "y1SumInDollars" | "y2";

  const btcExt = extent(lineData, (d) => d.y1Sum * btcPrice) as [
    number,
    number
  ];

  const diff = Math.abs(btcExt[0] - btcExt[1]);
  const d1 = diff === 0 ? 0 : btcExt[0];
  const d2 = btcExt[1];

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const top = yScale(lineData[lineData.length - 1]?.[yValueToUse]!);

  const btcScale = scaleLinear()
    .domain([d1, d2])
    .range([height - margin.bottom, top]);

  const btcScaleFull = scaleLinear()
    .domain([d1, d2])
    .range([height - margin.bottom, margin.top]);

  const btcLine = line<IRawNode>()
    .x((_, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
    .y((d) => {
      const t = d.y1Sum * btcPrice;
      const val = btcScale(t);
      return val;
    });

  const isPositiveChange = (i: number) => {
    const d = data[i];
    const price1 = parseFloat(d.closePrice);
    const previous = data[i - 1];
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
      const direction = lastMetric.closePrice > firstMetric.closePrice ? 1 : -1;

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
        .attr("id", "gradient-red")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradientRed
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
      const adjustedX = (i: number) =>
        xScale(i.toString())! + xScale.bandwidth() / 2;

      const areaGenerator = area<BinanceKlineMetric>()
        .x((_, i) => adjustedX(i))
        .y0(height)
        .y1((d) => yScale(parseFloat(d.closePrice)));

      svg
        .append("path")
        .datum(data)
        .attr("class", "area")
        .attr("opacity", 0.2)
        .attr("d", areaGenerator)
        .attr(
          "fill",
          direction > 0 ? "url(#gradient-green)" : "url(#gradient-red)"
        );

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Bar Chart
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => {
          const x = xScale(i.toString())!;
          const w = xScale.bandwidth();
          if (i === 0) {
            return x + w / 2 + 1;
          }

          return x;
        })
        .attr("y", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          // return priceChange >= 0 ? yScale(d[2]) : yScale(0);
          const price = parseFloat(d.closePrice);

          return yScale(price) - 50;
        })
        .attr("width", (_, i) => {
          const w = xScale.bandwidth();
          if (i === 0 || i === data.length - 1) {
            return w / 2 - 1;
          }
          return w;
        })
        .attr(
          "fill",
          direction > 0 ? "url(#gradient-green)" : "url(#gradient-red)"
        )
        .attr("height", (d) => {
          const price = parseFloat(d.closePrice);
          return height - margin.bottom - yScale(price) + 50;
        })
        .attr("opacity", (_, i) => {
          if (selectedIndex === null) {
            return 0;
          }
          return selectedIndex === i ? SELECTED_OPACITIY : 0;
        })
        .on("click", (_, kline) => {
          const index = data.findIndex((d) => d.openTime === kline.openTime);
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
      const lineGenerator = line<BinanceKlineMetric>()
        .x((_, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
        .y((d) => yScale(parseFloat(d.closePrice)));

      svg
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", direction > 0 ? jade.jade11 : ruby.ruby11)
        .attr("stroke-opacity", "0.5")
        .attr("stroke-width", 2);
      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Inverse Area chart
      const inverseAreaGenerator = area<BinanceKlineMetric>()
        .x((_, i) => {
          return adjustedX(i);
        })
        .y0(0)
        .y1((d) => yScale(parseFloat(d.closePrice)));

      svg
        .append("path")
        .datum(data)
        .attr("class", "inverse-area")
        .attr("d", inverseAreaGenerator)
        .attr("fill", grayRGB); // Apply a semi-transparent white fill

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Binding movement

      svg
        .on("mousemove touchmove", function (event) {
          if (isLocked) return;
          const [xy] = pointers(event);
          const [x] = xy;
          let index = Math.floor((x - margin.left) / xScale.step());

          let datum = data[index];
          if (!datum) {
            index = data.length - 1;
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
            onMouseOver({ datum, index });
          }
        })
        .on("mouseleave touchend", function () {
          if (isLocked) return;
          // select(this).attr("fill", "transparent"); // Revert to original color
          const index = data.length - 1;
          svg
            .selectAll(".bar")
            .attr("opacity", 0)
            .filter((_, i) => i === index)
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
      // Y2 Axis (right)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y2Axis = (g: any) => {
        const padding = { top: 1, right: 3, bottom: 1, left: 3 }; // Adjust as needed
        const textMargin = { top: 0, right: 5, bottom: 0, left: 0 };
        g.attr("transform", `translate(${width},0)`)
          .call(
            axisLeft(yScale)
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
            `translate(${textMargin.right * -1}, ${textMargin.top})`
          )
          .attr("fill", "gray");

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
            .attr("opacity", 0.4)
            .attr(
              "transform",
              `translate(${textMargin.right * -1}, ${textMargin.top})`
            )
            .style("fill", "white");

          // Remove any exiting rect elements
          rect.exit().remove();

          // text.attr("fill", "orange").attr("opacity", 1);
        });
      };

      svg.append("g").attr("id", "y2").call(y2Axis);

      // ---------------------------------------------------------------------//
      // BTC Allocation (line)
      svg
        .append("path")
        .attr("id", "btc-past-line")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-opacity", "0.8")
        .attr("stroke-width", 1)
        .attr("d", btcLine(lineData));

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // y1 (btc) axis (left)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y1Axis = (g: any) => {
        // const padding = { top: 1, right: 3, bottom: 1, left: 3 }; // Adjust as needed
        const textMargin = { top: 0, right: 0, bottom: 0, left: 5 };
        g.attr("transform", `translate(0,0)`)
          .call(
            axisRight(btcScaleFull)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .tickFormat((d: any) => {
                return `₿${privateNumber(formatBtc(d / btcPrice))}`;
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
            `translate(${textMargin.left}, ${textMargin.top})`
          );

        const padding = { top: 1, right: 1, bottom: 1, left: 5 }; // Adjust as needed

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
            .attr("opacity", 0.4)
            .style("fill", "white")
            .attr(
              "transform",
              `translate(${textMargin.left}, ${textMargin.top})`
            );

          // Remove any exiting rect elements
          rect.exit().remove();

          // Update text attributes
          text.attr("fill", "orange").attr("opacity", 1);
        });
      };
      svg.append("g").attr("id", "y1").call(y1Axis);

      // ---------------------------------------------------------------------//

      // ---------------------------------------------------------------------//
      // Current Price (bar - right)
      if (prices?.length) {
        const kline = prices[prices.length - 1];
        const h = yScale(parseFloat(kline.closePrice));

        const t = yScale(yExtent[1]!);

        svg
          .append("rect")
          .attr("id", "live-price")
          .attr("x", width - margin.right)
          .attr("y", t)
          .attr("width", margin.right)
          .attr("height", height)
          .attr("opacity", 0.28)
          .attr("transform", `translate(0, 0)`)
          .attr(
            "fill",
            direction > 0 ? "url(#gradient-green)" : "url(#gradient-red)"
          );
        // .attr("stroke", "black");

        // orange line
        svg
          .append("line")
          .attr("x1", width - margin.right)
          .attr("y1", h)
          .attr("x2", width)
          .attr("y2", h)
          // .attr("transform", `translate(${xScale.bandwidth() / -2}, 0)`)
          .attr("stroke", "orange")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 4")

          .attr("opacity", 0.8);
      }
    };

    render();
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
  ]);

  return (
    <div>
      <svg
        id="hero-chart"
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
        className=""
        ref={svgRef}
      />
    </div>
  );
};
