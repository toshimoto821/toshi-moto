/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { type BrushSelection } from "d3";
import debounce from "lodash/debounce";

import { type IChartTimeFrameRange } from "@root/machines/appMachine";

import { useBreakpoints } from "@root/lib/hooks/useBreakpoints";
import { cn } from "@root/lib/utils";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectForecast } from "@root/lib/slices/price.slice";

type IChartLegendProps = {
  height: number;
  width: number;
  chartTimeFrameRange: IChartTimeFrameRange | null;
  onChange: (range: [Date, Date]) => void;
  onReset: () => void;
};
export const ChartLegend = ({
  height,
  width,
  chartTimeFrameRange,
  onChange,
  onReset,
}: IChartLegendProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = {
    top: 70,
    right: 0,
    bottom: 10,
    left: 0,
  };
  const breakpoint = useBreakpoints();
  const [screensize, setScreensize] = useState(window.innerWidth);
  const currentSelecion = useRef<BrushSelection | null>(null);
  const { prices } = useBtcHistoricPrices();

  const { forecastModel, forecastPrices } = useAppSelector(selectForecast);

  const cachedPrices = useMemo(() => {
    if (forecastModel && forecastPrices) {
      return prices?.concat(forecastPrices);
    }
    return prices;
  }, [chartTimeFrameRange, forecastModel, prices?.length]);

  const xDomain = [] as Date[];
  if (cachedPrices?.length) {
    xDomain.push(new Date(cachedPrices[0][0]));
    xDomain.push(new Date(cachedPrices[cachedPrices.length - 1][0]));
  }

  const xRange = [margin.left, width - margin.right];
  const x = d3.scaleUtc().domain(xDomain).range(xRange);

  // this was used for grouping the brushes, but
  // that functionality was a bad user experience.
  // it was initially done to save on requests
  // because it would hit cache more.

  // default for 1D
  // let interval = d3.timeMinute.every(30);
  // if (chartTimeFrameRange === "1W") {
  //   interval = d3.timeHour.every(6);
  // } else if (chartTimeFrameRange === "1M") {
  //   interval = d3.timeHour.every(6);
  // } else if (chartTimeFrameRange === "3M") {
  //   interval = d3.timeDay.every(1);
  // } else if (chartTimeFrameRange === "1Y") {
  //   interval = d3.timeDay.every(5);
  // } else if (chartTimeFrameRange === "2Y") {
  //   interval = d3.timeDay.every(15);
  // } else if (chartTimeFrameRange === "5Y") {
  //   interval = d3.timeMonth.every(1);
  // }

  // function brushed(event: any) {
  //   if (!event.sourceEvent || !interval) return;
  //   const d0 = event.selection.map(x.invert);
  //   const d1 = d0.map(interval.round);
  //   // If empty when rounded, use floor instead.
  //   if (d1[0] >= d1[1]) {
  //     d1[0] = interval.floor(d0[0]);
  //     d1[1] = interval.offset(d1[0]);
  //   }

  //   const lastTick = x.domain()[1];
  //   if (d1[1] > lastTick) {
  //     // console.log("here", xDomain);
  //     d1[1] = xDomain[1]; // Current time
  //   }

  //   // @ts-expect-error d3 issues
  //   d3.select(this).call(brush.move, d1.map(x));
  // }

  function updateChart(brushEvent: any) {
    if (!brushEvent) {
      return;
    }
    if (brushEvent)
      if (!brushEvent.selection) {
        onReset();
      } else {
        const [x1, x2] = (brushEvent.selection || []).map(x.invert);
        if (isNaN(x1.getTime()) || isNaN(x2.getTime())) {
          return;
        }
        onChange([x1, x2]);
      }
  }

  // fix margin offsets
  const brush = d3
    .brushX()
    .extent([
      [margin.left, 1],
      [width - margin.right, height - 1],
    ])
    // .on("brush", brushed)
    .on("end", (selection: BrushSelection) => {
      currentSelecion.current = selection;
      updateChart(selection);
    });

  const xAxis = (g: any) => {
    const ticks = x.ticks(80);
    const tickFormat =
      chartTimeFrameRange === "1D"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : chartTimeFrameRange === "1W"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : chartTimeFrameRange === "1M"
        ? d3.timeFormat("%b %d, %Y")
        : chartTimeFrameRange == "3M" ||
          chartTimeFrameRange == "1Y" ||
          chartTimeFrameRange == "5Y"
        ? d3.timeFormat("%b %d, %Y")
        : d3.timeFormat("%b %d, %y");

    g.append("g")
      .call(
        //.attr("transform", `translate(0,${height - margin.bottom + 10})`)
        d3
          .axisBottom(x)
          .tickValues(ticks)
          // @ts-expect-error d3 issues
          .tickFormat(tickFormat) // Format the tick labels as needed
        // .tickSizeOuter(0)
      )
      .call((g: any) => {
        g.select(".domain").attr("stroke", "gray").attr("stroke-width", 0.5);
        g.selectAll(".tick line").attr("stroke", "gray");
      })

      .selectAll("text")
      .attr("dy", "1.5em")
      .attr("opacity", 0.5)
      .select(function () {
        // @ts-expect-error d3 issues
        return this.parentNode;
      }) // Select the parent of each text element, which is the g element of the tick
      .select("line") // Select the line of each tick
      .attr("opacity", 0.5)
      .attr("stroke-width", 1);

    g.selectAll("text")
      .filter((_: any, i: number) => {
        if (chartTimeFrameRange === "1D") {
          return i % 8 !== 0;
        }

        return i % 4 !== 0;
      }) // Filter out every other text node
      .remove();

    g.selectAll(".tick line")
      .filter((_: any, i: number) => i % 4 === 0)
      .attr("y2", 10);
  };

  const xAxisMobile = (g: any) => {
    const ticks = x.ticks(40);
    const tickFormat =
      chartTimeFrameRange === "1D"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : chartTimeFrameRange === "1W"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : chartTimeFrameRange === "1M"
        ? d3.timeFormat("%b %d, %Y")
        : chartTimeFrameRange == "3M" ||
          chartTimeFrameRange == "1Y" ||
          chartTimeFrameRange == "5Y"
        ? d3.timeFormat("%b %d, %Y")
        : d3.timeFormat("%b %d, %y");

    g.append("g")
      .call(
        //.attr("transform", `translate(0,${height - margin.bottom + 10})`)
        d3
          .axisBottom(x)
          .tickValues(ticks)
          // @ts-expect-error d3 issues
          .tickFormat(tickFormat) // Format the tick labels as needed
        // .tickSizeOuter(0)
      )
      .call((g: any) => {
        g.select(".domain").attr("stroke", "gray").attr("stroke-width", 0.5);
        g.selectAll(".tick line").attr("stroke", "gray");
      })

      .selectAll("text")
      .attr("dy", "1.5em")
      .attr("opacity", 0.5)
      .select(function () {
        // @ts-expect-error d3 issues
        return this.parentNode;
      }) // Select the parent of each text element, which is the g element of the tick
      .select("line") // Select the line of each tick
      .attr("opacity", 0.5)
      .attr("stroke-width", 1);

    g.selectAll("text")
      .filter((_: any, i: number) => {
        if (chartTimeFrameRange === "1M" || chartTimeFrameRange === "2Y") {
          return i % 6 !== 0;
        }

        return i % 12 !== 0;
      }) // Filter out every other text node
      .remove();

    g.selectAll(".tick line")
      .filter((_: any, i: number) => i % 6 === 0)
      .attr("y2", 10);
  };

  const render = () => {
    if (!prices?.length) return;
    const svg = d3.select(svgRef.current);

    if (breakpoint > 3) {
      svg.append("g").call(xAxis);
    } else {
      svg.append("g").call(xAxisMobile);
    }

    if (!forecastModel) {
      const brushSelection = svg.append("g");

      brushSelection.attr("class", "brush").call(brush);
    }
  };

  const hasPrices = (cachedPrices?.length || 0) > 0;

  useEffect(() => {
    render();

    return () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
      svg.selectAll("path").remove();
      svg.selectAll("defs").remove();
      svg.selectAll(".plot").remove();
      svg.selectAll("circle").remove();
      svg.selectAll("line").remove();
    };
  }, [hasPrices, chartTimeFrameRange, screensize, forecastModel]);

  useEffect(() => {
    // Function to execute when the window is resized
    const handleResize = debounce(() => {
      // onReset();
      setScreensize(window.innerWidth);
    }, 200);

    // Add the event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={cn("mx-4", {
        "opacity-60": !!forecastModel,
      })}
    >
      <svg
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          maxWidth: "100%",
          height: "auto",
          fontSize: 10,
        }}
        width={width}
        className="bg-white border rounded drop-shadow-lg"
        ref={svgRef}
      />
    </div>
  );
};
