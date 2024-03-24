import { Text } from "@radix-ui/themes";
import { TransactionSankey } from "@components/graphs/TransactionSankey";
import { TransactionRow } from "./TransactionRow";
import { Utxo } from "@models/Utxo";
import { Wallet } from "@models/Wallet";
import { Transaction } from "@models/Transaction";
import { PinTopIcon, PinBottomIcon } from "@radix-ui/react-icons";
import { cn, trimAddress } from "@lib/utils";

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

  const walletColor =
    wallets.find((w) => w.id === address.walletId)?.color || "#ccc";

  return (
    <div className="mb-8">
      <div className="bg-gray-50 border p-4">
        <div className="flex justify-between mb-2 items-end">
          <div>
            <Text className="font-bold" size="6">
              Transaction{" "}
            </Text>
          </div>
          <div>
            <Text>
              <a
                href={tx.blockExplorerLink}
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
            <Text className="font-bold">Date</Text>
            <Text>{tx.timestamp}</Text>
          </div>
          <div className="bg-white border p-2 flex justify-between">
            <Text className="font-bold">Fee</Text>
            <Text>{tx.fee} sats</Text>
          </div>
        </div>
      </div>
      <div className="p-4 sticky top-[80px] z-50">
        <TransactionSankey
          wallets={wallets}
          transaction={tx}
          utxo={address}
          width={width}
          height={height}
          selectedTxs={selectedTxs}
          toggleTx={toggleTx}
        />
      </div>
      <div className="grid grid-cols-8 gap-1 items-center text-xs px-4 py-4 font-bold top-[78px] border border-x-0">
        <div className="col-span-1"></div>

        <div className="text-left col-span-2 flex items-center">
          <PinTopIcon className="mr-1" width={12} />
          <Text className="">Vin</Text>{" "}
        </div>

        <div className="col-span-2 text-right flex items-center justify-end">
          <PinBottomIcon className="ml-1" width={12} />{" "}
          <Text className="">Vout</Text>
        </div>
        <div className="col-span-3 text-right">
          <Text className="">BTC</Text>
        </div>
      </div>
      <div className={cn("my-2 border border-x-0 border-t-0 pb-2")}>
        <TransactionRow
          transaction={tx}
          address={address}
          index={index}
          onClickTx={onClickTx}
          selectedTxs={selectedTxs}
          walletColor={walletColor}
        />
      </div>
    </div>
  );
};
