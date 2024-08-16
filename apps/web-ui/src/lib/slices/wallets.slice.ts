import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { Xpub } from "@models/Xpub";
import { createAppAsyncThunk } from "../store/withTypes";
import { apiSlice } from "./api.slice";
import type {
  AddressArgs,
  AddressResponse,
  Transaction,
} from "./api.slice.types";
import { enqueueAction } from "./network.slice";
import type { AppStartListening } from "../store/middleware/listener";
import { RootState } from "../store";
import { IAppAddressFilters } from "@root/types";

export interface Wallet {
  id: string;
  name: string;
  color: string;
  xpubs: string[];
  meta: {
    refreshedAt: number;
    change: {
      lastAddressIndex: number | null;
    };
    receive: {
      lastAddressIndex: number | null;
    };
  };
  // loading addresses, fetching transactions, etc
  status?: string;
  addresses: ReturnType<typeof addressAdapter.getInitialState>;
  addressFilters: IAppAddressFilters;
  archived?: boolean;
}

export interface Address {
  id: string; // address
  index: number;
  isChange: boolean;
  walletId: string;
  details?: {
    data: AddressResponse;
    fulfilledTimeStamp: number;
  };
  // loading transactions, etc
  status?: string;

  transactions: ReturnType<typeof transactionAdapter.getInitialState>;
}

interface WrappedTransactions {
  id: string;
  data: Transaction;
  fulfilledTimeStamp: number;
}

const walletsAdapter = createEntityAdapter<Wallet>();

const addressAdapter = createEntityAdapter<Address>({
  sortComparer: (a, b) => {
    return b.index - a.index;
  },
});
const transactionAdapter = createEntityAdapter<WrappedTransactions>();

export type AddressPayload = {
  walletId: string;
  addresses: string[];
  isChange: boolean;
  index: number;
};

