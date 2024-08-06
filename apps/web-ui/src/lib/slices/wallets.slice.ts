import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface Wallet {
  id: string;
  name: string;
}

const walletsAdapter = createEntityAdapter<Wallet>();

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
export const { upsertWallet, removeWallet } = walletsSlice.actions;
