import { Utxo, IUtxoInput } from "./Utxo";
import { Xpub, IXpubInput } from "./Xpub";
import { Transaction } from "@models/Transaction";
import { IUtxoRequest } from "@machines/appMachine";
import { ICurrency } from "@root/types";
import { currencySymbols } from "@root/lib/currencies";

export type IWalletInput = {
  name: string;
  id: string;
  color: string;
  utxos?: Record<string, IUtxoInput>; // @deprecated
  xpubs?: Record<string, IXpubInput>;
  addresses: Record<string, IUtxoInput>;
  transactions: Record<string, ITxLite>;
  accountType: "MULTI_SIG" | "SINGLE_SIG";
  changeMeta: AddressMeta;
  receiveMeta: AddressMeta;
  earliestTxDate: number;
  refreshedAt?: Date;
  settings: {
    cur?: string;
    blockExplorer?: string;
    btcPrice?: number;
    addresses?: Record<string, IUtxoRequest>;
    transactions?: ITxsInput;
    addressFilters: IWalletAddressFilters;
  };
};

export type IWalletExport = {
  name: string;
  color: string;
  xpubs: string[];
  utxos: string[];
};

export type IWalletManifest = {
  name: number;
  color: number;
  xpubs: number;
  utxos: number;
};

export type IWalletAddressFilters = {
  change: boolean;
  receive: boolean;
  utxoOnly: boolean;
  // inputAddresses: boolean;
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
  blockExplorer: string;
  btcPrice?: number;
  addresses: Record<string, IUtxoRequest>;
  transactions: ITxsInput;
  addressFilters: IWalletAddressFilters;
};

const defaultSettings: IWalletSettings = {
  cur: "usd",
  blockExplorer: "mempool.space",
  addresses: {},
  transactions: {
    txs: {},
    addr: {},
  },
  addressFilters: {
    change: true,
    receive: true,
    utxoOnly: false,
  },
};

export class Wallet {
  name: string;
  id: string;
  color: string;
  utxos: Record<string, Utxo> = {};
  addresses: Record<string, Utxo> = {};
  xpubs: Record<string, Xpub> = {};
  settings: IWalletSettings;
  btcPrice?: number;
  accountType: "MULTI_SIG" | "SINGLE_SIG" = "SINGLE_SIG";
  receiveMeta: AddressMeta;
  changeMeta: AddressMeta;
  private _earliestTxDate: number;
  addressMeta: {
    addressWithBalances: Set<string>;
  } = {
    addressWithBalances: new Set(),
  };

  private _balance?: number;
  refreshedAt?: Date;
  // private bitcoinjs?: any;

  constructor(data: IWalletInput, settings: IWalletSettings) {
    this.name = data.name;
    this.id = data.id;
    this.color = data.color;
    this.btcPrice = settings.btcPrice;
    this.accountType = data.accountType;
    this.refreshedAt = data.refreshedAt;
    this._earliestTxDate = data.earliestTxDate;

    this.receiveMeta = data.receiveMeta || {
      startIndex: 0,
      limit: 10,
      lastAddressIndex: 10,
    };

    this.changeMeta = data.changeMeta || {
      startIndex: 0,
      limit: 10,
      lastAddressIndex: 10,
    };

    this.addresses = Object.keys(data.addresses || {}).reduce((acc, cur) => {
      const address = data.addresses?.[cur];
      if (!address) return acc;
      const responseData = settings.addresses?.[cur]?.response;
      const utxoResponse = responseData
        ? {
            stats: responseData.data,
            details: responseData.details,
          }
        : undefined;

      // console.log("txs", address.transactions);

      // const txResponseData = settings.transactions?.[cur]?.response;
      return {
        ...acc,
        [cur]: new Utxo(
          {
            ...address,
            walletId: this.id,
            status: settings.addresses?.[cur]?.status,
          },
          {
            ...settings,
            btcPrice: this.btcPrice,
            utxoResponse,
          }
        ),
      };
    }, {});

    this.xpubs = Object.keys(data.xpubs || {}).reduce((acc, cur) => {
      const xpub = data.xpubs?.[cur];
      if (!xpub) return acc;
      return {
        ...acc,
        [cur]: new Xpub(xpub, {
          ...settings,
          btcPrice: this.btcPrice,
        }),
      };
    }, {});

    this.settings = {
      ...defaultSettings,
      ...settings,
      addressFilters: {
        ...defaultSettings.addressFilters,
        ...settings.addressFilters,
      },
    };
    this.setMeta();
  }

  setMeta() {
    for (const address of this.listAddresses) {
      if (address.utxoSum) {
        this.addressMeta.addressWithBalances.add(address.address);
      }
    }
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
    const sum = this.listUtxos.reduce((acc, xpub) => {
      return acc + xpub.value;
    }, 0);
    return sum;
  }

  get earliestTxDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setFullYear(d.getFullYear() - 1);
    const asNumber = d.getTime();
    if (this._earliestTxDate < asNumber) {
      return this._earliestTxDate;
    }
    return asNumber;
  }

  allocation(totalBalance: number) {
    const val = (this.balance / totalBalance) * 100;
    if (isNaN(val)) return "0%";
    return val.toFixed(2) + "%";
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

  get listAddresses() {
    return Object.values(this.addresses);
  }

  get listManualAddresses() {
    return this.listAddresses.filter((address) => {
      return address.manual;
    });
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
    const dates = utxos.map((utxo) => utxo.utxoResponse?.details?.endTime || 0);
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
    return currencySymbols[this.settings.cur];
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

  hasLoadingUtxos(addressType?: "RECEIVE" | "CHANGE") {
    let list = [] as string[];
    if (addressType === "RECEIVE") {
      list = this.listReceiveAddresses.map((address) => address.address);
    } else if (addressType === "CHANGE") {
      list = this.listChangeAddresses.map((address) => address.address);
    } else {
      list = this.listAddresses.map((address) => address.address);
    }
    return list.some(
      (address) => !!this.settings?.addresses?.[address]?.loading
    );
  }
  // @ts-expect-error deprecated
  private paginationFilter(change: boolean) {
    return (address: Utxo) => {
      // always show manual addresses
      if (address.manual) return true;
      if (change) {
        if (address.index === undefined) return false;
        if (address.index < this.changeMeta.startIndex) return false;
        if (address.index > this.changeMeta.startIndex + this.changeMeta.limit)
          return false;
        return true;
      }

      if (address.index === undefined) return false;
      if (address.index < this.receiveMeta.startIndex) return false;
      if (address.index > this.receiveMeta.startIndex + this.receiveMeta.limit)
        return false;

      return true;
    };
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
    const txs = this.getTxsForAddress(address);
    return txs.every((tx) => !!tx.date);
  }

  get orderedAddresses() {
    const addresses = this.listAddresses;
    return addresses.sort((a, b) => {
      if (a.index === undefined || b.index === undefined) return 0;
      return a.index - b.index;
    });
  }

  getAddressAtIndex(index: number, change: boolean = false) {
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
    const xpubs = Object.keys(this.xpubs);
    const utxos = Object.keys(this.utxos);
    return {
      name: this.name,
      color: this.color,
      xpubs,
      utxos,
    };
  }
}
