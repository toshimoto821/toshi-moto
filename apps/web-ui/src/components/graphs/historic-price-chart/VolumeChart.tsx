import { useRef, useEffect } from "react";
import { scaleBand, scaleLinear, select, min, max, pointers } from "d3";
import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setUI } from "@root/lib/slices/ui.slice";
import { jade, ruby } from "@radix-ui/colors";
import type { BinanceKlineMetric } from "@lib/slices/api.slice.types";
import { SELECTED_OPACITIY } from "./HeroChart";
import { addBufferItems, BUFFER_LENGTH } from "./hero-chart.utils";
import type { JSX } from "react";

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

export const COLOR_POSITIVE_CHANGE = "rgba(209, 213, 219, 0.9)";
export const COLOR_NEGATIVE_CHANGE = "transparent";
// export const COLOR_SELECTED = "#F7931A";

export const VolumeChart = (props: IVolumeChart) => {
  const { height, width, onMouseOver } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const { prices, loading, range, group } = useBtcHistoricPrices();
  const selectedIndex = useAppSelector((state) => state.ui.graphSelectedIndex);
  const isLocked = useAppSelector((state) => state.ui.graphIsLocked);
  // const breakpoint = useBreakpoints();
  const dispatch = useAppDispatch();

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const data = [...(prices || [])];
  const numBuffer = BUFFER_LENGTH; // getNumBuffer(data.length, breakpoint);
  if (data.length) {
    addBufferItems(data, numBuffer);
  }

  const lastPrice = data[data.length - 1] || [];
  const xScale = scaleBand()
    // prices = [date, price, volume]
    .domain(data.map((_, i) => i.toString()))
    .range([margin.left, width - margin.right + 3]) // 3? @fix me. some spacing is off
    .padding(0.1);

  const firstMetric = data[0];
  const lastMetric = data[data.length - 1];
  const direction =
    parseFloat(lastMetric?.closePrice) > parseFloat(firstMetric?.openPrice)
      ? 1
      : -1;

  const COLOR_SELECTED = direction > 0 ? jade.jade11 : ruby.ruby11;

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
    // @todo fix me
    if (i === 0) return true;
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
        .attr("x", (_, i) => {
          // if (i === 0) {

          // }
          return xScale(i.toString())! + xScale.bandwidth() / 2;
          // return xScale(i.toString())!;
        })
        .attr("y", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          // return priceChange >= 0 ? yScale(d[2]) : yScale(0);
          const vol = parseFloat(d.quoteAssetVolume);
          return yScale(vol);
        })
        .attr("width", xScale.bandwidth())
        // .attr("width", (_, i) => {
        //   if (i === data.length - 1 || i === 0) {
        //     return xScale.bandwidth() / 2;
        //   }
        //   return xScale.bandwidth();
        // })
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

          // this is wrong because i dont have the first price
          if (i < numBuffer || i > data.length - numBuffer - 1) {
            return "transparent";
          }

          if (selectedIndex === null && i === data.length - numBuffer - 1) {
            return COLOR_SELECTED;
          }

          if (i === selectedIndex) return COLOR_SELECTED;

          if (i === numBuffer) {
            // fill should always be positive
            return COLOR_POSITIVE_CHANGE;
          }

          return priceChange >= 0
            ? COLOR_POSITIVE_CHANGE
            : COLOR_NEGATIVE_CHANGE;
        })
        .attr("stroke", (d, i) => {
          // @todo fix me

          if (i < numBuffer || i > data.length - numBuffer - 1) {
            // exit before selecting the color

            return "transparent";
          }

          if (i === numBuffer) {
            // @TODO fix me
            // we dont know if the first bar is positive or negative
            return COLOR_POSITIVE_CHANGE;
          }

          const price1 = parseFloat(d.closePrice);
          const previous = data[i - 1];
          const price2 = previous ? parseFloat(previous.closePrice) : 0;

          const priceChange = i === 0 ? 0 : price1 - price2;
          return priceChange >= 0
            ? COLOR_NEGATIVE_CHANGE
            : COLOR_POSITIVE_CHANGE;
        })
        .attr("data-index", (_, i) => i)
        .on("click", (_, kline) => {
          let index = data.findIndex((d) => d.openTime === kline.openTime);
          if (index < numBuffer) {
            index = numBuffer;
          }
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
          let index = Math.floor((x - margin.left) / xScale.step());

          if (index < numBuffer || index > data.length - numBuffer - 1) {
            index = data.length - numBuffer - 1;
          }

          let datum = data[index];
          if (!datum) {
            index = data.length - numBuffer - 1;
            datum = data[index];
          }
          // const i = data.findIndex((d) => d.openTime === datum.openTime);

          svg
            .selectAll(".bar")
            // .attr("opacity", 0)
            .attr("fill", (_, ind) => {
              if (ind < numBuffer || ind > data.length - numBuffer - 1) {
                return "transparent";
              }

              if (ind === numBuffer) {
                // fill should always be positive
                return COLOR_POSITIVE_CHANGE;
              }

              return isPositiveChange(ind)
                ? COLOR_POSITIVE_CHANGE
                : COLOR_NEGATIVE_CHANGE;
            })
            .filter((_, ind) => {
              if (ind < numBuffer || ind > data.length - numBuffer - 1) {
                return false;
              }

              return ind === index;
            })
            // Reset all bars to original color
            .attr("fill", COLOR_SELECTED);

          const heroChart = select("#hero-chart");

          heroChart
            .selectAll(".bar")
            .attr("opacity", 0)
            .filter((_, i) => i === index)
            .attr("opacity", SELECTED_OPACITIY);

          if (onMouseOver) {
            onMouseOver({ datum, index: index });
          }
        })
        .on("mouseleave touchend", function () {
          if (isLocked) return;
          const index = data.length - numBuffer - 1;
          svg
            .selectAll(".bar")
            // .attr("opacity", 0)
            .attr("fill", (_, ind) => {
              if (ind < numBuffer - 1 || ind > data.length - numBuffer - 1) {
                return "transparent";
              }

              return isPositiveChange(ind)
                ? COLOR_POSITIVE_CHANGE
                : COLOR_NEGATIVE_CHANGE;
            })

            .filter((_, ind) => {
              if (ind < numBuffer - 1 || ind > data.length - numBuffer - 1) {
                return false;
              }

              return ind === index;
            })
            .attr("fill", COLOR_SELECTED);

          const heroChart = select("#hero-chart");
          heroChart
            .selectAll(".bar")
            .attr("opacity", 0)
            .filter((_, i) => i === index)
            .attr("opacity", SELECTED_OPACITIY);

          const chartLegend = select("#chart-legend");
          chartLegend
            .selectAll(".highlight-bar")
            .attr("opacity", 0)
            .filter((_, i) => i === index)
            .attr("opacity", 0.5);
          if (onMouseOver) {
            onMouseOver({ datum: data[index], index: index });
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
        id="volume-chart"
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
