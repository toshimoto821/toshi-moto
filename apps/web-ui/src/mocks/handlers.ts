import { http, HttpResponse } from "msw";
import address from "./addresses/emptyAddress.json";
import mockTx from "./txs/tx_bc1q0zca2ylgutn9jxhkcflhry7kmrr86tf8wh5tat.json";

const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;

export const handlers = [
  http.get(`${VITE_BITCOIN_NODE_URL}/api/address/:address`, ({ params }) => {
    const chain_stats = { ...address.chain_stats };
    if (params.address === "bc1q0zca2ylgutn9jxhkcflhry7kmrr86tf8wh5tat") {
      chain_stats.funded_txo_sum = 130000;
      chain_stats.tx_count = 1;
    }
    return HttpResponse.json({
      ...address,
      chain_stats,
      address: params.address,
    });
  }),

  http.get(
    `${VITE_BITCOIN_NODE_URL}/api/address/:address/txs`,
    ({ params }) => {
      if (params.address === "bc1q0zca2ylgutn9jxhkcflhry7kmrr86tf8wh5tat") {
        return HttpResponse.json(mockTx);
      }

      return HttpResponse.json([]);
    }
  ),
];
