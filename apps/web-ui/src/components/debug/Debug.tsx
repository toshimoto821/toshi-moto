import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { updatePricing, setLastUpdatedStreamAt } from "@lib/slices/price.slice";
import { selectDebugMode, setDebugMode } from "@lib/slices/ui.slice";
import { useSearchParams } from "react-router-dom";

export const Debug = () => {
  const [, setTimestamp] = useState(0);
  const dispatch = useAppDispatch();
  const debugMode = useAppSelector(selectDebugMode);
  const [params] = useSearchParams();

  const result = params.get("debug");

  const { btcPrice } = useBtcPrice();
  const fakeTick = () => {
    const price = btcPrice + 100;
    dispatch(updatePricing({ price, eventTime: Date.now() }));
  };

  const render = () => {
    setTimestamp(Date.now());
  };

  const resetStreamTs = () => {
    dispatch(setLastUpdatedStreamAt(Date.now()));
  };

  useEffect(() => {
    if (result === "true") {
      dispatch(setDebugMode(true));
    } else if (result === "false") {
      dispatch(setDebugMode(false));
    }
  }, [result, dispatch]);

  if (!debugMode) {
    return null;
  }
  return (
    <div className="fixed bottom-0 w-full z-50 h-24 bg-gray-100 border p-2">
      <div className="flex space-x-2">
        <button onClick={fakeTick}>tick</button>
        <button onClick={render}>render</button>
        <button onClick={resetStreamTs}>resetStreamTs</button>
      </div>
    </div>
  );
};
