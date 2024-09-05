import {
  createSlice,
  type PayloadAction,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { sub, add } from "date-fns";
import { timeDay, timeHour, timeMinute } from "d3";
import type { UIState, GroupBy, GraphTimeFrameRange } from "./ui.slice.types";
import { type RootState } from "../store";
import { API_REQUEST_REJECTED } from "./api.slice";

export const defaultGraphStartDate = timeDay(
  sub(new Date(), { years: 5 })
).getTime();

export const defaultGraphEndDate = timeDay(
  add(new Date(), { hours: 1 })
).getTime();

const initialState: UIState = {
  currency: "usd",
  debugMode: false,
  filterUtxoOnly: [],
  graphTimeFrameRange: "5Y",
  graphTimeFrameGroup: "1W",
  previousGraphTimeFrameRange: null,
  graphStartDate: defaultGraphStartDate,
  graphStartDateNext: null,
  graphEndDate: defaultGraphEndDate,
  graphEndDateNext: null,
  graphBtcAllocation: true,
  graphPlotDots: false,
  graphSelectedTransactions: [],
  navbarBalanceVisibility: false,
  netAssetValue: false,
  privatePrice: false,
  selectedWalletId: null,
  toastOpen: false,
  toastMessage: null,
  walletExpandedAddresses: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setUI(state, action: PayloadAction<Partial<UIState>>) {
      const { graphTimeFrameRange } = state;
      const overrides = {} as Partial<UIState>;
      if (action.payload.graphTimeFrameRange === null && graphTimeFrameRange) {
        overrides.previousGraphTimeFrameRange = graphTimeFrameRange;
      } else if (graphTimeFrameRange) {
        overrides.previousGraphTimeFrameRange = graphTimeFrameRange;
      }
      return {
        ...state,
        ...action.payload,
        ...overrides,
      };
    },
    showToast(state, action: PayloadAction<UIState["toastMessage"]>) {
      state.toastOpen = true;
      state.toastMessage = action.payload;
    },
    clearToast(state) {
      state.toastMessage = null;
      state.toastOpen = false;
    },
    toggleSelectedTx(state, action: PayloadAction<string>) {
      // remove from graphSelectedTransactions if exists
      if (state.graphSelectedTransactions.includes(action.payload)) {
        // remove it
        const index = state.graphSelectedTransactions.indexOf(action.payload);
        state.graphSelectedTransactions.splice(index, 1);
      } else {
        state.graphSelectedTransactions.push(action.payload);
      }
    },
    addSelectedTransactions(state, action: PayloadAction<string[]>) {
      const set = new Set(state.graphSelectedTransactions);
      for (const tx of action.payload) {
        set.add(tx);
      }
      state.graphSelectedTransactions = Array.from(set);
    },
    removeSelectedTransactions(state, action: PayloadAction<string[]>) {
      for (const tx of action.payload) {
        const index = state.graphSelectedTransactions.indexOf(tx);
        if (index > -1) {
          state.graphSelectedTransactions.splice(index, 1);
        }
      }
    },
    expandAddress(state, action: PayloadAction<string>) {
      const set = new Set(state.walletExpandedAddresses || []);
      set.add(action.payload);
      state.walletExpandedAddresses = Array.from(set);
    },
    collapseAddress(state, action: PayloadAction<string>) {
      const set = new Set(state.walletExpandedAddresses);
      set.delete(action.payload);
      state.walletExpandedAddresses = Array.from(set);
    },
    toggleAddress(state, action: PayloadAction<string>) {
      const set = new Set(state.walletExpandedAddresses);
      if (set.has(action.payload)) {
        set.delete(action.payload);
      } else {
        set.add(action.payload);
      }
      state.walletExpandedAddresses = Array.from(set);
    },
    setDebugMode(state, action: PayloadAction<boolean>) {
      state.debugMode = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addMatcher(API_REQUEST_REJECTED, (state, action) => {
      state.toastOpen = true;
      const message = {
        line1: `${action.meta.arg.endpointName} error`,
        // @ts-expect-error error
        line2: `${action.payload?.error}`,
      };
      state.toastMessage = message;
    });
  },
});

export const uiReducer = uiSlice.reducer;

///////////////////////////////////////
/// Actions
///////////////////////////////////////
export const {
  setUI,
  toggleSelectedTx,
  addSelectedTransactions,
  removeSelectedTransactions,
  expandAddress,
  collapseAddress,
  toggleAddress,
  showToast,
  clearToast,
  setDebugMode,
} = uiSlice.actions;

export const roundUpToNearHour = (date: Date) => {
  const oneHourFromDate = add(date, { hours: 1 });
  return timeHour(oneHourFromDate);
};

