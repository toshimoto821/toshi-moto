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

export type IChartTimeframeGroups = "5M" | "1H" | "1D" | "1W" | "1M";

export type IChartTimeFrameRange =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "1Y"
  | "2Y"
  | "5Y"
  | "ALL";
