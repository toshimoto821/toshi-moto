import { IRequest } from "@root/machines/network.types";
import transform from "lodash/transform";
import assign from "lodash/assign";
import isObject from "lodash/isObject";

function flattenObject(
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> {
  return transform(
    obj,
    (result, value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (isObject(value)) {
        assign(result, flattenObject(value, newKey));
      } else {
        result[newKey as string] = value; // Add index signature to allow indexing with a string
      }
    },
    {} as Record<string, any> // Add index signature to the initial value of result
  );
}

export const toTabularData = (request: IRequest) => {
  const headers = [] as string[];
  const rows = [] as string[][];
  if (request.meta.type === "btc-historic-price") {
    headers.push("Timestamp", "Price");
    const prices = request.response?.data.prices;
    if (prices.length) {
      for (const priceRow of prices) {
        rows.push([priceRow[0] + "", priceRow[1] + ""]);
      }
    }
  }

  if (request.meta.type === "btc-price") {
    headers.push("Key", "Value");
    const data = Object.keys(request.response?.data.bitcoin).map((key) => {
      return [key + "", request.response?.data.bitcoin[key] + ""];
    });

    rows.push(...data);
  }

  if (request.meta.type === "txs") {
    headers.push(
      "fee",
      "locktime",
      "size",
      "status.confirmed",
      "status.block_height",
      "status.block_time",
      "txid",
      "version",
      "weight"
    );

    const data = request.response?.data.map((row: any) => {
      return [
        row.fee,
        row.locktime,
        row.size,
        row.status.confirmed,
        row.status.block_height,
        row.status.block_time,
        row.txid,
        row.version,
        row.weight,
      ];
    });
    rows.push(...data);
  }

  if (request.meta.type === "utxo") {
    headers.push("Key", "Value");
    const flatObject = flattenObject(request.response?.data);
    const data = Object.keys(flatObject).map((key: any) => {
      const value = flatObject[key];

      return [key + "", JSON.stringify(value)];
    });
    console.log("data", data);
    rows.push(...data);
  }

  return {
    headers,
    rows,
  };
};
