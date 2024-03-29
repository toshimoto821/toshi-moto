import type { ICurrency, ICurrencySymbols, ICurrencyNames } from "@root/types";

export const currencyNames: ICurrencyNames = {
  aed: "United Arab Emirates Dirham",
  ars: "Argentine Peso",
  aud: "Australian Dollar",
  bch: "Bitcoin Cash",
  bdt: "Bangladeshi Taka",
  bhd: "Bahraini Dinar",
  bnb: "Binance Coin",
  bmd: "Bermudian Dollar",
  brl: "Brazilian Real",
  btc: "Bitcoin",
  bits: "Bits",
  cad: "Canadian Dollar",
  chf: "Swiss Franc",
  clp: "Chilean Peso",
  cny: "Chinese Yuan",
  czk: "Czech Koruna",
  dkk: "Danish Krone",
  dot: "Polkadot",
  eos: "EOS",
  eth: "Ethereum",
  eur: "Euro",
  gbp: "British Pound",
  gel: "Georgian Lari",
  hkd: "Hong Kong Dollar",
  huf: "Hungarian Forint",
  idr: "Indonesian Rupiah",
  ils: "Israeli New Shekel",
  inr: "Indian Rupee",
  jpy: "Japanese Yen",
  krw: "South Korean Won",
  kwd: "Kuwaiti Dinar",
  lkr: "Sri Lankan Rupee",
  ltc: "Litecoin",
  link: "Chainlink",
  mmk: "Burmese Kyat",
  mxn: "Mexican Peso",
  myr: "Malaysian Ringgit",
  ngn: "Nigerian Naira",
  nok: "Norwegian Krone",
  nzd: "New Zealand Dollar",
  php: "Philippine Peso",
  pkr: "Pakistani Rupee",
  pln: "Polish Złoty",
  rub: "Russian Ruble",
  sar: "Saudi Riyal",
  sek: "Swedish Krona",
  sgd: "Singapore Dollar",
  sats: "Sats",
  thb: "Thai Baht",
  try: "Turkish Lira",
  twd: "New Taiwan Dollar",
  uah: "Ukrainian Hryvnia",
  usd: "US Dollar",
  vef: "Venezuelan Bolívar",
  vnd: "Vietnamese Đồng",
  xag: "Silver",
  xau: "Gold",
  xdr: "Special Drawing Rights",
  xlm: "Stellar",
  xrp: "Ripple",
  yfi: "Yearn.finance",
  zar: "South African Rand",
};

export const currencySymbols: ICurrencySymbols = {
  aed: "د.إ",
  ars: "$",
  aud: "$",
  bch: "₿",
  bdt: "৳",
  bhd: ".د.ب",
  bnb: "",
  bmd: "$",
  brl: "R$",
  btc: "₿",
  bits: "",
  cad: "$",
  chf: "",
  clp: "$",
  cny: "¥",
  czk: "Kč",
  dkk: "kr",
  dot: "",
  eos: "",
  eth: "Ξ",
  eur: "€",
  gbp: "£",
  gel: "₾",
  hkd: "$",
  huf: "Ft",
  idr: "Rp",
  ils: "₪",
  inr: "₹",
  jpy: "¥",
  krw: "₩",
  kwd: "د.ك",
  lkr: "Rs",
  ltc: "Ł",
  link: "",
  mmk: "K",
  mxn: "$",
  myr: "RM",
  ngn: "₦",
  nok: "kr",
  nzd: "$",
  php: "₱",
  pkr: "₨",
  pln: "zł",
  rub: "₽",
  sar: "ر.س",
  sek: "kr",
  sgd: "$",
  sats: "",
  thb: "฿",
  try: "₺",
  twd: "NT$",
  uah: "₴",
  usd: "$",
  vef: "Bs",
  vnd: "₫",
  xag: "",
  xau: "",
  xdr: "",
  xlm: "",
  xrp: "",
  yfi: "",
  zar: "R",
};

const keys = Object.keys(currencyNames) as ICurrency[];
export const currencyList: { value: ICurrency; label: string }[] = keys
  .map((currency: ICurrency) => ({
    value: currency,
    label: currencyNames[currency],
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
