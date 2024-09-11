import transform from "lodash/transform";
import assign from "lodash/assign";
import isObject from "lodash/isObject";
import type { APIRequestResponse } from "@lib/slices/network.slice.types";
import type {
  PriceResponse,
  PriceHistoryResponse,
  AddressResponse,
  TransactionsResponse,
} from "@root/lib/slices/api.slice.types";

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

export const toTabularData = (request: APIRequestResponse) => {
  const headers = [] as string[];
  const rows = [] as string[][];
  if (request.meta.type === "btc-historic-price") {
    headers.push("Timestamp", "Price");

    const response = request.response?.data as PriceHistoryResponse;
    const prices = response.prices;
    if (prices.length) {
      for (const priceRow of prices) {
        rows.push([priceRow.closeTime + "", priceRow.closePrice + ""]);
      }
    }
  }

  if (request.meta.type === "supply") {
    headers.push("Key", "Value");
    rows.push(["supply", request.response?.data + ""]);
  }

  if (request.meta.type === "price" && request.response?.data) {
    const response = request.response?.data as PriceResponse;
    headers.push("Key", "Value");
    const data = (
      Object.keys(response.bitcoin) as (keyof typeof response.bitcoin)[]
    ).map((key) => {
      return [key + "", response.bitcoin[key] + ""];
    });

    rows.push(...data);
  }

  if (request.meta.type === "transactions") {
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

    const response = request.response?.data as TransactionsResponse;
    const data = (response || []).map((row: any) => {
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

  if (request.meta.type === "address") {
    headers.push("Key", "Value");
    const response = request.response?.data as AddressResponse;
    const flatObject = flattenObject(response || {});
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
