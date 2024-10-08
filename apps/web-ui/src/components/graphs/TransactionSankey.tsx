import { useNavigate } from "react-router-dom";
import { Wallet } from "@models/Wallet";
import { Sankey, type Node } from "./sankey/Sankey";
import { Utxo } from "@models/Utxo";
import { Transaction } from "@models/Transaction";
import { useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";
type ITransactionSankey = {
  utxo: Utxo;
  transaction: Transaction;
  width: number;
  height: number;
  wallets: Wallet[];
  toggleTx: (tx: Transaction) => void;
  index: number;
};

export const TransactionSankey = ({
  utxo,
  transaction: tx,
  width,
  height,
  wallets,
  toggleTx,
  index,
}: ITransactionSankey) => {
  const navigate = useNavigate();
  const { graphSelectedTransactions: selectedTxs } = useAppSelector(selectUI);
  const utxoWallet = utxo.walletId
    ? wallets.find((w) => w.id === utxo.walletId)
    : null;
  const handleClick = async (type: "tx" | "address", value: string) => {
    if (type === "tx") {
      const tx = utxo.getTx(value);
      if (tx) {
        toggleTx(tx);
      }
    } else {
      // @todo this is a hack
      // walletId should be based into the data and this lookup could be expensive
      const wallet = wallets.find((wallet) => wallet.hasAddress(value));
      if (wallet) {
        navigate(`/${wallet.id}/${value}`);
      }
    }
  };

  const links = [];
  const nodes = new Map<string, Node>();

  const vins = tx.vin;
  nodes.set(`${tx.txid}`, {
    name: `${tx.txid}`,
    type: "tx",
    date: tx.dateTime,
    addressIndex: utxo.indexString,
  });
  // nodes.push({ name: `${tx.txid}`, type: "tx" });
  for (let i = 0; i < vins.length; i++) {
    const vin = tx.vin[i];
    const wallet = wallets.find((wallet) =>
      wallet.hasAddress(vin.prevout.scriptpubkey_address)
    );

    nodes.set(`${tx.txid}`, {
      name: `${tx.txid}`,
      type: "tx",
      color: utxoWallet?.color ?? "black",
      date: tx.dateTime,
      addressIndex: utxo.indexString,
    });

    nodes.set(`${vin.prevout.scriptpubkey_address}`, {
      name: `${vin.prevout.scriptpubkey_address}`,
      type: "node",
      color: wallet?.color,
      date: tx.dateTime,
      addressIndex: utxo.indexString,
      // isHighlighed: utxo.address === vin.prevout.scriptpubkey_address,
    });
    links.push({
      source: `${vin.prevout.scriptpubkey_address}`,
      target: tx.txid,
      // this seems wrong. its owned by the utxo object (address) but is it spent?
      // should really be called isOwned
      isUtxo: vin.prevout.scriptpubkey_address === utxo.address,
      wallet: wallet?.name,
      color: wallet?.color,
      date: tx.dateTime,
      type: "source",
      value: vin.prevout.value,
      addressIndex: utxo.indexString,
      // isHighlighed: utxo.address === vin.prevout.scriptpubkey_address,
    });
  }

  const vouts = tx.vout;
  for (let i = 0; i < vouts.length; i++) {
    const vout = tx.vout[i];

    const wallet = wallets.find((wallet) =>
      wallet.hasAddress(vout.scriptpubkey_address)
    );
    nodes.set(`${vout.scriptpubkey_address}`, {
      name: `${vout.scriptpubkey_address}`,
      type: "node",
      color: wallet?.color,
      date: tx.dateTime,
      addressIndex: utxo.indexString,
      // isHighlighed: utxo.address === vout.scriptpubkey_address,
    });
    // if output address is in input, don't add a link back because it creates a circular reference
    const circular =
      vins.findIndex(
        (vin) => vin.prevout.scriptpubkey_address === vout.scriptpubkey_address
      ) > -1;
    let target = `${vout.scriptpubkey_address}`;
    if (circular) {
      target += "-circular";
      nodes.set(target, {
        name: target,
        type: "node",
        color: wallet?.color,
        date: tx.dateTime,
        addressIndex: utxo.indexString,
      });
    }
    links.push({
      source: `${tx.txid}`,
      target,
      isUtxo: vout.scriptpubkey_address === utxo.address,
      wallet: wallet?.name,
      color: wallet?.color,
      type: "target",
      value: vout.value,
      date: tx.dateTime,
      addressIndex: utxo.indexString,
      // isHighlighed: utxo.address === vout.scriptpubkey_address,
    });
  }

  // handle the fee
  nodes.set(`${tx.txid}-fee`, {
    name: `${tx.txid}-fee`,
    type: "node",
    color: "gray",
    date: tx.dateTime,
    addressIndex: utxo.indexString,
  });
  links.push({
    source: `${tx.txid}`,
    target: `${tx.txid}-fee`,
    isUtxo: false,
    wallet: "fee",
    color: "gray",
    type: "target",
    value: tx.fee,
    date: tx.dateTime,
    addressIndex: utxo.indexString,
  });

  const data = {
    nodes: Array.from(nodes.values()),
    links,
  };
  if (data.nodes.length === 0) {
    return null; // @todo loader
  }

  return (
    <Sankey
      data={data}
      width={width}
      height={height}
      onClick={handleClick}
      selectedTxs={selectedTxs}
      index={index}
    />
  );
};
