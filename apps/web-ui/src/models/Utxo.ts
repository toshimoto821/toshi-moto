import { Transaction } from "./Transaction";
import { getBitcoinNodeUrl } from "@root/lib/utils";
import { Address as AddressSliceModel } from "@lib/slices/wallets.slice";
import { AddressArgs } from "@root/lib/slices/api.slice.types";
const VITE_BITCOIN_NODE_URL = getBitcoinNodeUrl();

// @todo use and place in settings
// these are external to the core utxo data.
// cross reference 3rd part data, such as onchain data
// you can always fetch it again.
// whereas the Utxo data is more static
type ISettings = {
  cur: string;
  btcPrice?: number;
  // transactionsResponse?: Record<string, any>;
};

export type IUtxoInput = {
  address: string;
  status?: string;
  index: number;
  xpub?: string;
  manual?: boolean;
  isChange?: boolean;
  walletId: string;
};

export class Utxo {
  private _data: AddressSliceModel;
  // the xpub used to derive this address
  xpub?: string;
  transactionIds: string[] = [];
  transactions: Record<string, Transaction> = {};

  private _settings: ISettings;
  details?: AddressSliceModel["details"];
  // status: string = "";
  constructor(
    addressSliceData: AddressSliceModel,
    settings: ISettings = {
      cur: "BTC",
    }
  ) {
    this._data = addressSliceData;

    this._settings = settings;
    this.transactionIds = addressSliceData.transactions.ids;
    this.details = addressSliceData.details;

    this.transactions = Object.values(
      addressSliceData.transactions.entities
    ).reduce((acc, transaction) => {
      return {
        ...acc,
        [transaction.id]: new Transaction(transaction.data),
      };
    }, {});
  }

  get address() {
    return this._data.id;
  }

  get walletId() {
    return this._data.walletId;
  }

  get index() {
    return this._data.index;
  }

  get isChange() {
    return this._data.isChange;
  }

  get status() {
    return this._data.status || "unknown";
  }

  get loading() {
    throw new Error("removed");
  }

  get utxoResponse() {
    return this.details?.data;
  }

  get updatedAtNumber() {
    if (!this.details?.fulfilledTimeStamp) return 0;

    return this.details?.fulfilledTimeStamp;
  }

  get updatedAt() {
    if (!this.details?.fulfilledTimeStamp) return "";

    return new Date(this.details?.fulfilledTimeStamp).toLocaleString();
  }

  get updatedAtShort() {
    if (!this.details?.fulfilledTimeStamp) return "";

    return new Date(this.details.fulfilledTimeStamp).toLocaleDateString();
  }

  get isLoading() {
    return this._data.status === "PENDING";
  }

  get addressArgs(): AddressArgs {
    return {
      address: this.address,
      walletId: this.walletId,
      index: this.index,
      isChange: this.isChange,
    };
  }
  blockExplorerLink(bitcoinNodeUrl = VITE_BITCOIN_NODE_URL) {
    // @todo use settings
    return `${bitcoinNodeUrl}/address/${this.address}`;
  }

  get utxoSum() {
    const fundedTwoSum = this.details?.data.chain_stats.funded_txo_sum || 0;

    const mempoolFundedTwoSum =
      this.details?.data.mempool_stats.funded_txo_sum || 0;

    const spentTwoSum = this.details?.data.chain_stats.spent_txo_sum || 0;

    const mempoolSpentTwoSum =
      this.details?.data.mempool_stats.spent_txo_sum || 0;

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
    if (!this._settings.btcPrice) return 0;
    if (!this.utxoSum) return 0;

    return this._settings.btcPrice * this.utxoSum;
  }

  get transactionCount() {
    // return this.transactionIds.length || 0;
    return this.details?.data.chain_stats.tx_count || 0;
  }

  get listTransactions(): Transaction[] {
    return Object.values(this.transactions);
  }

  get indexString() {
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
