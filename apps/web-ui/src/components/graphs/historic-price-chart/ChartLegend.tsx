/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { type BrushSelection, scaleBand } from "d3";
import debounce from "lodash/debounce";
import { useBreakpoints } from "@root/lib/hooks/useBreakpoints";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectForecast } from "@root/lib/slices/price.slice";
import { selectOrAppend } from "../line/d3.utils";
import type { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import { getNumBuffer, addBufferItems } from "./hero-chart.utils";

type IChartLegendProps = {
  height: number;
  width: number;
  onChange: (range: [BinanceKlineMetric, BinanceKlineMetric]) => void;
  onReset: () => void;
  onBrushMove?: (klines: [BinanceKlineMetric, BinanceKlineMetric]) => void;
  onBrushEnd?: (klines: [BinanceKlineMetric, BinanceKlineMetric]) => void;
};
export const ChartLegend = ({
  height,
  width,
  onChange,
  onReset,
  onBrushMove,
}: IChartLegendProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const breakpoint = useBreakpoints();
  const [screensize, setScreensize] = useState(window.innerWidth);
  const currentSelecion = useRef<BrushSelection | null>(null);
  const { prices, loading, range: _rangeFromApi } = useBtcHistoricPrices();

  const { forecastModel } = useAppSelector(selectForecast);

  const previousGraphTimeFrameRange = useAppSelector(
    (state) => state.ui.previousGraphTimeFrameRange
  );

  const range = _rangeFromApi || previousGraphTimeFrameRange;

  // const cachedPrices = useMemo(() => {
  //   if (forecastModel && forecastPrices) {
  //     return prices?.concat(forecastPrices);
  //   }
  //   return prices;
  // }, [group, forecastModel, len > 0, previousGraphTimeFrameRange, range]);

  const cachedPrices = [...(prices || [])];
  const numBuffer = getNumBuffer(cachedPrices.length, breakpoint);
  if (cachedPrices.length) {
    addBufferItems(cachedPrices, numBuffer);
  }
  const xDomain = [] as Date[];
  if (cachedPrices?.length) {
    const firstPrice = cachedPrices[0];
    const openTime = firstPrice.openTime;
    xDomain.push(new Date(openTime));
    const lastPrice = cachedPrices[cachedPrices.length - 1];
    const lastCloseTime = lastPrice.closeTime;
    xDomain.push(new Date(lastCloseTime));
  }

  // const xRange = [margin.left, width - margin.right];
  // const x = d3.scaleUtc().domain(xDomain).range(xRange);

  const xScale = scaleBand()
    // prices = [date, price, volume]
    .domain((cachedPrices || []).map((_, i) => i.toString()))
    .range([margin.left, width - margin.right])
    .padding(0);

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
        if (!brushEvent.sourceEvent.reset) {
          onReset();
        }
      } else {
        const [x0, x1] = brushEvent.selection;

        const startIndex = Math.floor(x0 / xScale.step());
        const endIndex = Math.ceil(x1 / xScale.step()) - 1;

        let k1: BinanceKlineMetric | null = null;
        let k2: BinanceKlineMetric | null = null;
        if (cachedPrices?.length) {
          k1 = cachedPrices[startIndex];
          k2 = cachedPrices[endIndex];
          if (!k2) {
            k2 = cachedPrices[cachedPrices.length - 1];
          }
          onChange([k1, k2]);
        }
      }
  }

  // fix margin offsets
  // const interval = d3.timeMinute.every(30);
  const brush = d3
    .brushX()
    .extent([
      [margin.left, 1],
      [width - margin.right, height],
    ])
    .on("brush", (event: any) => {
      if (onBrushMove && event.selection) {
        // let interval = d3.timeMinute.every(30);
        // const d0 = event.selection.map(xScale.invert);
        // const d1 = d0.map(interval.round);
        const [x0, x1] = event.selection;

        const startIndex = Math.floor(x0 / xScale.step());
        const endIndex = Math.ceil(x1 / xScale.step()) - 1;

        let k1: BinanceKlineMetric | null = null;
        let k2: BinanceKlineMetric | null = null;
        if (cachedPrices?.length) {
          k1 = cachedPrices[startIndex];
          k2 = cachedPrices[endIndex];
          if (!k2) {
            k2 = cachedPrices[cachedPrices.length - 1];
          }
          onBrushMove([k1, k2]);
        }
      }
    })
    // .on("brush", brushed)
    .on("end", function (event: any) {
      currentSelecion.current = event;

      updateChart(event);
      // @todo bind to response in some way?
      // setTimeout(() => {
      if (!event.sourceEvent?.reset) {
        setTimeout(() => {
          // @ts-expect-error d3 issues
          d3.select(this).call(brush.move, null, { reset: true });
        }, 2000);
      }
      // }, 2000);
      // if (onBrushEnd && event.selection) {
      //   // const [x1, x2] = (event.selection || []).map(x.invert);
      //   const [x0, x1] = event.selection;

      //   const startIndex = Math.floor(x0 / xScale.step());
      //   const endIndex = Math.ceil(x1 / xScale.step()) - 1;
      //   let k1: BinanceKlineMetric | null = null;
      //   let k2: BinanceKlineMetric | null = null;
      //   if (cachedPrices?.length) {
      //     k1 = cachedPrices[startIndex];
      //     k2 = cachedPrices[endIndex];
      //     if (!k2) {
      //       k2 = cachedPrices[cachedPrices.length - 1];
      //     }
      //     onBrushEnd([k1, k2]);
      //   }
      //   // @todo pickup here
      //   // setTimeout(() => {
      //   //   d3.select(this).call(brush.move, null);
      //   // }, 5000);
      // }
      //
    });

  const xAxis = (g: any) => {
    // const ticks = (cachedPrices || []).map((d) => d[0]);
    const tickFormat =
      range === "1D"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : range === "1W"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : d3.timeFormat("%b %d, %Y");

    const el: any = selectOrAppend(g, "#g-x-tick", "g", { id: "g-x-tick" });

    // el.selectAll("*").remove();
    el.attr("data-range-type", range);
    el.call(
      //.attr("transform", `translate(0,${height - margin.bottom + 10})`)
      d3
        .axisBottom(xScale)
        // .tickValues(ticks)
        // @ts-expect-error d3 issues
        .tickFormat((d, i) => tickFormat(new Date(cachedPrices![i].openTime))) // Format the tick labels as needed
        .ticks(xScale.domain().length)
      // .tickSizeOuter(1)
    )
      .call((g: any) => {
        g.selectAll(".tick").attr("opacity", (_: any, i: number) => {
          if (i < 5) return 0;
          if (i > cachedPrices.length - numBuffer) return 0;
          return 1;
        });
        g.select(".domain").remove(); //attr("stroke", "gray").attr("stroke-width", 0.5);
        g.selectAll(".tick line").attr("stroke", "gray");
      })
      // .attr("transform", `translate(0, ${height - margin.bottom})`) // Move the axis to the bottom

      .selectAll("text")
      .attr("dy", "1.5em")
      .attr("opacity", 0.5)
      .select(function () {
        // @ts-expect-error d3 issues
        return this.parentNode;
      }) // Select the parent of each text element, which is the g element of the tick
      .select("line") // Select the line of each tick
      .attr("opacity", 0.5)
      .attr("stroke-width", 1)
      .style("font-size", "12px") // Ensure consistent font size
      .style("font-family", "Arial, sans-serif"); // Ensure consistent font family
    // .attr("transform", `translate(${-xScale.bandwidth() / 2 - 0}, 0)`); // Shift ticks to the left by half the bar width

    g.selectAll("text")
      // .attr("transform", `translate(${-xScale.bandwidth() / 2 - 0}, 0)`) // Shift ticks to the left by half the bar width
      .attr("display", "")
      .filter((_: any, i: number) => {
        if (range === "1D") {
          return i % 8 !== 0;
        }

        if (range === "1W") {
          return i % 8 !== 0;
        }

        if (range === "1M") {
          return i % 8 !== 0;
        }

        if (range === "3M") {
          return i % 8 !== 0;
        }

        if (range === "1Y") {
          return i % 8 !== 0;
        }

        if (range === "2Y") {
          return i % 8 !== 0;
        }

        if (range === "5Y") {
          return i % 12 !== 0;
        }

        return i % 4 !== 0;
      }) // Filter out every other text node
      .attr("display", "none");

    g.selectAll(".tick line")
      .attr("transform", `translate(0, ${height - 6})`)
      .filter((_: any, i: number) => {
        if (range === "3M") {
          return i % 8 === 0;
        }
        return i % 4 === 0;
      })
      .attr("transform", `translate(0, ${height - 10})`)
      .attr("y2", 10);

    g.selectAll(".tick line")
      .filter((_: any, i: number) => {
        if (range === "3M") {
          return i % 4 === 0;
        }

        return i % 4 != 0;
      })
      .attr("opacity", 0.25);
  };

  const xAxisMobile = (g: any) => {
    // const ticks = x.ticks(40);
    const tickFormat =
      range === "1D"
        ? d3.timeFormat("%b %d, %I:%M %p")
        : range === "1W"
        ? d3.timeFormat("%m/%d, %I %p")
        : range === "1M"
        ? d3.timeFormat("%b %d, %Y")
        : range == "3M" || range == "1Y" || range == "5Y"
        ? d3.timeFormat("%b %d, %Y")
        : d3.timeFormat("%b %d, %y");

    const el: any = selectOrAppend(g, "#g-x-tick", "g", { id: "g-x-tick" });
    el.call(
      //.attr("transform", `translate(0,${height - margin.bottom + 10})`)
      d3
        .axisBottom(xScale)

        // .tickValues(ticks)
        // @ts-expect-error d3 issues

        .tickFormat((d, i) => tickFormat(new Date(cachedPrices[i].openTime))) // Format the tick labels as needed
        .ticks(xScale.domain().length)
      // .tickSizeOuter(0)
    )
      .call((g: any) => {
        g.selectAll(".tick").attr("opacity", (_: any, i: number) => {
          if (i < numBuffer) return 0;
          if (i > cachedPrices.length - numBuffer - 1) return 0;
          return 1;
        });
        g.select(".domain").remove(); //.attr("stroke", "gray").attr("stroke-width", 0.5);
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

    const nodes = g.selectAll("text");

    nodes
      .attr("display", "")
      .filter((_: any, i: number) => {
        if (range === "1D") {
          return i % 8 !== 0;
        }

        if (range === "1W") {
          return i % 6 !== 0;
        }

        if (range === "1M") {
          return i % 7 !== 0;
        }

        if (range === "3M") {
          return i % 10 !== 0;
        }

        if (range === "1Y") {
          return i % 13 !== 0;
        }

        if (range === "2Y") {
          return i % 12 !== 0;
        }

        if (range === "5Y") {
          return i % 12 !== 0;
        }

        return i % 24 !== 0;
      }) // Filter out every other text node
      .attr("display", "none");

    g.selectAll(".tick line")
      .attr("transform", `translate(0, ${height - 6})`)
      .filter((_: any, i: number) => {
        if (range === "1D") {
          return i % 8 === 0;
        }
        if (range === "1W") {
          return i % 6 === 0;
        }

        if (range === "1M") {
          return i % 7 === 0;
        }

        if (range === "3M") {
          return i % 10 === 0;
        }

        if (range === "1Y") {
          return i % 13 === 0;
        }

        if (range === "2Y") {
          return i % 12 === 0;
        }

        if (range === "5Y") {
          return i % 12 === 0;
        }

        return i % 8 === 0;
      })
      .attr("transform", `translate(0, ${height - 10})`)
      .attr("y2", 10);
  };

  const render = () => {
    if (!cachedPrices?.length) return;
    const svg = d3.select(svgRef.current);

    // only repain the chart if the graphTimeFrameRange is not null.
    // it gets set to null when user drags on brush
    // if (graphTimeFrameRange) {
    if (breakpoint > 3) {
      selectOrAppend(svg, "#x-g", "g", { id: "x-g" }).call(xAxis);
    } else {
      selectOrAppend(svg, "#x-g", "g", { id: "x-g" }).call(xAxisMobile);
    }
    // }

    if (!forecastModel) {
      // const brushSelection = svg.append("g");
      const brushSelection: d3.Selection<
        SVGGElement,
        unknown,
        null,
        undefined
      > = selectOrAppend(svg, "#brush-g", "g", {
        id: "brush-g",
      });
      brushSelection.attr("class", "brush").call(brush);
    }
  };

  const hasPrices = (cachedPrices?.length || 0) > 0;

  // useEffect(() => {
  //   if (graphTimeFrameRange) {
  //     const svg = d3.select(svgRef.current);
  //     const brushSelection: d3.Selection<
  //       SVGGElement,
  //       unknown,
  //       null,
  //       undefined
  //     > = svg.select("#brush-g");
  //     brushSelection.call(brush.move, null);
  //   }
  // }, [graphTimeFrameRange, chartTimeFrameRange]);

  useEffect(() => {
    render();
    // const svg = d3.select(svgRef.current);
    return () => {
      // const brushSelection: d3.Selection<
      //   SVGGElement,
      //   unknown,
      //   null,
      //   undefined
      // > = svg.select("#brush-g");
      // brushSelection.call(brush.move, null);
      // const svg = d3.select(svgRef.current);
      // svg.selectAll("g").remove();
      // svg.selectAll("text").remove();
      // svg.selectAll("path").remove();
      // svg.selectAll("defs").remove();
      // svg.selectAll(".plot").remove();
      // svg.selectAll("circle").remove();
      // svg.selectAll("line").remove();
    };
  }, [loading, hasPrices, screensize, forecastModel, range, prices?.length]);

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
    <div className="opacity-80">
      <svg
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          height: "auto",
          fontSize: 10,
        }}
        width={width}
        className="bg-white border-b  border-gray-300"
        ref={svgRef}
      />
    </div>
  );
};
