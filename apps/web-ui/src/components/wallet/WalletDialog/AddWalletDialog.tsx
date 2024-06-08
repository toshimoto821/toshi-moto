import { useState, type MouseEvent, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Dialog, Button, Flex, Tabs, Box } from "@radix-ui/themes";

import { AppContext } from "@providers/AppProvider";
import { SingleSig } from "./SingleSig";
import { walletManagerMachine } from "@machines/walletManagerMachine";
import { Wallet } from "@models/Wallet";
import { MultiSig } from "./MultiSig";
import { ImportWallet } from "./ImportWallet";

type IAddWalletDialog = {
  children?: React.ReactNode;
  wallet?: Wallet;
  open: boolean;
  onClose: (success: boolean) => void;
};

type ITabType = "SINGLE_SIG" | "MULTI_SIG" | "IMPORT";

export const AddWalletDialog = ({
  wallet,
  open,
  onClose,
}: IAddWalletDialog) => {
  const [activeTab, setActiveTab] = useState<ITabType>(
    !wallet
      ? "SINGLE_SIG"
      : wallet.accountType === "SINGLE_SIG"
      ? "SINGLE_SIG"
      : "MULTI_SIG"
  );
  const appMachine = AppContext.useActorRef();

  const [current, send] = useMachine(walletManagerMachine, {
    input: {
      appMachine,
      wallet,
    },
  });

  useEffect(() => {
    if (wallet?.id) {
      send({ type: "RESET_FORM", data: { wallet } });
    }
  }, [wallet?.id, send, wallet]);

  const isSuccess = current.matches("success");
  useEffect(() => {
    if (isSuccess) {
      onClose(true);
      send({ type: "RESET_FORM", data: {} });
    }
  }, [isSuccess, wallet]);

  const handleSave = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();

    const accountType = activeTab;
    if (accountType === "IMPORT") return;
    send({
      type: "SAVE",
      data: {},
    });
  };

  const handleDelete = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (wallet) {
      appMachine.send({
        type: "APP_MACHINE_DELETE_WALLET",
        data: { walletId: wallet.id },
      });
    }

    onClose(false);
  };

  const onOpenChange = () => {
    send({ type: "RESET_FORM", data: { wallet: wallet } });
  };

  const handleImportDone = (accountType: "SINGLE_SIG" | "MULTI_SIG") => {
    setActiveTab(accountType);
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
            <Tabs.Trigger value="SINGLE_SIG">Single Sig</Tabs.Trigger>
            <Tabs.Trigger value="MULTI_SIG">Multi Sig</Tabs.Trigger>
            <Tabs.Trigger value="IMPORT">Import</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3" pb="2">
            <Tabs.Content value="SINGLE_SIG">
              <SingleSig wallet={wallet} snapshot={current} send={send} />
            </Tabs.Content>

            <Tabs.Content value="MULTI_SIG">
              <MultiSig wallet={wallet} snapshot={current} send={send} />
            </Tabs.Content>
            <Tabs.Content value="IMPORT">
              <ImportWallet send={send} onDone={handleImportDone} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        <Flex gap="3" mt="4" justify="between">
          <Flex>
            {wallet?.id && (
              <Dialog.Close>
                <Button variant="outline" color="red" onClick={handleDelete}>
                  Delete
                </Button>
              </Dialog.Close>
            )}
          </Flex>
          <Flex gap="3">
            <Button variant="soft" color="gray" onClick={() => onClose(false)}>
              Cancel
            </Button>

            <Dialog.Close>
              <Button onClick={handleSave}>Save</Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
