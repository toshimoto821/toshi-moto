import { Separator, Text } from "@radix-ui/themes";
import { Popover } from "@root/components/popover/Popover";
import { useWallets } from "@lib/hooks/useWallets";
import { WalletRow } from "./WalletRow";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";

export const WalletRows = () => {
  const { wallets: allWallets } = useWallets();
  const { circulatingSupply, btcPrice } = useBtcPrice();
  if (!allWallets.length) return null;

  const wallets = allWallets.filter((wallet) => wallet.archived === false);
  const archivedWallets = allWallets.filter(
    (wallet) => wallet.archived === true
  );
  return (
    <div className="px-2 border dark:border-[#404040] rounded bg-white dark:bg-[#2d2d2d] drop-shadow-lg">
      {wallets.map((wallet, index) => {
        return (
          <div key={index} className="">
            <WalletRow
              wallet={wallet}
              className="px-2 py-4"
              circulatingSupply={circulatingSupply}
              btcPrice={btcPrice}
            />
            {index < wallets.length - 1 && (
              <Separator color="gray" size="4" className="opacity-50" />
            )}
          </div>
        );
      })}
      {archivedWallets.length > 0 && (
        <div>
          <div className="bg-gray-100 dark:bg-[#1a1a1a] p-2 border-t border-b dark:border-[#404040]">
            <Popover
              title="Archived"
              text={(classNames: string) => (
                <Text size="3" className={`${classNames} `}>
                  Archived Wallets
                </Text>
              )}
            >
              Archived wallets do not fetch data for updates when the wallet is
              selected.
            </Popover>
          </div>
          {archivedWallets.map((wallet, index) => {
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-[#252525] opacity-70"
              >
                <WalletRow
                  wallet={wallet}
                  className="px-2 py-4"
                  circulatingSupply={circulatingSupply}
                  btcPrice={btcPrice}
                />
                {index < wallets.length - 1 && (
                  <Separator color="gray" size="4" className="opacity-50" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
