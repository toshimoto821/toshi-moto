import { useAppSelector } from "./store.hooks";
import { selectPrivatePrice } from "../slices/ui.slice";

export const useNumberObfuscation = () => {
  const privatePrice = useAppSelector(selectPrivatePrice);
  return (price: string | number) => {
    if (privatePrice) {
      return "••.•••";
    }
    return price;
  };
};
