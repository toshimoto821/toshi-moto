import {
  createSlice,
  type PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";

import { type RootState } from "../store";

export type NavbarState = {
  graphStartDate: number | null;
  graphEndDate: number | null;
};

const initialState: NavbarState = {
  graphStartDate: null,
  graphEndDate: null,
};

export const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    setRange(
      state,
      action: PayloadAction<{
        graphStartDate: number | null;
        graphEndDate: number | null;
      }>
    ) {
      state.graphStartDate = action.payload.graphStartDate;
      state.graphEndDate = action.payload.graphEndDate;
    },
  },
  // extraReducers(builder) {
  //   builder.addMatcher(API_REQUEST_REJECTED, (state, action) => {
  //     state.toastOpen = true;
  //     const message = {
  //       line1: `${action.meta.arg.endpointName} error`,
  //       // @ts-expect-error error
  //       line2: `${action.payload?.error}`,
  //     };
  //     state.toastMessage = message;
  //   });
  // },
});

export const navbarReducer = navbarSlice.reducer;

///////////////////////////////////////
/// Actions
///////////////////////////////////////
export const { setRange } = navbarSlice.actions;

///////////////////////////////////////
/// Selectors
///////////////////////////////////////

export const selectGraphRange = createSelector(
  (state: RootState) => state.navbar.graphStartDate,
  (state: RootState) => state.navbar.graphEndDate,
  (graphStartDate, graphEndDate) => ({ graphStartDate, graphEndDate })
);

////////////////////////////////////////
// Middleware
////////////////////////////////////////
// export const addUIListener = (startAppListening: AppStartListening) => {
// startAppListening({
//   predicate: (action, state) => {
//     console.log("predicate"), action, state;
//     return true;
//   },
//   effect: (action, { dispatch, getState }) => {
//     // const state = getState();
//     // console.log(action, state);
//   },
// });
// };
