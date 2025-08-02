import { useCallback } from "react";
import { useAppSelector } from "./store.hooks";
import { selectPrivatePrice } from "../slices/ui.slice";

export const useNumberObfuscation = () => {
  const privatePrice = useAppSelector(selectPrivatePrice);
  return useCallback(
    (price: string | number) => {
      if (privatePrice) {
        return "••.•••";
      }
      return price;
    },
    [privatePrice]
  );
};
