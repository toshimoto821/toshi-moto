import { getBitcoinNodeUrl } from "@root/lib/utils";
import type { Transaction as TransactionSliceModel } from "@lib/slices/api.slice.types";
const VITE_BITCOIN_NODE_URL = getBitcoinNodeUrl();

export class Transaction {
  private _data: TransactionSliceModel;

  constructor(data: TransactionSliceModel) {
    this._data = data;
  }

  get confirmed() {
    return this._data.status.confirmed;
  }

  get date() {
    if (!this._data.status.confirmed) return null;
    return new Date(this._data.status.block_time * 1000);
  }

  get shortDate() {
    const date = this.date;
    if (!date) return "";
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  }

  get longDate() {
    const date = this.date;
    if (!date) return "";
    return `${date.getFullYear().toString()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }

  get timestamp() {
    const date = this.date;
    if (!date) return undefined;
    return date.toLocaleString();
  }
  get dateTime() {
    const date = this.date;
    if (!date) return undefined;

    return date.getTime();
  }

  get fee() {
    return this._data.fee;
  }

  get txid() {
    return this._data.txid;
  }

  get vin() {
    return this._data.vin;
  }

  get vout() {
    return this._data.vout;
  }

  blockExplorerLink(bitcoinNodeUrl = VITE_BITCOIN_NODE_URL) {
    return `${bitcoinNodeUrl}/tx/${this.txid}`;
  }

  findVout(address: string) {
    return this._data.vout.find(
      (vout) => vout.scriptpubkey_address === address
    );
  }

  findVin(address: string) {
    return this._data.vin.find(
      (vin) => vin.prevout.scriptpubkey_address === address
    );
  }
  sumVin(address: string) {
    return this._data.vin
      .filter((vin) => vin.prevout.scriptpubkey_address === address)
      .reduce((acc, vin) => acc + vin.prevout.value, 0);
  }

  sumVout(address: string) {
    return this._data.vout
      .filter((vout) => vout.scriptpubkey_address === address)
      .reduce((acc, vout) => acc + vout.value, 0);
  }
}
