import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { jade, ruby } from "@radix-ui/colors";
import { useBreakpoints } from "@lib/hooks/useBreakpoints";
import type { IPlotData, IChartTimeframeGroups } from "@root/types";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectForecast } from "@root/lib/slices/price.slice";

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
  // to show the net value of wallets set to true (y1)
  // otherwise the btcPrice (y2) is graphed
  graphAssetValue: boolean;
  chartTimeframeGroup: IChartTimeframeGroups;
  showBtcAllocation: boolean;
  btcPrice: number;
};
// const grayRGB = "rgb(243 244 246)";
export const ThinLine = (props: ILine) => {
  const {
    height,
    width,
    lineData,
    plotData,
    graphAssetValue,
    chartTimeframeGroup,
    btcPrice,
    showBtcAllocation,
  } = props;

  const yValueToUse: "y1SumInDollars" | "y2" = graphAssetValue
    ? "y1SumInDollars"
    : "y2";

  const { forecastModel } = useAppSelector(selectForecast);

  const breakpoint = useBreakpoints();

  const svgRef = useRef<SVGSVGElement>(null);
  const margin = {
    top: 10,
    right: 0,
    bottom: 34,
    left: 0,
  };

  const xDomain = d3.extent(lineData.map((d) => new Date(d.x))) as [Date, Date];

  const xRange = [margin.left, width - margin.right];
  const x = d3.scaleUtc().domain(xDomain).range(xRange);

  const [, max] = d3.extent(lineData, (d) => d[yValueToUse]!) as [
    number,
    number
  ];
  const y1 = d3
    .scaleLinear()
    .domain([0, max])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line<Plot>()
    .x((d) => x(new Date(d.x)))
    .y((d) => y2(d[yValueToUse]!));

  const ext = d3.extent(lineData, (d) => d[yValueToUse]!) as [number, number];

  const y2 = d3
    .scaleLinear()
    .domain(ext)
    .range([height - margin.bottom, margin.top]);

  const plotExt = d3.extent(plotData, (d) => d.value) as [number, number];
  const y3 = d3.scaleLinear().domain(plotExt).range([0.25, 0.75]);

  const ext3 = d3.extent(lineData, (d) => d.y1Sum * btcPrice!) as [
    number,
    number
  ];

  const top = y2(lineData[lineData.length - 1]?.[yValueToUse]);

  // if there is no difference between the min and max
  // it screws up the scale
  // so we set the bottom to 0
  const diff = Math.abs(ext3[0] - ext3[1]);
  const b = diff === 0 ? 0 : ext3[0];
  const y4 = d3
    .scaleLinear()
    .domain([b, ext3[1]])
    .range([height - margin.bottom, top]);

  const xAxis = (g: any) => {
    const ticks = x.ticks(5);
    const tickFormat =
      chartTimeframeGroup === "5M"
        ? d3.timeFormat("%I:%M %p")
        : chartTimeframeGroup === "1H"
        ? d3.timeFormat("%b %d")
        : d3.timeFormat("%b %y");

    g.attr("transform", `translate(0,${height - margin.bottom + 10})`)

      .call(
        d3
          .axisBottom(x)
          .tickValues(ticks)
          // @ts-expect-error d3 issues
          .tickFormat(tickFormat) // Format the tick labels as needed
          .tickSizeOuter(0)
      )
      .call((g: any) => g.select(".domain").attr("stroke", "gray"))
      .call((g: any) => g.selectAll(".tick line").attr("stroke", "gray"))
      .call(
        (g: any) =>
          g.select(".domain").attr("stroke-width", 0.5).attr("opacity", 0.5)

        // .attr("color", "gray")
      ) // Change the thickness of the domain line
      .selectAll("text") // Add this line
      .attr("opacity", 0.5)
      .select(function () {
        // @ts-expect-error d3 issues
        return this.parentNode;
      }) // Select the parent of each text element, which is the g element of the tick
      .select("line") // Select the line of each tick
      .attr("opacity", 0.5);
  };

  const renderLineArea = () => {
    // if (barData.length === 0 && barDataTwo.length === 0) return;
    const svg = d3.select(svgRef.current);
    const area = d3
      .area<Plot>()
      .x((d) => x(new Date(d.x)))
      .y0(y1(0))
      .y1((d) => {
        const val = y2(d[yValueToUse]);

        return val;
      });

    const defs = svg.append("defs");
    // Upward pointing marker
    defs
      .append("marker")
      .attr("id", "arrowheadUp")
      .attr("viewBox", "-0 -5 20 20") // Position and size of the arrowhead
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 40)
      .attr("markerHeight", 40)
      // .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5") // Shape of the arrowhead
      .attr("fill", "green");
    // .style("stroke", "none");

    // Downward pointing marker
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
      .attr("fill", "red");
    // .attr("stroke-width", 5)
    // .style("stroke", "none");
    // Define the gradient
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
      .attr("stop-color", "rgb(243 244 246)")
      .attr("stop-opacity", 1);

    gradientGreen
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(243 244 246)")
      .attr("stop-opacity", 1);

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

    // add the x-axis
    svg.append("g").call(xAxis);
  };

  const renderPlots = () => {
    const svg = d3.select(svgRef.current);
    const bisect = d3.bisector((d: Plot) => new Date(d.x)).left;

    const direction =
      lineData[0]?.[yValueToUse] < lineData[lineData.length - 1]?.[yValueToUse]
        ? 1
        : -1;
    if (plotData?.length) {
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
          if (!d0) return 0;
          const val = y2(d0[yValueToUse]);
          return val;
        })
        .attr("x2", width - margin.right)
        .attr("y2", (d) => {
          const xVal = x(new Date(d.x));
          const x0 = x.invert(xVal);
          const i = bisect(lineData, x0, 1);
          const d0 = lineData[i];
          if (!d0) return 0;
          const val = y2(d0[yValueToUse]);
          return val;
        })
        .attr("stroke", (d) => {
          const color = d.data.color;
          return color;
        })
        .attr("class", "plot")
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
          if (!d0) return 0;
          const val = y2(d0[yValueToUse]);
          return val;
        })
        .attr("r", 1)
        .attr("fill", direction > 0 ? jade.jade11 : ruby.ruby11)
        .attr("stroke", (d) => d.data.color)
        .attr("class", "plot-marker")
        .attr("stroke-width", 0.5)
        .attr("opacity", (d) => {
          if (d.data.visible) return 1;
          return 0;
        });
    }
  };
  const renderBtcAllocation = () => {
    const svg = d3.select(svgRef.current);
    if (!svg) return null;

    if (ext3[1] === 0) return null;

    const btcLine = d3
      .line<Plot>()
      .x((d) => x(new Date(d.x)))
      .y((d) => {
        const val = y4(d.y1Sum * btcPrice);

        return val;
      });

    if (showBtcAllocation && btcPrice) {
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

  const render = () => {
    renderLineArea();
    renderPlots();
    renderBtcAllocation();
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
      svg.selectAll("circle").remove();
      svg.selectAll(".plot").remove();
      svg.selectAll(".plot-marker").remove();
    };
  }, [height, width, lineData, breakpoint, btcPrice, forecastModel]);

  return (
    <svg
      height={height}
      viewBox={[0, 0, width, height].join(",")}
      style={{ maxWidth: "100%", height: "auto", fontSize: 10 }}
      width={width}
      ref={svgRef}
    />
  );
};
