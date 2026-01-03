import { useRef, useEffect, useMemo, useState } from "react";
import { select } from "d3";
import { useBtcHistoricPrices } from "@lib/hooks/useBtcHistoricPrices";
import { useNumberObfuscation } from "@lib/hooks/useNumberObfuscation";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { useChartData } from "@lib/hooks/useChartData";
import { useWallets } from "@lib/hooks/useWallets";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { setUI, selectDarkMode } from "@root/lib/slices/ui.slice";
import {
  addBufferItems,
  BUFFER_LENGTH,
  createBufferedData,
} from "./hero-chart.utils";
import type { IHeroChart } from "./hero-chart.types";
import { DEFAULT_MARGIN, SELECTED_OPACITY } from "./hero-chart.constants";
import { createGradients } from "./hero-chart.gradients";
import { createChartScales } from "./hero-chart.scales";
import {
  renderBtcArea,
  renderPriceArea,
  renderPriceLine,
  renderInteractiveBars,
  renderCrosshairs,
  renderIndicatorDots,
  renderPlotData,
  renderCurrentPriceLine,
  renderBtcLine,
  renderY2Axis,
  renderY1Axis,
} from "./hero-chart.renderers";
import {
  createMouseMoveHandler,
  createMouseLeaveHandler,
  createBarClickHandler,
} from "./hero-chart.interactions";

export { SELECTED_OPACITY as SELECTED_OPACITIY };

/**
 * HeroChart - Main chart component for displaying Bitcoin price history and portfolio value
 *
 * This component renders a complex D3-based chart with multiple layers:
 * - Price area and line charts
 * - BTC allocation visualization
 * - Interactive crosshairs and tooltips
 * - Transaction plot points
 * - Dual Y-axes (price and BTC amount)
 *
 * @param props - Chart configuration and event handlers
 */