export const walletsSlice = createSlice({
  name: "wallets",
  initialState: walletsAdapter.getInitialState(),
  reducers: {
    archiveWallet(
      state,
      action: PayloadAction<{ walletId: string; archive: boolean }>
    ) {
      const wallet = state.entities[action.payload.walletId];
      if (wallet) {
        wallet.archived = action.payload.archive;
      }
    },
    upsertWallet(state, action: PayloadAction<Wallet>) {
      walletsAdapter.upsertOne(state, action.payload);
    },
    removeWallet(state, action: PayloadAction<string>) {
      walletsAdapter.removeOne(state, action.payload);
    },
    upsertAddresses(state, action: PayloadAction<AddressPayload>) {
      const wallet = state.entities[action.payload.walletId];
      for (const address of action.payload.addresses) {
        if (wallet) {
          addressAdapter.upsertOne(wallet.addresses, {
            id: address,
            walletId: wallet.id,
            transactions: transactionAdapter.getInitialState(),
            index: action.payload.index,
            isChange: action.payload.isChange,
          });
        }
      }
    },
    refreshAddresses(state, action: PayloadAction<AddressArgs[]>) {
      for (const item of action.payload) {
        const { walletId, address } = item;
        state.entities[walletId].addresses.entities[address].status = "PENDING";
      }
    },
    trimAddresses(
      state,
      action: PayloadAction<{
        walletId: string;
        change: boolean;
        index: number;
      }>
    ) {
      const wallet = state.entities[action.payload.walletId];
      if (wallet) {
        const addressesToRemove = wallet.addresses.ids.filter((addressId) => {
          const address = wallet.addresses.entities[addressId];
          if (address.isChange === action.payload.change) {
            if (address.index > action.payload.index) {
              return true;
            }
          }
          return false;
        });

        addressAdapter.removeMany(wallet.addresses, addressesToRemove);
      }
    },
    refreshWallet(state, action: PayloadAction<string>) {
      const wallet = state.entities[action.payload];
      if (wallet) {
        wallet.meta.refreshedAt = new Date().getTime();
      }
    },
    incrementAddressIndex(
      state,
      action: PayloadAction<{
        walletId: string;
        change: boolean;
        incrementOrDecrement: number;
      }>
    ) {
      const wallet = state.entities[action.payload.walletId];
      if (wallet) {
        const type = action.payload.change ? "change" : "receive";
        wallet.meta[type].lastAddressIndex =
          wallet.meta[type].lastAddressIndex || 0;

        wallet.meta[type].lastAddressIndex +=
          action.payload.incrementOrDecrement;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      apiSlice.endpoints.getAddress.matchRejected,
      (state, action) => {
        const { address, walletId } = action.meta.arg.originalArgs;
        const wallet = state.entities[walletId];
        if (wallet) {
          const addressObj = wallet.addresses.entities[address];
          if (addressObj) {
            addressObj.status = "REJECTED";
          }
        }
      }
    );

    builder.addMatcher(
      apiSlice.endpoints.getAddress.matchFulfilled,
      (state, action) => {
        const { address, walletId, index, isChange } =
          action.meta.arg.originalArgs;
        const wallet = state.entities[walletId];

        if (wallet) {
          const addressObj = wallet.addresses.entities[address] || {};
          const addressEntity = addressAdapter.upsertOne(wallet.addresses, {
            ...addressObj,
            id: address,
            walletId,
            index,
            isChange,
            transactions:
              addressObj.transactions || transactionAdapter.getInitialState(),
            status: "RESOLVED",
            details: {
              data: action.payload,
              fulfilledTimeStamp: action.meta.fulfilledTimeStamp,
            },
          });
          wallet.addresses = addressEntity;
          state.entities[walletId] = wallet;

          if (
            action.payload.chain_stats.tx_count === 0 &&
            action.payload.mempool_stats.tx_count === 0
          ) {
            if (!action.meta.arg.originalArgs.isChange) {
              wallet.meta.receive.lastAddressIndex = Math.max(
                wallet.meta.receive.lastAddressIndex || 0,
                action.meta.arg.originalArgs.index
              );
            } else if (action.meta.arg.originalArgs.isChange) {
              wallet.meta.change.lastAddressIndex = Math.max(
                wallet.meta.change.lastAddressIndex || 0,
                action.meta.arg.originalArgs.index
              );
            }
          }
        }
      }
    );
    builder.addMatcher(
      apiSlice.endpoints.getTransactions.matchFulfilled,
      (state, action) => {
        const { address, walletId } = action.meta.arg.originalArgs;
        const wallet = state.entities[walletId];
        if (wallet) {
          const txs = action.payload.map((tx) => {
            return {
              id: tx.txid,
              data: tx,
              fulfilledTimeStamp: action.meta.fulfilledTimeStamp,
            };
          });
          wallet.addresses.entities[address].transactions =
            transactionAdapter.upsertMany(
              wallet.addresses.entities[address].transactions,
              txs
            );
        }
      }
    );
  },
});

export const walletsReducer = walletsSlice.reducer;

///////////////////////////////////////////
// Middleware
///////////////////////////////////////////

export const addWalletListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: walletsSlice.actions.incrementAddressIndex,
    effect: async (action, listenerApi) => {
      const state = listenerApi.getState();
      const wallet = state.wallets.entities[action.payload.walletId];

      // just the first address
      if (wallet) {
        const metaType = action.payload.change ? "change" : "receive";
        const lastAddressIndex = wallet.meta[metaType].lastAddressIndex || 0;
        const start = Math.max(
          lastAddressIndex - action.payload.incrementOrDecrement,
          0
        );
        // const limit = lastAddressIndex - action.payload.incrementOrDecrement;
        const addresses = await Xpub.scanXpubs(wallet.xpubs, {
          start,
          limit: Math.abs(action.payload.incrementOrDecrement),
          isChange: action.payload.change,
        });

        listenerApi.dispatch(
          enqueueAction(
            addresses.map((address, index) => ({
              endpoint: "getAddress",
              args: {
                address,
                walletId: action.payload.walletId,
                index: start + index,
                isChange: action.payload.change,
              },
            }))
          )
        );
      }
    },
  });

  // wallet listener
  startAppListening({
    actionCreator: walletsSlice.actions.upsertWallet,
    effect: async (action, listenerApi) => {
      const { dispatch, getState } = listenerApi;
      const state = getState();
      const SKIP_BY = 10;
      const walletId = action.payload.id;
      const wallet = state.wallets.entities[walletId];
      if (wallet) {
        // just the first address
        const [address] = await Xpub.scanXpubs(wallet.xpubs, {
          start: 0,
          limit: 1,
          isChange: false,
        });
        dispatch(
          enqueueAction([
            {
              endpoint: "getAddress",
              args: {
                address,
                walletId: walletId,
                index: 0,
                isChange: false,
              },
            },
          ])
        );

        const [changeAddress] = await Xpub.scanXpubs(wallet.xpubs, {
          start: 0,
          limit: 1,
          isChange: true,
        });

        dispatch(
          enqueueAction([
            {
              endpoint: "getAddress",
              args: {
                address: changeAddress,
                walletId: walletId,
                index: 0,
                isChange: true,
              },
            },
          ])
        );

        await listenerApi.condition((_, currentState) => {
          const wallet = currentState.wallets.entities[walletId];
          if (!wallet) return false;
          return (
            wallet.meta.receive.lastAddressIndex !== null &&
            wallet.meta.change.lastAddressIndex !== null
          );
        });

        // ready to scan

        const updatedState = listenerApi.getState();
        const updatedWallet = updatedState.wallets.entities[walletId];
        const receiveAddresses = await Xpub.scanXpubs(updatedWallet.xpubs, {
          start: 1,
          limit: Math.max(
            updatedWallet.meta.receive.lastAddressIndex!,
            SKIP_BY
          ),
          isChange: false,
        });
        listenerApi.dispatch(
          enqueueAction(
            receiveAddresses.map((address, index) => ({
              endpoint: "getAddress",
              args: {
                address,
                index: index + 1,
                isChange: false,
                walletId: walletId,
              },
            }))
          )
        );

        const changeAddresses = await Xpub.scanXpubs(updatedWallet.xpubs, {
          start: 1,
          limit: Math.max(updatedWallet.meta.change.lastAddressIndex!, SKIP_BY),
          isChange: true,
        });
        listenerApi.dispatch(
          enqueueAction(
            changeAddresses.map((address, index) => ({
              endpoint: "getAddress",
              args: {
                address,
                index: index + 1,
                isChange: true,
                walletId: walletId,
              },
            }))
          )
        );
      }
    },
  });

  // Address Listener
  startAppListening({
    actionCreator: walletsSlice.actions.upsertAddresses,
    effect: (action, listenerApi) => {
      const { dispatch } = listenerApi;
      const { walletId, addresses } = action.payload;
      dispatch(
        enqueueAction(
          addresses.map((address) => ({
            endpoint: "getAddress",
            args: {
              address,
              walletId: walletId,
            },
          }))
        )
      );
    },
  });

  // scan wallet until we find an address with no transactions
  startAppListening({
    matcher: apiSlice.endpoints.getAddress.matchFulfilled,
    effect: async (action, listenerApi) => {
      const state = listenerApi.getState();
      const { isChange, index, walletId } = action.meta.arg.originalArgs;
      const wallet = state.wallets.entities[walletId];

      if (wallet.meta.receive.lastAddressIndex === null) {
        if (action.payload.chain_stats.tx_count > 0) {
          const start = index + 10;
          const [address] = await Xpub.scanXpubs(wallet.xpubs, {
            start,
            limit: start + 1,
            isChange: isChange,
          });
          listenerApi.dispatch(
            enqueueAction({
              endpoint: "getAddress",
              args: {
                address,
                index: start,
                isChange: isChange,
                walletId: wallet.id,
              },
            })
          );
          // wallet.meta.receive.lastAddressIndex = action.meta.arg.originalArgs.index;
        }
      }
    },
  });

  // tx listener
  startAppListening({
    matcher: apiSlice.endpoints.getAddress.matchFulfilled,
    effect: (action, listenerApi) => {
      const { dispatch } = listenerApi;
      const { address, walletId } = action.meta.arg.originalArgs;
      const wallet = listenerApi.getState().wallets.entities[walletId];
      if (wallet) {
        if (
          action.payload?.chain_stats?.tx_count > 0 ||
          action.payload?.mempool_stats?.tx_count > 0
        ) {
          dispatch(
            enqueueAction([
              {
                endpoint: "getTransactions",
                args: {
                  address,
                  walletId,
                },
              },
            ])
          );
        }
      }
    },
  });
};

