import { useBreakpoints } from "./useBreakpoints";
export const ONE_DAY_GROUP_BY = "15m";
export const ONE_MONTH_GROUP_BY = "6h";
export const ONE_WEEK_GROUP_BY = "2h";
export const ONE_YEAR_GROUP_BY = "3d";
export const THREE_MONTH_GROUP_BY = "1d";
export const TWO_YEAR_GROUP_BY = "1w";
export const FIVE_YEAR_GROUP_BY = "1w";

export const MOBILE_ONE_DAY_GROUP_BY = "15m";
export const MOBILE_ONE_MONTH_GROUP_BY = "6h";
export const MOBILE_ONE_WEEK_GROUP_BY = "2h";
export const MOBILE_ONE_YEAR_GROUP_BY = "3d";
export const MOBILE_THREE_MONTH_GROUP_BY = "1d";
export const MOBILE_TWO_YEAR_GROUP_BY = "1w";
export const MOBILE_FIVE_YEAR_GROUP_BY = "1w";

export const useDynamicGroupBy = () => {
  const breakpoint = useBreakpoints();

  if (breakpoint < 3) {
    return {
      ONE_DAY_GROUP_BY: MOBILE_ONE_DAY_GROUP_BY,
      ONE_MONTH_GROUP_BY: MOBILE_ONE_MONTH_GROUP_BY,
      ONE_WEEK_GROUP_BY: MOBILE_ONE_WEEK_GROUP_BY,
      ONE_YEAR_GROUP_BY: MOBILE_ONE_YEAR_GROUP_BY,
      THREE_MONTH_GROUP_BY: MOBILE_THREE_MONTH_GROUP_BY,
      TWO_YEAR_GROUP_BY: MOBILE_TWO_YEAR_GROUP_BY,
      FIVE_YEAR_GROUP_BY: MOBILE_FIVE_YEAR_GROUP_BY,
    };
  }

  return {
    ONE_DAY_GROUP_BY,
    ONE_MONTH_GROUP_BY,
    ONE_WEEK_GROUP_BY,
    ONE_YEAR_GROUP_BY,
    THREE_MONTH_GROUP_BY,
    TWO_YEAR_GROUP_BY,
    FIVE_YEAR_GROUP_BY,
  };
};
