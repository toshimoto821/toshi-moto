const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;

type ITxStatus = {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
};

type IVOut = {
  scriptpubkey_asm: string;
  scriptpubkey_address: string;
  scriptpubkey_type: string;
  scriptpubkey_hex: string;
  value: number;
};

type IVin = {
  inner_redeemscript_asm: string;
  inner_witnessscript_asm: string;
  is_coinbase: boolean;
  prevout: IVOut;
  scriptsig: string;
  scriptsig_asm: string;
  txid: string;
  vout: number;
  witness: string[];
};

export type ITransactionData = {
  fee: number;
  locktime: number;
  size: number;
  status: ITxStatus;
  txid: string;
  vin: IVin[];
  vout: IVOut[];
  weight: number;
};

export class Transaction {
  data: ITransactionData;

  constructor(data: ITransactionData) {
    this.data = data;
  }

  get confirmed() {
    return this.data.status.confirmed;
  }

  get date() {
    if (!this.data.status.confirmed) return null;
    return new Date(this.data.status.block_time * 1000);
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
    return this.data.fee;
  }

  get txid() {
    return this.data.txid;
  }

  get vin() {
    return this.data.vin;
  }

  get vout() {
    return this.data.vout;
  }

  blockExplorerLink(bitcoinNodeUrl = VITE_BITCOIN_NODE_URL) {
    return `${bitcoinNodeUrl}/tx/${this.txid}`;
  }

  findVout(address: string) {
    return this.data.vout.find((vout) => vout.scriptpubkey_address === address);
  }

  findVin(address: string) {
    return this.data.vin.find(
      (vin) => vin.prevout.scriptpubkey_address === address
    );
  }
  sumVin(address: string) {
    return this.data.vin
      .filter((vin) => vin.prevout.scriptpubkey_address === address)
      .reduce((acc, vin) => acc + vin.prevout.value, 0);
  }

  sumVout(address: string) {
    return this.data.vout
      .filter((vout) => vout.scriptpubkey_address === address)
      .reduce((acc, vout) => acc + vout.value, 0);
  }
}
