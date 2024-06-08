// This gets the price of bitcoin in USD from Coingecko.

const axios = require("axios");

const downloadAndParseJSON = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

const currency = "usd";
const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=2`;
const parseCoingecko = (data) => {
  const { bitcoin } = data;
  const { usd, last_updated_at } = bitcoin || {};
  return {
    price: usd,
    timestamp: last_updated_at,
  };
};

downloadAndParseJSON(url)
  .then(parseCoingecko)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });
