import { useEffect } from "react";
import localForage from "localforage";
import { type IWalletInput, type ITxsInput } from "@models/Wallet";
import {
  type IUtxoRequest,
  type AppMachineMeta,
} from "@machines/appMachine.ts";
import { AppContext } from "@providers/AppProvider";
import { App } from "./App.tsx";
import { Loading } from "./screens/loading/Loading.tsx";
export const AppLoader = () => {
  const { send } = AppContext.useActorRef();
  const ready = AppContext.useSelector((current) => current.context.meta.ready);

  useEffect(() => {
    localForage.getItem("walletMachine").then((data: any) => {
      if (data) {
        // @ts-ignore
        const context = {
          btcWallets: (data.context.btcWallets || []) as IWalletInput[],
          addresses: (data.context.addresses || {}) as Record<
            string,
            IUtxoRequest
          >,
          selectedTxs: (data.context.selectedTxs || {}) as Set<string>,
          transactions: (data.context.transactions || {}) as ITxsInput,
          meta: data.context.meta,
        };

        send({ type: "APP_MACHINE_REHYDRATE", data: { context } });
      } else {
        const context = {
          btcWallets: [] as IWalletInput[],
          addresses: {} as Record<string, IUtxoRequest>,
          transactions: {} as ITxsInput,
          meta: {} as AppMachineMeta,
          selectedTxs: new Set<string>(),
        };
        send({ type: "APP_MACHINE_REHYDRATE", data: { context } });
      }
    });
  }, []);

  if (!ready) {
    return <Loading />;
  }
  return <App />;
};
