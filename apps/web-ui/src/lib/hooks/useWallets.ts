import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Transaction } from "@models/Transaction";
import { Wallet } from "@models/Wallet";
import { useBtcPrice } from "./useBtcPrice";
import { useAppSelector, useAppDispatch } from "@lib/hooks/store.hooks";
import type { IExpandAddressKey, IAppAddressFilters } from "@root/types";
import {
  refreshAddresses,
  refreshWallet,
  selectAllWallets,
  incrementAddressIndex,
  removeWallet,
  trimAddresses,
  archiveWallet,
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
  expandAddress,
  collapseAddress,
  toggleAddress,
} from "../slices/ui.slice";
import { getRangeFromTime } from "@root/components/graphs/graph-utils";
import { UIState } from "../slices/ui.slice.types";

export const useWallets = () => {
  const params = useParams();

  const dispatch = useAppDispatch();
  const uiState = useAppSelector(selectUI);
  const walletsState = useAppSelector(selectAllWallets);

  const currency = "usd";

  const { btcPrice } = useBtcPrice();

  const walletRows = walletsState
    .map(
      (wallet) =>
        new Wallet(wallet, {
          cur: currency,
          btcPrice,
        })
    )
    .sort((a, b) => b.balance - a.balance);

  const chartEndDate = uiState.graphEndDate;

  const chartStartDate = uiState.graphStartDate;

  const actions = {
    updateMeta: (meta: Partial<UIState>) => {
      console.log(meta);
      throw new Error("@todo, implement");
      // appRef.send({ type: "APP_MACHINE_UPDATE_META", data: { meta } });
    },
    toggleAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      dispatch(toggleAddress(key));
    },
    expandAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      dispatch(expandAddress(key));
    },
    collapseAddress: (walletId: string, address: string) => {
      const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
      dispatch(collapseAddress(key));
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
        dispatch(addSelectedTransactions(txids));
      } else {
        dispatch(removeSelectedTransactions(txids));
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
      dispatch(
        setUI({
          navbarBalanceVisibility: !uiState.navbarBalanceVisibility,
        })
      );
    },
    refreshWallet(walletId: string, ttl = 1000 * 60 * 60 * 24, reset = false) {
      dispatch(refreshWallet({ walletId, ttl, reset }));
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
      dispatch(removeWallet(walletId));
    },

    changeAddressFilter: (walletId: string, filter: IAppAddressFilters) => {
      const filters = uiState.filterUtxoOnly
        ? uiState.filterUtxoOnly.slice()
        : [];

      const index = filters.indexOf(walletId);
      if (index > -1) {
        filters.splice(index);
      }
      if (filter.utxoOnly) {
        filters.push(walletId);
      }

      dispatch(
        setUI({
          filterUtxoOnly: filters,
        })
      );
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
      if (uiState.filterUtxoOnly.includes(walletId)) {
        actions.changeAddressFilter(walletId, { utxoOnly: false });
      }

      dispatch(
        incrementAddressIndex({
          walletId,
          change,
          incrementOrDecrement,
        })
      );
      // appRef.send({
      //   type: "APP_MACHINE_UPDATE_WALLET_PAGINATION_LIMIT",
      //   data: {
      //     walletId,
      //     addressType: change ? "CHANGE" : "RECEIVE",
      //     incrementOrDecrement,
      //   },
      // });
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

      dispatch(
        trimAddresses({
          walletId,
          change,
          index,
        })
      );
    },
    archiveWallet({
      walletId,
      archive,
    }: {
      walletId: string;
      archive: boolean;
    }) {
      dispatch(
        archiveWallet({
          walletId,
          archive,
        })
      );
    },
  };

  const toRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const { walletId, address } = params;

    dispatch(
      setUI({
        selectedWalletId: walletId ?? null,
      })
    );

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

  const walletFilter = (wallet: Wallet) => {
    if (!uiState.selectedWalletId) {
      return true;
    }
    return uiState.selectedWalletId === wallet.id;
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

  return {
    wallets: walletRows,
    data,
    // @todo move into ui
    displayMode: uiState.displayMode,
    actions,
  };
};
