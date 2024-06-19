import { assertEvent, assign, sendTo, setup, fromPromise, raise } from "xstate";
import { Xpub } from "@models/Xpub";
import type { IUtxoInput } from "@machines/appMachine";
import { getLastAddressIndex } from "@root/lib/utils";
import { type StackedBarData } from "@root/components/graphs/line/Line";
type LoadingSet = Set<`wallet-id:${string};utxo${string}`>;

const addToLoadingSet = (
  { address, walletId }: { address: string; walletId: string },
  loadingUtxos?: LoadingSet
) => {
  const _loadingUtxos =
    loadingUtxos || new Set<`wallet-id:${string};utxo${string}`>();
  _loadingUtxos.add(`wallet-id:${walletId};utxo:${address}`);
  return _loadingUtxos;
};

const removeFromLoadingSet = (
  { address, walletId }: { address: string; walletId: string },
  loadingUtxos: LoadingSet
) => {
  loadingUtxos.delete(`wallet-id:${walletId};utxo:${address}`);
  return loadingUtxos;
};

type LineData = {
  x: number;
  y1: number;
  y1Sum: number;
  y1SumInDollars: number;
  y2: number;
};

export type IRawNode = {
  x: number;
  y1: number; // not used
  y1Sum: number;
  y1SumInDollars: number;
  // y1, // shows the net value at the current price, not price of date range
  y2: number;
};

export type IPlotType = "VIN" | "VOUT";

export type IPlotData = {
  node: IRawNode;
  x: number;
  data: StackedBarData;
  type: IPlotType;
  value: number;
  grpSum: number;
};

export type IExpandAddressKey = `wallet-id:${string};utxo:${string}`;
export type IWalletListUIContext = {
  networkActorRef: any;
  appMachineRef: any;
  openWallets: Set<string>;
  loadingUtxos: LoadingSet;
  isTreemapLogScale: boolean;
  selectedWallet: string;
  expandedTxs: Set<IExpandAddressKey>;
  lineData: LineData[];
  plotData: IPlotData[];
  selectedPlotIndex: number;
  clearSelectedPlot?: () => void;
};

