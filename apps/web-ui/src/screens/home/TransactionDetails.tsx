import { Text } from "@radix-ui/themes";
import { TransactionSankey } from "@components/graphs/TransactionSankey";
import { TransactionRow } from "./TransactionRow";
import { Utxo } from "@models/Utxo";
import { Wallet } from "@models/Wallet";
import { Transaction } from "@models/Transaction";
import { PinTopIcon, PinBottomIcon } from "@radix-ui/react-icons";
import { AppContext } from "@root/providers/AppProvider";
import { cn, trimAddress } from "@lib/utils";
import { ICurrency } from "@root/types";
import { Popover } from "@root/components/popover/Popover";

type ITransactionDetails = {
  utxo: Utxo;
  transaction: Transaction;
  width: number;
  height: number;
  wallets: Wallet[];
  selectedTxs: Set<string>;
  toggleTx: (tx: Transaction) => void;
  onClickTx: () => void;
  index: number;
  currency: ICurrency;
};
export const TransactionDetails = (props: ITransactionDetails) => {
  const {
    utxo: address,
    transaction: tx,
    width,
    height,
    wallets,
    selectedTxs,
    toggleTx,
    index,
    onClickTx,
  } = props;

  const bitcoinNodeUrl = AppContext.useSelector(
    (current) => current.context.meta.config.bitcoinNodeUrl
  );

  const walletColor =
    wallets.find((w) => w.id === address.walletId)?.color || "#ccc";

  return (
    <div className="mb-8">
      <div className="bg-gray-50 border p-4">
        <div className="flex justify-between mb-2 items-end">
          <div>
            <Text className="font-bold text-gray-500" size="6">
              Transaction {index + 1}
            </Text>
            {!tx.confirmed && (
              <Text className="text-xs text-red-500">Unconfirmed</Text>
            )}
          </div>
          <div>
            <Text>
              <a
                href={tx.blockExplorerLink(bitcoinNodeUrl)}
                target="_blank"
                className="text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs"
              >
                <span className="hidden md:inline">{tx.txid}</span>
                <span className="inline md:hidden">{trimAddress(tx.txid)}</span>
              </a>
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-white border p-2 flex justify-between">
            <Text className="font-bold text-gray-500">Date</Text>
            <Text className="text-gray-500 italic">{tx.timestamp}</Text>
          </div>
          <div className="bg-white border p-2 flex justify-between">
            <Text className="font-bold text-gray-500">Fee</Text>
            <Text className="text-gray-500 italic">{tx.fee} sats</Text>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1 items-center text-xs px-2 py-4 font-bold top-[78px] border border-x-0">
        <div className="col-span-3 lg:col-span-4 text-left">
          <Text className="">Adddress</Text>
        </div>
        <div className="text-left col-span-3 lg:col-span-2 flex items-center">
          <PinTopIcon className="mr-1" width={12} />
          <Popover title="Vector Input" text="Vin">
            <Text>
              "Vin" stands for Vector Input. A vector is a data structure that
              can store multiple elements. The Vins are the transaction inputs.
            </Text>
          </Popover>
        </div>

        <div className="col-span-3 lg:col-span-2 text-right flex items-end justify-end">
          <PinBottomIcon className="ml-1 mr-1" width={12} />
          <Popover title="Vector Output" text="Vout">
            <Text>
              "Vout" stands for Vector Output. A vector is a data structure that
              can store multiple elements. The Vouts are the transaction
              outputs.
            </Text>
          </Popover>
        </div>
        <div className="col-span-3 lg:col-span-4 text-right">
          <Text className="">Value</Text>
        </div>
      </div>
      <div className={cn("mb-2 pb-2")}>
        <TransactionRow
          transaction={tx}
          address={address}
          index={index}
          onClickTx={onClickTx}
          selectedTxs={selectedTxs}
          walletColor={walletColor}
          currency={props.currency}
        />
      </div>
      <div className="p-4 top-[80px] z-50">
        <TransactionSankey
          wallets={wallets}
          transaction={tx}
          utxo={address}
          width={width}
          height={height}
          selectedTxs={selectedTxs}
          toggleTx={toggleTx}
          index={index}
        />
      </div>
    </div>
  );
};
