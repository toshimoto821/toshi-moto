import { useEffect, useRef } from "react";
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
    useRef<d3.Selection<SVGPathElement | null, Node, SVGGElement, unknown>>();

  const nodeAlign = sankeyCenter; //sankeyJustify;
  const isHoverRef = useRef(false);

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
      <h2>${padBtcZeros(value / 100000000)} btc -> ${wallet}</h2>
      <p>${trimAddress(address)}</p>
      `;
    } else if (type === "target") {
      address = target.name;

      html = `
      <h2>${trimAddress(source.name)} -> ${padBtcZeros(
        value / 100000000
      )} btc</h2>
      <p>${trimAddress(address)}</p>
      `;
    }
    // if ()

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

  const render = () => {
    const svg = d3.select(svgRef.current);

    // Constructs and configures a Sankey generator.
    const sankey = d3Sankey()
      // @ts-expect-error d3 issues
      .nodeId((d) => d.name)
      .nodeAlign(nodeAlign) // d3.sankeyLeft, etc.
      .nodeWidth(15)
      .nodePadding(5)
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

    // Creates the paths that represent the links.
    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll()
      .data(links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    link
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => {
        const c = d3.color(d.color || "black");
        if (d.isUtxo) return c?.brighter(1);
        if (d.wallet) return d.color ?? "black";
        return "#E0E0E0"; //
      })
      // .attr("transform", "translate(-50, 0) scale(1.10, 1)")
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .on("click", onClick)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // Creates the rects that represent the nodes.
    const nodeGroup = svg.append("g").attr("stroke", "#666").selectAll();

    nodeGroup
      .data(nodes)
      .join("rect")
      .attr("stroke-width", (d: any) => {
        const targetLinkAddress = d.targetLinks.find(
          (node: any) => node.isUtxo
        );
        if (targetLinkAddress && d.type !== "tx") return 1;

        const sourceLinkAddress = d.sourceLinks.find(
          (node: any) => node.isUtxo
        );
        if (sourceLinkAddress && d.type !== "tx") return 1;
        return 0;
        ("");
      })
      .attr("x", function (d: any) {
        const x = d.x0;
        if (d.type === "tx") return x - 1;
        return x;
      })
      .attr("y", (d: any) => {
        return d.y0;
      })
      .attr("height", (d: any) => Math.max(d.y1 - d.y0, 5))
      .attr("width", (d: any) => {
        const v = d.x1 - d.x0;
        if (d.type === "tx") return v + 2;
        return v;
      })
      // .attr("fill-opacity", 0.5)
      .attr("fill", (d: any) => {
        const targetLinkAddress = d.targetLinks.find(
          (node: any) => node.isUtxo
        );

        const color = fillRect(d);
        if (color === "#cccccc") return color;

        if (targetLinkAddress && d.type !== "tx") {
          const c = d3.color(color);
          return c!.brighter().toString();
        }

        return color;
      })
      .style("cursor", "pointer")
      .on("click", onClick)
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
      .style("font-size", "10px")
      .attr("text-anchor", "middle")

      .attr("stroke", "white")
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
  };

  useEffect(() => {
    render();
    return () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
      svg.selectAll("path").remove();
    };
  }, [width, hoverCardRef, chartStartDate, chartEndDate]);

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
    <div className="relative" style={{ height: height + 40 }}>
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
