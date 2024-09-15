import { useRef, useEffect } from "react";
import { scaleBand, scaleLinear, select, min, max, pointers } from "d3";
import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setUI } from "@root/lib/slices/ui.slice";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";

interface IVolumeChart {
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

const COLOR_POSITIVE_CHANGE = "rgba(209, 213, 219, 0.9)";
const COLOR_NEGATIVE_CHANGE = "transparent";
const COLOR_SELECTED = "rgba(0, 0, 0, 0.60)";
export const VolumeChart = (props: IVolumeChart) => {
  const { height, width, onMouseOver } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const { prices, loading, range, group } = useBtcHistoricPrices();
  const selectedIndex = useAppSelector((state) => state.ui.graphSelectedIndex);
  const isLocked = useAppSelector((state) => state.ui.graphIsLocked);

  const dispatch = useAppDispatch();

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
          if (i === selectedIndex) return COLOR_SELECTED;

          return priceChange >= 0
            ? COLOR_POSITIVE_CHANGE
            : COLOR_NEGATIVE_CHANGE;
        })
        .attr("stroke", (d, i) => {
          const price1 = parseFloat(d.closePrice);
          const previous = data[i - 1];
          const price2 = previous ? parseFloat(previous.closePrice) : 0;

          const priceChange = i === 0 ? 0 : price1 - price2;
          return priceChange >= 0
            ? COLOR_NEGATIVE_CHANGE
            : COLOR_POSITIVE_CHANGE;
        })
        .on("click", (_, kline) => {
          const index = data.findIndex((d) => d.openTime === kline.openTime);
          // const datum = data[index];
          if (isLocked) {
            dispatch(setUI({ graphIsLocked: false, graphSelectedIndex: null }));
          } else {
            dispatch(setUI({ graphIsLocked: true, graphSelectedIndex: index }));
          }
        });

      // ---------------------------------------------------------------------//
      // Binding movement
      svg

        .on("mousemove touchmove", function (event) {
          if (isLocked) return;
          const [xy] = pointers(event);
          const [x] = xy;
          const index = Math.floor((x - margin.left) / xScale.step());
          const datum = data[index];
          const i = data.findIndex((d) => d.openTime === datum.openTime);

          svg
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
            onMouseOver({ datum, index: i });
          }
        })
        .on("mouseleave touchend", function () {
          if (isLocked) return;
          const index = data.length - 1;
          svg
            .selectAll(".bar")
            // .attr("opacity", 0)
            .attr("fill", (_, i) =>
              isPositiveChange(i)
                ? COLOR_POSITIVE_CHANGE
                : COLOR_NEGATIVE_CHANGE
            )
            .filter((_, i) => i === index)
            .attr("fill", COLOR_SELECTED);
          if (onMouseOver) {
            onMouseOver({ datum: data[index], index });
          }
        });

      // ---------------------------------------------------------------------//

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
    isLocked,
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
