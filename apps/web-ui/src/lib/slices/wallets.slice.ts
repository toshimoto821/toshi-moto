import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { Xpub } from "@models/Xpub";
import { createAppAsyncThunk } from "../store/withTypes";
import { getAddress } from "./api.slice";
import { AppDispatch } from "../store";

interface Wallet {
  id: string;
  name: string;
  color: string;
  xpubs: string[];
  // loading addresses, fetching transactions, etc
  status?: string;
  addresses: ReturnType<typeof addressAdapter.getInitialState>;
}

interface Address {
  id: string; // address
  walletId: string;
  // loading transactions, etc
  status?: string;
}

const walletsAdapter = createEntityAdapter<Wallet>();
const addressAdapter = createEntityAdapter<Address>();

interface WalletsState {
  wallets: ReturnType<typeof walletsAdapter.getInitialState>;
}

const initialState: WalletsState = {
  wallets: walletsAdapter.getInitialState(),
};

export const walletsSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    upsertWallet(state, action: PayloadAction<Wallet>) {
      walletsAdapter.upsertOne(state.wallets, action.payload);
    },
    removeWallet(state, action: PayloadAction<{ id: string }>) {
      state.wallets = walletsAdapter.removeOne(
        state.wallets,
        action.payload.id
      );
    },
  },
});

export const walletsReducer = walletsSlice.reducer;

///////////////////////////
// Actions
///////////////////////////

export const { removeWallet } = walletsSlice.actions;

export async function getLastAddressIndex(
  xpub: string | string[],
  change: boolean,
  dispatch: AppDispatch
) {
  let running = true;

  const SKIP_BY = 10;
  let index = 0;
  let lastAddressWithNoTxs = -1;
  while (running) {
    const address = await Xpub.getAddressAtIndex(xpub, index, change);
    const response = await dispatch(getAddress.initiate(address));

    // check for transactions
    if (
      (response.data && response?.data?.chain_stats.tx_count > 0) ||
      response?.data?.mempool_stats?.tx_count
    ) {
      index += SKIP_BY;
    } else if (
      response?.data?.chain_stats?.tx_count === 0 &&
      response?.data?.mempool_stats?.tx_count === 0
    ) {
      lastAddressWithNoTxs = Math.max(index, SKIP_BY); // + SKIP_BY;
      running = false;
    } else {
      running = false;
    }
  }
  return lastAddressWithNoTxs;
}

export const upsertWallet = createAppAsyncThunk(
  walletsSlice.actions.upsertWallet.type,
  async (wallet: Wallet, { dispatch /*, getState */ }) => {
    dispatch(walletsSlice.actions.upsertWallet(wallet));
    // const state = getState();

    const receiveIndex = await getLastAddressIndex(
      wallet.xpubs,
      false,
      dispatch
    );
    console.log(receiveIndex, "receiveIndex");
    // scan wallet to get xpubs
    // up to n+ empty addresses

    // if tx, continue and throw out data

    // add addresses to wallet

    // scan addresses for transactions

    // add transactions to wallet addresses
  }
);
