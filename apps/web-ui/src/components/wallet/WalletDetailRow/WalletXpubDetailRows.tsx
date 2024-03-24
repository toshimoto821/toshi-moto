import { useRef } from "react";
import { useMachine } from "@xstate/react";
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Table, IconButton, Text, Button } from "@radix-ui/themes";
import { cn } from "@lib/utils";
import { Xpub } from "@models/Xpub";
import { Wallet } from "@models/Wallet";
import { walletXpubRowsUIMachine } from "@machines/walletXpubRowsUIMachine";
import { StartIndex } from "./StartIndex";
import { Limit } from "./Limit";
import { UtxoRow } from "./UtxoRow";
import { useElementDimensions } from "@lib/hooks/useElementDimensions";
import { AppContext } from "@providers/AppProvider";

type IOnClickRefreshUtxo = {
  walletId: string;
  address: string;
};

export type IOnClickExpandTxs = {
  walletId: string;
  address: string;
};

export type IOnClickRefreshHandlerProps = {
  addressType?: "RECEIVE" | "CHANGE";
  startIndex?: number;
  limit?: number;
  // or
  utxos?: string[];
};

export type IOnClickRefreshHandler = ({
  addressType,
  startIndex,
  limit,
  utxos,
}: IOnClickRefreshHandlerProps) => void;

type IWalletDetailRows = {
  // @deprecated
  walletId?: string;
  wallet: Wallet;
  wallets: Wallet[];
  // @deprecated
  xpub?: Xpub;
  isLoadingXpub: (addressType: "RECEIVE" | "CHANGE") => boolean;
  onClickRefreshUtxo: ({
    walletId,
    address,
  }: IOnClickRefreshUtxo) => () => void;
  onClickExpandUtxo: ({ walletId, address }: IOnClickExpandTxs) => () => void;
  onClickRefreshXpub: IOnClickRefreshHandler;
  isLoadingUtxo: (address: string) => boolean;
  expandTxs: (address: string) => boolean;
};

