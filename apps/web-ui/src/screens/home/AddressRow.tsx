import { useEffect, useState } from "react";
import { IconButton, Separator, Text, Button } from "@radix-ui/themes";
import {
  CopyIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";
import { Utxo } from "@models/Utxo";
import { Transaction } from "@models/Transaction";
import { padBtcZeros, trimAddress, copyToClipboard } from "@lib/utils";
import { ToastContext, AppContext } from "@root/providers/AppProvider";
import { cn, formatPrice } from "@lib/utils";
import { useWallets } from "@lib/hooks/useWallets";
import { type ICurrency } from "@root/types";
import { currencySymbols } from "@root/lib/currencies";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";
import { TransactionDetails } from "./TransactionDetails";

type IDimensions = {
  height: number;
  width: number;
};

type IAddressRow = {
  address: Utxo;
  isUtxoExpanded: boolean;
  onClickExpandUtxo: () => void;
  separator: boolean;
  wallets: ReturnType<typeof useWallets>;
  dimensions: IDimensions;
  onClickRefresh: ({ address }: { address: Utxo }) => void;
  currency: ICurrency;
};

export const AddressRow = (prop: IAddressRow) => {
  const {
    address,
    isUtxoExpanded,
    onClickExpandUtxo,
    separator,

    // perf optimization to pass it in
    wallets: useWalletRet,
    dimensions,
    onClickRefresh,
    currency,
  } = prop;

  const { send } = ToastContext.useActorRef();

  const bitcoinNodeUrl = AppContext.useSelector(
    (current) => current.context.meta.config.bitcoinNodeUrl
  );
  const privateNumber = useNumberObfuscation();

  const { wallets, actions } = useWalletRet;
  const [height, setHeight] = useState(200);
  useEffect(() => {
    const h = Math.max(window.innerHeight / 4, 200);
    setHeight(h);
  }, []);
  const handleOnClickTx = (tx: Transaction) => {
    return () => {
      actions.toggleTx(tx);
    };
  };
  const listTransactions = address.listTransactions;
  const numTxs = listTransactions.length;

  const handleCopy = (address: string) => {
    return async () => {
      await copyToClipboard(address);
      const message = {
        line1: "Address copied to clipboard",
        line2: trimAddress(address),
      };
      send({
        type: "TOAST",
        data: { message },
      });
    };
  };

  return (
    <div id={`address-${address.address}`}>
      <div
        className={cn("bg-white ", {
          // "sticky top-[140px] ": isUtxoExpanded,
          "bg-red-50": address.status === "error",
        })}
      >
        <div
          key={address.address}
          className={cn(
            "grid grid-cols-9 gap-1 py-4 items-center text-xs px-2",
            {
              "animate-pulse": address.isLoading,
            }
          )}
        >
          <div>
            {numTxs > 0 && (
              <IconButton variant="ghost" onClick={onClickExpandUtxo}>
                {!isUtxoExpanded && <ChevronRightIcon width="18" height="18" />}
                {isUtxoExpanded && <ChevronDownIcon width="18" height="18" />}
              </IconButton>
            )}
          </div>
          <div>
            <Button
              title="Refresh"
              variant="outline"
              size="2"
              onClick={() => onClickRefresh({ address })}
              loading={address.isLoading}
            >
              <Text className="font-mono" size="1">
                {address.indexString}
              </Text>
            </Button>
          </div>
          <div className="col-span-3 md:col-span-5 flex items-center justify-end truncate">
            <a
              className={cn(
                "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs",
                {
                  "text-gray-400": address.utxoSum === 0,
                }
              )}
              title={address.address}
              href={address.blockExplorerLink(bitcoinNodeUrl)}
              target="_blank"
              rel="noreferrer"
            >
              {address.isChange && (
                <TriangleUpIcon width="16" height="16" className="ml-1" />
              )}
              <span className="hidden sm:inline">{address.address}</span>
              <span className="inline sm:hidden">
                {trimAddress(address.address, { prefix: 4, suffix: 2 })}
              </span>
            </a>
            <button
              className={cn(
                "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs",
                {
                  "text-gray-400": address.utxoSum === 0,
                }
              )}
              onClick={handleCopy(address.address)}
            >
              <CopyIcon width="16" height="16" className="ml-2" />
            </button>
          </div>

          <div
            className={cn("col-span-2 md:col-span-1 text-right font-mono", {
              "text-gray-400": address.utxoSum === 0,
            })}
          >
            <Text className="hidden md:inline">
              {privateNumber(padBtcZeros(address.balance))}
            </Text>
            <Text className="inline md:hidden">
              {privateNumber(padBtcZeros(address.balance, 4))}
            </Text>
          </div>
          <div
            className={cn("text-right font-mono col-span-2 md:col-span-1", {
              "text-gray-400": address.utxoSum === 0,
            })}
          >
            <Text>
              {currencySymbols[currency]}
              <span className="inline md:hidden">
                {privateNumber(formatPrice(address.value, 0))}
              </span>
              <span className="hidden md:inline">
                {privateNumber(formatPrice(address.value))}
              </span>
            </Text>
          </div>
        </div>
        {isUtxoExpanded && (
          <Separator color="gray" size="4" className="opacity-30" />
        )}
      </div>

      {isUtxoExpanded &&
        listTransactions.map((tx, i) => (
          <TransactionDetails
            key={tx.txid + i}
            transaction={tx}
            utxo={address}
            toggleTx={actions.toggleTx}
            index={i}
            onClickTx={handleOnClickTx(tx)}
            wallets={wallets}
            width={dimensions.width}
            height={height}
            currency={currency}
          />
        ))}

      {separator && <Separator size="4" />}
    </div>
  );
};
