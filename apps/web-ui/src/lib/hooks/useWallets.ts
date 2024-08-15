import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  AppContext,
  NetworkContext,
  WalletUIContext,
} from "@providers/AppProvider";
import { Transaction } from "@models/Transaction";
import {
  type IAppAddressFilters,
  type AppMachineMeta,
} from "@machines/appMachine";
import { type IExpandAddressKey } from "@machines/walletListUIMachine";
import { Wallet } from "@models/Wallet";
import { useBtcPrice } from "./useBtcPrice";
import { useAppSelector, useAppDispatch } from "@lib/hooks/store.hooks";
import {
  refreshAddresses,
  refreshWallet,
  selectAllWallets,
} from "@lib/slices/wallets.slice";

import { Utxo } from "@root/models/Utxo";
import {
  setUI,
  selectUI,
  toggleSelectedTx,
  removeSelectedTransactions,
  addSelectedTransactions,
  defaultGraphEndDate,
  setGraphByRange,
} from "../slices/ui.slice";
import { getRangeFromTime } from "@root/components/graphs/graph-utils";

export const useWallets = () => {
  const params = useParams();

  const appRef = AppContext.useActorRef();
  const networkActorRef = NetworkContext.useActorRef();
  const walletUIActorRef = WalletUIContext.useActorRef();

  const dispatch = useAppDispatch();
  const uiState = useAppSelector(selectUI);
  const walletsState = useAppSelector(selectAllWallets);

  const addresses = AppContext.useSelector(
    (current) => current.context.addresses
  );

  // const currency = AppContext.useSelector(
  //   (current) => current.context.meta.currency
  // );
  const currency = "usd";

  const { send } = walletUIActorRef;

  const { btcPrice, loading: btcPriceLoading, forcastPrice } = useBtcPrice();

  useEffect(() => {
    send({
      type: "INIT",
      data: {
        networkLoggerRef: networkActorRef,
        appMachineRef: appRef,
        selectedWallet: params.walletId || "",
      },
    });
  }, [appRef, params.walletId, networkActorRef, send]);

  const walletRows = walletsState
    .map(
      (wallet) =>
        new Wallet(wallet, {
          cur: currency,
          btcPrice: forcastPrice ?? btcPrice,
        })
    )
    .sort((a, b) => b.balance - a.balance);

  const chartEndDate = uiState.graphEndDate;

  const chartStartDate = uiState.graphStartDate;

  const netAssetValue = uiState.netAssetValue;

  const balanceVisible = AppContext.useSelector(
    (current) => current.context.meta.balanceVisible
  );

  const addressFilters = AppContext.useSelector(
    (current) => current.context.meta.addressFilters
  );

  const toggleNetAssetValue = () => {
    dispatch(
      setUI({
        netAssetValue: !netAssetValue,
      })
    );
  };

  const actions = {
    updateMeta: (meta: Partial<AppMachineMeta>) => {
      appRef.send({ type: "APP_MACHINE_UPDATE_META", data: { meta } });
    },
    toggleNetAssetValue,
    toggleAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      send({ type: "TOGGLE_ADDRESS", data: { id: key } });
    },
    expandAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      send({ type: "EXPAND_ADDRESS", data: { id: key } });
    },
    collapseAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      send({ type: "COLLAPSE_ADDRESS", data: { id: key } });
    },
    selectInputAddresses: () => {
      const txids = [] as string[];

      // go through every address and get transactions
      // if ithe address has tx and is not a vin (vout only)
      // it can be considered an external receive of btc
      // however I also want to filter other wallets of mine
      for (const wallet of walletRows) {
        for (const address of wallet.listAddresses) {
          const transactions = address.listTransactions; // get first tx only

          txLoop: for (const tx of transactions) {
            if (tx.vin.length) {
              const vinAddresses = tx.vin.map(
                (vin) => vin.prevout.scriptpubkey_address
              );
              for (const addr of vinAddresses) {
                const walletIndex = walletRows.findIndex(
                  (wallet) => wallet.addresses[addr]
                );

                if (walletIndex === -1) {
                  txids.push(tx.txid);
                  break txLoop;
                }
              }
            }
          }
        }
      }
      const unique = Array.from(new Set(txids));

      dispatch(
        setUI({
          graphSelectedTransactions: unique,
        })
      );
    },
    selectWalletInputAddresses: (walletId: string, selected: boolean) => {
      const wallet = walletRows.find((w) => w.id === walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }
      const txids = [] as string[];

      // go through every address and get transactions
      // if ithe address has tx and is not a vin (vout only)
      // it can be considered an external receive of btc
      // however I also want to filter other wallets of mine

      for (const address of wallet.listAddresses) {
        const transactions = address.listTransactions; // get first tx only

        txLoop: for (const tx of transactions) {
          if (tx.vin.length) {
            const vinAddresses = tx.vin.map(
              (vin) => vin.prevout.scriptpubkey_address
            );
            for (const addr of vinAddresses) {
              const walletIndex = walletRows.findIndex(
                (wallet) => wallet.addresses[addr]
              );

              if (walletIndex === -1) {
                txids.push(tx.txid);
                break txLoop;
              }
            }
          }
        }
      }

      if (selected) {
        addSelectedTransactions(txids);
      } else {
        removeSelectedTransactions(txids);
      }
    },
    toggleTx: (tx: Transaction) => {
      dispatch(toggleSelectedTx(tx.txid));

      const txDate = tx.date?.getTime();
      if (!txDate) return;
      // if the tx date is not within the range of the chart, update the chart range
      if (txDate < chartStartDate || txDate > chartEndDate) {
        const chartEndData = defaultGraphEndDate;
        const diff = chartEndData - txDate;

        const range = getRangeFromTime(diff);
        dispatch(setGraphByRange(range));
      }
    },
    toggleBalanceVisibility() {
      const data = {
        meta: {
          balanceVisible: !balanceVisible,
        },
      };
      appRef.send({ type: "APP_MACHINE_UPDATE_META", data });
    },
    refreshWallet(walletId: string) {
      dispatch(refreshWallet({ walletId, ttl: 1000 * 60 * 60 * 24 }));
    },
    refreshAddresses({
      walletId,
      addresses,
    }: {
      walletId: string;
      addresses: Utxo[];
    }) {
      const wallet = walletRows.find((wallet) => wallet.id === walletId);
      if (!wallet) return;

      const addressesToSend = addresses.map((addr) => addr.addressArgs);

      if (addressesToSend.length > 0) {
        dispatch(refreshAddresses(addressesToSend));
      }
    },

    deleteWallet(walletId: string) {
      appRef.send({
        type: "APP_MACHINE_DELETE_WALLET",
        data: {
          walletId,
        },
      });
    },

    changeAddressFilter: (walletId: string, filter: IAppAddressFilters) => {
      appRef.send({
        type: "APP_MACHINE_CHANGE_ADDRESS_FILTER",
        data: {
          filter,
          walletId,
        },
      });
    },

    loadNextAddresses({
      walletId,
      change,
      incrementOrDecrement = 10,
    }: {
      walletId: string;
      change: boolean;
      incrementOrDecrement?: number;
    }) {
      if (addressFilters.utxoOnly) {
        appRef.send({
          type: "APP_MACHINE_CHANGE_ADDRESS_FILTER",
          data: {
            filter: {
              change: true,
              receive: true,
              utxoOnly: false,
            },
            walletId,
          },
        });
      }

      appRef.send({
        type: "APP_MACHINE_UPDATE_WALLET_PAGINATION_LIMIT",
        data: {
          walletId,
          addressType: change ? "CHANGE" : "RECEIVE",
          incrementOrDecrement,
        },
      });
    },
    trimWalletAddresses({
      walletId,
      change,
    }: {
      walletId: string;
      change: boolean;
    }) {
      const wallet = walletRows.find((w) => w.id === walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }
      const index = wallet.getNextAddressIndex({
        type: change ? "CHANGE" : "RECEIVE",
      });
      appRef.send({
        type: "APP_MACHINE_TRIM_WALLET_ADDRESSES",
        data: {
          walletId,
          addressType: change ? "CHANGE" : "RECEIVE",
          index,
        },
      });
    },
    archiveWallet({
      walletId,
      archive,
    }: {
      walletId: string;
      archive: boolean;
    }) {
      appRef.send({
        type: "APP_MACHINE_ARCHIVE_WALLET",
        data: {
          walletId,
          archive,
        },
      });
    },
  };

  const toRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const { walletId, address } = params;
    if (walletId) {
      send({ type: "TOGGLE_SELECT_WALLET", data: { walletId } });
    } else {
      send({ type: "CLEAR_SELECTED_WALLETS" });
    }

    if (address && walletId) {
      if (toRef.current) {
        clearTimeout(toRef.current);
      }
      // i don't like this but its here because d3 is not rendering the svg
      // correctly on navigate.  this makes the ui paint then the address is expanded and scrolled
      // 500 feels better than 0 but still not great
      actions.collapseAddress(walletId, address);
      toRef.current = setTimeout(() => {
        actions.expandAddress(walletId, address);
        const el = document.querySelector("#address-" + address);
        if (el) {
          const rect = el.getBoundingClientRect();
          const y = rect.top + window.scrollY - 270;
          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.walletId, params.address]);

  const selectedWallet = WalletUIContext.useSelector((current) => {
    return current.context.selectedWallet;
  });

  const walletFilter = (wallet: Wallet) => {
    if (!selectedWallet) {
      return true;
    }
    return selectedWallet === wallet.id;
  };

  const totalBalance = walletRows.reduce((acc, wallet) => {
    return acc + wallet.balance;
  }, 0);

  const totalValue = walletRows.filter(walletFilter).reduce((acc, wallet) => {
    return acc + wallet.value;
  }, 0);

  const data = {
    totalBalance,
    totalValue,
  };
  const expandedTxs = WalletUIContext.useSelector(
    (current) => current.context.expandedTxs
  );

  const ui = {
    expandedTxs,
    addressFilters,
    balanceVisible,
    isLoadingAddress: (address: string, wallet: Wallet) => {
      if (addresses[address]?.loading) return true;

      return !wallet.isAddressLoaded(address);
    },
    btcPriceLoading,
  };

  const selectedWallets = new Set<string>(
    selectedWallet ? [selectedWallet] : Array.from(walletRows).map((w) => w.id)
  );
  return {
    wallets: walletRows,
    data,
    ui,
    // @todo move into ui
    selectedWallets,
    netAssetValue,
    actions,
  };
};
