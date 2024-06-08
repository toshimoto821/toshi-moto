import { type ITxsInput } from "./Wallet";
import { Transaction } from "./Transaction";
const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;

type UtxoStats = {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
};
export type UtxoData = {
  address: string;
  chain_stats: UtxoStats;
  mempool_stats: UtxoStats;
};

// @todo use and place in settings
// these are external to the core utxo data.
// cross reference 3rd part data, such as onchain data
// you can always fetch it again.
// whereas the Utxo data is more static
type ISettings = {
  cur: string;
  blockExplorer: string;
  btcPrice?: number;
  utxoResponse?: {
    stats: UtxoData;
    details: {
      duration: number;
      status: number;
      startTime: number;
      endTime: number;
    };
  };
  transactions?: ITxsInput;
  // transactionsResponse?: Record<string, any>;
};

export type IUtxoInput = {
  address: string;
  status?: string;
  index: number;
  xpub?: string;
  manual?: boolean;
  isChange?: boolean;
  transactions?: string[];
  walletId: string;
  // @dep
  details?: {
    duration: number;
    status: number;
    startTime: number;
    endTime: number;
  };
};

export class Utxo {
  address: string;
  walletId: string;
  // if the utxo was added manually
  manual: boolean = false;
  // used to determine if the utxo address is derived from change
  isChange?: boolean;
  // the index used on xpub to derive this address
  index?: number;
  // the xpub used to derive this address
  xpub?: string;
  transactionIds: string[] = [];
  transactions: Record<string, Transaction> = {};
  status: string;
  settings: ISettings;

  // status: string = "";
  constructor(
    data: IUtxoInput,
    settings: ISettings = {
      cur: "BTC",

      blockExplorer: VITE_BITCOIN_NODE_URL,
    }
  ) {
    this.address = data.address;
    this.walletId = data.walletId;
    this.index = data.index;
    this.xpub = data.xpub;
    this.isChange = data.isChange;
    this.status = data.status || "loaded";
    this.settings = settings;

    this.manual = data.manual ?? false;
    this.transactionIds = data.transactions ?? [];

    for (const txid of data?.transactions || []) {
      if (settings.transactions?.txs?.[txid]) {
        this.transactions[txid] = new Transaction(
          settings.transactions?.txs[txid].response
        );
      }
    }
  }

  get loading() {
    throw new Error("removed");
  }

  get utxoResponse() {
    return this.settings.utxoResponse;
  }

  get updatedAt() {
    if (!this.utxoResponse?.details?.endTime) return "";

    return new Date(this.utxoResponse?.details?.endTime).toLocaleString();
  }

  get updatedAtShort() {
    if (!this.utxoResponse?.details?.endTime) return "";

    return new Date(this.utxoResponse?.details?.endTime).toLocaleDateString();
  }

  blockExplorerLink(bitcoinNodeUrl = VITE_BITCOIN_NODE_URL) {
    // @todo use settings
    return `${bitcoinNodeUrl}/address/${this.address}`;
  }

  get utxoSum() {
    const fundedTwoSum =
      this.utxoResponse?.stats?.chain_stats.funded_txo_sum || 0;

    const mempoolFundedTwoSum =
      this.utxoResponse?.stats?.mempool_stats.funded_txo_sum || 0;

    const spentTwoSum =
      this.utxoResponse?.stats?.chain_stats.spent_txo_sum || 0;

    const mempoolSpentTwoSum =
      this.utxoResponse?.stats?.mempool_stats.spent_txo_sum || 0;

    const val =
      fundedTwoSum + mempoolFundedTwoSum - (spentTwoSum + mempoolSpentTwoSum);
    if (val > 0) {
      return val / (100 * 1000000);
    }

    return val;
  }
  get balance() {
    return this.utxoSum;
  }

  get value() {
    if (!this.settings.btcPrice) return 0;
    if (!this.utxoSum) return 0;

    return this.settings.btcPrice * this.utxoSum;
  }

  get transactionCount() {
    // return this.transactionIds.length || 0;
    return this.utxoResponse?.stats?.chain_stats.tx_count || 0;
  }

  get listTransactions() {
    return this.transactionIds
      .map((txid) => {
        return this.transactions[txid];
      })
      .filter((val) => val)
      .sort((a, b) => {
        if (a.date && b.date) {
          return b.date.getTime() - a.date.getTime();
        }
        return 0;
      });
  }

  get indexString() {
    if (this.manual) return "n";

    return this.index;
  }

  getTx(txid: string) {
    return this.transactions[txid];
  }

  allocation(totalBalance: number) {
    if (!this.utxoSum) return 0;
    return ((this.utxoSum / totalBalance) * 100).toFixed(2) + "%";
  }
}
