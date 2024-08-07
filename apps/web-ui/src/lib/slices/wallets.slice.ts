import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { Xpub } from "@models/Xpub";
import { createAppAsyncThunk } from "../store/withTypes";
import { getAddress } from "./api.slice";

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

export const upsertWallet = createAppAsyncThunk(
  walletsSlice.actions.upsertWallet.type,
  async (wallet: Wallet, { dispatch, getState }) => {
    console.log(wallet);
    dispatch(walletsSlice.actions.upsertWallet(wallet));
    const state = getState();
    console.log(state);
    // scan wallet to get xpubs
    // up to n+ empty addresses
    let running = true;
    const xpubs = wallet.xpubs;
    let index = 0;
    let change = false;
    while (running) {
      const address = await Xpub.getAddressAtIndex(xpubs, index, change);
      await dispatch(getAddress.initiate(address));
      console.log(address);
      // check for transactions

      // if tx, continue and throw out data

      // otherwise return
      running = false;
    }

    // add addresses to wallet

    // scan addresses for transactions

    // add transactions to wallet addresses
  }
);
