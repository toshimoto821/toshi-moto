import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, Button, Flex, Text, Separator } from "@radix-ui/themes";
import { Wallet, type IWalletExport } from "@models/Wallet";
import { wait } from "@root/lib/utils";
import { DownloadIcon } from "@radix-ui/react-icons";

type IExportWalletDialog = {
  wallet: Wallet;
  open: boolean;
  onClose: (success: boolean) => void;
};

export const ExportWalletDialog = ({
  wallet,
  open,
  onClose,
}: IExportWalletDialog) => {
  const [runCount, setRunCount] = useState<number>(0);
  const [qrcodeString, setQrcodeString] = useState<string>("");
  const data = wallet.export();
  console.log(data);
  const buidlManifest = (data: IWalletExport) => {
    return JSON.stringify({
      name: data.name.length,
      color: data.color.length,
      xpubs: data.xpubs.length,
    });
  };
  const run = async () => {
    const { xpubs, name, color } = data;
    setQrcodeString(`manifest:${buidlManifest(data)}`);
    await wait(1000);
    setQrcodeString(`name:${name}`);
    await wait(1000);
    setQrcodeString(`color:${color}`);
    await wait(1000);
    for (const pub of xpubs) {
      setQrcodeString(`xpub:${pub}`);
      await wait(1000);
    }
    setRunCount(runCount + 1);
  };

  useEffect(() => {
    if (open) {
      run();
    }
  }, [runCount, open]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${wallet.name}.json`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Title>Export Wallet - {wallet.name}</Dialog.Title>
        <Flex className="mb-4">
          <Text>
            Scan the QR code below with another device to import the xpubs/utxos
          </Text>
        </Flex>
        <Separator size="4" className="mb-4" />
        <Flex justify="center" className="mb-4">
          <QRCodeSVG value={qrcodeString} size={380} />
        </Flex>
        <Separator size="4" className="mb-4" />
        <Flex gap="3" mt="4" justify="between">
          <Flex>
            <Button variant="soft" color="gray" onClick={handleDownload}>
              <DownloadIcon /> Download Export
            </Button>
          </Flex>
          <Flex>
            <Button variant="soft" onClick={() => onClose(false)}>
              Close
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
