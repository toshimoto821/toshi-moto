import { Text, IconButton } from "@radix-ui/themes";
import { Transaction } from "@models/Transaction";
import { Utxo } from "@models/Utxo";
import { cn, trimAddress, padBtcZeros } from "@lib/utils";
import { useBreakpoints } from "@root/lib/hooks/useBreakpoints";

type ITransactionRow = {
  transaction: Transaction;
  address: Utxo;
  index: number;
  walletColor: string;
  className?: string;
  selectedTxs: Set<string>;
  onClickTx: () => void;
};

type ITransactionRowDetails = {
  indexKeyText: string;
  date: string;
  txid: string;
  href: string;
  vout: string;
  vin: string;
  btc: number;
  type: "VIN" | "VOUT";
};

export const TransactionRow = ({
  transaction,
  address,
  index,
  selectedTxs,
  onClickTx,
  walletColor,
}: ITransactionRow) => {
  const breakpointIndex = useBreakpoints();

  const getVins = () => {
    return transaction.vin.map(
      (vin) =>
        ({
          indexKeyText: `${address.indexString}.${index + 1}`,
          date:
            breakpointIndex < 3 ? transaction.shortDate : transaction.longDate,
          txid: transaction.txid,
          href: transaction.blockExplorerLink,
          vin: vin.prevout.scriptpubkey_address,
          vout: "",
          btc: vin.prevout.value,
          type: "VIN",
        } as ITransactionRowDetails)
    );
  };

  const getVouts = () => {
    return transaction.vout.map(
      (vout) =>
        ({
          indexKeyText: `${address.indexString}.${index + 1}`,
          date:
            breakpointIndex < 3 ? transaction.shortDate : transaction.longDate,
          txid: transaction.txid,
          href: transaction.blockExplorerLink,
          vin: "",
          vout: vout.scriptpubkey_address,
          btc: vout.value,
          type: "VOUT",
        } as ITransactionRowDetails)
    );
  };

  const data = [...getVins(), ...getVouts()];

  return data.map((vinOrVout, key) => {
    const isNotCurrentWallet =
      (vinOrVout.type === "VIN" && vinOrVout.vin !== address.address) ||
      (vinOrVout.type === "VOUT" && vinOrVout.vout !== address.address);
    return (
      <div
        key={key}
        style={{ color: isNotCurrentWallet ? "" : walletColor }}
        className={cn(
          "grid grid-cols-8 gap-1 items-center text-xs px-2 py-2 mx-2",
          {
            "bg-gray-50": key % 2 === 0,
            "opacity-30": isNotCurrentWallet,
          }
        )}
      >
        <div className="col-span-1 overflow-hidden">
          <IconButton
            variant="surface"
            color={selectedTxs.has(vinOrVout.txid) ? "orange" : "sky"}
            onClick={onClickTx}
            className="flex items-center justify-center"
          >
            <div className="flex  items-center justify-center text-xs text-center ">
              {vinOrVout.indexKeyText}
            </div>
          </IconButton>
        </div>

        <div className="col-span-2 lg:col-span-3 text-left font-mono">
          <span className="hidden lg:inline">{vinOrVout.vin}</span>
          <span className="inline lg:hidden">
            {trimAddress(vinOrVout.vin, { prefix: 2 })}
          </span>
        </div>
        <div className="text-right col-span-2 lg:col-span-3 font-mono">
          <span className="hidden lg:inline">{vinOrVout.vout}</span>
          <span className="inline lg:hidden">
            {trimAddress(vinOrVout.vout, { prefix: 2 })}
          </span>
        </div>
        <div className="col-span-3 lg:col-span-1 text-right font-mono">
          <Text>{padBtcZeros((vinOrVout.btc || 0) / 100000000)} </Text>
        </div>
      </div>
    );
  });
};
