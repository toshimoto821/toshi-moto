import { useRef, useEffect } from "react";
import { select, max, min, scaleLinear, scaleBand, line, area } from "d3";
import { jade, ruby } from "@radix-ui/colors";
import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";

interface IHeroChart {
  height: number;
  width: number;
  selectedIndex: number | null;
  onMouseOver?: ({
    datum,
    index,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => void;
  onMouseOut?: ({
    datum,
    index,
  }: {
    datum: BinanceKlineMetric;
    index: number;
  }) => void;
}

const grayRGB = "rgb(243 244 246)";

export const HeroChart = (props: IHeroChart) => {
  const { height, width, onMouseOut, onMouseOver, selectedIndex } = props;
  const svgRef = useRef<SVGSVGElement>(null);

  const { prices, loading, range, group } = useBtcHistoricPrices();
  const margin = { top: 120, right: 0, bottom: 0, left: 0 };

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
          direction > 0 ? "url(#gradient-green" : "url(#gradient-red"
        );

      // ---------------------------------------------------------------------//
      // .attr("fill", "rgba(173, 216, 230, 0.5)"); // Light blue with 50% opacity
      // create a bar chart that
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
        .attr("height", (d) => {
          const price = parseFloat(d.closePrice);
          return height - margin.bottom - yScale(price) + 50;
        })

        .attr("fill", (_, i) => {
          if (!selectedIndex) return "transparent";
          if (i === selectedIndex) {
            return direction > 0
              ? "url(#gradient-green)"
              : "url(#gradient-red)";
          }
          return "transparent";
        })
        .attr("opacity", 0.18)
        .on("mouseover touchmove", function () {
          const datum = select(this).datum() as BinanceKlineMetric;
          const index = data.findIndex((d) => d.openTime === datum.openTime);

          select(this)
            .attr(
              "fill",
              direction > 0 ? "url(#gradient-green)" : "url(#gradient-red)"
            )
            .attr("opacity", 0.18); // Change to desired hover color "rgba(209, 213, 219, 0.5)"

          if (onMouseOver) {
            onMouseOver({ datum, index });
          }
        })
        .on("mouseout touchend", function () {
          select(this).attr("fill", "transparent"); // Revert to original color
          if (onMouseOut) {
            const datum = select(this).datum() as BinanceKlineMetric;
            const index = data.findIndex((d) => d.openTime === datum.openTime);
            onMouseOut({ datum, index });
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
      // Inverse
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
  ]);

  return (
    <div>
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
        className=""
        ref={svgRef}
      />
    </div>
  );
};
