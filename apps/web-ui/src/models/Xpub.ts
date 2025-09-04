import { trimAddress } from "@lib/utils";

const VITE_BITCOIN_NETWORK: "mainnet" | "testnet" =
  import.meta.env.VITE_BITCOIN_NETWORK || "mainnet";

// Extended public key prefixes for different address types
const XPUB_PREFIXES = {
  mainnet: {
    xpub: "0488b21e", // Legacy addresses (P2PKH)
    ypub: "049d7cb2", // SegWit compatible addresses (P2SH-P2WPKH)
    zpub: "04b24746", // Native SegWit addresses (P2WPKH)
  },
  testnet: {
    tpub: "043587cf", // Legacy addresses (P2PKH)
    upub: "044a5262", // SegWit compatible addresses (P2SH-P2WPKH)
    vpub: "045f1cf6", // Native SegWit addresses (P2WPKH)
  },
};

type ExtendedPubKeyType = "xpub" | "ypub" | "zpub" | "tpub" | "upub" | "vpub";

export class Xpub {
  address: string;

  bitcoinjs?: unknown;
  constructor(address: string) {
    this.address = address;
  }

  /**
   * Detects the type of extended public key (xpub, ypub, zpub, etc.)
   */
  static async detectExtendedPubKeyType(
    pubKey: string
  ): Promise<ExtendedPubKeyType | null> {
    try {
      const bitcoinjs = await Xpub.getBitcoinjs();

      // Check if bs58check is available, if not use a simple prefix check
      if (bitcoinjs.bs58check) {
        const decoded = bitcoinjs.bs58check.decode(pubKey);
        const prefix = decoded.slice(0, 4).toString("hex");

        // Check mainnet prefixes
        for (const [type, expectedPrefix] of Object.entries(
          XPUB_PREFIXES.mainnet
        )) {
          if (prefix === expectedPrefix) {
            return type as ExtendedPubKeyType;
          }
        }

        // Check testnet prefixes
        for (const [type, expectedPrefix] of Object.entries(
          XPUB_PREFIXES.testnet
        )) {
          if (prefix === expectedPrefix) {
            return type as ExtendedPubKeyType;
          }
        }
      } else {
        // Fallback: check the first 4 characters of the base58 string
        const prefix = pubKey.substring(0, 4);

        // Check mainnet prefixes
        if (prefix === "xpub") return "xpub";
        if (prefix === "ypub") return "ypub";
        if (prefix === "zpub") return "zpub";

        // Check testnet prefixes
        if (prefix === "tpub") return "tpub";
        if (prefix === "upub") return "upub";
        if (prefix === "vpub") return "vpub";
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Converts extended public keys to xpub format for the current network
   * All extended public keys (ypub, zpub, tpub, upub, vpub) are converted to xpub/tpub
   */
  static async convertToXpub(pubKey: string): Promise<string> {
    try {
      const bitcoinjs = await Xpub.getBitcoinjs();
      const decoded = bitcoinjs.bs58check.decode(pubKey);

      // Detect the original pubkey type to determine the correct target prefix
      const pubKeyType = await Xpub.detectExtendedPubKeyType(pubKey);
      if (!pubKeyType) {
        throw new Error("Unable to detect extended public key type");
      }

      // Always convert to xpub/tpub format regardless of original type
      let targetPrefix: string;
      if (VITE_BITCOIN_NETWORK === "mainnet") {
        targetPrefix = XPUB_PREFIXES.mainnet.xpub;
      } else {
        targetPrefix = XPUB_PREFIXES.testnet.tpub;
      }

      // Replace the prefix
      const newData = bitcoinjs.Buffer.concat([
        bitcoinjs.Buffer.from(targetPrefix, "hex"),
        decoded.slice(4),
      ]);

      return bitcoinjs.bs58check.encode(newData);
    } catch (error) {
      throw new Error(`Failed to convert extended public key: ${error}`);
    }
  }

  /**
   * Generates addresses based on the extended public key type
   */
  static async generateAddresses(
    pubKeyType: ExtendedPubKeyType,
    bitcoinjs: unknown,
    pubkey: Buffer,
    network: unknown
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bitcoin = bitcoinjs as any;
    switch (pubKeyType) {
      case "xpub":
      case "tpub":
        // TODO: support for legacy addresses - Legacy addresses (P2PKH) - starts with '1' or 'm'/'n'
        // xpubs can generate new addresses with p2wpkh
        return bitcoin.payments.p2wpkh({ pubkey, network }).address;
      case "ypub":
      case "upub":
        // SegWit compatible addresses (P2SH-P2WPKH) - starts with '3' or '2'
        return bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({ pubkey, network }),
          network,
        }).address;

      case "zpub":
      case "vpub":
        // Native SegWit addresses (P2WPKH) - starts with 'bc1' or 'tb1'
        return bitcoin.payments.p2wpkh({ pubkey, network }).address;

      default:
        throw new Error(`Unsupported extended public key type: ${pubKeyType}`);
    }
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

      // First check if it's a valid extended public key format
      const pubKeyType = await Xpub.detectExtendedPubKeyType(xpub);
      if (!pubKeyType) {
        return false;
      }

      const bitcoinjs = await Xpub.getBitcoinjs();

      // Convert all extended public keys to xpub/tpub format for compatibility with bitcoinjs
      let normalizedXpub = xpub;
      if (
        pubKeyType === "ypub" ||
        pubKeyType === "zpub" ||
        pubKeyType === "upub" ||
        pubKeyType === "vpub"
      ) {
        try {
          normalizedXpub = await Xpub.convertToXpub(xpub);
        } catch {
          return false;
        }
      }

      // Determine the correct network based on the environment
      const network =
        VITE_BITCOIN_NETWORK === "mainnet"
          ? bitcoinjs.networks.bitcoin
          : bitcoinjs.networks.testnet;

      // Try to parse the extended public key with the correct network
      try {
        bitcoinjs.bip32.fromBase58(normalizedXpub, network);
        return true;
      } catch {
        // If parsing fails with the expected network, try the other network as fallback
        try {
          const fallbackNetwork =
            network === bitcoinjs.networks.bitcoin
              ? bitcoinjs.networks.testnet
              : bitcoinjs.networks.bitcoin;
          bitcoinjs.bip32.fromBase58(normalizedXpub, fallbackNetwork);
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

    // Detect the extended public key type
    const pubKeyType = await Xpub.detectExtendedPubKeyType(xpub);
    if (!pubKeyType) {
      throw new Error("Invalid extended public key format");
    }

    // Convert all extended public keys to xpub/tpub format for compatibility with bitcoinjs
    let normalizedXpub = xpub;
    if (
      pubKeyType === "ypub" ||
      pubKeyType === "zpub" ||
      pubKeyType === "upub" ||
      pubKeyType === "vpub"
    ) {
      normalizedXpub = await Xpub.convertToXpub(xpub);
    }

    // Determine the correct network based on the environment
    const network =
      VITE_BITCOIN_NETWORK === "mainnet"
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet;

    const node = bitcoin.bip32.fromBase58(normalizedXpub, network);
    const addresses = await Promise.all(
      Array.from({ length: limit }).map(async (_, i) => {
        const pubkey = node
          .derive(isChange ? 1 : 0)
          .derive(i + start).publicKey;
        return Xpub.generateAddresses(pubKeyType, bitcoin, pubkey, network);
      })
    );

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
      // For multisig, we need to handle each key individually
      const pubkeys = await Promise.all(
        xpub.map(async (xp) => {
          const pubKeyType = await Xpub.detectExtendedPubKeyType(xp);
          if (!pubKeyType) {
            throw new Error("Invalid extended public key format");
          }

          // Determine the correct network for this key
          let network;
          if (VITE_BITCOIN_NETWORK === "mainnet") {
            if (
              pubKeyType === "xpub" ||
              pubKeyType === "ypub" ||
              pubKeyType === "zpub"
            ) {
              network = bitcoinjs.networks.bitcoin;
            } else {
              network = bitcoinjs.networks.bitcoin;
            }
          } else {
            if (
              pubKeyType === "tpub" ||
              pubKeyType === "upub" ||
              pubKeyType === "vpub"
            ) {
              network = bitcoinjs.networks.testnet;
            } else {
              network = bitcoinjs.networks.testnet;
            }
          }

          const node = bitcoinjs.bip32
            .fromBase58(xp, network)
            .derive(isChange ? 1 : 0)
            .derive(index).publicKey;
          return node;
        })
      );
      pubkeys.sort((a, b) => a.compare(b));

      // For multisig, we'll use the network from the environment
      let network;
      if (VITE_BITCOIN_NETWORK === "mainnet") {
        network = bitcoinjs.networks.bitcoin;
      } else {
        network = bitcoinjs.networks.testnet;
      }

      const redeemScript = bitcoinjs.payments.p2ms({
        m: 2,
        pubkeys: pubkeys,
        network,
      });

      const { address } = bitcoinjs.payments.p2wsh({
        redeem: redeemScript,
        network,
      });
      return address;
    }

    // For single extended public key, detect type and generate appropriate address
    const pubKeyType = await Xpub.detectExtendedPubKeyType(xpub[0]);
    if (!pubKeyType) {
      throw new Error("Invalid extended public key format");
    }

    // Convert all extended public keys to xpub/tpub format for compatibility with bitcoinjs
    let normalizedXpub = xpub[0];
    if (
      pubKeyType === "ypub" ||
      pubKeyType === "zpub" ||
      pubKeyType === "upub" ||
      pubKeyType === "vpub"
    ) {
      normalizedXpub = await Xpub.convertToXpub(xpub[0]);
    }

    // Determine the correct network based on the environment
    const network =
      VITE_BITCOIN_NETWORK === "mainnet"
        ? bitcoinjs.networks.bitcoin
        : bitcoinjs.networks.testnet;

    const node = bitcoinjs.bip32.fromBase58(normalizedXpub, network);
    const pubkey = node.derive(isChange ? 1 : 0).derive(index).publicKey;
    return Xpub.generateAddresses(pubKeyType, bitcoinjs, pubkey, network);
  }

  get shortAddress() {
    return trimAddress(this.address);
  }
}
