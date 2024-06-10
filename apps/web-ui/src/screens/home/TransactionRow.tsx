import { useState } from "react";
import { Text, Button } from "@radix-ui/themes";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Transaction } from "@models/Transaction";
import { Utxo } from "@models/Utxo";
import { cn, trimAddress, padBtcZeros, formatPrice } from "@lib/utils";
import { AppContext } from "@root/providers/AppProvider";
import { useBreakpoints } from "@root/lib/hooks/useBreakpoints";
import { ICurrency } from "@root/types";
import { cloneDeep } from "lodash";
import { currencySymbols } from "@root/lib/currencies";
type ITransactionRow = {
  transaction: Transaction;
  address: Utxo;
  index: number;
  walletColor: string;
  className?: string;
  selectedTxs: Set<string>;
  onClickTx: () => void;
  currency: ICurrency;
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
  // selectedTxs,
  // onClickTx,
  walletColor,
  currency,
}: ITransactionRow) => {
  const breakpointIndex = useBreakpoints();

  const [isTxDetailsExpanded, setIsTxDetailsExpanded] = useState(false);

  const bitcoinNodeUrl = AppContext.useSelector(
    (current) => current.context.meta.config.bitcoinNodeUrl
  );

  const getVins = () => {
    return transaction.vin.map(
      (vin) =>
        ({
          indexKeyText: `${address.indexString}.${index + 1}`,
          date:
            breakpointIndex < 3 ? transaction.shortDate : transaction.longDate,
          txid: transaction.txid,
          href: transaction.blockExplorerLink(bitcoinNodeUrl),
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
          href: transaction.blockExplorerLink(bitcoinNodeUrl),
          vin: "",
          vout: vout.scriptpubkey_address,
          btc: vout.value,
          type: "VOUT",
        } as ITransactionRowDetails)
    );
  };

  const vins = getVins();
  const vouts = getVouts();
  const [firstVout] = vouts;
  const fee = cloneDeep(firstVout);
  fee.vout = "Transaction fee";
  fee.btc = transaction.fee;
  fee.href = "";
  const data = [...vins, ...vouts, fee];

  const rows = data
    .filter((vinOrVout) => {
      const isNotCurrentWallet =
        (vinOrVout.type === "VIN" && vinOrVout.vin !== address.address) ||
        (vinOrVout.type === "VOUT" && vinOrVout.vout !== address.address);
      if (isNotCurrentWallet && !isTxDetailsExpanded) {
        return false;
      }
      return true;
    })
    .map((vinOrVout, key) => {
      const isNotCurrentWallet =
        (vinOrVout.type === "VIN" && vinOrVout.vin !== address.address) ||
        (vinOrVout.type === "VOUT" && vinOrVout.vout !== address.address);

      const btcAmount = (vinOrVout.btc || 0) / 100000000;
      const btcValue = (address.settings.btcPrice || 0) * btcAmount;
      return (
        <div
          key={key}
          data-component="TransactionRow"
          style={{ color: isNotCurrentWallet ? "" : walletColor }}
          className={cn(
            "grid grid-cols-12 gap-1 items-center text-xs px-2 py-2 mx-0 border border-x-0 border-t-0 border-gray-200",
            {
              "bg-gray-50": key % 2 === 0,
              "opacity-70": isNotCurrentWallet,
            }
          )}
        >
          <div className="col-span-3 lg:col-span-5 text-left font-mono">
            <span className="hidden lg:inline">{vinOrVout.vin}</span>
            <span className="inline lg:hidden">
              {trimAddress(vinOrVout.vin, { prefix: 2 })}
            </span>
          </div>
          <div className="text-right col-span-3 lg:col-span-5 font-mono">
            <span className="hidden lg:inline">
              {trimAddress(vinOrVout.vout, { prefix: 6, suffix: 60 })}
            </span>
            <span className="inline lg:hidden">
              {trimAddress(vinOrVout.vout, { prefix: 2 })}
            </span>
          </div>
          <div className="col-span-3 lg:col-span-1 text-right font-mono">
            <span className="hidden lg:inline">{padBtcZeros(btcAmount)}</span>
            <span className="inline lg:hidden">
              {padBtcZeros(btcAmount, 4)}
            </span>
          </div>
          <div className="col-span-3 lg:col-span-1 text-right font-mono">
            <Text>
              {currencySymbols[currency]}
              <span className="hidden lg:inline">{formatPrice(btcValue)}</span>
              <span className="inline lg:hidden">
                {formatPrice(btcValue, 0)}
              </span>
            </Text>
          </div>
        </div>
      );
    });

  return (
    <div data-component="TransactionRows">
      {rows}
      <div className="flex justify-center items-center text-xs px-2 py-2 mx-0 border border-t-0 border-x-0 ">
        <Button
          variant="ghost"
          onClick={() => setIsTxDetailsExpanded(!isTxDetailsExpanded)}
          className="flex items-center justify-center"
          size="1"
        >
          {isTxDetailsExpanded && (
            <>
              <EyeClosedIcon width="16" height="15" />
              Hide Other ({vins.length} Inputs / {vouts.length} Outputs)
            </>
          )}
          {!isTxDetailsExpanded && (
            <>
              <EyeOpenIcon width="16" height="15" />
              Show All ({vins.length} Inputs / {vouts.length} Outputs)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
