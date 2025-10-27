import { useEffect, useRef, useCallback } from "react";
import * as React from "react";
import * as d3 from "d3";
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyCenter,
} from "d3-sankey";
import { trimAddress } from "@lib/utils";
import { padBtcZeros } from "@lib/utils";
import { GraphHoverCard } from "./GraphHoverCard";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@lib/slices/ui.slice";

type ISankey = {
  data: {
    nodes: Node[];
    links: Link[];
  };
  width: number;
  height: number;
  onClick?: (type: "address" | "tx", value: string) => void;
  selectedTxs: string[];
  index: number;
};

export type Node = {
  name: string;
  type?: string;
  color?: string;
  date?: number;
  addressIndex?: number | string;
};
type Link = {
  source: string;
  target: string;
};

const symbolToUse = d3.symbol().type(d3.symbolTriangle);
const triangle = symbolToUse.size(1200)();

export const deserialize = (str: string) => {
  const parts = str.split(";");
  return parts.reduce((acc, curr) => {
    const [key, value] = curr.split(":");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
};
export const Sankey = ({
  data,
  width,
  height,
  onClick: onClickGraph,
  selectedTxs = [],
  index,
}: ISankey) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);

  const { graphStartDate: chartStartDate, graphEndDate: chartEndDate } =
    useAppSelector(selectUI);

  const selectedElements =
    useRef<d3.Selection<SVGPathElement | null, Node, SVGGElement, unknown>>(
      null
    );

  const nodeAlign = sankeyCenter; //sankeyJustify;
  const isHoverRef = useRef(false);
  const [isDarkMode, setIsDarkMode] = React.useState(
    document.documentElement.classList.contains("dark")
  );

  const mouseover = function () {
    // was setting opacity here but the problem is
    // auto scroll can trigger mouse over with no mouse move
    // so it created an empty box
    isHoverRef.current = true;
  };
  const mousemove = function (evt: any, d: any) {
    const Tooltip = d3.select(hoverCardRef.current);

    if (!Tooltip) return;
    Tooltip.style("opacity", 1);

    const [x, y] = d3.pointer(evt);

    const { source, target, type, wallet = "Unknown Wallet", value } = d;

    let left;
    if (x > width / 2) {
      left = x - 40 - Tooltip.node()!.offsetWidth;
    } else {
      left = x + 20;
    }
    let address = "";
    let html = "";
    if (type === "source") {
      address = source.name;
      html = `
      <div class="text-sm font-semibold mb-1">${padBtcZeros(
        value / 100000000
      )} BTC</div>
      <div class="text-xs text-gray-300">${wallet}</div>
      <div class="text-xs text-gray-400 mt-1 font-mono">${trimAddress(
        address
      )}</div>
      `;
    } else if (type === "target") {
      address = target.name;

      html = `
      <div class="text-sm font-semibold mb-1">${padBtcZeros(
        value / 100000000
      )} BTC</div>
      <div class="text-xs text-gray-300">${
        wallet !== "Unknown Wallet" ? wallet : "Output"
      }</div>
      <div class="text-xs text-gray-400 mt-1 font-mono">${trimAddress(
        address
      )}</div>
      `;
    }
    // if ()

    Tooltip.html(html)
      .style("left", left + "px")
      .style("top", y + 20 + "px");
  };

  const mousemoveNode = function (evt: any, d: any) {
    const Tooltip = d3.select(hoverCardRef.current);

    if (!Tooltip) return;
    Tooltip.style("opacity", 1);

    const [x, y] = d3.pointer(evt);

    let left;
    if (x > width / 2) {
      left = x - 40 - Tooltip.node()!.offsetWidth;
    } else {
      left = x + 20;
    }

    let html = "";

    // Calculate total value for this node
    const totalIn =
      d.targetLinks?.reduce(
        (sum: number, link: any) => sum + (link.value || 0),
        0
      ) || 0;
    const totalOut =
      d.sourceLinks?.reduce(
        (sum: number, link: any) => sum + (link.value || 0),
        0
      ) || 0;
    const totalValue = Math.max(totalIn, totalOut);

    if (d.type === "tx") {
      html = `
      <div class="text-sm font-semibold mb-1">Transaction</div>
      <div class="text-xs text-gray-400 mt-1 font-mono">${trimAddress(
        d.name
      )}</div>
      `;
    } else {
      // Regular address node
      const wallet =
        d.sourceLinks?.[0]?.wallet || d.targetLinks?.[0]?.wallet || "Unknown";
      html = `
      <div class="text-sm font-semibold mb-1">${padBtcZeros(
        totalValue / 100000000
      )} BTC</div>
      <div class="text-xs text-gray-300">${
        wallet !== "Unknown" ? wallet : "Address"
      }</div>
      <div class="text-xs text-gray-400 mt-1 font-mono">${trimAddress(
        d.name
      )}</div>
      `;
    }

    Tooltip.html(html)
      .style("left", left + "px")
      .style("top", y + 20 + "px");
  };

  const fillRect = (d: any) => {
    const targetLinkAddress = d.targetLinks?.find((node: any) => node.isUtxo);
    // tx are all gray for now
    if (targetLinkAddress) return targetLinkAddress.color ?? "black"; // if no color use black to show error
    //color(targetLinkAddress.wallet);

    const sourceLinkAddress = d.sourceLinks?.find((node: any) => node.isUtxo);

    if (sourceLinkAddress) return sourceLinkAddress.color ?? "black";
    // color(sourceLinkAddress.wallet);

    const sourceWallet = d.sourceLinks?.find((node: any) => node.wallet);
    if (sourceWallet && d.type !== "tx") return sourceWallet.color ?? "black";

    const targetWallet = d.targetLinks?.find((node: any) => node.wallet);
    if (targetWallet && d.type !== "tx") return targetWallet.color; //color(targetWallet.wallet);

    return "#cccccc";
  };

  const mouseleave = function () {
    const Tooltip = d3.select(hoverCardRef.current);

    Tooltip.style("opacity", 0);

    // mouseleaveRect.call(this);
  };

  const onClick = (_: any, d: any) => {
    const { source } = d;
    let txid;
    let address;
    if (d.type === "tx") {
      txid = d.name;
      if (onClickGraph) {
        onClickGraph("tx", txid);
      }
      return;
    }

    if (d.type === "node") {
      address = d.name;
    } else {
      address = source.name;
    }
    if (onClickGraph && d.color && d.type === "node") {
      onClickGraph("address", address);
    }
  };

  const render = useCallback(() => {
    const svg = d3.select(svgRef.current);

    // Constructs and configures a Sankey generator.
    const sankey = d3Sankey()
      // @ts-expect-error d3 issues
      .nodeId((d) => d.name)
      .nodeAlign(nodeAlign) // d3.sankeyLeft, etc.
      .nodeWidth(20)
      .nodePadding(10)
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    // Applies it to the data. We make a copy of the nodes and links objects
    // so as to avoid mutating the original.
    const { nodes, links } = sankey({
      // @ts-expect-error d3 issues
      nodes: data.nodes.map((d) => Object.assign({}, d)),
      // @ts-expect-error d3 issues
      links: data.links.map((d) => Object.assign({}, d)),
    });

    // Use the isDarkMode state
    const isDark = isDarkMode;

    // Creates the paths that represent the links.
    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("g")
      .style("mix-blend-mode", isDark ? "screen" : "multiply");

    link
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => {
        const c = d3.color(d.color || (isDark ? "#666" : "#ccc"));
        if (d.isUtxo) return c?.brighter(isDark ? 1.5 : 1).toString();
        if (d.wallet) return d.color ?? (isDark ? "#666" : "#ccc");
        return isDark ? "#444" : "#E0E0E0";
      })
      .attr("stroke-width", (d: any) => Math.max(2, d.width))
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .on("click", onClick)
      .on("mouseover", function (this: any) {
        mouseover.call(this);
        d3.select(this).attr("stroke-opacity", 0.9);
      })
      .on("mousemove", mousemove)
      .on("mouseleave", function (this: any) {
        mouseleave.call(this);
        d3.select(this).attr("stroke-opacity", 0.6);
      });

    // Creates the rects that represent the nodes.
    const nodeGroup = svg
      .append("g")
      .attr("stroke", isDark ? "#888" : "#666")
      .selectAll();

    nodeGroup
      .data(nodes)
      .join("rect")
      .attr("stroke-width", (d: any) => {
        const targetLinkAddress = d.targetLinks.find(
          (node: any) => node.isUtxo
        );
        if (targetLinkAddress && d.type !== "tx") return 2;

        const sourceLinkAddress = d.sourceLinks.find(
          (node: any) => node.isUtxo
        );
        if (sourceLinkAddress && d.type !== "tx") return 2;
        return 0;
      })
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("x", function (d: any) {
        const x = d.x0;
        if (d.type === "tx") return x - 1;
        return x;
      })
      .attr("y", (d: any) => {
        return d.y0;
      })
      .attr("height", (d: any) => Math.max(d.y1 - d.y0, 8))
      .attr("width", (d: any) => {
        const v = d.x1 - d.x0;
        if (d.type === "tx") return v + 2;
        return v;
      })
      .attr("fill", (d: any) => {
        const targetLinkAddress = d.targetLinks.find(
          (node: any) => node.isUtxo
        );

        const color = fillRect(d);
        if (color === "#cccccc") return isDark ? "#555" : color;

        if (targetLinkAddress && d.type !== "tx") {
          const c = d3.color(color);
          return c!.brighter(isDark ? 0.5 : 1).toString();
        }

        return color;
      })
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .on("click", onClick)
      .on("mouseover", function (this: any) {
        mouseover.call(this);
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mousemove", mousemoveNode)
      .on("mouseleave", function (this: any) {
        mouseleave.call(this);
        d3.select(this).attr("opacity", 1);
      })
      .append("title")
      .text((d: any) => {
        return d.name;
      });

    const filteredNodes = nodes.filter((d: any) => d.type === "tx");

    selectedElements.current = nodeGroup
      .data<Node>(filteredNodes as Node[])
      .join("path")
      .attr("d", triangle)
      .attr("transform", (d: any) => {
        // const v = d.x1 - d.x0;
        const x = d.x1; // - v;
        const y = (d.y0 + d.y1) / 2;
        return `translate(${x}, ${y}) rotate(90)`;
      })

      .attr("stroke-opacity", 1)
      .attr("stroke-width", 0)

      .attr("fill", (d) => d.color!)
      .style("cursor", "pointer")
      .on("click", function (...args) {
        onClick.apply(this, args);
      });

    nodeGroup
      .data<Node>(filteredNodes as Node[])
      .join("rect")
      .attr("x", (d: any) => {
        return d.x1 - 30; // - v;
      })
      .attr("fill", (d) => d.color!)
      .attr("y", (d: any) => (d.y0 + d.y1) / 2 - 12)
      .attr("height", 24)
      .attr("width", 30)
      .style("cursor", "pointer")
      .on("click", onClick)
      .attr("stroke", "none");
    nodeGroup
      .data<Node>(filteredNodes as Node[])
      .join("text")
      .attr("x", (d: any) => {
        return d.x1; // - v;
      })
      .attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("fill", isDark ? "#fff" : "#fff")
      .attr("stroke", "none")
      .style(
        "text-shadow",
        isDark ? "0 1px 3px rgba(0,0,0,0.8)" : "0 1px 2px rgba(0,0,0,0.5)"
      )
      .style("pointer-events", "none")
      .text((d) => {
        // const v = i + 1;
        return `${d.addressIndex}.${index + 1}`;
      });

    // Adds labels on the nodes.
    svg
      .append("g")
      .selectAll()
      .data(nodes)
      .join("text")
      .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => {
        return (d.y1 + d.y0) / 2;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "start" : "end"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, width, height, isDarkMode, index]);

  // Watch for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Create observer to watch for class changes on documentElement
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    render();
    return () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
      svg.selectAll("path").remove();
    };
  }, [render, chartStartDate, chartEndDate]);

  useEffect(() => {
    if (selectedElements.current) {
      // const els = selectedElements.current.filter((d: Node) => {
      //   return selectedTxs.has(d.name);
      // }
      selectedElements.current
        .transition()
        .duration(200)
        .attr("d", (d: Node) => {
          const size = selectedTxs.includes(d.name) ? 2000 : 1200;
          return symbolToUse.size(size)();
        })
        .attr("transform", function (d: any) {
          // const v = d.x1 - d.x0;
          const padding = selectedTxs.includes(d.name) ? 20 : 15;
          const x = d.x1 + padding; // - v;
          const y = (d.y0 + d.y1) / 2;

          return `translate(${x}, ${y}) rotate(90)`;
        });
      // .attr("fill", "white");
    }
  }, [selectedTxs]);

  return (
    <div
      className="relative bg-white dark:bg-[#0a0a0a] rounded-lg p-4"
      style={{ height: height + 40 }}
    >
      <GraphHoverCard ref={hoverCardRef} />
      <svg
        height={height + 40}
        viewBox={[0, 0, width, height].join(",")}
        style={{ maxWidth: "100%", fontSize: "10 sans-serif" }}
        width={width}
        ref={svgRef}
      />
    </div>
  );
};
