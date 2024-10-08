import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type PipelineStage } from "mongoose";
import axios from "axios";
import csv from "csv-parser";
import type { IRangeDiffResponse } from "./price.controller";
import { Price } from "./schemas/price.schema";
import { CreatePriceDto } from "./dto/create-price.dto";
import { wait } from "@lib/utils";

type IYahooPrice = {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  "Adj Close": string;
  Volume: string;
};

type IFindRange = {
  currency: string;
  from: number;
  to: number;
  groupBy: "15M" | "1H" | "2H" | "4H" | "12H" | "1D" | "1W";
};

type BinanceTradingDayResponse = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
};

export type BinanceKlineMetric = {
  openTime: number;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
};

type IGroupByDate = {
  $group: {
    _id: {
      year: {
        $year: "$timestamp";
      };
      month?: {
        $month: "$timestamp";
      };
      day?: {
        $dayOfMonth: "$timestamp";
      };
      hour?: {
        $hour: "$timestamp";
      };
      week?: {
        $week: "$timestamp";
      };
      minute?: {
        $subtract: [
          { $minute: "$timestamp" },
          { $mod: [{ $minute: "$timestamp" }, 30] }
        ];
      };
    };
    price: {
      $last: "$price";
    };
    volume: {
      $sum: "$volume";
    };
  };
};

type IDateFromParts = {
  year: string;
  month: string;
  day: string;
  hour?: string;
  minute?: string;
  week?: string;
};

@Injectable()
export class PriceService {
  constructor(
    @InjectModel(Price.name) private readonly priceModel: Model<Price>
  ) {}
  private readonly logger = new Logger(PriceService.name);

  async upsert(createPriceDto: CreatePriceDto) {
    const createdPrice = await this.priceModel.findOneAndUpdate(
      {
        timestamp: createPriceDto.timestamp,
        openTime: createPriceDto.openTime,
        closeTime: createPriceDto.closeTime,
        currency: createPriceDto.currency,
        volume: createPriceDto.volume,
        interval: createPriceDto.interval,
      },
      createPriceDto,
      { upsert: true, new: true }
    );
    return createdPrice;
  }

  async waitForImport() {
    for (let i = 0; i < 20; i++) {
      const count = await this.count();
      if (count > 0) {
        return;
      }
      await wait(1000);
    }
  }

  // 1502928000000 is the first ts available from binance.
  async importFromBinance(startTime = 1502928000000, interval = "1d") {
    // let now = Date.now();
    const urlTemplate = `https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=1000&startTime={startTime}`;

    let running = true;
    const maxApiCalls = 10;
    let i = 0;

    while (running) {
      try {
        const url = urlTemplate.replace("{startTime}", startTime.toString());
        const resp = await axios.get(url);
        // add to db
        for (const data of resp.data) {
          const [
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            openTime,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            openPrice,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            highPrice,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            lowPrice,
            closePrice,
            vol,
            closeTime,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            quoteAssetVolume,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            numberOfTrades,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            takerBuyBaseAssetVolume,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            takerBuyQuoteAssetVolume,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ignore,
          ] = data;
          const price = parseFloat(closePrice);
          const volume = parseFloat(vol);
          const openTimestamp = new Date(openTime);
          const timestamp = new Date(closeTime + 1);
          const closeTimestamp = new Date(closeTime);
          // dont save data that hasnt been complete
          if (closeTime < Date.now()) {
            try {
              await this.upsert({
                price,
                currency: "usd",
                timestamp,
                openTime: openTimestamp,
                closeTime: closeTimestamp,
                volume,
                interval,
              });
            } catch (ex) {
              console.log(ex);
            }
          }
        }

        if (resp.data.length < 1000 || i > maxApiCalls) {
          running = false;
        }
        startTime = resp.data[resp.data.length - 1][6] + 1;
        i++;
      } catch (ex) {
        console.log(ex);
        running = false;
      }
    }

    return null;
  }

  // @deprecated
  async import(currency: string) {
    const pipe = await this.importHistoricalCurrency(currency);
    pipe
      .on("data", async (data) => {
        const {
          Volume,
          Date: date,
          "Adj Close": adjClose,
        } = data as unknown as IYahooPrice;
        const timestamp = new Date(date);

        this.upsert({
          price: parseFloat(adjClose),
          currency,
          timestamp,
          openTime: timestamp,
          closeTime: timestamp,
          volume: parseFloat(Volume),
          interval: "1d",
        });
      })
      .on("end", () => {
        this.logger.debug("CSV file successfully processed");
      });
    return {
      ok: true,
    };
    // const createdCat = await this.priceModel.create();
  }

  async findAll(): Promise<Price[]> {
    return this.priceModel.find().exec();
  }
  async count(): Promise<number> {
    return this.priceModel.countDocuments().exec();
  }

