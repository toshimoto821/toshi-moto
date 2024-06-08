// This script downloads daily btc prices since Today
// to  3 months ago and imports them into the database
// (diff is hourly, not daily).

const axios = require("axios");

const { sub } = require("date-fns");

const downloadAndParseJSON = async (url) => {
  const response = await axios.get(url);
  return response.data;
};
const now = new Date();
const to = Math.floor(now.getTime() / 1000);
const from = Math.floor(sub(now, { months: 3 }).getTime() / 1000);
const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

downloadAndParseJSON(url)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
