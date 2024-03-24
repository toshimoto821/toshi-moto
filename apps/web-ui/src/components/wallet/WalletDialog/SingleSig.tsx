import { type FocusEvent } from "react";
import { Flex, Text, TextField, Button } from "@radix-ui/themes";
import { type AnyMachineSnapshot } from "xstate";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Wallet } from "@models/Wallet";
import { hexToRgb, parseRgb, rgbToHex } from "@root/lib/utils";
import { type IWalletManagerEvents } from "@root/machines/walletManagerMachine";
type ISingleSig = {
  wallet?: Wallet;
  snapshot: AnyMachineSnapshot;
  send: ({ type, data }: IWalletManagerEvents) => void;
};

export const SingleSig = ({ wallet, snapshot, send }: ISingleSig) => {
  const utxos = snapshot.context.utxos as string[];
  const xpub = snapshot.context.xpubs[0] || "";
  const handleBlur =
    ({ index, xpub }: { xpub: boolean; index: number }) =>
    (evt: FocusEvent<HTMLInputElement>) => {
      send({
        type: "BLUR_FIELD",
        data: { index, value: evt.target.value, xpub },
      });
    };

  const addEmptyUtxo = (xpub: boolean) => {
    send({
      type: "ADD_EMPTY_FIELD",
      data: { xpub },
    });
  };
  const handleDelete =
    ({ index, xpub }: { index: number; xpub: boolean }) =>
    () => {
      send({
        type: "DELETE_FIELD",
        data: { index, xpub },
      });
    };

  const handleName = (evt: FocusEvent<HTMLInputElement>) => {
    send({
      type: "SET_NAME",
      data: { name: evt.target.value },
    });
  };

  const handleColor = (evt: FocusEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    const rgb = hexToRgb(value);
    if (rgb === null) return;
    send({
      type: "SET_VALUE",
      data: {
        key: "color",
        value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      },
    });
  };

  return (
    <Flex direction="column" gap="3">
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Name
        </Text>
        <TextField.Input
          defaultValue={wallet?.name}
          onBlur={handleName}
          placeholder="Enter a name for this wallet (can be anything)"
        />
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Color
        </Text>
        <TextField.Input
          type="color"
          defaultValue={rgbToHex(parseRgb(wallet?.color))}
          onBlur={handleColor}
        />
      </label>

      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          XPUB Key
        </Text>

        <div className="mb-2">
          <TextField.Root className="">
            <TextField.Input
              placeholder="Enter an XPUB"
              defaultValue={xpub}
              onBlur={handleBlur({ xpub: true, index: 0 })}
            />
          </TextField.Root>
        </div>
      </label>
      <label>
        <Text as="div" size="2" mb="1" weight="bold">
          Addresses (UTXO)
        </Text>

        {utxos.map((utxo, index) => (
          <div key={index} className="mb-2" data-index={index}>
            <TextField.Root className="">
              <TextField.Input
                placeholder="Enter an address"
                defaultValue={utxo}
                onBlur={handleBlur({ xpub: false, index })}
              />
              {index > 0 && (
                <TextField.Slot onClick={handleDelete({ index, xpub: false })}>
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
        <div>
          <Button variant="soft" onClick={() => addEmptyUtxo(false)}>
            Add Field
          </Button>
        </div>
      </label>
    </Flex>
  );
};
