import { jade, ruby } from "@radix-ui/colors";
import type { Selection } from "d3";
import { GRAY_RGB } from "./hero-chart.constants";

const GRAY_DARK = "rgb(35, 35, 35)";

/**
 * Creates SVG gradient definitions for the chart
 * @param svg - D3 selection of the SVG element
 * @param id - Unique identifier for the chart (used to scope gradient IDs)
 */
export const createGradients = (
  svg: Selection<SVGSVGElement | null, unknown, null, undefined>,
  id: string
) => {
  const defs = svg.append("defs");

  // Green gradient (for positive price movement)
  const gradientGreen = defs
    .append("linearGradient")
    .attr("id", "gradient-green")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientGreen
    .append("stop")
    .attr("id", "jade-stop")
    .attr("offset", "0%")
    .attr("stop-color", jade.jade11)
    .attr("stop-opacity", 1);

  gradientGreen
    .append("stop")
    .attr("id", "gray-stop-2")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_RGB)
    .attr("stop-opacity", 1);

  // Red gradient (for negative price movement)
  const gradientRed = defs
    .append("linearGradient")
    .attr("id", `gradient-red__${id}`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientRed
    .append("stop")
    .attr("id", "ruby-stop")
    .attr("offset", "0%")
    .attr("stop-color", ruby.ruby11)
    .attr("stop-opacity", 1);

  gradientRed
    .append("stop")
    .attr("id", "gray-stop-2")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_RGB)
    .attr("stop-opacity", 1);

  // Orange gradient (for BTC allocation)
  const gradientOrange = defs
    .append("linearGradient")
    .attr("id", `gradient-orange__${id}`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientOrange
    .append("stop")
    .attr("id", "orange-stop")
    .attr("offset", "0%")
    .attr("stop-color", "orange")
    .attr("stop-opacity", 1);

  gradientOrange
    .append("stop")
    .attr("id", "gray-stop-3")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_RGB)
    .attr("stop-opacity", 1);

  // ============================================================================
  // DARK MODE GRADIENTS
  // ============================================================================

  // Green gradient - dark mode (for positive price movement)
  const gradientGreenDark = defs
    .append("linearGradient")
    .attr("id", "gradient-green-dark")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientGreenDark
    .append("stop")
    .attr("id", "jade-stop-dark")
    .attr("offset", "0%")
    .attr("stop-color", jade.jade11)
    .attr("stop-opacity", 1);

  gradientGreenDark
    .append("stop")
    .attr("id", "gray-stop-dark-2")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_DARK)
    .attr("stop-opacity", 1);

  // Red gradient - dark mode (for negative price movement)
  const gradientRedDark = defs
    .append("linearGradient")
    .attr("id", `gradient-red-dark__${id}`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientRedDark
    .append("stop")
    .attr("id", "ruby-stop-dark")
    .attr("offset", "0%")
    .attr("stop-color", ruby.ruby11)
    .attr("stop-opacity", 1);

  gradientRedDark
    .append("stop")
    .attr("id", "gray-stop-dark-3")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_DARK)
    .attr("stop-opacity", 1);

  // Orange gradient - dark mode (for BTC allocation)
  const gradientOrangeDark = defs
    .append("linearGradient")
    .attr("id", `gradient-orange-dark__${id}`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradientOrangeDark
    .append("stop")
    .attr("id", "orange-stop-dark")
    .attr("offset", "0%")
    .attr("stop-color", "orange")
    .attr("stop-opacity", 1);

  gradientOrangeDark
    .append("stop")
    .attr("id", "gray-stop-dark-4")
    .attr("offset", "100%")
    .attr("stop-color", GRAY_DARK)
    .attr("stop-opacity", 1);
};