///////////////////////////
// Actions
///////////////////////////

export const {
  removeWallet,
  incrementAddressIndex,
  trimAddresses,
  archiveWallet,
} = walletsSlice.actions;

export const refreshAddresses = createAppAsyncThunk(
  walletsSlice.actions.refreshAddresses.type,
  async (addresses: AddressArgs[], { dispatch }) => {
    dispatch(walletsSlice.actions.refreshAddresses(addresses));

    dispatch(
      enqueueAction(
        addresses.map((address) => ({
          endpoint: "getAddress",
          args: address,
        }))
      )
    );
  }
);

interface RefresWalletArgs {
  walletId: string;
  ttl?: number;
}
export const refreshWallet = createAppAsyncThunk(
  walletsSlice.actions.refreshWallet.type,
  async ({ walletId, ttl }: RefresWalletArgs, { dispatch, getState }) => {
    const state = getState();
    const wallet = state.wallets.entities[walletId];
    if (wallet) {
      const { refreshedAt } = wallet.meta;
      // dont refresh if cache is not stale
      if (ttl && refreshedAt) {
        const now = new Date().getTime();
        const diff = now - refreshedAt;
        if (diff < ttl) return;
      }
      dispatch(walletsSlice.actions.refreshWallet(walletId));

      const addresses = Object.values(wallet.addresses.entities).map(
        (address) => {
          return {
            address: address.id,
            walletId,
            index: address.index,
            isChange: address.isChange,
          } as AddressArgs;
        }
      );
      dispatch(refreshAddresses(addresses));
    }
  }
);

export const upsertWallet = createAppAsyncThunk(
  walletsSlice.actions.upsertWallet.type,
  async (
    wallet: Pick<Wallet, "id" | "name" | "color" | "xpubs">,
    { dispatch /*, getState*/ }
  ) => {
    // add the initial wallet
    dispatch(
      walletsSlice.actions.upsertWallet({
        ...wallet,
        meta: {
          refreshedAt: new Date().getTime(),
          change: {
            lastAddressIndex: null,
          },
          receive: {
            lastAddressIndex: null,
          },
        },
        addresses: addressAdapter.getInitialState(),
        addressFilters: {
          utxoOnly: false,
        },
      })
    );
  }
);

///////////////////////////
// Selectors
///////////////////////////
export const { selectAll: selectAllWallets } =
  walletsAdapter.getSelectors<RootState>((state) => state.wallets);
