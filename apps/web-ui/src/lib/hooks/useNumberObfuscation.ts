import { AppContext } from "@providers/AppProvider";

export const useNumberObfuscation = () => {
  const privatePrice = AppContext.useSelector((current) => {
    return current.context.meta.privatePrice;
  });
  return (price: string) => {
    if (privatePrice) {
      return price.replace(/\d/g, "•");
    }
    return price;
  };
};
