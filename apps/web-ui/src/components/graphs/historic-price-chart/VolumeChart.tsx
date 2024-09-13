import { useRef, useEffect } from "react";
import { scaleBand, scaleLinear, select, min, max } from "d3";

import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
interface IVolumeChart {
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
export const VolumeChart = (props: IVolumeChart) => {
  const { height, width, onMouseOver, onMouseOut, selectedIndex } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const { prices, loading, range, group } = useBtcHistoricPrices();
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const data = prices || [];
  const lastPrice = data[data.length - 1] || [];
  const xScale = scaleBand()
    // prices = [date, price, volume]
    .domain(data.map((_, i) => i.toString()))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  // const yScale = scaleLinear()
  //   .domain([
  //     Math.min(0, ...data.map((d, i) => (i === 0 ? 0 : d[1] - data[i - 1][1]))),
  //     Math.max(0, ...data.map((d, i) => (i === 0 ? 0 : d[1] - data[i - 1][1]))),
  //   ])
  //   .range([height, 0]);

  const yExtent = [
    min(
      data.map((d) => {
        const volume = parseFloat(d.quoteAssetVolume);
        return volume;
      })
    ),
    max(
      data.map((d) => {
        return parseFloat(d.quoteAssetVolume);
      })
    ),
  ];

  const yScale = scaleLinear()
    .domain([yExtent[0]!, yExtent[1]!])
    .range([height, 0]);

  useEffect(() => {
    const render = () => {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      // ---------------------------------------------------------------------//
      // Vars:
      // const firstMetric = data[0];
      // const lastMetric = data[data.length - 1];
      // const direction = lastMetric.closePrice > firstMetric.closePrice ? 1 : -1;

      // ---------------------------------------------------------------------//

      // create a bar chart that
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => xScale(i.toString())!)
        .attr("y", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          // return priceChange >= 0 ? yScale(d[2]) : yScale(0);
          const vol = parseFloat(d.quoteAssetVolume);
          return yScale(vol);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          const vol = parseFloat(d.quoteAssetVolume);
          return Math.abs(yScale(vol) - yScale(0));
        })
        .attr("opacity", 1)
        .attr("fill", (d, i) => {
          const price1 = parseFloat(d.closePrice);
          const previous = data[i - 1];
          const price2 = previous ? parseFloat(previous.closePrice) : 0;
          const priceChange = i === 0 ? 0 : price1 - price2;
          if (i === selectedIndex) return "rgba(0, 0, 0, 0.18)";

          return priceChange >= 0 ? "rgba(209, 213, 219, 0.9)" : "transparent";
        })
        .attr("stroke", (d, i) => {
          const price1 = parseFloat(d.closePrice);
          const previous = data[i - 1];
          const price2 = previous ? parseFloat(previous.closePrice) : 0;

          const priceChange = i === 0 ? 0 : price1 - price2;
          return priceChange >= 0 ? "" : "rgba(209, 213, 219, 0.9)";
        })
        .on("mouseover", function () {
          const datum = select(this).datum() as BinanceKlineMetric;
          const i = data.findIndex((d) => d.openTime === datum.openTime);
          // const price1 = parseFloat(datum.closePrice);
          // const previous = data[i - 1];
          // const price2 = previous ? parseFloat(previous.closePrice) : 0;
          // const priceChange = i === 0 ? 0 : price1 - price2;
          // const color = priceChange >= 0 ? jade.jade11 : ruby.ruby11;
          select(this).attr("fill", "rgba(0, 0, 0, 1)").attr("opacity", 0.18); // Change to desired hover color
          if (onMouseOver) {
            onMouseOver({ datum, index: i });
          }
        })
        .on("mouseout", function () {
          const datum = select(this).datum() as BinanceKlineMetric;
          const i = data.findIndex((d) => d.openTime === datum.openTime);
          // const price1 = parseFloat(datum.closePrice);
          // const previous = data[i - 1];
          // const price2 = previous ? parseFloat(previous.closePrice) : 0;
          // const priceChange = i === 0 ? 0 : price1 - price2;
          // const color =
          //   priceChange >= 0 ? "rgba(209, 213, 219, 0.9)" : "transparent";
          select(this)
            .attr("fill", "rgba(209, 213, 219, 0.9)")
            .attr("opacity", 1); // Revert to original color
          if (onMouseOut) {
            onMouseOut({ datum, index: i });
          }
        });

      // svg
      //   .append("text")
      //   .attr("x", 0)
      //   .attr("y", height / 2)
      //   .attr("text-anchor", "left")
      //   .attr("font-size", "10px")
      //   .attr("font-weight", "bold")
      //   .attr("fill", "black")
      //   .text("Volume");
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
