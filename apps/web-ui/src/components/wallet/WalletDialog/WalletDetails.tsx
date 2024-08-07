import { useState, type FocusEvent } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { Flex, Text, TextField, Button, Dialog } from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Wallet } from "@models/Wallet";
import { hexToRgb, parseRgb, rgbToHex } from "@root/lib/utils";
import { useAppDispatch } from "@root/lib/hooks/store.hooks";
import { upsertWallet } from "@root/lib/slices/wallets.slice";

type ISingleSig = {
  wallet?: Wallet;
  onClose: (success: boolean) => void;
};

type WalletFields = {
  id: string;
  name: string;
  color: string;
  xpubs: string[];
};

export const WalletDetails = ({ wallet, onClose }: ISingleSig) => {
  const dispatch = useAppDispatch();

  const [fields, setFields] = useState<WalletFields>({
    id: wallet?.id || nanoid(),
    name: wallet?.name || "",
    color: wallet?.color || "rgb(153, 204, 255)",
    xpubs: wallet ? wallet.listXpubsStrings : [""],
  });

  const bindField = (key: keyof WalletFields) => {
    return (evt: FocusEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: evt.target.value }));
    };
  };

  const bindXpub = (index: number) => {
    return (evt: FocusEvent<HTMLInputElement>) => {
      const { value } = evt.target;
      setFields((prev) => {
        const xpubs = [...prev.xpubs];
        xpubs[index] = value;
        return { ...prev, xpubs };
      });
    };
  };

  const bindClose = (success: boolean) => {
    return () => {
      if (success) {
        dispatch(upsertWallet(fields));
      }
      onClose(success);
    };
  };

  const bindDeleteXpub = (index: number) => {
    return () => {
      setFields((prev) => {
        const xpubs = [...prev.xpubs];
        xpubs.splice(index, 1);
        return { ...prev, xpubs };
      });
    };
  };

  const handleColor = (evt: FocusEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    const rgb = hexToRgb(value);
    if (rgb === null) return;
    const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    setFields((prev) => ({ ...prev, color }));
  };

  const addEmptyXpub = () => {
    setFields((prev) => ({ ...prev, xpubs: [...prev.xpubs, ""] }));
  };

  return (
    <>
      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Name
          </Text>
          <TextField.Root
            defaultValue={fields.name}
            onBlur={bindField("name")}
            placeholder="Enter a name for this wallet (can be anything)"
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Color
          </Text>
          <TextField.Root
            // @ts-expect-error radix-ui doesn't support color input
            type="color"
            defaultValue={rgbToHex(parseRgb(fields.color))}
            onBlur={handleColor}
          />
        </label>

        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            XPUB Key
          </Text>
          {fields.xpubs.map((xpub, index) => (
            <div className="mb-2" key={index}>
              <TextField.Root
                placeholder="Enter an XPUB"
                defaultValue={xpub}
                onBlur={bindXpub(index)}
              >
                {index > 0 && (
                  <TextField.Slot onClick={bindDeleteXpub(index)}>
                    <Cross1Icon
                      height="16"
                      width="16"
                      className="hover:cursor-pointer"
                    />
                  </TextField.Slot>
                )}
              </TextField.Root>
            </div>
          ))}
        </label>
        <div>
          <Button variant="soft" onClick={addEmptyXpub}>
            Add XPub (multi-sig)
          </Button>
        </div>
      </Flex>
      <div className="mt-2 flex justify-end">
        <Flex gap="3">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={bindClose(false)}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={bindClose(true)}>Save</Button>
          </Dialog.Close>
        </Flex>
      </div>
    </>
  );
};
