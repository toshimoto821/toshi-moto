// This script downloads daily btc prices since 2014
// to Today - 3 months and imports them into the database.

const axios = require("axios");
const csv = require("csv-parser");
const { sub } = require("date-fns");

const downloadAndParseCSV = async (url) => {
  const response = await axios.get(url, { responseType: "stream" });
  return new Promise((resolve, reject) => {
    const results = [];
    response.data
      .pipe(csv())
      .on("data", (data) => {
        console.log(data);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const period1 = new Date("2014-09-17").getTime() / 1000;
const period2 = sub(new Date(), { months: 3 }).getTime() / 1000;
const url = `https://query1.finance.yahoo.com/v7/finance/download/BTC-USD?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;

downloadAndParseCSV(url)
  .then((data) => {
    console.log("done");
  })
  .catch((error) => console.error(error));
