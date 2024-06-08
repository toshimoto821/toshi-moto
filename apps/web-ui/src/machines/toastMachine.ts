import { setup, assign } from "xstate";

export type IToastMessage = {
  line1: string;
  line2?: string;
  action?: IToastAction;
};

export type IToastAction = {
  altText: string;
  text: string;
  onClick: () => void;
};
export const toastMachine = setup({
  types: {} as {
    context: {
      open: boolean;
      message: IToastMessage | null;
    };
    events:
      | {
          type: "TOAST";
          data: {
            message: IToastMessage;
          };
        }
      | {
          type: "CLEAR_TOAST";
        };
  },
  actors: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgGEAZAUQEEAlAfQBUB5GgZSYG0AGAXUSgADgHtYuAC64R+QSAAeiAEw8AbADoAnAA4emgKwB2HgGYAjEv0AaEAE9EAWm1n1JgCw9tK85YC+vmzQsPEIidVwIABswEjB8CQAnW14BJBBRcSkZOUUEfU1NdS9VM0MzbUNrO0QzDR4zEyUlTRNjM1Ly7X9AjBwCYnComNYObn45DMlpWTTctw0KqvsEJV11N3a3E303N30zN01DbpAgvtD1WGwRAHcCKBJ5WAl0CTB1dAAzN4TkfR4AaQziEBldbvcUhMxFNsrNlKZ1Ep3K0ljVtG51GZNEpVNodnsDkclP4AiB8CIIHA5MD+kQoZlpjlHC4LKiEA4yuttKpDMZVM1tF5nCcaRcItF6TCZqBciZcVolHtVDwdrjKjZlo11LjLPoSvokVtKiLeiCwmC7vgoJKstKFIh+SZXEa2bVtIjkbs3F43EpOiTfEA */
  initial: "idle",
  context: {
    open: false,
    message: null,
  },
  states: {
    idle: {
      // entry: "resetToast",
      on: {
        TOAST: {
          actions: assign({
            open: true,
            message: ({ event }) => {
              return event.data.message;
            },
          }),
          target: "showing",
        },
      },
    },
    showing: {
      after: {
        5000: "idle",
      },
    },
  },
  on: {
    CLEAR_TOAST: {
      actions: assign({
        open: false,
        message: null,
      }),
    },
  },
});
