import { type IRequest } from "@machines/network.types";
export const request: IRequest = {
  url: "https://mempool.space/api/address/bc1qwgpkrw0yy39up9pl3skwtgnfem7rp78csgn0ly",
  loading: false,
  status: "complete",
  id: "1703029470871",
  createdAt: 1633029470871,
  response: {
    id: "foo",
    data: {
      address: "bc1qwgpkrw0yy39up9pl3skwtgnfem7rp78csgn0ly",
      chain_stats: {
        funded_txo_count: 1,
        funded_txo_sum: 100000,
        spent_txo_count: 0,
        spent_txo_sum: 0,
        tx_count: 1,
      },
      mempool_stats: {
        funded_txo_count: 0,
        funded_txo_sum: 0,
        spent_txo_count: 0,
        spent_txo_sum: 0,
        tx_count: 0,
      },
    },
    headers: {
      "cache-control": "public, max-age=10, public",
      "content-length": "300",
      "content-type": "application/json",
      pragma: "public",
    },
    details: {
      duration: 528,
      status: 200,
      startTime: 1633029470871,
      endTime: 1633029471399,
    },
  },
  meta: {
    type: "utxo",
  },
};
