import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { type Html5Qrcode } from "html5-qrcode";
import { Button, Separator, Text, Callout } from "@radix-ui/themes";
import { CameraIcon, UploadIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { type IWalletManifest } from "@root/models/Wallet";

export type ImportResult = {
  name: string;
  color: string;
  xpubs: string[];
  utxos: string[];
};

type IImportWallet = {
  onDone: (result: ImportResult) => void;
};
export const ImportWallet = ({ onDone: onDoneProp }: IImportWallet) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [willScan, setWillScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedElements, setScannedElements] = useState<string[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const onResult = (result: string) => {
    // console.log(result);
    setScannedElements((prev) => [...prev, result]);
  };
  const onDone = (result: ImportResult) => {
    onDoneProp(result);
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

  const isValidManifest = (data: ImportResult, manifest?: IWalletManifest) => {
    if (!manifest) return false;
    try {
      if (data.name.length !== manifest.name) return false;
      if (data.color.length !== manifest.color) return false;
      if (data.xpubs.length !== manifest.xpubs) return false;
      if (data.utxos.length !== manifest.utxos) return false;
      return true;
    } catch (ex) {
      return false;
    }
  };

  const scan = async () => {
    if (!previewRef.current) return;
    const qr = await import("html5-qrcode");
    const html5QrcodeScanner = new qr.Html5Qrcode(previewRef.current.id);
    ref.current = html5QrcodeScanner;
    if (!html5QrcodeScanner) return;
    const data = {
      name: "",
      color: "",
      xpubs: [],
      utxos: [],
    } as ImportResult;

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
            data.xpubs.push(value);
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
          xpubs: json.xpubs,
          utxos: json.utxos,
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
        <Text size="2">Scanned Elements: {scannedElements.length}</Text>
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
