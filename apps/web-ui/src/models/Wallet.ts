import { Utxo } from "./Utxo";
import { Xpub } from "./Xpub";
import { Transaction } from "@models/Transaction";
import { ICurrency } from "@root/types";
import { currencySymbols } from "@root/lib/currencies";
import { type Wallet as WalletSliceModel } from "@lib/slices/wallets.slice";

export type IWalletExport = {
  name: string;
  color: string;
  xpubs: string[];
};

export type IWalletManifest = {
  name: number;
  color: number;
  xpubs: number;
};

export type ITxLite = {
  txid: string;
  blockHeight: number;
};

export type ITxsInput = {
  // stores the txs response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txs: Record<string, any>;
  // keeps track of request status - loading, complete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addr: Record<string, any>;
};

export type AddressMeta = {
  // used for UI
  startIndex: number;
  // use for UI
  limit: number;
  // used to tell how many addresses have been generated
  // to fetch data onload from
  lastAddressIndex: number;
};

type IWalletSettings = {
  cur: ICurrency;
  btcPrice?: number;
};

// @todo rename WalletDto
export class Wallet {
  addresses: Record<string, Utxo> = {};
  xpubs: Xpub[] = [];

  addressMeta: {
    addressWithBalances: Set<string>;
  } = {
    addressWithBalances: new Set(),
  };

  private _balance?: number;
  // private bitcoinjs?: any;
  private _data: WalletSliceModel;
  private _settings: IWalletSettings;
  constructor(walletData: WalletSliceModel, settings: IWalletSettings) {
    this._settings = settings;
    this._data = walletData;

    this.addresses = Object.values(walletData.addresses.entities).reduce(
      (acc, address) => {
        return {
          ...acc,
          [address.id]: new Utxo(
            {
              ...address,
              walletId: this.id,
              status: address.status,
            },
            {
              ...settings,
              btcPrice: this._settings.btcPrice,
            }
          ),
        };
      },
      {}
    );

    this.xpubs = walletData.xpubs.map((xpub) => {
      return new Xpub(xpub);
    });

    this.setMeta();
  }

  setMeta() {
    for (const address of this.listAddresses) {
      if (address.utxoSum) {
        this.addressMeta.addressWithBalances.add(address.address);
      }
    }
  }

  get color() {
    return this._data.color;
  }

  get name() {
    return this._data.name;
  }

  get id() {
    return this._data.id;
  }

  get archived() {
    return this._data.archived || false;
  }

  get walletType() {
    return this._data.walletType || "xpub";
  }

  get isManualWallet() {
    return this.walletType === "manual";
  }

  get canDeriveAddresses() {
    return !this.isManualWallet && this.xpubs.length > 0;
  }

  get error() {
    return this._data.meta?.error || null;
  }

  get balance() {
    if (this._balance) return this._balance;
    const utxos = this.listUtxos;
    const sum = utxos.reduce((acc, cur) => {
      return acc + cur.utxoSum;
    }, 0);

    this._balance = sum;

    return sum;
  }

  get value() {
    const sum = this.listUtxos.reduce((acc, address) => {
      return acc + address.value;
    }, 0);
    return sum;
  }

  get btcPrice() {
    return this._settings.btcPrice;
  }

  get settings() {
    return this._settings;
  }

  get receiveMeta() {
    return this._data.meta.receive;
  }

  get changeMeta() {
    return this._data.meta.change;
  }

  get refreshedAt() {
    return this._data.meta.refreshedAt;
  }

  // @deprecated
  get earliestTxDate() {
    throw new Error("implement earliestTxDate");
    // const d = new Date();
    // d.setHours(0, 0, 0, 0);
    // d.setFullYear(d.getFullYear() - 1);
    // const asNumber = d.getTime();
    // if (this._earliestTxDate < asNumber) {
    //   return this._earliestTxDate;
    // }
    return null;
  }

  allocation(totalBalance: number) {
    const val = (this.balance / totalBalance) * 100;
    if (isNaN(val)) return "0%";
    return val.toFixed(2) + "%";
  }

  get isArchived() {
    console.log(this, "wallet");
    return false;
  }

  /**
   * only returns addresses with balances
   */
  get listUtxos() {
    const filtered = Array.from(this.addressMeta.addressWithBalances).map(
      (address) => this.addresses[address]
    );

    return filtered;
  }

  get listUtxoTxs() {
    const utxos = this.listUtxos;
    const txs = utxos.reduce((acc, cur) => {
      return [...acc, ...cur.listTransactions];
    }, [] as Transaction[]);
    return txs;
  }

  get listXpubs() {
    const xpubs = Object.values(this.xpubs);

    return xpubs;
  }

  get listXpubsStrings() {
    const xpubs = this.listXpubs;
    return xpubs.map((xpub) => xpub.address);
  }

  get listAddresses() {
    return Object.values(this.addresses);
  }

  get listChangeAddresses() {
    return Object.values(this.addresses).filter((address) => {
      return address.isChange;
    });
  }

  get listReceiveAddresses() {
    return Object.values(this.addresses).filter((address) => {
      return !address.isChange;
    });
  }

  get updatedAtNumber(): number {
    const utxos = this.listUtxos;
    if (utxos.length === 0) return 0;
    const dates = utxos.map((utxo) => utxo.updatedAtNumber);
    const max = Math.max(...dates);
    return max;
  }

  get updatedAt() {
    return new Date(this.updatedAtNumber).toLocaleString();
  }

  get transactionCount() {
    return this.listAddresses.reduce((acc, cur) => {
      return acc + cur.transactionCount;
    }, 0);
  }

  get loadedTransactionCount() {
    return this.listAddresses.reduce((acc, cur) => {
      return acc + cur.listTransactions.length;
    }, 0);
  }