  async findRangeFromBinance(opts: IFindRange): Promise<BinanceKlineMetric[]> {
    const { from, to, groupBy } = opts;
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=${groupBy}&limit=1000&startTime=${from}&endTime=${to}`;
    const response = await axios.get(url);
    const data = response.data;
    return data.map((d) => {
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        openTime,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        openPrice,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        highPrice,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lowPrice,
        closePrice,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        vol,
        closeTime,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        quoteAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        numberOfTrades,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        takerBuyBaseAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        takerBuyQuoteAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ignore,
      ] = d;
      return {
        openPrice,
        highPrice,
        lowPrice,
        closePrice,
        volume: vol,
        quoteAssetVolume,
        timestamp: new Date(closeTime + 1),
        openTime: new Date(openTime),
        closeTime: new Date(closeTime),
        numberOfTrades,
        takerBuyBaseAssetVolume,
        takerBuyQuoteAssetVolume,
        interval: groupBy,
      };
    });
  }

  async findRange(
    opts: IFindRange
  ): Promise<{ price: number; volume: number; timestamp: Date }[]> {
    if (isNaN(opts.from) || isNaN(opts.to)) {
      return [];
    }

    let timestamp = {} as {
      $dateFromParts?: IDateFromParts;
      $add: any;
    };

    let groupBy: IGroupByDate = {
      $group: {
        _id: {
          year: {
            $year: "$timestamp",
          },
          month: {
            $month: "$timestamp",
          },
          day: {
            $dayOfMonth: "$timestamp",
          },
        },
        price: {
          $last: "$price",
        },
        volume: {
          $sum: "$volume",
        },
      },
    };
    const $dateFromParts: IDateFromParts = {
      year: "$_id.year",
      month: "$_id.month",
      day: "$_id.day",
    };
    timestamp.$dateFromParts = $dateFromParts;
    if (opts.groupBy === "4H") {
      groupBy = {
        $group: {
          _id: {
            year: {
              $year: "$timestamp",
            },
            month: {
              $month: "$timestamp",
            },
            day: {
              $dayOfMonth: "$timestamp",
            },
            hour: {
              $hour: "$timestamp",
            },
          },
          price: {
            $last: "$price",
          },
          volume: {
            $sum: "$volume",
          },
        },
      };
      $dateFromParts.hour = "$_id.hour";
    } else if (opts.groupBy === "15M") {
      groupBy = {
        $group: {
          _id: {
            year: {
              $year: "$timestamp",
            },
            month: {
              $month: "$timestamp",
            },
            day: {
              $dayOfMonth: "$timestamp",
            },
            hour: {
              $hour: "$timestamp",
            },
            minute: {
              $subtract: [
                { $minute: "$timestamp" },
                { $mod: [{ $minute: "$timestamp" }, 30] },
              ],
            },
          },
          price: {
            $last: "$price",
          },
          volume: {
            $sum: "$volume",
          },
        },
      };
      $dateFromParts.hour = "$_id.hour";
      $dateFromParts.minute = "$_id.minute";
    } else if (opts.groupBy === "1W") {
      groupBy = {
        $group: {
          _id: {
            year: {
              $year: "$timestamp",
            },
            week: {
              $week: "$timestamp",
            },
          },
          price: {
            $last: "$price",
          },
          volume: {
            $sum: "$volume",
          },
        },
      };
      timestamp = {
        $add: [
          { $dateFromParts: { year: "$_id.year", month: 1, day: 1 } },
          { $multiply: ["$_id.week", 7, 24, 60, 60, 1000] },
          { $multiply: [6, 24, 60, 60, 1000] }, // Add 6 days to the start date of the week
        ],
      };
    }

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: new Date(opts.from),
            $lte: new Date(opts.to),
          },
          interval:
            opts.groupBy === "15M" || opts.groupBy === "1H" ? "15m" : "1d",
        },
      },
      groupBy,
      {
        $project: {
          timestamp,
          price: 1,
          volume: 1,
        },
      },
      {
        $sort: {
          timestamp: 1 as 1 | -1,
        },
      },
    ];

    const prices = this.priceModel.aggregate(pipeline);

    return prices;
  }

  async findRangeDiff(): Promise<IRangeDiffResponse["data"]> {
    const pipeline = [
      {
        $facet:
          /**
           * outputFieldN: The first output field.
           * stageN: The first aggregation stage.
           */
          {
            "1D": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("1D"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "1D",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "1W": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("1W"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "1W",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "1M": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("1M"),
                  },
                },
              },
              {
                $sort: {
                  date: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "1M",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "3M": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("3M"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "3M",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "1Y": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("1Y"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "1Y",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "2Y": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("2Y"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "2Y",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
            "5Y": [
              {
                $match: {
                  timestamp: {
                    $gte: this.getStartDate("5Y"),
                  },
                },
              },
              {
                $sort: {
                  timestamp: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  firstPrice: {
                    $first: "$price",
                  },
                  lastPrice: {
                    $last: "$price",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  period: "5Y",
                  diff: {
                    $subtract: ["$lastPrice", "$firstPrice"],
                  },
                },
              },
            ],
          },
      },
      {
        $project:
          /**
           * specifications: The fields to
           *   include or exclude.
           */
          {
            results: {
              $concatArrays: ["$1D", "$1W", "$1M", "$3M", "$1Y", "$2Y", "$5Y"],
            },
          },
      },
      {
        $unwind:
          /**
           * path: Path to the array field.
           * includeArrayIndex: Optional name for index.
           * preserveNullAndEmptyArrays: Optional
           *   toggle to unwind null and empty values.
           */
          {
            path: "$results",
          },
      },
      {
        $replaceRoot:
          /**
           * replacementDocument: A document or string.
           */
          {
            newRoot: "$results",
          },
      },
    ];
    return this.priceModel.aggregate(pipeline as PipelineStage[]);
  }

  async firstPrice(cur: string) {
    return this.priceModel
      .findOne({ currency: cur })
      .sort({ timestamp: 1 })
      .exec();
  }

  async lastPrice(cur: string) {
    return this.priceModel
      .findOne({ currency: cur })
      .sort({ timestamp: -1 })
      .exec();
  }

  async priceOneDayAgo(): Promise<Price> {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setMinutes(date.getMinutes() - 5);

    return this.priceModel.findOne({
      timestamp: { $gte: date },
    });
  }

  async findOne(id: string): Promise<Price> {
    return this.priceModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedPrice = await this.priceModel
      .findByIdAndDelete({ _id: id })
      .exec();
    return deletedPrice;
  }

  async simplePrice(): Promise<BinanceTradingDayResponse> {
    const url = `https://data-api.binance.vision/api/v3/ticker/tradingDay?symbol=BTCUSDT`;
    //const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=2`;
    const response = await axios.get(url);
    // const {data} = response;
    // const { bitcoin } = data;
    // const { usd, last_updated_at } = bitcoin || {};
    // return {
    //   price: usd,
    //   timestamp: last_updated_at,
    // };
    return response.data;
  }

