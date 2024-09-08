import { useRef, useEffect } from "react";
import { scaleBand, scaleLinear, select, min, max } from "d3";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";

interface IVolumeChart {
  height: number;
  width: number;
}
export const VolumeChart = (props: IVolumeChart) => {
  const { height, width } = props;
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

  const yExtent = [min(data.map((d) => d[2])), max(data.map((d) => d[2]))];

  const yScale = scaleLinear()
    .domain([-yExtent[1]!, yExtent[1]!])
    .range([height, 0]);

  // const yScale = scaleLinear()
  //   .domain([yExtent[0] || 0, yExtent[1] || 0])
  //   .range([height, 0]);

  // const priceExtent = [
  //   Math.min(...data.map((d) => d[1])),
  //   Math.max(...data.map((d) => d[1])),
  // ];

  useEffect(() => {
    const render = () => {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      // create a bar chart that
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => xScale(i.toString())!)
        .attr("y", (d, i) => {
          const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          return priceChange >= 0 ? yScale(d[2]) : yScale(0);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => {
          // const priceChange = i === 0 ? 0 : d[1] - data[i - 1][1];
          return Math.abs(yScale(d[2]) - yScale(0));
        })
        .attr("fill", "rgba(209, 213, 219, 0.6)");

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
  }, [loading, range, group, height, width, lastPrice[0]]);

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
