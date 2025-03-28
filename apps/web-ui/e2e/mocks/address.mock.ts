type IGetAddressResponse = {
  address: string;
  numTxs?: number;
  sum?: number;
};
export const getAddressResponse = ({
  address,
  numTxs = 0,
  sum = 0,
}: IGetAddressResponse) => {
  return {
    address: address,
    chain_stats: {
      funded_txo_count: numTxs,
      funded_txo_sum: sum,
      spent_txo_count: 0,
      spent_txo_sum: 0,
      tx_count: numTxs,
    },
    mempool_stats: {
      funded_txo_count: 0,
      funded_txo_sum: 0,
      spent_txo_count: 0,
      spent_txo_sum: 0,
      tx_count: 0,
    },
  };
};
