import { trimAddress } from "@lib/utils";
import { IUtxoInput, type Utxo } from "./Utxo";
import { IUtxoRequest } from "@machines/appMachine";

const VITE_BITCOIN_NETWORK: "mainnet" | "testnet" =
  import.meta.env.VITE_BITCOIN_NETWORK || "mainnet";

export type IXpubInput = {
  address: string;
  utxos?: Record<string, IUtxoInput>;
};

type ISettings = {
  cur: string;
  blockExplorer: string;
  btcPrice?: number;
  utxos?: Record<string, IUtxoRequest>;
};

export class Xpub {
  address: string;
  // utxo doesn't have to have a balance, they are really just addresses
  utxos: Record<string, Utxo> = {};

  settings?: ISettings;
  bitcoinjs?: any;
  constructor(data: IXpubInput, settings: ISettings) {
    this.address = data.address;
    this.settings = settings;
  }

  static async scanXpubMultiSigAddresses(
    xpubs: string[],
    {
      start = 0,
      limit = 10,
      isChange = false,
    }: { start?: number; limit?: number; isChange?: boolean } = {}
  ) {
    const bitcoinjs = await Xpub.getBitcoinjs();

    const addresses = Array.from({ length: limit }).map((_, i) => {
      const pubkeys = xpubs
        .map((xpub) => {
          const node = bitcoinjs.bip32
            .fromBase58(
              xpub,
              VITE_BITCOIN_NETWORK === "mainnet"
                ? bitcoinjs.networks.bitcoin
                : bitcoinjs.networks.testnet
            )
            .derive(isChange ? 1 : 0)
            .derive(start + i).publicKey;
          return node;
        })
        .sort((a, b) => a.compare(b));

      const redeemScript = bitcoinjs.payments.p2ms({
        m: 2,
        pubkeys: pubkeys,
        network:
          VITE_BITCOIN_NETWORK === "mainnet"
            ? bitcoinjs.networks.bitcoin
            : bitcoinjs.networks.testnet,
      });

      const { address } = bitcoinjs.payments.p2wsh({
        redeem: redeemScript,
        network:
          VITE_BITCOIN_NETWORK === "mainnet"
            ? bitcoinjs.networks.bitcoin
            : bitcoinjs.networks.testnet,
      });
      return address;
    });

    return addresses;
  }

  static async getBitcoinjs() {
    const { default: bitcoin } = await import("bitcoinjs");

    return bitcoin;
  }

  static async preload() {
    return Xpub.getBitcoinjs();
  }

  static async scanXpubAddresses(
    xpub: string,
    {
      start = 0,
      limit = 10,
      isChange = false,
    }: { start?: number; limit?: number; isChange?: boolean } = {}
  ) {
    const bitcoin = await Xpub.getBitcoinjs();
    const node = bitcoin.bip32.fromBase58(
      xpub,
      VITE_BITCOIN_NETWORK === "mainnet"
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet
    );
    const addresses = Array.from({ length: limit }).map((_, i) => {
      const pubkey = node.derive(isChange ? 1 : 0).derive(i + start).publicKey;
      return bitcoin.payments.p2wpkh({
        pubkey,
        network:
          VITE_BITCOIN_NETWORK === "mainnet"
            ? bitcoin.networks.bitcoin
            : bitcoin.networks.testnet,
      }).address;
    });

    return addresses;
  }

  static async getAddressAtIndex(
    xpub: string | string[],
    index: number,
    isChange: boolean
  ) {
    const bitcoinjs = await Xpub.getBitcoinjs();

    if (Array.isArray(xpub)) {
      const pubkeys = xpub
        .map((xp) => {
          const node = bitcoinjs.bip32
            .fromBase58(
              xp,
              VITE_BITCOIN_NETWORK === "mainnet"
                ? bitcoinjs.networks.bitcoin
                : bitcoinjs.networks.testnet
            )
            .derive(isChange ? 1 : 0)
            .derive(index).publicKey;
          return node;
        })
        .sort((a, b) => a.compare(b));

      const redeemScript = bitcoinjs.payments.p2ms({
        m: 2,
        pubkeys: pubkeys,
        network:
          VITE_BITCOIN_NETWORK === "mainnet"
            ? bitcoinjs.networks.bitcoin
            : bitcoinjs.networks.testnet,
      });

      const { address } = bitcoinjs.payments.p2wsh({
        redeem: redeemScript,
        network:
          VITE_BITCOIN_NETWORK === "mainnet"
            ? bitcoinjs.networks.bitcoin
            : bitcoinjs.networks.testnet,
      });
      return address;
    }
    const node = bitcoinjs.bip32.fromBase58(
      xpub,
      VITE_BITCOIN_NETWORK === "mainnet"
        ? bitcoinjs.networks.bitcoin
        : bitcoinjs.networks.testnet
    );
    const pubkey = node.derive(isChange ? 1 : 0).derive(index).publicKey;
    return bitcoinjs.payments.p2wpkh({
      pubkey,
      network:
        VITE_BITCOIN_NETWORK === "mainnet"
          ? bitcoinjs.networks.bitcoin
          : bitcoinjs.networks.testnet,
    }).address;
  }

  get shortAddress() {
    return trimAddress(this.address);
  }
}
