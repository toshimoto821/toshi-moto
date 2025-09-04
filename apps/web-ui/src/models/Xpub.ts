import { trimAddress } from "@lib/utils";

const VITE_BITCOIN_NETWORK: "mainnet" | "testnet" =
  import.meta.env.VITE_BITCOIN_NETWORK || "mainnet";

export class Xpub {
  address: string;

  bitcoinjs?: unknown;
  constructor(address: string) {
    this.address = address;
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
    const { default: bitcoin } = await import("@toshimoto821/bitcoinjs");

    return bitcoin;
  }

  static async preload() {
    return Xpub.getBitcoinjs();
  }

  static async isValidXpub(xpub: string): Promise<boolean> {
    try {
      if (!xpub || typeof xpub !== "string") {
        return false;
      }

      const bitcoinjs = await Xpub.getBitcoinjs();

      // Try to parse the xpub with both mainnet and testnet networks
      try {
        bitcoinjs.bip32.fromBase58(xpub, bitcoinjs.networks.bitcoin);
        return true;
      } catch {
        try {
          bitcoinjs.bip32.fromBase58(xpub, bitcoinjs.networks.testnet);
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  static async scanXpubs(
    xpub: string | string[],
    {
      start = 0,
      limit = 10,
      isChange = false,
    }: { start?: number; limit?: number; isChange?: boolean } = {}
  ): Promise<string[]> {
    if (Array.isArray(xpub) && xpub.length > 1) {
      return Xpub.scanXpubMultiSigAddresses(xpub, { start, limit, isChange });
    }
    if (Array.isArray(xpub)) {
      return Xpub.scanXpubAddresses(xpub[0], { start, limit, isChange });
    }

    return Xpub.scanXpubAddresses(xpub, { start, limit, isChange });
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
    xpubInput: string | string[],
    index: number,
    isChange: boolean
  ) {
    const xpub = Array.isArray(xpubInput) ? xpubInput : [xpubInput];

    const bitcoinjs = await Xpub.getBitcoinjs();
    if (xpub.length > 1) {
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
      xpub[0],
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
