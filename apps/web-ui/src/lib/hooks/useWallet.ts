import { useEffect, useMemo } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useMachine } from "@xstate/react";
import { useWallets } from "@lib/hooks/useWallets";
import { AppContext, WalletUIContext } from "@providers/AppProvider";
import { walletManagerMachine } from "@machines/walletManagerMachine";
import { useAppDispatch } from "@lib/hooks/store.hooks";
import { upsertWallet } from "@lib/slices/wallets.slice";

export const useWallet = (xpubs: string[]) => {
  const appMachine = AppContext.useActorRef();
  const walletUIActorRef = WalletUIContext.useActorRef();
  const dispatch = useAppDispatch();
  const { wallets } = useWallets();

  const [, send] = useMachine(walletManagerMachine, {
    input: {
      appMachine,
      wallet: null,
    },
  });

  useEffect(() => {
    appMachine.send({ type: "SUBSCRIBE", data: { ref: walletUIActorRef } });

    return () => {
      // @todo this is not working
      // causes subscribers to get lost.
      // appMachine.send({
      //   type: "UNSUBSCRIBE",
      //   data: { ref: walletUIActorRef },
      // });
    };
  }, [walletUIActorRef]);

  const createWallet = async (name: string = "test wallet", id?: string) => {
    send({
      type: "SET_NAME",
      data: {
        name,
      },
    });
    // await wait(100);
    send({
      type: "SET_VALUE",
      data: {
        key: "color",
        value: `rgb(153, 204, 255)`,
      },
    });
    // await wait(100);
    for (let i = 0; i < xpubs.length; i++) {
      send({
        type: "BLUR_FIELD",
        data: {
          index: i,
          xpub: true,
          value: xpubs[i],
        },
      });
    }
    // await wait(100);
    send({
      type: "SAVE",
      data: { id },
    });
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
    [xpubs.length]
  );

  const wallet = wallets.find((wallet) => {
    return wallet.listXpubs.every((xpub) => xpubs.includes(xpub.address));
  });

  return { actions, wallet, wallets };
};
