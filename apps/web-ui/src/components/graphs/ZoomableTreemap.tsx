import { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { uid } from "./graph-utils";
import { padBtcZeros, trimAddress } from "@lib/utils";
import { Wallet } from "@models/Wallet";

// https://observablehq.com/@d3/zoomable-treemap

export type Node = {
  walletId?: string;
  name: string;
  children: Node[];
  value?: number;
  unitValue?: number;
  balance?: number;
  color?: string;
};

type IZoomableTreemap = {
  width: number;
  height: number;
  btcPrice: number;
  totalBalance: number;
  totalValue: number;
  wallets: Wallet[];
  logarithmicScale: boolean;
  selectedWallets: Set<string>;
};

export const ZoomableTreemap = (props: IZoomableTreemap) => {
  const {
    width,
    height,
    btcPrice,
    logarithmicScale,
    totalBalance,
    totalValue,
    wallets,
    selectedWallets,
  } = props;

  const fader = (color: string) => d3.interpolateRgb(color, "#fff")(0.2);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10.map(fader));
  const data: Node = useMemo(
    () => ({
      name: "Wallets",
      // value: totalValue,
      balance: totalBalance,
      children: wallets
        .map((wallet) => {
          return {
            walletId: wallet.id,
            name: wallet.name,
            balance: wallet.balance,
            color: colorScale(wallet.name),
            children: wallet.listUtxos.map((utxo) => {
              return {
                name: utxo.address,
                balance: utxo.balance,
                value: logarithmicScale
                  ? Math.log(utxo.balance * 1000) //
                  : utxo.balance * 1000,
                color: colorScale(wallet.name),
              } as Node;
            }),
          } as Node;
        })
        .filter((wallet) => selectedWallets.has(wallet.walletId!)),
    }),
    [
      wallets.length,
      totalBalance,
      totalValue,
      logarithmicScale,
      selectedWallets.size,
    ]
  );

  const svgRef = useRef<SVGSVGElement>(null);
  // const data: Node = rawData;
  // This custom tiling function adapts the built-in binary tiling function
  // for the appropriate aspect ratio when the treemap is zoomed-in.
  function tile(node: any, x0: number, y0: number, x1: number, y1: number) {
    d3.treemapBinary(node, 0, 0, width, height);
    for (const child of node.children) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0);
      child.x1 = x0 + (child.x1 / width) * (x1 - x0);
      child.y0 = y0 + (child.y0 / height) * (y1 - y0);
      child.y1 = y0 + (child.y1 / height) * (y1 - y0);
    }
  }

  const renderTreemap = () => {
    const svg = d3.select(svgRef.current);
    // Compute the layout.

    const hierarchy = d3
      .hierarchy<Node>(data)
      .sum((d) => d.value!)
      .sort((a, b) => b.value! - a.value!);

    const root = d3.treemap<Node>().tile(tile)(hierarchy);

    // Create the scales.
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

    // Formatting utilities.
    const format = d3.format(",d");
    const name = (d: any) =>
      d
        .ancestors()
        .reverse()
        .map((d: any) => d.data.name)
        .join("/");

    // Create the SVG container.

    // Display the root.
    let group = svg.append("g").call(render, root);

    function render(group: any, root: any) {
      const node = group
        .selectAll("g")
        .data(root.children.concat(root))
        .join("g");

      node
        .filter((d: any) => (d === root ? d.parent : d.children))
        .attr("cursor", "pointer")
        .on("click", (_event: any, d: any) =>
          d === root ? zoomout(root) : zoomin(d)
        );

      node
        .append("title")
        .text((d: any) => `${name(d)}\n${format(d.data.balance * btcPrice)}`);

      node
        .append("rect")
        .attr("id", (d: any) => (d.leafUid = uid("leaf")).id)
        .attr("fill", (d: any) => {
          // console.log(d.data.walletName);
          return d === root ? "#fff" : d.data.color;
        })
        .attr("stroke", "#fff");

      node
        .append("clipPath")
        .attr("id", (d: any) => (d.clipUid = uid("clip")).id)
        .append("use")
        .attr("xlink:href", (d: any) => d.leafUid.href);

      node
        .append("text")
        .attr("clip-path", (d: any) => d.clipUid)
        .attr("font-weight", (d: any) => (d === root ? "bold" : null))
        .attr("fill", (d: any) => (d === root ? "#000" : "#fff"))
        .selectAll("tspan")
        .data((d: any) => {
          const v =
            d === root
              ? name(d)
              : d.children
              ? d.data.name
              : trimAddress(d.data.name);

          const val = [v].concat(
            padBtcZeros(d.data.balance) +
              " / " +
              "$" +
              format(d.data.balance * btcPrice)
          );
          return val;
        })
        .join("tspan")
        .attr("x", 3)
        .attr("y", (_d: any, i: number, nodes: any) => {
          return `${(nodes.length - 1) * 0.3 + 1.1 + i}em`;
        })
        .attr("fill-opacity", (_d: any, i: number, nodes: any) =>
          i === nodes.length - 1 ? 0.7 : null
        )
        .attr("font-weight", (_d: any, i: number, nodes: any) =>
          i === nodes.length - 1 ? "normal" : null
        )
        .text((d: any) => d);

      group.call(position, root);
    }

    function position(group: any, root: any) {
      group
        .selectAll("g")
        .attr("transform", (d: any) => {
          // console.log(d, "transform");
          return d === root
            ? `translate(0,-30)`
            : `translate(${x(d.x0)},${y(d.y0)})`;
        })
        .select("rect")
        .attr("width", (d: any) => (d === root ? width : x(d.x1) - x(d.x0)))
        .attr("height", (d: any) => (d === root ? 30 : y(d.y1) - y(d.y0)));
    }

    // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d: any) {
      const group0 = group.attr("pointer-events", "none");
      const group1 = (group = svg.append("g").call(render, d));

      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      svg
        .transition()
        .duration(750)
        .call((t: any) =>
          group0.transition(t).remove().call(position, d.parent)
        )
        .call((t: any) =>
          // @ts-ignore
          group1
            .transition(t)
            // @ts-ignore
            .attrTween("opacity", () => d3.interpolate(0, 1))
            .call(position, d)
        );
    }

    // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d: any) {
      const group0 = group.attr("pointer-events", "none");
      const group1 = (group = svg.insert("g", "*").call(render, d.parent));

      x.domain([d.parent.x0, d.parent.x1]);
      y.domain([d.parent.y0, d.parent.y1]);

      svg
        .transition()
        .duration(750)
        .call((t: any) =>
          // @ts-ignore
          group0
            .transition(t)
            .remove()
            // @ts-ignore
            .attrTween("opacity", () => d3.interpolate(1, 0))
            .call(position, d)
        )
        // @ts-ignore
        .call((t) => group1.transition(t).call(position, d.parent));
    }
  };

  useEffect(() => {
    if (width > 0 && height > 0) {
      renderTreemap();
    }

    return () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("g").remove();
    };
  }, [height, width, btcPrice, data]);
  return (
    <svg
      height={height}
      viewBox={[0.5, -30.5, width, height].join(",")}
      style={{ maxWidth: "100%", height: "auto", fontSize: 10 }}
      width={width}
      ref={svgRef}
    />
  );
};
