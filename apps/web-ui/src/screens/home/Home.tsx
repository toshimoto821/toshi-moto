import { useRef, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { useElementDimensions } from "@lib/hooks/useElementDimensions";
import { Footer } from "@components/footer/Footer";
import { HistoricPriceChart } from "@components/graphs/historic-price-chart/HistoricPriceChart";
import { NetworkLog } from "@components/log/NetworkLog";
import { AddWalletDialog } from "@components/wallet/WalletDialog/AddWalletDialog";

export const Home = () => {
  const { pathname } = useLocation();
  const [addWalletOpen, setAddWalletOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(containerRef);
  const setDialogOpen = useCallback(() => {
    setAddWalletOpen(true);
  }, []);
  const setDialogClosed = useCallback(() => {
    setAddWalletOpen(false);
  }, []);
  const paddingTop = 140;
  return (
    <>
      <div style={{ paddingTop }}>
        <div ref={containerRef} className="mb-4 pt-2">
          <HistoricPriceChart height={400} width={dimensions.width} />
        </div>
        <div className="mx-4 min-h-[400px]">
          <Outlet />

          {pathname === "/" && (
            <div className="mx-4 md:mx-0 mt-4 flex justify-end">
              <Button
                variant="surface"
                color="gray"
                className="drop-shadow-lg"
                onClick={setDialogOpen}
              >
                Add Wallet
              </Button>
              <AddWalletDialog open={addWalletOpen} onClose={setDialogClosed} />
            </div>
          )}
        </div>

        <Footer />
      </div>
      <NetworkLog />
    </>
  );
};