export const WalletXpubDetailRows = (props: IWalletDetailRows) => {
  const {
    onClickRefreshXpub,
    onClickRefreshUtxo,
    onClickExpandUtxo,
    wallet,
    isLoadingXpub,
    isLoadingUtxo,
    wallets,
    expandTxs,
  } = props;

  const containerRef = useRef<HTMLTableRowElement>(null);
  const dimensions = useElementDimensions(containerRef);
  const appMachineActor = AppContext.useActorRef();

  const [current, send] = useMachine(walletXpubRowsUIMachine);

  const showOnlyUtxosForReceiveAddress =
    current.context.showOnlyUtxosForReceiveAddress;

  const showOnlyUtxosForChangeAddress =
    current.context.showOnlyUtxosForChangeAddress;

  const handleUtxoRefresh = (address: string) => {
    return onClickRefreshUtxo({
      walletId: wallet.id,
      address,
    });
  };

  const handleUtxoExpand = (address: string) => {
    return onClickExpandUtxo({
      walletId: wallet.id,
      address,
    });
  };

  const handleIsLoadingUtxo = (address: string) => {
    return isLoadingUtxo(address);
  };

  const handleExpandAddress = (addressType: "RECEIVE" | "CHANGE") => {
    return () => {
      send({ type: "TOGGLE_ADDRESS_EXPANDED", data: { addressType } });
    };
  };

  const handleRefreshXPub = (addressType: "RECEIVE" | "CHANGE") => {
    return () => {
      if (onClickRefreshXpub) {
        // i want to be able to only refresh visible utxos
        // or refresh all if the user is viewing all addresses
        if (showOnlyUtxosForReceiveAddress && addressType === "RECEIVE") {
          const utxos = wallet
            .getAddresses({
              onlyUtxos: true,
              change: false,
              min: 3,
            })
            .map((utxo) => utxo.address);

          onClickRefreshXpub({
            utxos,
          });
        } else if (showOnlyUtxosForChangeAddress && addressType === "CHANGE") {
          const utxos = wallet
            .getAddresses({
              onlyUtxos: true,
              change: true,
              min: 3,
            })
            .map((utxo) => utxo.address);

          onClickRefreshXpub({
            utxos,
          });
        } else {
          // refresh all utxos withing the pagination range for the addressType
          const meta = addressType === "RECEIVE" ? "receiveMeta" : "changeMeta";
          onClickRefreshXpub({
            addressType,
            startIndex: wallet[meta].startIndex,
            limit: wallet[meta].limit,
          });
        }
      }
    };
  };

  const handleChangeStartIndex = (addressType: "RECEIVE" | "CHANGE") => {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      let startIndex = parseInt(evt.target.value, 10);
      if (isNaN(startIndex)) {
        startIndex = 0;
      }
      const meta = addressType === "RECEIVE" ? "receiveMeta" : "changeMeta";
      const limit = wallet[meta].limit ?? 10;

      appMachineActor.send({
        type: "APP_MACHINE_SET_WALLET_PAGINATION",
        data: { addressType, startIndex, limit, walletId: wallet.id },
      });
    };
  };

  const handleChangeLimit = (addressType: "RECEIVE" | "CHANGE") => {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      let limitValue = parseInt(evt.target.value, 10);
      if (isNaN(limitValue)) {
        limitValue = 0;
      }
      const meta = addressType === "RECEIVE" ? "receiveMeta" : "changeMeta";
      const startIndex = wallet[meta].startIndex ?? 0;

      appMachineActor.send({
        type: "APP_MACHINE_SET_WALLET_PAGINATION",
        data: {
          addressType,
          startIndex,
          limit: limitValue,
          walletId: wallet.id,
        },
      });
    };
  };

  return (
    <Table.Root>
      <Table.Body>
        <Table.Row
          className="bg-gray-100 border border-y-0"
          align="center"
          ref={containerRef}
        >
          <Table.RowHeaderCell className="w-12">
            <div className="flex items-center ">
              <IconButton
                variant="ghost"
                color="gray"
                title="Will refresh all UTXO's visible below."
                onClick={handleRefreshXPub("RECEIVE")}
                className={cn("p2", {
                  "animate-spin": isLoadingXpub("RECEIVE"),
                  "bg-gray-100": isLoadingXpub("RECEIVE"),
                  "hover:bg-gray-100": isLoadingXpub("RECEIVE"),
                })}
                disabled={isLoadingXpub("RECEIVE")}
              >
                <UpdateIcon width="14" height="14" />
              </IconButton>
            </div>
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="w-12">Tx</Table.RowHeaderCell>
          <Table.RowHeaderCell className="align-middle w-14">
            <Limit
              value={wallet.receiveMeta.limit}
              onBlur={handleChangeLimit("RECEIVE")}
            />
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="w-[365px]">
            <Button
              variant="ghost"
              color="gray"
              onClick={handleExpandAddress("RECEIVE")}
            >
              <Text size="2" weight="bold" className="mr-2">
                Receive <span className="hidden md:inline">Addresses</span>
              </Text>
              {showOnlyUtxosForReceiveAddress && (
                <BookmarkFilledIcon width="14" height="14" />
              )}
              {!showOnlyUtxosForReceiveAddress && (
                <BookmarkIcon width="14" height="14" />
              )}
            </Button>
          </Table.RowHeaderCell>

          <Table.RowHeaderCell className="w-[125px] text-xs text-right">
            BTC
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="w-[145px] text-xs text-right">
            BTC/USD
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="w-[200px] text-xs text-right">
            TXS
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="w-[100px] text-xs text-right">
            Allocation
          </Table.RowHeaderCell>
          <Table.RowHeaderCell className="text-xs text-right">
            Date
          </Table.RowHeaderCell>
        </Table.Row>
        {wallet
          .getAddresses({
            onlyUtxos: showOnlyUtxosForReceiveAddress,
            change: false,
            min: 3,
          })
          .map((utxo, i) => (
            <UtxoRow
              width={dimensions.width}
              className={cn("border border-y-0", {})}
              key={i}
              isLoading={handleIsLoadingUtxo(utxo.address)}
              utxo={utxo}
              onRefresh={handleUtxoRefresh(utxo.address)}
              onExpandToggle={handleUtxoExpand(utxo.address)}
              expandTxs={expandTxs(utxo.address)}
              walletBalance={wallet.balance}
              wallets={wallets}
            />
          ))}
        {!!wallet.listXpubs.length && (
          <Table.Row className="border border-y-0" align="center">
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell>
              {!!wallet.listXpubs.length && (
                <StartIndex
                  value={wallet.receiveMeta.startIndex}
                  onBlur={handleChangeStartIndex("RECEIVE")}
                />
              )}
            </Table.Cell>
            <Table.Cell className=""></Table.Cell>
            <Table.Cell colSpan={5}></Table.Cell>
          </Table.Row>
        )}
        <Table.Row className="bg-gray-100 border border-y-0" align="center">
          <Table.Cell className={cn("w-8 align-middle")}>
            <div className="flex items-center ">
              <IconButton
                variant="ghost"
                color="gray"
                onClick={handleRefreshXPub("CHANGE")}
                className={cn("p2", {
                  "animate-spin": isLoadingXpub("CHANGE"),
                  "bg-gray-100": isLoadingXpub("CHANGE"),
                  "hover:bg-gray-100": isLoadingXpub("CHANGE"),
                })}
                disabled={isLoadingXpub("CHANGE")}
              >
                <UpdateIcon width="14" height="14" />
              </IconButton>
            </div>
          </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell>
            {!!wallet.listXpubs.length && (
              <StartIndex
                value={wallet.changeMeta.startIndex}
                onBlur={handleChangeStartIndex("CHANGE")}
              />
            )}
          </Table.Cell>
          <Table.Cell>
            <Button
              variant="ghost"
              color="gray"
              onClick={handleExpandAddress("CHANGE")}
            >
              <Text size="2" weight="bold" className="mr-2">
                Change Addresses
              </Text>
              {showOnlyUtxosForChangeAddress && (
                <BookmarkFilledIcon width="14" height="14" />
              )}
              {!showOnlyUtxosForChangeAddress && (
                <BookmarkIcon width="14" height="14" />
              )}
            </Button>
          </Table.Cell>

          <Table.Cell colSpan={5}></Table.Cell>
        </Table.Row>
        {wallet
          .getAddresses({
            onlyUtxos: showOnlyUtxosForChangeAddress,
            change: true,
            min: 3,
          })
          .map((utxo, i) => (
            <UtxoRow
              className="border border-y-0"
              key={i + utxo.address}
              isLoading={handleIsLoadingUtxo(utxo.address)}
              utxo={utxo}
              onRefresh={handleUtxoRefresh(utxo.address)}
              onExpandToggle={handleUtxoExpand(utxo.address)}
              walletBalance={wallet.balance}
              width={dimensions.width}
              expandTxs={expandTxs(utxo.address)}
              wallets={wallets}
            />
          ))}
        {!!wallet.listXpubs.length && (
          <Table.Row className="border border-y-0">
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell className="">
              <div className="flex items-center justify-between">
                <Limit
                  value={wallet.changeMeta.limit}
                  onBlur={handleChangeLimit("CHANGE")}
                />
              </div>
            </Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell colSpan={5}></Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
};
