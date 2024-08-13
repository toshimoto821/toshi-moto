import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UIState } from "./ui.slice.types";
import { type RootState } from "../store";

const initialState: UIState = {
  graphBtcAllocation: true,
  graphPlotDots: false,
  graphSelectedTransactions: [],
  privatePrice: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setUI(state, action: PayloadAction<Partial<UIState>>) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const uiReducer = uiSlice.reducer;

///////////////////////////////////////
/// Actions
///////////////////////////////////////
export const { setUI } = uiSlice.actions;

///////////////////////////////////////
/// Selectors
///////////////////////////////////////

export const selectPrivatePrice = (state: RootState) => state.ui.privatePrice;
export const selectUI = (state: RootState) => state.ui;
