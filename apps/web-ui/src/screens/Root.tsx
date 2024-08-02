import { useEffect } from "react";
import {
  AppContext,
  NetworkContext,
  WalletUIContext,
  ToastContext,
} from "@providers/AppProvider";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import throttle from "lodash/throttle";
import localForage from "localforage";
import { Toast } from "@components/toast/Toast";
import { Navbar } from "@components/navbar/Navbar";
import { Xpub } from "@root/models/Xpub";
import { useAppDispatch, useAppSelector } from "@lib/hooks/store.hooks";
import { setAppVersion, selectAppVersion } from "@root/lib/slices/config.slice";

export const Root = () => {
  const walletActorRef = AppContext.useActorRef();
  const networkActorRef = NetworkContext.useActorRef();
  const walletUIActorRef = WalletUIContext.useActorRef();
  const toastActorRef = ToastContext.useActorRef();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const btcWallets = AppContext.useSelector(
    (current) => current.context.btcWallets
  );

  const throttledFunction = throttle(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const persistedState = walletActorRef.getPersistedSnapshot() as any;
      localForage.setItem("walletMachine", {
        context: persistedState.context,
      });
    },
    2000,
    { leading: false }
  );

  useEffect(() => {
    const subscription = walletActorRef.subscribe({
      next: throttledFunction,
    });
    return subscription.unsubscribe;
  }, [walletActorRef, throttledFunction]);

  useEffect(() => {
    if (pathname !== "/onboarding" && btcWallets.length === 0) {
      navigate("/onboarding");
    }
  }, [pathname, btcWallets.length, navigate]);

  useEffect(() => {
    walletActorRef.send({ type: "SUBSCRIBE", data: { ref: networkActorRef } });
    walletActorRef.send({ type: "SUBSCRIBE", data: { ref: walletUIActorRef } });
    walletActorRef.send({ type: "SUBSCRIBE", data: { ref: toastActorRef } });
    return () => {
      walletActorRef.send({
        type: "UNSUBSCRIBE",
        data: { ref: networkActorRef },
      });
      walletActorRef.send({
        type: "UNSUBSCRIBE",
        data: { ref: walletUIActorRef },
      });
    };
  }, [networkActorRef, toastActorRef, walletUIActorRef, walletActorRef]);

  const storedVersion = useAppSelector(selectAppVersion);

  const currentVersion = "__VERSION__";
  console.log(storedVersion, currentVersion);
  useEffect(() => {
    if (storedVersion !== currentVersion) {
      dispatch(setAppVersion(currentVersion));
    }
  }, [storedVersion, dispatch, currentVersion]);

  useEffect(() => {
    setTimeout(() => {
      Xpub.preload();
    }, 3000);
  }, []);

  return (
    <div className="">
      <Toast />

      {/* <div id="sidebar">
        <h1>
          <Link to="/">Home</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to={`/wallet/1`}>Wallet 1</Link>
            </li>
            <li>
              <Link to={`/wallet/2`}>Wallet 2</Link>
            </li>
          </ul>
        </nav>
      </div> */}
      <div id="app">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};
