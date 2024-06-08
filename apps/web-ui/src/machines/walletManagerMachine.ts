import { Wallet } from "@models/Wallet";
import { assertEvent, assign, sendTo, setup } from "xstate";

export type IWalletManagerEvents =
  | {
      type: "SET_NAME";
      data: {
        name: string;
      };
    }
  | {
      type: "SET_VALUE";
      data: {
        key: string;
        value: any;
      };
    }
  | {
      type: "RESET_FORM";
      data: { wallet?: Wallet };
    }
  | {
      type: "SAVE";
      data: { id?: string };
    }
  | {
      type: "ADD_EMPTY_FIELD";
      data: { xpub: boolean };
    }
  | {
      type: "DELETE_FIELD";
      data: {
        index: number;
        xpub: boolean;
      };
    }
  | {
      type: "BLUR_FIELD";
      data: {
        index: number;
        value: string;
        xpub: boolean;
      };
    }
  | {
      type: "DELETE_WALLET";
      data: {
        walletId: string;
      };
    };

export const walletManagerMachine = setup({
  types: {} as {
    context: {
      name: string;
      data: Record<string, any>;
      utxos: string[];
      xpubs: string[];
      walletId?: string;
      isDirty: boolean;
      appMachine: any;
    };
    events: IWalletManagerEvents;
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgCUBRAZQoBUBtABgF1FQAHAe1lwBddO+NiAAeiRgBoQAT3EBfOVLRY8hIgDpcEADZgSNWgH0AcgEEAshSaskILj36DhYhJJnzFIZTgLFNOvSpTADUrFmF7PgEhWxc3WVcFJQwfNX9dEgAhABkAVTJDXNoADQB5awjuKKdY8SkExiSvFNU-LQzTABFOwwpzAAVaAE1CkvLw20jHGNAXAEYAJgBWdUYAFgBOBYAOADZGRgBmQ921xgX6xG219QWAdjulu8ZTtbXt8+2m71aNdr1OhRsnQKKMyhVJlVps5EAtDgtbrsFmslm8URsHtsLu4EAtzuo9nMNoc5nM7ttDktdoc1t8Wr4NLB0AA3AhQEgQjhQ6Iw1yXRKeH4M9RM1n4dn0OY2LkOHm1XFHdRLUlYk53DZzM6U-kAWjmKy2mwpjC2Gw2azuCwWdJUwtgAFdMJg4LASCJYLx0LwwOp0AAzb0AJ2QcwOjFIQrSDqdLs5dm5NVmdRxjSa+E4EDgwkjxEqssTokQOveutDh1uFu2GyW23VuypX0F9LS-zz1Rmhb5OORqeStqjLLZbeh8viiEOdxu72r6vOcxO1xtqT80edsHgkPzHZcFoRtbJmsY20WO12-IWSIJG12WzmN6PqLmS9+6j96Fw2ntgbAw7lSa7CT3rc5LUkSyIfDeCgKEAA */
  context: ({ input }: { input: any }) => {
    // const utxos = !!input.wallet
    //   ? [...input.wallet.listUtxos.map((utxo: Utxo) => utxo.address), ""]
    //   : ["", ""];
    let utxos = ["", ""];
    let xpubs = ["", ""];
    if (input.wallet) {
      utxos = [];
      xpubs = [];
      for (const xpub of input.wallet.listXpubs) {
        xpubs.push(xpub.address);
      }
      for (const utxo of input.wallet.listUtxos) {
        utxos.push(utxo.address);
      }
      utxos.push("");
    }

    return {
      name: input.wallet?.name || "",
      walletId: input.wallet?.id,
      data: { color: input.wallet?.color || "#000000" },
      utxos,
      xpubs,
      appMachine: input.appMachine,
      isDirty: false,
    };
  },

  initial: "idle",
  states: {
    idle: {
      on: {
        SET_VALUE: {
          actions: assign({
            data: ({ event, context }) => ({
              ...context.data,
              [event.data.key]: event.data.value,
            }),
          }),
        },
        SET_NAME: {
          actions: assign({
            name: ({ event }) => event.data.name,
          }),
        },
        SAVE: {
          target: "saving",
        },
        BLUR_FIELD: {
          actions: assign({
            utxos: ({ context, event }) => {
              const existing = [...context.utxos];
              if (!event.data.xpub) {
                existing[event.data.index] = event.data.value;
              }
              return existing;
            },
            xpubs: ({ context, event }) => {
              const existing = [...context.xpubs];
              if (event.data.xpub) {
                existing[event.data.index] = event.data.value;
              }
              return existing;
            },
            isDirty: ({ context, event }) => {
              const existingUtxos = [...context.utxos];
              const existingXpubs = [...context.xpubs];
              if (!event.data.xpub) {
                existingUtxos[event.data.index] = event.data.value;
              }
              if (event.data.xpub) {
                existingXpubs[event.data.index] = event.data.value;
              }
              const dirtyUtxos = existingUtxos.some((utxo) => utxo);
              const dirtyXpubs = existingXpubs.some((xpub) => xpub);
              return dirtyUtxos || dirtyXpubs;
            },
          }),
        },
        ADD_EMPTY_FIELD: {
          actions: assign({
            utxos: ({ context, event }) => {
              if (!event.data.xpub) {
                return [...context.utxos, ""];
              }
              return context.utxos;
            },
            xpubs: ({ context, event }) => {
              if (event.data.xpub) {
                return [...context.xpubs, ""];
              }
              return context.xpubs;
            },
          }),
        },
        DELETE_FIELD: {
          actions: assign({
            utxos: ({ context, event }) => {
              const utxos = [...context.utxos];
              if (!event.data.xpub) {
                utxos.splice(event.data.index, 1);
              }
              return utxos;
            },
            xpubs: ({ context, event }) => {
              const xpubs = [...context.xpubs];
              if (event.data.xpub) {
                xpubs.splice(event.data.index, 1);
              }
              return xpubs;
            },
          }),
        },
      },
    },
    saving: {
      // @todo some validation?
      always: [
        {
          target: "success",
          guard: ({ context }) => {
            const utxos = context.utxos.filter((utxo) => utxo);
            const xpubs = context.xpubs.filter((xpub) => xpub);
            const sum = utxos.length + xpubs.length;
            return sum >= 1 && !!context.name;
          },
        },
        "idle", // @todo error stuff
      ],
    },
    success: {
      entry: [
        sendTo(
          ({ context }) => context.appMachine,
          ({ context, event }) => {
            assertEvent(event, "SAVE");
            const toObject = (acc: Record<string, any>, cur: string) => ({
              ...acc,
              [cur]: { address: cur, manual: true },
            });

            const addresses = context.utxos
              .filter((val) => val)
              .reduce(toObject, {});

            const xpubs = context.xpubs
              .filter((val) => val)
              .reduce(toObject, {});

            const name = context.name;
            const accountType =
              Object.keys(xpubs).length > 1 ? "MULTI_SIG" : "SINGLE_SIG";

            const color = context.data.color;
            return {
              type: "APP_MACHINE_ADD_WALLET",
              data: {
                addresses,
                xpubs,
                name,
                id: event.data.id || context.walletId,
                accountType,
                color,
              },
              flags: {
                hasUpdatedUtxoOrXpub: context.isDirty,
              },
            };
          }
        ),
      ],
      after: {
        1000: "idle",
      },
    },
    failure: {},
  },
  on: {
    RESET_FORM: {
      target: ".idle",
      actions: assign({
        isDirty: false,
        walletId: ({ event }) => {
          assertEvent(event, "RESET_FORM");
          return event.data?.wallet?.id;
        },
        utxos: ({ event }) => {
          assertEvent(event, "RESET_FORM");
          let utxos = ["", ""];
          if (event.data.wallet) {
            utxos = [];
            // for (const xpub of event.data.wallet.listXpubs) {
            //   utxos.push(xpub.address);
            // }
            for (const utxo of event.data?.wallet?.listManualAddresses) {
              utxos.push(utxo.address);
            }
            utxos.push("");
          }
          return utxos;
        },
        xpubs: ({ event }) => {
          assertEvent(event, "RESET_FORM");
          let xpubs = ["", ""];
          if (event.data.wallet) {
            xpubs = [];
            for (const xpub of event.data.wallet.listXpubs) {
              xpubs.push(xpub.address);
            }
            if (event.data.wallet.accountType === "MULTI_SIG") {
              xpubs.push("");
            }
          }
          return xpubs;
        },
      }),
    },
  },
});
