// This gets the price of bitcoin in USD from Coingecko.

import axios from "axios";

const downloadAndParseJSON = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

const parseCoingecko = (currency: string) => (data) => {
  const { bitcoin } = data;
  const { usd, last_updated_at } = bitcoin || {};
  const volume = bitcoin[`${currency}_24h_vol`];
  const timestamp = last_updated_at * 1000;

  return {
    price: usd as number,
    timestamp,
    volume,
  };
};

export const getPrice = async (currency = "usd") => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=2`;
  const data = await downloadAndParseJSON(url).then(parseCoingecko(currency));
  return data;
};
