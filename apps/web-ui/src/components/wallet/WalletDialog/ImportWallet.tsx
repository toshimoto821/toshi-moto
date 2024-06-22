import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button, Separator, Text, Callout } from "@radix-ui/themes";
import { CameraIcon, UploadIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { type IWalletManagerEvents } from "@root/machines/walletManagerMachine";
import { type IWalletManifest } from "@root/models/Wallet";
type IResult = {
  name: string;
  color: string;
  xpubs: Set<string>;
  utxos: Set<string>;
};
type IWalletImport = {
  name: string;
  color: string;
  xpubs: Set<string>;
  utxos: Set<string>;
};
type IAccountType = "SINGLE_SIG" | "MULTI_SIG";
type IImportWallet = {
  send: ({ type, data }: IWalletManagerEvents) => void;
  onDone: (accountType: IAccountType, result: IResult) => void;
};
export const ImportWallet = ({ send, onDone: onDoneProp }: IImportWallet) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [willScan, setWillScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedElements, setScannedElements] = useState(new Set<string>());
  const [importError, setImportError] = useState<string | null>(null);

  const onResult = (result: string) => {
    // console.log(result);
    setScannedElements((prev) => new Set([...prev, result]));
  };
  const onDone = (result: IWalletImport) => {
    let AccountType: IAccountType = "SINGLE_SIG";
    const xpubs = Array.from(result.xpubs);
    if (xpubs.length > 1) {
      AccountType = "MULTI_SIG";
      // multisig
      for (let i = 0; i < xpubs.length; i++) {
        send({
          type: "BLUR_FIELD",
          data: { index: i, value: xpubs[i], xpub: true },
        });
        if (i > 2) {
          // send({ type: "ADD_EMPTY_FIELD", data: { xpub: true } });
        }
      }
    } else if (xpubs.length === 1) {
      AccountType = "SINGLE_SIG";
      send({
        type: "BLUR_FIELD",
        data: { index: 0, value: xpubs[0], xpub: true },
      });
    }

    send({
      type: "SET_NAME",
      data: { name: result.name },
    });
    send({
      type: "SET_VALUE",
      data: {
        key: "color",
        value: result.color,
      },
    });

    onDoneProp(AccountType, result);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onError = (_errorMessage: string) => {
    // console.log(errorMessage);
  };
  const ref = useRef<Html5Qrcode | null>(null);

  const stop = () => {
    if (ref.current?.isScanning) {
      ref.current.stop();
    }
    setIsScanning(false);
  };

  const isValidManifest = (data: IWalletImport, manifest?: IWalletManifest) => {
    if (!manifest) return false;
    try {
      if (data.name.length !== manifest.name) return false;
      if (data.color.length !== manifest.color) return false;
      if (data.xpubs.size !== manifest.xpubs) return false;
      if (data.utxos.size !== manifest.utxos) return false;
      return true;
    } catch (ex) {
      return false;
    }
  };

  const scan = async () => {
    if (!previewRef.current) return;
    const html5QrcodeScanner = new Html5Qrcode(previewRef.current.id);
    ref.current = html5QrcodeScanner;
    if (!html5QrcodeScanner) return;
    const data = {
      name: "",
      color: "",
      xpubs: new Set<string>(),
      utxos: new Set<string>(),
    } as IWalletImport;

    const didStart = await html5QrcodeScanner
      .start(
        { facingMode: "environment" },
        { fps: 10 },
        (decodedText) => {
          let manifest: IWalletManifest | undefined;
          const index = decodedText.indexOf(":");
          const key = decodedText.substring(0, index);
          const value = decodedText.substring(index + 1);
          if (key === "manifest") {
            try {
              manifest = JSON.parse(value);
            } catch (ex) {
              console.log(ex);
            }
          } else if (key === "xpub") {
            data.xpubs.add(value);
          } else if (key === "utxo") {
            data.utxos.add(value);
          } else if (key === "name") {
            data.name = value;
          } else if (key === "color") {
            data.color = value;
          }

          if (isValidManifest(data, manifest)) {
            onDone(data);
            stop();
          }

          onResult(decodedText);
        },
        (errorMessage) => {
          //console.log("error", errorMessage);
          onError(errorMessage);
        }
      )
      .then(() => true);
    return didStart;
  };
  const toggleScan = () => {
    if (isScanning) {
      setWillScan(false);
      stop();
    } else {
      setWillScan(true);
      scan()
        .then(() => {
          setIsScanning(true);
        })
        .catch((ex) => {
          console.log(ex);
          setImportError(ex);
        });
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement & { files: FileList }>
  ) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;
      try {
        const json = JSON.parse(event.target.result as string);
        const data = {
          ...json,
          xpubs: new Set(json.xpubs),
          utxos: new Set(json.utxos),
        };
        const manifest = {
          name: json.name?.length,
          color: json.color?.length,
          xpubs: json.xpubs?.length,
          utxos: json.utxos?.length,
        };
        if (isValidManifest(data, manifest)) {
          onDone(data);
        } else {
          setImportError("Failed to import manifest!");
        }

        // Handle the JSON object...
      } catch (error) {
        console.error("Invalid JSON:", error);
      } finally {
        if (fileInput.current) {
          fileInput.current.value = "";
        }
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    // Trigger the hidden file input click event
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const fileInput = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <div className="min-h-[402px] border">
        {!willScan && (
          <div className="flex items-center justify-center min-h-[402px]">
            <Button onClick={toggleScan}>
              <CameraIcon /> Start Scanning
            </Button>
          </div>
        )}
        <div id="preview" ref={previewRef} />
      </div>
      <div className="my-2 flex justify-between">
        {/* @todo turn into progress bar */}
        <Text size="2">Scanned Elements: {scannedElements.size}</Text>
        <Button variant="soft" color="gray" onClick={handleImport}>
          <UploadIcon /> Import Manifest
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            ref={fileInput}
            className="hidden"
          />
        </Button>
      </div>
      <Separator size="4" className="mb-2" />
      {importError && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{importError}</Callout.Text>
        </Callout.Root>
      )}
    </div>
  );
};
