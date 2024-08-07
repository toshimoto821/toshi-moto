import { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Dialog, Tabs, Box } from "@radix-ui/themes";

import { AppContext } from "@providers/AppProvider";
import { WalletDetails } from "./WalletDetails";

import { Wallet } from "@models/Wallet";

import { ImportWallet } from "./ImportWallet";

type IAddWalletDialog = {
  children?: React.ReactNode;
  wallet?: Wallet;
  open: boolean;
  onClose: (success: boolean) => void;
};

type ITabType = "DETAILS" | "IMPORT";

export const AddWalletDialog = ({
  wallet,
  open,
  onClose,
}: IAddWalletDialog) => {
  const [activeTab, setActiveTab] = useState<ITabType>("DETAILS");

  function handleClose(success: boolean) {
    onClose(success);
  }

  const onOpenChange = () => {
    // send({ type: "RESET_FORM", data: { wallet: wallet } });
  };

  const handleImportDone = () => {
    setActiveTab("DETAILS");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>{wallet ? "Update Wallet" : "Add Wallet"}</Dialog.Title>

        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as ITabType);
          }}
        >
          <Tabs.List>
            <Tabs.Trigger value="DETAILS">Wallet Details</Tabs.Trigger>
            <Tabs.Trigger value="IMPORT">Import</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3" pb="2">
            <Tabs.Content value="DETAILS">
              <WalletDetails wallet={wallet} onClose={handleClose} />
            </Tabs.Content>

            <Tabs.Content value="IMPORT">
              <ImportWallet onDone={handleImportDone} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
};
