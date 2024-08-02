import { Provider } from "react-redux";
import { createActorContext } from "@xstate/react";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

import { store } from "@lib/store";
// import { networkMachine } from "../machines/networkMachine";
import { networkLoggerMachine } from "@machines/networkLoggerMachine";
import { appMachine } from "@machines/appMachine";
import { btcPriceMachine } from "@machines/btcPriceMachine";
import { walletListUIMachine } from "@machines/walletListUIMachine";
import { btcHistoricPriceMachine } from "@machines/btcHistoricPriceMachine";
import { toastMachine } from "@root/machines/toastMachine";

export const BtcHistoricPriceContext = createActorContext(
  btcHistoricPriceMachine
);
export const BtcPriceContext = createActorContext(btcPriceMachine);

export const WalletUIContext = createActorContext(walletListUIMachine);

export const NetworkContext = createActorContext(networkLoggerMachine, {
  // state: JSON.parse(localStorage.getItem("networkMachine") || "null"),
});

export const ToastContext = createActorContext(toastMachine);

// const state = JSON.parse(localStorage.getItem("walletMachine") || "null");

export const AppContext = createActorContext(appMachine, {
  // state: state?.persistedState,
});

interface IAppProvider {
  children: React.ReactNode;
}
const persistor = persistStore(store);
export const AppProvider = ({ children }: IAppProvider) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NetworkContext.Provider>
          <AppContext.Provider>
            <ToastContext.Provider>
              <BtcPriceContext.Provider>
                <BtcHistoricPriceContext.Provider>
                  <WalletUIContext.Provider>
                    {children}
                  </WalletUIContext.Provider>
                </BtcHistoricPriceContext.Provider>
              </BtcPriceContext.Provider>
            </ToastContext.Provider>
          </AppContext.Provider>
        </NetworkContext.Provider>
      </PersistGate>
    </Provider>
  );
};
