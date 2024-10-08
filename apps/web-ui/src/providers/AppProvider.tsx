import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Loading } from "../components/loading/Loading";
import { store } from "@lib/store";

interface IAppProvider {
  children: React.ReactNode;
}
const persistor = persistStore(store);

export const AppProvider = ({ children }: IAppProvider) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