export const setGraphByRange = (
  range: GraphTimeFrameRange
): PayloadAction<Partial<UIState>> => {
  const now = new Date(); //add(, { hours: 1 });
  const oneHourFromNow = add(now, { hours: 1 });
  // default to 5 years;
  let startDate = timeDay(sub(now, { years: 5 })).getTime();
  const endDate = timeHour(oneHourFromNow).getTime();
  let graphTimeFrameGroup: GroupBy = "1W";
  let graphTimeFrameRange: GraphTimeFrameRange = "5Y";

  if (range === "1D") {
    startDate = timeMinute(sub(now, { days: 1 })).getTime();
    graphTimeFrameGroup = "5M";
    graphTimeFrameRange = "1D";
  } else if (range === "1W") {
    startDate = timeHour(sub(now, { days: 7 })).getTime();
    graphTimeFrameGroup = "1H";
    graphTimeFrameRange = "1W";
  } else if (range === "1M") {
    startDate = timeHour(sub(now, { months: 1 })).getTime();
    graphTimeFrameGroup = "1H";
    graphTimeFrameRange = "1M";
  } else if (range === "3M") {
    startDate = timeHour(sub(now, { months: 3 })).getTime();
    graphTimeFrameGroup = "1D";
    graphTimeFrameRange = "3M";
  } else if (range === "1Y") {
    startDate = timeDay(sub(now, { years: 1 })).getTime();
    graphTimeFrameGroup = "1D";
    graphTimeFrameRange = "1Y";
  } else if (range === "2Y") {
    startDate = timeDay(sub(now, { years: 2 })).getTime();
    graphTimeFrameGroup = "1W";
    graphTimeFrameRange = "2Y";
  }
  return {
    type: setUI.type,
    payload: {
      graphStartDate: startDate,
      graphEndDate: endDate,
      graphTimeFrameRange,
      graphTimeFrameGroup,
    },
  };
};

export const chartByDateRangeAction = (
  start: number,
  end: number
): PayloadAction<Partial<UIState>> => {
  const diff = end - start;
  const diffInDays = diff / (1000 * 60 * 60 * 24);

  let graphTimeFrameGroup: GroupBy = "1D";
  if (diffInDays < 2) {
    graphTimeFrameGroup = "5M";
  } else if (diffInDays < 8) {
    graphTimeFrameGroup = "1H";
  } else if (diffInDays < 31) {
    graphTimeFrameGroup = "1H";
  } else if (diffInDays < 365) {
    graphTimeFrameGroup = "1D";
  }

  return {
    type: setUI.type,
    payload: {
      graphTimeFrameGroup,
      graphStartDate: start,
      graphEndDate: end,
      graphTimeFrameRange: null,
    },
  };
};

///////////////////////////////////////
/// Selectors
///////////////////////////////////////
export const selectDebugMode = (state: RootState) => state.ui.debugMode;
export const selectPrivatePrice = (state: RootState) => state.ui.privatePrice;
export const selectUI = (state: RootState) => state.ui;

export const selectGroupByHistoric = createSelector(
  (state: RootState) => state.ui.graphTimeFrameRange,
  (state: RootState) => state.ui.previousGraphTimeFrameRange,
  (currentRange, previousRange) => {
    const range = previousRange || currentRange;
    let groupBy: GroupBy | null = null;
    if (range === "1D") {
      groupBy = "5M";
    } else if (range === "1W" || range === "1M") {
      groupBy = "1H";
    } else if (range === "3M" || range === "1Y") {
      groupBy = "1D";
    } else if (range === "2Y" || range === "5Y") {
      groupBy = "1W";
    } else {
      groupBy = "1W";
      console.error("unknown range", range);
    }

    return groupBy;
  }
);

export const selectGraphDates = createSelector(
  (state: RootState) => state.ui.graphStartDate,
  (state: RootState) => state.ui.graphEndDate,
  (state: RootState) => state.ui.graphTimeFrameRange,
  (graphStartDate, graphEndDate, graphTimeFrameRange) => {
    return {
      graphStartDate: graphStartDate || defaultGraphStartDate,
      graphEndDate: graphEndDate || defaultGraphEndDate,
      graphTimeFrameRange,
    };
  }
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

export const resetGraphIfEmptyRange = createAsyncThunk(
  "ui/resetGraphIfEmptyRange",
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    if (!state.ui.graphTimeFrameRange) {
      if (state.ui.previousGraphTimeFrameRange) {
        dispatch(setGraphByRange(state.ui.previousGraphTimeFrameRange));
      }
    }
  }
);
