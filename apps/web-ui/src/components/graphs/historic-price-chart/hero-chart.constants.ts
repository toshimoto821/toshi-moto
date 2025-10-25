export const GRAY_RGB = "rgb(243 244 246)";
export const SELECTED_OPACITY = 0.07;

export const DEFAULT_MARGIN = {
  top: 25,
  right: 0,
  bottom: 10,
  left: 0,
};

export const MIN_TICK_SPACING = 40;

export const CHART_COLORS = {
  gray: GRAY_RGB,
  selectedOpacity: SELECTED_OPACITY,
} as const;

export const AXIS_CONFIG = {
  y2: {
    transform: { x: -60, y: 0 },
    padding: { top: 1, right: 5, bottom: 1, left: 5 },
    textMargin: { top: 0, right: 5, bottom: 0, left: 0 },
    fontSize: "12px",
  },
  y1: {
    transform: { x: 70, y: 0 },
    padding: { top: 1, right: 5, bottom: 1, left: 5 },
    textMargin: { top: 0, right: 0, bottom: 0, left: 5 },
    fontSize: "12px",
  },
} as const;
