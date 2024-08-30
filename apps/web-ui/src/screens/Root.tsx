import { useCallback, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { selectAllWallets } from "@lib/slices/wallets.slice";
import { Toast } from "@components/toast/Toast";
import { Navbar } from "@components/navbar/Navbar";
import { Xpub } from "@root/models/Xpub";
import { useAppDispatch, useAppSelector } from "@lib/hooks/store.hooks";
import { setAppVersion, selectAppVersion } from "@root/lib/slices/config.slice";
import {
  openPriceSocket,
  closePriceSocket,
} from "@root/lib/slices/price.slice";

const VITE_PRICING_STREAM_DISABLED = import.meta.env
  .VITE_PRICING_STREAM_DISABLED;

export const Root = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const btcWallets = useAppSelector(selectAllWallets);

  useEffect(() => {
    if (pathname !== "/onboarding" && btcWallets.length === 0) {
      navigate("/onboarding");
    }
  }, [pathname, btcWallets.length, navigate]);

  const storedVersion = useAppSelector(selectAppVersion);

  const currentVersion = "__VERSION__";

  const visibilitychange = useCallback(() => {
    if (document.visibilityState === "visible") {
      dispatch(openPriceSocket(true));
    } else {
      dispatch(closePriceSocket());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!VITE_PRICING_STREAM_DISABLED) {
      visibilitychange();
      document.addEventListener("visibilitychange", visibilitychange);
    }
    return () => {
      if (!VITE_PRICING_STREAM_DISABLED) {
        document.removeEventListener("visibilitychange", visibilitychange);
      }
    };
  }, [visibilitychange]);

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

  useEffect(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(() => {
        const hostname = window.location.href;
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SET_HOSTNAME",
            payload: hostname,
          });
        }
      });
    }
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