  private async importHistoricalCurrency(currency: string) {
    const period1 = Math.round(new Date("2014-09-17").getTime() / 1000);
    const period2 = Math.round(new Date().getTime() / 1000);

    const url = `https://query1.finance.yahoo.com/v7/finance/download/BTC-${currency.toUpperCase()}?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;
    const response = await axios.get(url, { responseType: "stream" });

    return response.data.pipe(csv());
  }

  async trim(n = 31) {
    try {
      // this should delete records older than n days
      // except for the first value of that day
      // @todo make configurable
      const date = new Date();
      date.setDate(date.getDate() - n);

      const pipeline = [
        {
          $match: {
            timestamp: {
              $lt: date,
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$timestamp",
              },
              month: {
                $month: "$timestamp",
              },
              day: {
                $dayOfMonth: "$timestamp",
              },
            },
            records: { $push: "$$ROOT" },
          },
        },
      ];
      const records = await this.priceModel.aggregate(pipeline);
      this.logger.log(`found ${records.length} days of data to trim`);
      let count = 0;
      for (const group of records) {
        const recordsToDelete = group.records.slice(1);

        const idsToDelete = recordsToDelete.map((record) => record._id);
        if (idsToDelete.length > 0) {
          const [first] = recordsToDelete;
          const timestamp = new Date(first.timestamp);
          this.logger.log(
            `found ${
              idsToDelete.length
            } records to delete on ${timestamp.toLocaleDateString()}`
          );
          count += idsToDelete.length;
          await this.priceModel.deleteMany({ _id: { $in: idsToDelete } });
        }
      }
      this.logger.log(`deleted ${count} records`);
    } catch (ex) {
      this.logger.error(ex.message);
    }
    return true;
  }

  private getStartDate(range: "1D" | "1W" | "1M" | "3M" | "1Y" | "2Y" | "5Y") {
    const now = this.getNow();
    let startDate;
    switch (range) {
      case "1D":
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case "1W":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "1M":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3M":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "1Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "2Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 2));
        break;
      case "5Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
    }
    return startDate;
  }

  async getLastPrice() {
    const lastPrice = await this.priceModel
      .findOne()
      .sort({ timestamp: -1 })
      .exec();
    return lastPrice;
  }

  async fetchPriceFromBinance(endTime, interval = "15m") {
    try {
      // i have to limit 2 because if 1, it goes out into the future
      const url = `https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=2&endTime=${endTime}`;
      const response = await axios.get(url);
      const data = response.data[0];
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        openTime,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        openPrice,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        highPrice,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lowPrice,
        closePrice,
        vol,
        closeTime,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        quoteAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        numberOfTrades,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        takerBuyBaseAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        takerBuyQuoteAssetVolume,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ignore,
      ] = data;
      return {
        price: parseFloat(closePrice),
        volume: parseFloat(vol),
        timestamp: new Date(closeTime + 1),
        openTime: new Date(openTime),
        closeTime: new Date(closeTime),
        interval,
      };
    } catch (ex) {
      console.log(ex);
      return {
        price: null,
        volume: null,
        timestamp: new Date(),
        interval,
      };
    }
  }

  private getNow() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0); // Round down to the nearest hour
    return now;
  }
}
