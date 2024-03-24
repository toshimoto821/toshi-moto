import { useState, useEffect } from "react";
import { AppContext } from "@root/providers/AppProvider";

export const useWindowFocus = (inactiveTime: number) => {
  const { send } = AppContext.useActorRef();
  const lastFocus = AppContext.useSelector(
    (state) => state.context.meta.windowFocusTimestamp
  );
  const chartTimeFrameRange = AppContext.useSelector(
    (state) => state.context.meta.chartTimeFrameRange
  );

  // const [lastFocus, setLastFocus] = useState(Date.now());
  const [refreshKey, setRefreshKey] = useState(false);

  useEffect(() => {
    const handleWindowFocus = () => {
      const now = Date.now();
      if (now - lastFocus > inactiveTime) {
        setRefreshKey(!refreshKey);
        send({
          type: "APP_MACHINE_UPDATE_META",
          data: {
            meta: {
              windowFocusTimestamp: now,
            },
          },
        });
        send({
          type: "APP_MACHINE_UPDATE_CHART_RANGE",
          data: {
            group: chartTimeFrameRange!,
          },
        });
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [lastFocus, refreshKey, inactiveTime]);

  return refreshKey;
};
