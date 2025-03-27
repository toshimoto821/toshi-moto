import { useMemo } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useWallets } from "@lib/hooks/useWallets";
import { useAppDispatch } from "@lib/hooks/store.hooks";
import { upsertWallet } from "@lib/slices/wallets.slice";

export const useWallet = (xpubs: string[]) => {
  const dispatch = useAppDispatch();
  const { wallets } = useWallets();

  const createWallet = async (name = "test wallet", id?: string) => {
    const walletId = id ?? nanoid();

    dispatch(
      upsertWallet({
        name,
        id: walletId,
        color: "rgb(153, 204, 255)",
        xpubs,
      })
    );
  };

  // console.log(current);
  const actions = useMemo(
    () => ({
      createWallet,
    }),
    [xpubs.length, createWallet]
  );

  const wallet = wallets.find((wallet) => {
    return wallet.listXpubs.every((xpub) => xpubs.includes(xpub.address));
  });

  return { actions, wallet, wallets };
};
