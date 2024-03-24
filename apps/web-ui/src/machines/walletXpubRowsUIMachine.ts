import { setup, assign } from "xstate";

type IContext = {
  showOnlyUtxosForReceiveAddress: boolean;
  showOnlyUtxosForChangeAddress: boolean;
};
export const walletXpubRowsUIMachine = setup({
  types: {} as {
    context: IContext;
    events: {
      type: "TOGGLE_ADDRESS_EXPANDED";
      data: { addressType: "RECEIVE" | "CHANGE" };
    };
  },
  actions: {
    toggleAddressExpanded: assign({
      showOnlyUtxosForReceiveAddress: ({ context, event }) => {
        if (event.data.addressType === "RECEIVE") {
          return !context.showOnlyUtxosForReceiveAddress;
        }

        return context.showOnlyUtxosForReceiveAddress;
      },
      showOnlyUtxosForChangeAddress: ({ context, event }) => {
        if (event.data.addressType === "CHANGE") {
          return !context.showOnlyUtxosForChangeAddress;
        }

        return context.showOnlyUtxosForChangeAddress;
      },
    }),
  },
}).createMachine({
  initial: "idle",
  context: {
    showOnlyUtxosForReceiveAddress: true,
    showOnlyUtxosForChangeAddress: true,
  },
  states: {
    idle: {
      on: {
        TOGGLE_ADDRESS_EXPANDED: {
          actions: "toggleAddressExpanded",
        },
      },
    },
  },
  // need to register an event listener with app so that other
  // things can expand/collapse addresses
  // dont spend much time on this as its currently a broken ux
  // i need to expand addresses only if its hidden
});
