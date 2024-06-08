import { useEffect } from "react";
import {
  AppContext,
  NetworkContext,
  WalletUIContext,
  ToastContext,
} from "@providers/AppProvider";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { throttle } from "lodash";
import localForage from "localforage";
import { Toast } from "@components/toast/Toast";
import { Navbar } from "@components/navbar/Navbar";
import { Xpub } from "@root/models/Xpub";

export const Root = () => {
  const walletActorRef = AppContext.useActorRef();
  const networkActorRef = NetworkContext.useActorRef();
  const walletUIActorRef = WalletUIContext.useActorRef();
  const toastActorRef = ToastContext.useActorRef();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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

  const storedVersion = AppContext.useSelector(
    (current) => current.context.meta.appVersion
  );
  const currentVersion = "__VERSION__";
  useEffect(() => {
    // if (!storedVersion) {
    walletActorRef.send({
      type: "APP_MACHINE_UPDATE_APP_VERSION",
      data: { appVersion: currentVersion },
    });
    // }
  }, [storedVersion, walletActorRef, currentVersion]);

  useEffect(() => {
    setTimeout(() => {
      Xpub.preload();
    }, 3000);
  }, []);
  // useEffect(() => {
  //   if (currentVersion !== storedVersion && storedVersion) {
  //     toastActorRef.send({
  //       type: "TOAST",
  //       data: {
  //         message: {
  //           line1: "A new version is available",
  //           line2: `v${storedVersion} -> v${currentVersion}`,
  //           action: {
  //             text: "Reload",
  //             altText: "Reload the app",
  //             onClick: () => {
  //               handleReload();
  //             },
  //           },
  //         },
  //       },
  //     });
  //   }
  // }, [currentVersion, storedVersion]);

  // const handleReload = () => {
  //   walletActorRef.send({
  //     type: "APP_MACHINE_UPDATE_APP_VERSION",
  //     data: { appVersion: currentVersion },
  //   });
  //   // wait 3 seconds for save
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // };

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
