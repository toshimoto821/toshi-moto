import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { Xpub } from "@models/Xpub";
import { createAppAsyncThunk } from "../store/withTypes";
import { apiSlice } from "./api.slice";
import type { AddressResponse, Transaction } from "./api.slice.types";
import { enqueueAction } from "./network.slice";

import type { AppStartListening } from "../store/middleware/listener";

interface Wallet {
  id: string;
  name: string;
  color: string;
  xpubs: string[];
  meta: {
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
}

interface Address {
  id: string; // address
  index: number;
  isChange: boolean;
  walletId: string;
  details?: AddressResponse;
  // loading transactions, etc
  status?: string;

  transactions: ReturnType<typeof transactionAdapter.getInitialState>;
}

interface WalletTransaction extends Transaction {
  id: string;
}

const walletsAdapter = createEntityAdapter<Wallet>();
const addressAdapter = createEntityAdapter<Address>();
const transactionAdapter = createEntityAdapter<WalletTransaction>();

type AddressPayload = {
  walletId: string;
  addresses: string[];
  isChange: boolean;
  index: number;
};

export const walletsSlice = createSlice({
  name: "wallets",
  initialState: walletsAdapter.getInitialState(),
  reducers: {
    upsertWallet(state, action: PayloadAction<Wallet>) {
      walletsAdapter.upsertOne(state, action.payload);
    },
    removeWallet(state, action: PayloadAction<{ id: string }>) {
      state = walletsAdapter.removeOne(state, action.payload.id);
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
  },
  extraReducers: (builder) => {
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
            details: action.payload,
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
        console.log(action);
        const { address, walletId } = action.meta.arg.originalArgs;
        const wallet = state.entities[walletId];
        if (wallet) {
          const txs = action.payload.map((tx) => ({ ...tx, id: tx.txid }));
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

export const { removeWallet } = walletsSlice.actions;

export const upsertWallet = createAppAsyncThunk(
  walletsSlice.actions.upsertWallet.type,
  async (wallet: Wallet, { dispatch /*, getState*/ }) => {
    // add the initial wallet
    dispatch(
      walletsSlice.actions.upsertWallet({
        ...wallet,
        meta: {
          change: {
            lastAddressIndex: null,
          },
          receive: {
            lastAddressIndex: null,
          },
        },
        addresses: addressAdapter.getInitialState(),
      })
    );
  }
);

///////////////////////////
/// Utils
///////////////////////////

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
