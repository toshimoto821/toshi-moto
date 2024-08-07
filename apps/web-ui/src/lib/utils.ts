import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type IXhrOptions, type IResponse } from "@machines/network.types";
import { Xpub } from "@models/Xpub";

const VITE_BITCOIN_NODE_URL_ENV = import.meta.env.VITE_BITCOIN_NODE_URL;
const VITE_IS_UMBREL = import.meta.env.VITE_IS_UMBREL;
export const ONE_HUNDRED_MILLION = 100000000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// on an umbrel, mempool runs on 3006

export const getBitcoinNodeUrl = () => {
  const { protocol, hostname } = window.location;
  const umbrelUrl = `${protocol}//${hostname}:3006`;
  return VITE_IS_UMBREL === "true" ? umbrelUrl : VITE_BITCOIN_NODE_URL_ENV;
};

const VITE_BITCOIN_NODE_URL = getBitcoinNodeUrl();

export const formatPrice = (price: number | string, decimals = 2) => {
  if (typeof price === "string") return price;
  // Check if the input is a valid number
  if (isNaN(price)) {
    return "Invalid input";
  }

  // Convert the number to a fixed-point number with two decimal places
  const formattedNumber = price.toFixed(decimals);

  // Add commas to the integer part of the number
  const parts = formattedNumber.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine the integer and decimal parts with a period
  return parts.join(".");
};

export const padBtcZeros = (number?: number, roundDecimals?: number) => {
  if (typeof number === "undefined") return "";
  // Check if the input is a valid number
  if (isNaN(number)) {
    return "Invalid input";
  }

  const n = round(number, roundDecimals ?? 8);

  // Convert the number to a string and split into integer and decimal parts
  const [integerPart, decimalPart] = n.toFixed(roundDecimals ?? 8).split(".");

  // Pad the decimal part with zeros up to 8 places
  const paddedDecimalPart = decimalPart
    ? decimalPart.padEnd(8, "0")
    : "00000000";

  const sats = paddedDecimalPart.split("");
  sats.splice(2, 0, ",");
  sats.splice(6, 0, ",");

  sats.splice(roundDecimals ?? 10, sats.length - (roundDecimals ?? 10));

  // Combine the integer and padded decimal parts with a period
  const integerPartAsNumber = parseInt(integerPart || "0", 10);
  return `${integerPartAsNumber.toLocaleString()}.${sats.join("")}`;
};

export const trim = (str: string, length = 6) => {
  if (str.length > length - 1) {
    return `${str.substring(0, length - 1).trim()}...`;
  }
  return str;
};

export const trimAddress = (
  address?: string,
  { prefix = 6, suffix = 4 } = {}
) => {
  if (!address) return "";
  if (address.length <= prefix + suffix) return address;
  const prefixStr = address.slice(0, prefix);
  const suffixStr = address.slice(-suffix);
  return `${prefixStr}…${suffixStr}`;
};

export function round(num: number, decimalPlaces = 0) {
  const p = Math.pow(10, decimalPlaces);
  const n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

const e = Math.exp(1);

export function antilog(n: number | string, base = e) {
  const number = typeof n === "string" ? parseFloat(n) : n;
  if (base === e) return Math.exp(number);

  return Math.pow(base, number);
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const defaultOptions = {
  timeout: 60000,
};

type Headers = Record<string, string>;
export function xhrRequest<T>(
  url: string,
  opts: IXhrOptions = defaultOptions
): Promise<IResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = new Date().getTime();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const endTime = new Date().getTime();
        const duration = endTime - startTime;
        const responseHeaders = xhr.getAllResponseHeaders();

        // Convert the header string into an array
        // of individual headers
        const arr = responseHeaders.trim().split(/[\r\n]+/);

        // Create a map of header names to values
        const headerMap: Headers = arr.reduce((acc, line) => {
          const parts = line.split(": ");
          const header = parts.shift() as string;
          const value = parts.join(": ");
          return {
            ...acc,
            [header]: value,
          };
        }, {});

        const contentTypes = (headerMap["content-type"] || "").split(";");

        const data: T = contentTypes.includes("application/json")
          ? JSON.parse(xhr.responseText)
          : xhr.responseText;

        const details = {
          duration,
          status: xhr.status,
          startTime,
          endTime: new Date().getTime(),
          url,
        };
        const response: IResponse<T> = {
          data,
          headers: headerMap,
          details,
          id: opts.id || new Date().getTime().toString(),
        };
        if (xhr.status === 200) {
          resolve(response);
        } else {
          reject(response);
        }
      }
    };
    xhr.timeout = opts.timeout ?? defaultOptions.timeout;

    xhr.onerror = reject;
    // if opts.ttl set a query paral ttl
    let u = url;
    if (typeof opts.ttl !== "undefined") {
      if (url.includes("?")) {
        u = `${url}&ttl=${opts.ttl}`;
      } else {
        u = `${url}?ttl=${opts.ttl}`;
      }
    }
    xhr.open("GET", u, true);

    xhr.send();
  });
}

export function invokeApi(url: string, id: string, ttl?: number) {
  // mempool.space doesnt support fetch options request
  return xhrRequest(url, { id, ttl });
}

// @deprecated
export const getLastAddressIndex = async (
  xpub: string | string[],
  change: boolean,
  bitcoinNodeUrl?: string
) => {
  // some wallets (aqua) start at 1
  let index = 1;
  let running = true;
  const SKIP_BY = 10;
  let lastAddressWithNoTxs = -1;
  while (running) {
    const address = await Xpub.getAddressAtIndex(xpub, index, change);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await invokeApi(
      `${bitcoinNodeUrl || VITE_BITCOIN_NODE_URL}/api/address/${address}`,
      `${address}-scan`
    );
    if (
      response?.data?.chain_stats?.tx_count > 0 ||
      response?.data?.mempool_stats?.tx_count
    ) {
      index += SKIP_BY;
    } else if (
      response?.data?.chain_stats?.tx_count === 0 &&
      response?.data?.mempool_stats?.tx_count === 0
    ) {
      lastAddressWithNoTxs = Math.max(index, SKIP_BY); // + SKIP_BY;
      running = false;
    } else {
      running = false;
    }
  }

  return lastAddressWithNoTxs;
};

export const parseRgb = (rgb?: string) => {
  if (!rgb) return { r: 0, g: 0, b: 0 };
  const parts = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/.exec(rgb);
  // extract and turn into numbers
  const [, r, g, b] = parts || [];
  return { r: parseInt(r, 10), g: parseInt(g, 10), b: parseInt(b, 10) };
};

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return "#" + ((1 << 24) | ((r << 16) | (g << 8) | b)).toString(16).slice(1);
}

// Function to convert Hex to RGB
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export const copyToClipboard = (text: string) =>
  new Promise((resolve, reject) => {
    navigator.clipboard.writeText(text).then(
      function () {
        resolve({ success: true, message: "Copied to clipboard" });
      },
      function (err) {
        reject(err);
      }
    );
  });

export const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export const getQueryParams = (url: string) => {
  try {
    const uri = new URL(url);
    const search = uri.search.substring(1, uri.search.length);

    return search
      .split("&")
      .map((parts) => {
        return parts.split("=");
      })
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur[0]]: cur[1],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {}) as Record<string, any>;
  } catch (ex) {
    console.error(ex);
    return {};
  }
};
