import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

import { store } from "@lib/store";

interface IAppProvider {
  children: React.ReactNode;
}
const persistor = persistStore(store);
export const AppProvider = ({ children }: IAppProvider) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
