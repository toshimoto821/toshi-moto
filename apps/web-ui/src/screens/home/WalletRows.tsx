import { Separator } from "@radix-ui/themes";
import { useWallets } from "@lib/hooks/useWallets";
import { WalletRow } from "./WalletRow";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";

export const WalletRows = () => {
  const { wallets } = useWallets();
  const { circulatingSupply, btcPrice, forcastPrice } = useBtcPrice();
  if (!wallets.length) return null;
  return (
    <div className="mx-4 md:mx-0 px-2 border rounded bg-white drop-shadow-lg">
      {wallets.map((wallet, index) => {
        return (
          <div key={index} className="">
            <WalletRow
              wallet={wallet}
              className="px-2 py-4"
              circulatingSupply={circulatingSupply}
              btcPrice={forcastPrice ?? btcPrice}
            />
            {index < wallets.length - 1 && (
              <Separator color="gray" size="4" className="opacity-50" />
            )}
          </div>
        );
      })}
    </div>
  );
};
