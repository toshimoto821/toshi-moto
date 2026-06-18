import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect } from "vitest";

import { walletsReducer, walletsSlice, refreshWallet } from "./wallets.slice";
import type { Wallet, Address } from "./wallets.slice";
import { networkReducer } from "./network.slice";
import type { AppDispatch } from "../store";

const ONE_MINUTE = 1000 * 60;

/**
 * Builds a minimal store with just the wallets + network reducers. We don't
 * include the listener/api middleware, so enqueued requests stay in
 * `network.queue` instead of triggering real fetches — that queue is exactly
 * what we assert on to know whether a refresh actually re-fetched.
 */
const makeStore = () =>
  configureStore({
    reducer: {
      wallets: walletsReducer,
      network: networkReducer,
    },
  });

const seedWallet = (
  store: ReturnType<typeof makeStore>,
  refreshedAt: number
) => {
  const address: Address = {
    id: "addr1",
    index: 0,
    isChange: false,
    walletId: "w1",
    transactions: { ids: [], entities: {} },
  };

  const wallet: Wallet = {
    id: "w1",
    name: "Test Wallet",
    color: "#ffffff",
    walletType: "xpub",
    xpubs: ["xpub-test"],
    meta: {
      refreshedAt,
      change: { lastAddressIndex: 0 },
      receive: { lastAddressIndex: 0 },
    },
    addresses: { ids: ["addr1"], entities: { addr1: address } },
    addressFilters: { utxoOnly: false },
  };

  store.dispatch(walletsSlice.actions.upsertWallet(wallet));
};

const getAddressRequests = (store: ReturnType<typeof makeStore>) => {
  const { queue } = store.getState().network;
  return queue.ids
    .map((id) => queue.entities[id])
    .filter((item) => item?.action.endpoint === "getAddress");
};

describe("refreshWallet TTL guard (issue #331)", () => {
  it("skips re-fetching address data when the cache is younger than the TTL", async () => {
    const store = makeStore();
    const refreshedAt = Date.now();
    seedWallet(store, refreshedAt);

    await (store.dispatch as AppDispatch)(refreshWallet({ walletId: "w1", ttl: ONE_MINUTE }));

    // Fresh cache -> no getAddress enqueued, refreshedAt untouched.
    expect(getAddressRequests(store)).toHaveLength(0);
    expect(store.getState().wallets.entities.w1?.meta.refreshedAt).toBe(
      refreshedAt
    );
  });

  it("re-fetches address data once the cache is older than the TTL", async () => {
    const store = makeStore();
    const refreshedAt = Date.now() - (ONE_MINUTE + 5000);
    seedWallet(store, refreshedAt);

    await (store.dispatch as AppDispatch)(refreshWallet({ walletId: "w1", ttl: ONE_MINUTE }));

    // Stale cache -> the wallet's address gets re-queued and refreshedAt bumps.
    const requests = getAddressRequests(store);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.action.args).toMatchObject({
      address: "addr1",
      walletId: "w1",
    });
    expect(
      store.getState().wallets.entities.w1?.meta.refreshedAt
    ).toBeGreaterThan(refreshedAt);
  });

  it("always re-fetches when ttl is 0 (manual / forced refresh)", async () => {
    const store = makeStore();
    const refreshedAt = Date.now();
    seedWallet(store, refreshedAt);

    await (store.dispatch as AppDispatch)(refreshWallet({ walletId: "w1", ttl: 0 }));

    // ttl=0 bypasses the guard even with a brand-new cache.
    expect(getAddressRequests(store)).toHaveLength(1);
  });
});
