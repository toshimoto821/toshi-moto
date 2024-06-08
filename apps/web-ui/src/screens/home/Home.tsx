import { useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { useBtcPrice } from "@lib/hooks/useBtcPrice";
import { useWallets } from "@lib/hooks/useWallets";
import { Footer } from "@components/footer/Footer";
import { useElementDimensions } from "@root/lib/hooks/useElementDimensions";
import { HistoricPriceChart } from "@root/components/graphs/historic-price-chart/HistoricPriceChart";
import { NetworkLog } from "@components/log/NetworkLog";
import { AddWalletDialog } from "@root/components/wallet/WalletDialog/AddWalletDialog";

export const Home = () => {
  const { pathname } = useLocation();
  const [addWalletOpen, setAddWalletOpen] = useState(false);
  const { btcPrice } = useBtcPrice();
  const { wallets, selectedWallets, netAssetValue } = useWallets();

  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(containerRef);

  const paddingTop = 140;
  return (
    <>
      <div style={{ paddingTop }}>
        <div ref={containerRef} className="mb-4 pt-2">
          <HistoricPriceChart
            wallets={wallets}
            netAssetValue={netAssetValue}
            selectedWallets={selectedWallets}
            height={400}
            btcPrice={btcPrice}
            width={dimensions.width}
          />
        </div>
        <div className="md:container md:mx-auto min-h-[400px]">
          <Outlet />

          {pathname === "/" && (
            <div className="mx-4 md:mx-0 mt-4 flex justify-end">
              <Button
                variant="surface"
                color="gray"
                className="drop-shadow-lg"
                onClick={() => setAddWalletOpen(true)}
              >
                Add Wallet
              </Button>
              <AddWalletDialog
                open={addWalletOpen}
                onClose={() => setAddWalletOpen(false)}
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
      <NetworkLog />
    </>
  );
};
