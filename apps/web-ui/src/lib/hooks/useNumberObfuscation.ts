import { useAppSelector } from "./store.hooks";
import { selectPrivatePrice } from "../slices/ui.slice";
import { useCallback } from "react";

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
