import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { updatePricing, setLastUpdatedStreamAt } from "@lib/slices/price.slice";
import { selectDebugMode, setDebugMode } from "@lib/slices/ui.slice";
import { useSearchParams } from "react-router-dom";
import { getSubscription } from "@components/settings/settings.util";
import { useTestPushMutation } from "@root/lib/slices/api.slice";
import { type PushSubscription } from "@root/lib/slices/api.slice.types";
import { createFakeKline } from "@components/graphs/graph-utils";

export const Debug = () => {
  const [, setTimestamp] = useState(0);
  const dispatch = useAppDispatch();
  const debugMode = useAppSelector(selectDebugMode);
  const [params] = useSearchParams();

  const [subscription, setPushSubscription] = useState<PushSubscription | null>(
    null
  );
  const [testPush] = useTestPushMutation();
  const result = params.get("debug");

  const { btcPrice } = useBtcPrice();
  const fakeTick = () => {
    const price = btcPrice - 100;

    dispatch(
      updatePricing({
        kline: createFakeKline(price, Date.now(), 8411324.3785577 * 10),
      })
    );
  };

  const render = () => {
    setTimestamp(Date.now());
  };

  const resetStreamTs = () => {
    dispatch(setLastUpdatedStreamAt(Date.now()));
  };

  const handleTestPush = () => {
    if (subscription) {
      testPush(subscription);
    } else {
      alert("no subscription");
    }
  };

  useEffect(() => {
    if (result === "true") {
      dispatch(setDebugMode(true));
    } else if (result === "false") {
      dispatch(setDebugMode(false));
    }
  }, [result, dispatch]);

  useEffect(() => {
    getSubscription().then((sub) => {
      if (sub) {
        setPushSubscription(sub.toJSON() as PushSubscription);
      }
    });
  }, []);

  if (!debugMode) {
    return null;
  }
  return (
    <div className="fixed bottom-0 w-full z-50 h-48 bg-gray-100 border p-2">
      <div className="flex space-x-2">
        <div className="flex space-y-2 flex-col items-start">
          <button
            onClick={fakeTick}
            className="border px-2 bg-gray-200 border-black w-full"
          >
            tick
          </button>
          <button
            onClick={render}
            className="border px-2 bg-gray-200 border-black w-full"
          >
            render
          </button>
          <button
            onClick={resetStreamTs}
            className="border px-2 bg-gray-200 border-black w-full"
          >
            resetStreamTs
          </button>
        </div>
        <div className="flex flex-col space-y-2 items-start">
          <div className="flex flex-col space-y-2">
            <label>deviceId endpoint</label>
            <input
              type="text"
              className="border"
              defaultValue={subscription?.endpoint || ""}
            />
          </div>
          <div>
            <button
              className="border px-2 bg-gray-200 border-black w-full"
              onClick={handleTestPush}
            >
              test push
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