  get utxoCount() {
    return this.listUtxos.length;
  }

  get txsForUtxos() {
    const utxos = this.listUtxos;
    const txs = utxos.reduce((acc, cur) => {
      return [...acc, ...cur.listTransactions];
    }, [] as Transaction[]);

    return txs;
  }

  get currencySymbol() {
    return currencySymbols[this._settings.cur];
  }

  /**
   *  Tells if the address is a utxo or is spent
   * @param address string
   */
  hasUtxo(address: string) {
    return this.addressMeta.addressWithBalances.has(address);
  }

  hasAddress(address: string) {
    return !!this.addresses[address];
  }

  /**
   *
   * @param onlyUtxos only return addresses with utxos
   * @param change return change addresses
   * @param receive return receive addresses
   * @param addresses force these addresses to be returned as well
   * @returns Utxo[]
   */
  getAddresses({
    onlyUtxos,
    change = false,
    receive = true,
    addresses: includedAddresses,
    sort,
  }: {
    onlyUtxos?: boolean;
    change?: boolean;
    receive?: boolean;
    min?: number;
    addresses?: string[];
    sort?: "asc" | "desc";
  } = {}) {
    const sortAsc = (a: Utxo, b: Utxo) => {
      return a.index! - b.index!;
    };

    const sortDesc = (a: Utxo, b: Utxo) => {
      return b.index! - a.index!;
    };

    const forcedAddresses = includedAddresses?.length
      ? this.listAddresses.filter((address) => {
          return includedAddresses.includes(address.address);
        })
      : [];

    if (onlyUtxos) {
      const utxos = forcedAddresses
        .concat(this.listUtxos)
        .filter((address) => {
          if (includedAddresses?.length) {
            if (includedAddresses.includes(address.address)) return true;
          }
          if (change && receive) return true;

          if (change && !address.isChange) {
            return false;
          }

          if (receive && address.isChange) {
            return false;
          }
          return true;
        })
        // .filter(this.paginationFilter(!!change, addresses))
        .sort(sort === "asc" ? sortAsc : sortDesc);

      const map = new Map<string, Utxo>();
      utxos.forEach((address) => {
        map.set(address.address, address);
      });
      const ret = Array.from(map.values()).sort(
        sort === "asc" ? sortAsc : sortDesc
      );

      return ret;
    }

    const addresses = forcedAddresses
      .concat(this.listAddresses)
      .filter((address) => {
        if (change && receive) return true;
        if (change && !address.isChange) return false;
        if (receive && address.isChange) return false;
        return true;
      });

    const map = new Map<string, Utxo>();
    addresses.forEach((address) => {
      map.set(address.address, address);
    });

    const ret = Array.from(map.values()).sort(
      sort === "asc" ? sortAsc : sortDesc
    );
    return ret;
  }
  getLastAddressAtIndex({
    index,
    type,
  }: {
    index: number;
    type: "CHANGE" | "RECEIVE";
  }) {
    const addresses =
      type === "CHANGE" ? this.listChangeAddresses : this.listReceiveAddresses;

    return addresses[index];
  }
  getNextAddressIndex({ type }: { type: "CHANGE" | "RECEIVE" }) {
    // const meta = type === "CHANGE" ? this.changeMeta : this.receiveMeta;
    const addresses =
      type === "CHANGE" ? this.listChangeAddresses : this.listReceiveAddresses;
    addresses.reverse(); // descending to find last address with tx
    let lastAddressIndex = -1;
    for (const utxo of addresses) {
      if (utxo.transactionCount > 0) {
        lastAddressIndex = utxo.index!;
        break;
      }
    }
    return lastAddressIndex + 1;
  }

  // @deprecated
  getTxs(startDate: Date, endDate: Date) {
    const transactions = [];
    for (const addr of this.listAddresses) {
      const txs = addr.listTransactions;
      for (const tx of txs) {
        if (tx.date && tx.date > startDate && tx.date < endDate) {
          transactions.push(tx);
        }
      }
    }

    return transactions;
  }

  getTxsByIds(txids: string[]) {
    const transactions = [];
    for (const addr of this.listAddresses) {
      const addrTxs = addr.transactions;
      for (const txid of txids) {
        if (addrTxs[txid]) {
          transactions.push(addrTxs[txid]);
        }
      }
    }

    return transactions.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    });
  }

  getTxsForAddress(address: string) {
    const addr = this.addresses[address];
    if (!addr) return [];
    return addr.listTransactions;
  }

  isAddressLoaded(address: string) {
    // const txs = this.getTxsForAddress(address);
    const addr = this.addresses[address];
    if (!addr) return false;
    return addr.status === "complete";
  }

  get orderedAddresses() {
    const addresses = this.listAddresses;
    return addresses.sort((a, b) => {
      if (a.index === undefined || b.index === undefined) return 0;
      return a.index - b.index;
    });
  }

  getAddressAtIndex(index: number, change = false) {
    const address = this.listAddresses.find(
      (addr) => addr.index === index && addr.isChange === change
    );

    return address;
  }

  getTxsOutputValue(startDate: Date, endDate: Date) {
    let value = 0;
    // need to be able to choose between listAddresses (all txs, event spent)
    // vs listUtxos which is just utxos
    for (const addr of this.listUtxos) {
      const txs = addr.listTransactions;
      for (const tx of txs) {
        if (tx.date && tx.date > startDate && tx.date < endDate) {
          value += tx.findVout(addr.address)?.value ?? 0;
        }
      }
    }

    return value / 100000000;
  }

  getAddress(address: string) {
    return this.addresses[address];
  }
  export(): IWalletExport {
    const xpubs = this.xpubs.map((xpub) => xpub.address);
    return {
      name: this.name,
      color: this.color,
      xpubs,
    };
  }
}