export const walletListUIMachine = setup({
  types: {} as {
    context: IWalletListUIContext;
    events:
      | {
          type: "SET_LINE_DATA";
          data: { lineData: LineData[]; plotData: IPlotData[] };
        }
      | {
          type: "WALLET_LIST_ADD_WALLET";
          data: any;
        }
      | { type: "TOGGLE_ADDRESS"; data: { id: IExpandAddressKey } }
      | { type: "EXPAND_ADDRESS"; data: { id: IExpandAddressKey } }
      | { type: "COLLAPSE_ADDRESS"; data: { id: IExpandAddressKey } }
      | { type: "GLOBAL_REQUEST"; data: any }
      | {
          type: "FETCH_WALLET_UTXO";
          data: { address: string; walletId: string; ttl?: number };
        }
      | {
          type: "SCAN_WALLET_XPUB";
          data: {
            xpub: string;
            xpubs: string[];
            walletId: string;
            start?: number;
            limit?: number;
            changeLimit?: number;
            changeStart?: number;
            receiveLimit?: number;
            receiveStart?: number;
            addressType?: "RECEIVE" | "CHANGE";
            accountType: "MULTI_SIG" | "SINGLE_SIG";
            bitcoinNodeUrl?: string;
          };
        }
      | {
          type: "TOGGLE_ROW";
          data: {
            id: string;
          };
        }
      | {
          type: "TOGGLE_TREEMAP_LOG_SCALE";
        }
      | {
          type: "CLEAR_SELECTED_WALLETS";
        }
      | {
          type: "TOGGLE_SELECT_WALLET";
          data: { walletId: string };
        }
      | {
          type: "INIT";
          data: {
            networkLoggerRef: any;
            appMachineRef: any;
            selectedWallet: string;
          };
        }
      | {
          type: "SET_SELECTED_LOT_DATA_INDEX";
          data: {
            date: number;
            clearSelection?: () => void;
          };
        };
  },
  actors: {
    scanWalletXpub: fromPromise(
      async ({
        input,
      }: {
        input: {
          // @deprecated, use xpubs
          xpub: string;
          xpubs: string[];
          walletId: string;
          changeStart?: number;
          changeLimit?: number;
          receiveStart?: number;
          receiveLimit?: number;
          addressType?: "RECEIVE" | "CHANGE";
          accountType?: "MULTI_SIG" | "SINGLE_SIG";
          bitcoinNodeUrl?: string;
        };
      }) => {
        const {
          xpub,
          xpubs,
          walletId,
          addressType,
          accountType,
          bitcoinNodeUrl,
        } = input;

        const changeStart = input.changeStart ?? 0;
        let changeLimit = input.changeLimit;

        if (!changeLimit) {
          changeLimit = await getLastAddressIndex(
            accountType === "SINGLE_SIG" ? xpubs[0] : xpubs,
            true,
            bitcoinNodeUrl
          );
        }
        const receiveStart = input.receiveStart ?? 0;
        let receiveLimit = input.receiveLimit;
        if (!receiveLimit) {
          receiveLimit = await getLastAddressIndex(
            accountType === "SINGLE_SIG" ? xpubs[0] : xpubs,
            false,
            bitcoinNodeUrl
          );
        }

        if (accountType === "MULTI_SIG") {
          if (!xpubs) {
            return {
              receiveAddresses: [],
              changeAddresses: [],
              walletId,
              receiveLimit,
              receiveStart,
              changeLimit,
              changeStart,
              addressType,
              accountType,
            };
          }

          // multi sig
          const receiveAddresses = [] as string[];
          const changeAddresses = [] as string[];

          if (!addressType || addressType === "RECEIVE") {
            receiveAddresses.push(
              ...(await Xpub.scanXpubMultiSigAddresses(xpubs, {
                start: receiveStart,
                limit: receiveLimit,
                isChange: false,
              }))
            );
          }
          if (!addressType || addressType === "CHANGE") {
            changeAddresses.push(
              ...(await Xpub.scanXpubMultiSigAddresses(xpubs, {
                start: changeStart,
                limit: changeLimit,
                isChange: true,
              }))
            );
          }

          return {
            receiveAddresses,
            changeAddresses,
            // xpub,// purposefully undefined for multi-sig
            xpubs,
            walletId,
            changeStart,
            changeLimit,
            receiveStart,
            receiveLimit,
            addressType,
            accountType,
          };
        }
        // single sig
        if (!xpub) {
          return {
            receiveAddresses: [],
            changeAddresses: [],
            walletId,
            changeStart,
            changeLimit,
            receiveStart,
            receiveLimit,
            addressType,
            accountType,
          };
        }

        let receiveAddresses = [] as string[];
        let changeAddresses = [] as string[];
        if (!addressType || addressType === "RECEIVE") {
          receiveAddresses = await Xpub.scanXpubAddresses(xpub, {
            start: receiveStart,
            limit: receiveLimit,
            isChange: false,
          });
        }

        if (!addressType || addressType === "CHANGE") {
          changeAddresses = await Xpub.scanXpubAddresses(xpub, {
            start: changeStart,
            limit: changeLimit,
            isChange: true,
          });
        }

        return {
          receiveAddresses,
          changeAddresses,
          xpub,
          walletId,
          changeStart,
          changeLimit,
          receiveStart,
          receiveLimit,
          addressType,
          accountType,
        };
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHcCGAbdYAuAZAlrNgLKoDGAFvgHZgDEA4rgPIBCAgrgPoBKAogEUAqnwDKAFQDaABgC6iUAAcA9rHzZ8y6gpAAPRAE4AbAA4AdABYAzAFYD9mwEYDVgOxGLAGhABPQ6-NpE3tbGytpN2kLAF9o7zRMHAIiUkoaegB1Tlw+cS5cAEkJLnYAEVKuLNwcqTkdFTUNLR19BEdncwsAJiMuxz7nC1dHbz8EV1cLM2knawsIiyMbZdj4jCw8QhJyKlo6cWYGJj5eZgyZeSQQBvVNbSvW12MzYYsTYK631ytrUcMLGyWEyOEwWAyOZZBAwmVYgBIbZLbNJ7A5HHJccT8PjEdgABXyhy4ogAwpw+Bd6qpbs0HogflNHNIDE9oQYLBC7H8EC4ui8mQCDNIjEEIbD4UktqldvRiTl2DwiXwcsTxHwKlUaqIKVcbk17qBWjZJmYjcCrEYrGyXBYvL5EEZ2mZ+sEomzpF13TC4nD1hKUjt0vtDsdFcq8hrctqlFS9S1EDYTFYzL12l1PjyhTYuU5Ad8oqYhjYjBaumLfZt-cj6KiQ2VSvxRFq6jqY3c4whhQYXsFXHYbOyrGms3aEN1pGYrIOIh72v1zWXEhWkdK6HwABq49gAOQqdYbTcu0cabdpHaZZhMEwtjle0mGXMHUxctgMy0WCZi3vFS6lgeJzGqPFRBOPcxAPSljxpA17WkccXWkZxiyNaETC5NMuzCHNBRMD0bU-NZF0RX89mAvJCi3E5SnYcR2Cja5WygvR7T6CdeyiFlYM7LlHB+J1zVcNMHTYt4FwRSUAxI3JQz4FU1QJPIqJorgCh3dc6N1E9oIQN8JyMaFJ3eAFXDvbjSy-csiIksAzEUAAnMACmodQ6BUgpakPejIP1JiOzCaYISWHlPkWW0xmdIxk3mB0PBfS8vQIsTK2lMx8AgLA6AAMVyYkAAlKmyKShHENdmHUhjvNaaFeX7KIZnsLo3CMVxuOFQErBBBN2hMJY9IMUS-WXdIUrS+gSW3fLqikjchFYMqvPbJYkwQos7EHYKPG4kEuxBdCAQaj1i36n8rLMAAzHBkSgIRsF0ZQ6Dm6kKsQWcIoibqEz00EQWakdHDBXlJgCLp3HeFZzMI8Sqxs+zFFQeyMuUWzRDIVBqDXRQAFcACN7ubI9HvbLoEzMV92rcG9lkvdwWsdMIPCLcIfh+I7LKhuywFh+HEeR1H0ex+7HA8jTGNaH4uwCEwEImIZTBwqxuJtVwzCJ7qDCJz4nF7FnIeS2AUeoJzqCgPmcYgLRrJoAA3ZQAGtrO-Vndf1w3jcxrGECt5QUb1C4HtjU8BIByJXw8HCbCiFq7GTdxgfsUFwTCWJvWoZQIDgHQHZ19IIIJ08AFoRl+xlHAvVbpZvNN53BxLBtoaGHKc7Ac-9rTll5RY02MiF2VZbjwgw18ZnD4Zw5vbWkqG1KsGbzSfJ7F4i0rwUmXa7inHHKW2KiTq2XH2vrPO7BLuu26Z5F56NZND0cO6SW9O+NebWV0w7yZGY9NsPfiOs9nObABGkb6xNmfJ6o4fphQBOOLobJ0wNUZO8L+J09aoxdsAls81TzdCTCFS8TgbxMneGvb40xLQzGgbBGwwNPyxCAA */
  id: "walletListMachine",
  context: {
    networkActorRef: null,
    appMachineRef: null,
    openWallets: new Set(),
    expandedTxs: new Set(),
    loadingUtxos: new Set(),
    isTreemapLogScale: true,
    selectedWallet: "",
    netAssetValue: false,
    lineData: [],
    plotData: [],
    selectedPlotIndex: -1,
  },

  initial: "preInit",
  states: {
    preInit: {
      on: {
        INIT: {
          actions: [
            assign({
              networkActorRef: ({ event }) => {
                return event.data.networkLoggerRef;
              },
              appMachineRef: ({ event }) => {
                return event.data.appMachineRef;
              },
              selectedWallet: ({ event }) => {
                return event.data.selectedWallet;
              },
            }),
          ],
          target: "idle",
        },
      },
    },
    idle: {
      on: {
        FETCH_WALLET_UTXO: {
          target: "fetchingUtxo",
        },
        SCAN_WALLET_XPUB: {
          target: "prepareForScanXpub",
        },
      },
    },
    fetchingUtxo: {
      entry: [
        assign({
          loadingUtxos: ({ context, event }) => {
            assertEvent(event, "FETCH_WALLET_UTXO");
            const loadingUtxos = addToLoadingSet(
              { walletId: event.data.walletId, address: event.data.address },
              context.loadingUtxos
            );
            return loadingUtxos;
          },
        }),
        sendTo(
          ({ context }) => {
            return context.appMachineRef;
          },
          ({ event }) => {
            assertEvent(event, "FETCH_WALLET_UTXO");
            return {
              type: "APP_MACHINE_FETCH_UTXO",
              data: {
                walletId: event.data.walletId,
                address: event.data.address,
                ttl: event.data.ttl,
              },
            };
          }
        ),
      ],
      always: "idle",
    },
    prepareForScanXpub: {
      always: [
        {
          target: "scanningXpub",
          guard: ({ event }) => {
            assertEvent(event, "SCAN_WALLET_XPUB");
            if (event.data.accountType === "SINGLE_SIG") {
              if (!event.data.xpub || !event.data.xpubs.length) {
                return false;
              }
            } else if (event.data.accountType === "MULTI_SIG") {
              if (!event.data.xpubs.length) {
                return false;
              }
            }
            return true;
          },
        },
        {
          actions: [
            sendTo(
              ({ context }) => context.appMachineRef,
              ({ event }) => {
                assertEvent(event, "SCAN_WALLET_XPUB");
                return {
                  type: "APP_MACHINE_FETCH_WALLETS_UTXOS",
                  data: {
                    bypassCache: true,
                    ...event.data,
                  },
                };
              }
            ),
          ],
          target: "idle",
        },
      ],
    },
    scanningXpub: {
      entry: [
        assign({
          loadingUtxos: ({ context, event }) => {
            assertEvent(event, "SCAN_WALLET_XPUB");
            let loadingUtxos = new Set(Array.from(context.loadingUtxos));
            if (event.data.xpub || event.data.xpubs?.length) {
              loadingUtxos = addToLoadingSet(
                { walletId: event.data.walletId, address: event.data.xpub },
                loadingUtxos
              );
            }
            return loadingUtxos;
          },
        }),
      ],
      invoke: {
        src: "scanWalletXpub",
        input: ({ event }) => {
          assertEvent(event, "SCAN_WALLET_XPUB");
          const {
            xpub,
            xpubs,
            walletId,
            start,
            limit,
            changeLimit,
            changeStart,
            receiveLimit,
            receiveStart,
            addressType,
            accountType,
            bitcoinNodeUrl,
          } = event.data;
          return {
            xpub,
            xpubs,
            walletId,
            start,
            limit,
            changeLimit,
            changeStart,
            receiveLimit,
            receiveStart,
            addressType,
            accountType,
            bitcoinNodeUrl,
          };
        },
        onDone: {
          target: "idle",
          actions: [
            assign({
              loadingUtxos: ({ context, event }) => {
                const loadingUtxos = new Set(Array.from(context.loadingUtxos));
                if (event.output.xpubs?.length) {
                  removeFromLoadingSet(
                    {
                      walletId: event.output.walletId,
                      address: event.output.xpubs[0],
                    },
                    loadingUtxos
                  );
                }
                if (event.output.xpub) {
                  removeFromLoadingSet(
                    {
                      walletId: event.output.walletId,
                      address: event.output.xpub,
                    },
                    loadingUtxos
                  );
                }

                return loadingUtxos;
              },
            }),
            sendTo(
              ({ context }) => context.appMachineRef,
              ({ event }) => {
                const receiveAddresses = event.output.receiveAddresses.reduce(
                  (acc, cur, index) => {
                    const i = index + (event.output.receiveStart ?? 0);
                    return {
                      ...acc,
                      [cur]: {
                        address: cur,
                        index: i,
                        // xpub: event.output.xpub,
                        // xpubs: event.output.xpubs,
                        accountType: event.output.accountType,
                        isChange: false,
                      } as IUtxoInput,
                    };
                  },
                  {}
                );

                const changeAddresses = event.output.changeAddresses.reduce(
                  (acc, cur, index) => {
                    const i = index + (event.output.changeStart ?? 0);
                    return {
                      ...acc,
                      [cur]: {
                        address: cur,
                        index: i,
                        // xpub: event.output.xpub,
                        // xpubs: event.output.xpubs,
                        accountType: event.output.accountType,
                        isChange: true,
                      },
                    };
                  },
                  {}
                );

                const utxos = {
                  ...receiveAddresses,
                  ...changeAddresses,
                };

                const hasMore = true;
                return {
                  type: "APP_MACHINE_SET_XPUB_UTXOS",
                  data: {
                    walletId: event.output.walletId,
                    xpub: event.output.xpub,
                    xpubs: event.output.xpubs,
                    accountType: event.output.accountType,
                    utxos,
                    addressType: event.output.addressType,
                    changeStart: event.output.changeStart,
                    changeLimit: event.output.changeLimit,
                    receiveStart: event.output.receiveStart,
                    receiveLimit: event.output.receiveLimit,
                    // limit: event.output.limit,
                    hasMore,
                  },
                };
              }
            ),
          ],
        },
      },
      fetchXPubUtxos: {
        invoke: {
          src: "",
          onDone: "idle",
        },
      },
    },
  },
  on: {
    GLOBAL_REQUEST: {
      actions: [
        assign({
          loadingUtxos: ({ context, event }) => {
            const loadingUtxos = new Set(Array.from(context.loadingUtxos));
            // need some sort of event type check
            if (event.data.status === "complete") {
              for (const request of event.data.requests) {
                removeFromLoadingSet(request.meta, loadingUtxos);
              }
            }
            return loadingUtxos;
          },
        }),
      ],
    },
    WALLET_LIST_ADD_WALLET: {
      actions: [
        assign({
          loadingUtxos: ({ context, event }) => {
            let loadingUtxos = new Set(Array.from(context.loadingUtxos));
            const xpubs = Object.keys(event.data.wallet.xpubs || {});
            const xpub = xpubs[0]; // @todo load multiple?
            if (xpub && event.data.wallet.id) {
              loadingUtxos = addToLoadingSet(
                { walletId: event.data.wallet.id, address: xpub },
                loadingUtxos
              );
              return loadingUtxos;
            }

            return loadingUtxos;
          },
        }),
        raise(({ event }) => {
          const xpubs = Object.keys(event.data.wallet.xpubs || {});
          const accountType = event.data.wallet.accountType;
          const xpub = xpubs[0]; // @todo load multiple?
          const { wallet, changeLimit, receiveLimit, bitcoinNodeUrl } =
            event.data;

          return {
            type: "SCAN_WALLET_XPUB",
            data: {
              walletId: wallet.id,
              xpub,
              xpubs,
              accountType,
              changeLimit: changeLimit,
              changeStart: 0,
              receiveLimit: receiveLimit,
              receiveStart: 0,
              bitcoinNodeUrl,
            },
          };
        }),
      ],
    },
    TOGGLE_ROW: {
      actions: assign({
        openWallets: ({ context, event }) => {
          const openWallets = context.openWallets || new Set<string>();
          if (openWallets.has(event.data.id)) {
            openWallets.delete(event.data.id);
          } else {
            openWallets.add(event.data.id);
          }
          return context.openWallets;
        },
      }),
    },
    TOGGLE_TREEMAP_LOG_SCALE: {
      actions: assign({
        isTreemapLogScale: ({ context }) => {
          return !context.isTreemapLogScale;
        },
      }),
    },
    CLEAR_SELECTED_WALLETS: {
      actions: assign({
        selectedWallet: "",
      }),
    },
    TOGGLE_SELECT_WALLET: {
      actions: assign({
        selectedWallet: ({ event }) => {
          return event.data.walletId;
        },
      }),
    },
    TOGGLE_ADDRESS: {
      actions: assign({
        expandedTxs: ({ context, event }) => {
          const set = new Set(Array.from(context.expandedTxs));
          if (set.has(event.data.id)) {
            set.delete(event.data.id);
          } else {
            set.add(event.data.id);
          }
          return set;
        },
      }),
    },
    EXPAND_ADDRESS: {
      actions: assign({
        expandedTxs: ({ context, event }) => {
          const set = new Set(Array.from(context.expandedTxs));

          set.add(event.data.id);

          return set;
        },
      }),
    },
    COLLAPSE_ADDRESS: {
      actions: assign({
        expandedTxs: ({ context, event }) => {
          const set = new Set(Array.from(context.expandedTxs));

          set.delete(event.data.id);

          return set;
        },
      }),
    },

    SET_LINE_DATA: {
      actions: assign({
        lineData: ({ event }) => event.data.lineData,
        plotData: ({ event }) => event.data.plotData,
      }),
    },
    SET_SELECTED_LOT_DATA_INDEX: {
      actions: [
        assign({
          selectedPlotIndex: ({ event, context }) => {
            const date = event.data.date;
            const { plotData } = context;
            const index = plotData.findIndex((d) => d.x === date);

            return index;
          },
          clearSelectedPlot: ({ event, context }) => {
            if (event.data.clearSelection) {
              return event.data.clearSelection;
            }
            return context.clearSelectedPlot;
          },
        }),
        ({ context }) => {
          // this is a bad side affect and should be refactored
          // however the tooltip is in d3 and it's a bit of a pain to get the
          // context in there
          if (context.selectedPlotIndex === -1 && context.clearSelectedPlot) {
            context.clearSelectedPlot();
          }
        },
      ],
    },
  },
});