export const HeroChart = (props: IHeroChart) => {
  const {
    height,
    width,
    suppressEvents = false,
    suppressLegengs = false,
    onMouseOver,
    id = "hero-chart",
  } = props;

  // ============================================================================
  // REFS & HOOKS
  // ============================================================================
  const svgRef = useRef<SVGSVGElement>(null);
  const isMouseInteracting = useRef(false);
  const dispatch = useAppDispatch();

  // ============================================================================
  // DATA HOOKS
  // ============================================================================
  const { btcPrice } = useBtcPrice();
  const { wallets } = useWallets();
  const privateNumber = useNumberObfuscation();
  const { prices, loading, range, group, from, to } = useBtcHistoricPrices();
  const { lineData, plotData } = useChartData({ btcPrice, wallets });

  // ============================================================================
  // STATE SELECTORS
  // ============================================================================
  const {
    selectedWalletId,
    graphIsLocked: isLocked,
    graphSelectedIndex: selectedIndex,
    graphSelectedTransactions,
    graphBtcAllocation,
    graphShowAxisLines,
    displayMode,
  } = useAppSelector((state) => state.ui);
  const darkMode = useAppSelector(selectDarkMode);
  const [lastDarkMode, setLastDarkMode] = useState(darkMode);

  // ============================================================================
  // DATA PREPARATION
  // ============================================================================
  const margin = DEFAULT_MARGIN;
  const numBuffer = BUFFER_LENGTH;

  // Memoize buffered data to prevent unnecessary recalculations
  const data = useMemo(() => {
    return createBufferedData(prices || []);
  }, [prices]);

  // Memoize buffered line data (create a copy to avoid mutation)
  const bufferedLineData = useMemo(() => {
    if (lineData.length === 0) return [];
    const lineDataCopy = [...lineData];
    addBufferItems(lineDataCopy, numBuffer);
    return lineDataCopy;
  }, [lineData, numBuffer]);

  const lastPrice = data[data.length - 1] || {};
  const lastRawNode = bufferedLineData[bufferedLineData.length - 1] || {};

  // ============================================================================
  // CHART CONFIGURATION
  // ============================================================================
  const yValueToUse: "y1SumInDollars" | "y2" =
    displayMode !== "standard" ? "y1SumInDollars" : "y2";

  // Memoize scales to prevent unnecessary recalculations
  const { xScale, yScale, btcScale } = useMemo(
    () =>
      createChartScales(
        data,
        bufferedLineData,
        width,
        height,
        margin,
        displayMode,
        yValueToUse
      ),
    [data, bufferedLineData, width, height, margin, displayMode, yValueToUse]
  );

  // Calculate price direction for styling
  const firstMetric = data[0];
  const lastMetric = data[data.length - 1];
  const direction =
    lastMetric &&
    firstMetric &&
    parseFloat(lastMetric.closePrice) > parseFloat(firstMetric.openPrice)
      ? 1
      : -1;

  // Check if user has zero BTC
  const hasZeroBtc = bufferedLineData.every((d) => d.y1Sum === 0);

  // ============================================================================
  // RENDER EFFECT
  // ============================================================================
  useEffect(() => {
    /**
     * Main render function - orchestrates all chart rendering
     */
    const render = () => {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      if (data.length === 0) {
        return; // Early return if no data
      }

      // Create SVG gradients
      createGradients(svg, id);

      // Render BTC allocation area (if enabled)
      if (graphBtcAllocation && bufferedLineData.length) {
        renderBtcArea(svg, bufferedLineData, xScale, btcScale, height, id);
      }

      // Render main price area
      const chartData = displayMode !== "standard" ? bufferedLineData : data;
      renderPriceArea(
        svg,
        chartData,
        xScale,
        yScale,
        height,
        displayMode,
        yValueToUse,
        numBuffer,
        direction,
        id
      );

      // Render interactive bars
      renderInteractiveBars(
        svg,
        chartData,
        xScale,
        height,
        selectedIndex,
        numBuffer,
        direction,
        id
      );

      // Render main price line
      renderPriceLine(
        svg,
        chartData,
        xScale,
        yScale,
        displayMode,
        yValueToUse,
        numBuffer,
        direction
      );

      // Render crosshairs
      const len = data.length ? data.length - numBuffer : 0;
      const crosshairX = (xScale(len.toString()) ?? 0) + xScale.bandwidth() / 2;
      let crosshairY: number;
      if (displayMode !== "standard") {
        crosshairY = yScale(lastRawNode.y1SumInDollars || 0);
      } else {
        crosshairY = yScale(parseFloat(lastPrice.closePrice || "0"));
      }
      renderCrosshairs(svg, crosshairX, crosshairY, width, height);

      // Render indicator dots
      renderIndicatorDots(svg, crosshairX, crosshairY, graphBtcAllocation);

      // Render plot data (transaction markers)
      if (plotData.length) {
        renderPlotData(svg, plotData, yScale, data, xScale, displayMode, numBuffer, bufferedLineData);
      }

      // Render current price line
      renderCurrentPriceLine(
        svg,
        prices,
        yScale,
        width,
        margin,
        xScale,
        direction
      );

      // Render Y2 axis (price)
      if (!suppressLegengs) {
        renderY2Axis(
          svg,
          yScale,
          width,
          yValueToUse,
          privateNumber as (val: string) => string,
          direction,
          graphShowAxisLines
        );
      }

      // Render BTC line and Y1 axis
      if (graphBtcAllocation) {
        renderBtcLine(svg, bufferedLineData, xScale, btcScale);

        if (!suppressLegengs) {
          renderY1Axis(
            svg,
            btcScale,
            bufferedLineData,
            data,
            yScale,
            height,
            margin,
            displayMode,
            privateNumber as (val: string) => string,
            hasZeroBtc,
            graphShowAxisLines
          );
        }
      }

      // Attach event handlers
      const handleBarClick = createBarClickHandler(
        data,
        bufferedLineData,
        numBuffer,
        displayMode,
        isLocked,
        suppressEvents,
        dispatch,
        setUI,
        onMouseOver
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleBarClick(svg as any, isMouseInteracting);

      const handleMouseMove = createMouseMoveHandler(
        svgRef,
        xScale,
        yScale,
        btcScale,
        data,
        bufferedLineData,
        margin,
        numBuffer,
        displayMode,
        isLocked,
        suppressEvents,
        darkMode,
        onMouseOver
      );

      const handleMouseLeave = createMouseLeaveHandler(
        svgRef,
        xScale,
        yScale,
        btcScale,
        data,
        bufferedLineData,
        numBuffer,
        displayMode,
        isLocked,
        suppressEvents,
        darkMode,
        graphShowAxisLines,
        onMouseOver
      );

      svg
        .on("mouseenter touchstart", () => {
          isMouseInteracting.current = true;
        })
        .on("mousemove touchmove", handleMouseMove)
        .on("mouseleave touchend", () => {
          isMouseInteracting.current = false;
          handleMouseLeave();
        });
    };

    // Skip full re-render during active mouse/touch interaction to prevent
    // interrupting the interaction. The handlers will update crosshairs/highlights
    // without needing a full re-render.
    // EXCEPTION: Always re-render if dark mode changed (to update gradients)
    const darkModeChanged = lastDarkMode !== darkMode;

    if (!isMouseInteracting.current || darkModeChanged) {
      render();
      if (darkModeChanged) {
        setLastDarkMode(darkMode);
      }
    }
  }, [
    // Data dependencies
    data,
    bufferedLineData,
    plotData,
    xScale,
    yScale,
    btcScale,
    lastPrice.closePrice,
    lastRawNode.y1SumInDollars,
    // UI state
    selectedIndex,
    graphBtcAllocation,
    graphShowAxisLines,
    graphSelectedTransactions,
    displayMode,
    yValueToUse,
    direction,
    hasZeroBtc,
    // Chart dimensions
    height,
    width,
    margin,
    numBuffer,
    // Other
    loading,
    range,
    group,
    from,
    to,
    privateNumber,
    selectedWalletId,
    suppressEvents,
    suppressLegengs,
    onMouseOver,
    id,
    prices,
    isLocked,
    dispatch,
    darkMode,
    lastDarkMode,
  ]);

  return (
    <div>
      <svg
        id={id}
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
