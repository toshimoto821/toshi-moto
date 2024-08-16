declare module "@toshimoto821/bitcoinjs";

export type ICurrency =
  | "btc"
  | "eth"
  | "ltc"
  | "bch"
  | "bnb"
  | "eos"
  | "xrp"
  | "xlm"
  | "link"
  | "dot"
  | "yfi"
  | "usd"
  | "aed"
  | "ars"
  | "aud"
  | "bdt"
  | "bhd"
  | "bmd"
  | "brl"
  | "cad"
  | "chf"
  | "clp"
  | "cny"
  | "czk"
  | "dkk"
  | "eur"
  | "gbp"
  | "gel"
  | "hkd"
  | "huf"
  | "idr"
  | "ils"
  | "inr"
  | "jpy"
  | "krw"
  | "kwd"
  | "lkr"
  | "mmk"
  | "mxn"
  | "myr"
  | "ngn"
  | "nok"
  | "nzd"
  | "php"
  | "pkr"
  | "pln"
  | "rub"
  | "sar"
  | "sek"
  | "sgd"
  | "thb"
  | "try"
  | "twd"
  | "uah"
  | "vef"
  | "vnd"
  | "zar"
  | "xdr"
  | "xag"
  | "xau"
  | "bits"
  | "sats";

export type ICurrencyNames = Record<ICurrency, string>;

export type ICurrencySymbols = Record<ICurrency, string>;

export type IExpandAddressKey = `wallet-id:${string};utxo:${string}`;

export type IAppAddressFilters = {
  utxoOnly: boolean;
};
