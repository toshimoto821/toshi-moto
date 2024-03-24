import { useRef, useEffect } from "react";
import { Text } from "@radix-ui/themes";
import * as d3 from "d3";
import { trimAddress, formatPrice, padBtcZeros } from "@lib/utils";

type ITreemap = {
  name: string;
  height: number;
  width: number;
  data: Node;
  color?: string;
};

interface Node {
  name: string;
  children?: Node[];
  value?: number;
  total?: number;
  balance?: number;
  category?: string;
}

export const Treemap = ({ height, width, data, color = "red" }: ITreemap) => {
  const svgRef = useRef<SVGSVGElement>(null);

  function renderTreemap() {
    const svg = d3.select(svgRef.current);

    const root = d3
      .hierarchy<Node>(data)
      .sum((d) => {
        return d.value || 0;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // console.log(root);
    const treemapRoot = d3.treemap<Node>().size([width, height]).padding(1)(
      root
    );

    const leaves = treemapRoot.leaves();
    // const [min, max] = d3.extent(leaves, (d) => d.value || 0);
    // console.log(max);
    // const xScale = d3.scaleLog().domain([min!, max!]).range([0, width]);
    // const yScale = d3.scaleLog().domain([min!, max!]).range([0, height]);
    // const yScale = (val: number) => val;
    //
    // console.log(xScale(10), "xScale(10000)");

    // const scale = (val: number) => val;
    const nodes = svg
      .selectAll("g")
      .data(leaves)
      .join("g")
      // .attr("x", (d) => d.x0 + 5)
      //.attr("y", (d) => d.y0 + 45)
      .attr("transform", (d) => {
        return `translate(${d.x0},${d.y0})`;
      });

    // const fader = (color: string) => d3.interpolateRgb(color, "#fff")(0.2);
    // const colorScale = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

    nodes
      .append("rect")
      .attr("width", (d) => {
        // const width = xScale(d.x1) - xScale(d.x0);
        // console.log(d.x1, d.x0, d.x1 - d.x0, width);
        return d.x1 - d.x0;
      })
      .attr("height", (d) => d.y1 - d.y0)
      .attr("stroke-width", "1")
      .attr("stroke", "white")
      .attr("fill", color);

    const fontSize = 14;

    nodes
      .append("text")
      .text((d) =>
        d.data.value
          ? `${trimAddress(d.data.name, {
              prefix: 4,
              suffix: 4,
            })}`
          : ""
      )
      .attr("font-size", `${fontSize}px`)
      .attr("x", 5)
      .attr("y", 20)
      .attr("fill", "white");

    nodes
      .append("text")
      .text((d) => (d.data.value ? `${padBtcZeros(d.data.balance ?? 0)}` : ""))
      .attr("font-size", `${fontSize}px`)
      .attr("x", 5)
      .attr("y", 40)
      .attr("fill", "white");

    nodes
      .append("text")
      .text((d) => (d.data.value ? `(${formatPrice(d.data.value || 0)})` : ""))
      .attr("font-size", `${fontSize}px`)
      .attr("x", 5)
      .attr("y", 60)
      .attr("fill", "white");
    // .attr("paint-order", "stroke");

    // svg
    //   .selectAll("titles")
    //   .data(
    //     root.descendants().filter(function (d) {
    //       return d.depth == 1;
    //     }) as d3.HierarchyRectangularNode<Node>[]
    //   )
    //   .enter()
    //   .append("text")
    //   .attr("x", function (d) {
    //     return d.x0;
    //   })
    //   .attr("y", function (d) {
    //     return d.y0 + 20;
    //   })
    //   .text(function (d) {
    //     return d.data.name;
    //   })
    //   .attr("font-size", "19px")
    //   .attr("fill", (d) => {
    //     const c = colorScale(d.data.name) as string;
    //     return c;
    //   });
  }

  useEffect(() => {
    // console.log(width);

    if (width > 0 && height > 0) {
      renderTreemap();
    }

    return () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
    };
  }, [data, height, width]);

  return (
    <div>
      {data.total! > 0 && (
        <Text size="1" className="italic text-gray-400">
          {data.name} {data.total && formatPrice(data.total)}
        </Text>
      )}
      <svg height={height} width={width} ref={svgRef} />
    </div>
  );
};
