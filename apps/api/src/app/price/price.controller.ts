import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Header,
} from "@nestjs/common";
import { PriceService } from "./price.service";
import { RangeQueryDto } from "./dto/create-price.dto";
import { Price } from "./schemas/price.schema";
import type { BinanceKlineMetric } from "./price.service";
type IRangeResponse = {
  meta: {
    groupBy: string;
    from: number;
    to: number;
    range: string;
  };
  prices: BinanceKlineMetric[];
};

type IRangeResponseDep = {
  meta: {
    groupBy: string;
    from: number;
    to: number;
    range: string;
  };
  prices: [number, number, number][];
};

export type IRangeDiffResponse = {
  data: {
    period: string;
    diff: number;
  }[];
};

type ISimplePriceResponse<T extends string> = {
  bitcoin: {
    [key in T]: number;
  } & {
    [key in `${T}_24_hour_vol`]: number;
  } & {
    last_updated_at: number;
  };
};

@Controller("prices")
export class PriceController {
  constructor(private readonly priceService: PriceService) {
    // this.priceService.count().then((count) => {
    //   if (count === 0) {
    //     this.priceService.importFromBinance();
    //     const start = new Date();
    //     // 1 month ago
    //     const monthAgo = new Date(start.getTime() - 1000 * 60 * 60 * 24 * 30);
    //     monthAgo.setSeconds(0);
    //     monthAgo.setMilliseconds(0);
    //     monthAgo.setHours(0);
    //     monthAgo.setMinutes(0);
    //     this.priceService.importFromBinance(monthAgo.getTime()), "5m";
    //   }
    // });
  }

  @Get()
  @Header("Cache-Control", "public, max-age=86400")
  async findAll(): Promise<Price[]> {
    return this.priceService.findAll();
  }

  @Get("kline")
  @Header("Cache-Control", "public, max-age=300")
  async findRange(@Query() query: RangeQueryDto): Promise<IRangeResponse> {
    const from = query.from * 1000;
    const to = query.to * 1000;

    const range = await this.priceService.findRangeFromBinance({
      currency: query.vs_currency,
      from,
      to,
      groupBy: query.group_by,
    });

    return {
      meta: {
        groupBy: query.group_by,
        from: query.from,
        to: query.to,
        range: query.range,
      },
      prices: range,
    };
  }
  @Get("range")
  @Header("Cache-Control", "public, max-age=300")
  async findRangeDep(
    @Query() query: RangeQueryDto
  ): Promise<IRangeResponseDep> {
    const from = query.from * 1000;
    const to = query.to * 1000;

    let range = await this.priceService.findRange({
      currency: query.vs_currency,
      from,
      to,
      groupBy: query.group_by,
    });

    if (range.length === 0) {
      // wait about 20 seconds for the data to be imported
      console.log("no records found, waiting for import");
      await this.priceService.waitForImport();
      range = await this.priceService.findRange({
        currency: query.vs_currency,
        from,
        to,
        groupBy: query.group_by,
      });
      console.log(`found ${range.length} records after waiting for import`);
    }

    return {
      meta: {
        groupBy: query.group_by,
        from: query.from,
        to: query.to,
        range: query.range,
      },
      prices: range.map((r) => [r.timestamp.getTime(), r.price, r.volume]),
    };
  }

  @Get("range/diff")
  @Header("Cache-Control", "public, max-age=300")
  async findRangeDiff(): Promise<IRangeDiffResponse> {
    const data = await this.priceService.findRangeDiff();

    return {
      data,
    };
  }

  @Get("bounds")
  @Header("Cache-Control", "public, max-age=300")
  async bounds(): Promise<{ first: Price; last: Price }> {
    const [first, last] = await Promise.all([
      this.priceService.firstPrice("usd"),
      this.priceService.lastPrice("usd"),
    ]);
    return { first, last };
  }

  @Post("import")
  // @Header("Content-Type", "application/json")
  async import(): Promise<{ ok: boolean }> {
    const start = new Date();
    // 1 month ago
    const monthAgo = new Date(start.getTime() - 1000 * 60 * 60 * 24 * 30);
    monthAgo.setSeconds(0);
    monthAgo.setMilliseconds(0);
    monthAgo.setHours(0);

    monthAgo.setMinutes(0);

    await this.priceService.importFromBinance();
    await this.priceService.importFromBinance(monthAgo.getTime(), "30m");

    return { ok: true };
  }

  @Get("simple")
  @Header("Cache-Control", "public, max-age=300")
  // @todo make usd dynamic
  async simple(): Promise<ISimplePriceResponse<"usd">> {
    const response = await this.priceService.simplePrice();
    return {
      bitcoin: {
        last_updated_at: Date.now(),
        usd: parseFloat(response.lastPrice),
        usd_24_hour_vol: parseFloat(response.quoteVolume),
      },
    };
  }

  @Get("one-day-ago")
  async oneDayAgo(): Promise<Price> {
    return this.priceService.priceOneDayAgo();
  }

  @Post()
  // async create(@Body() createPriceDto: CreatePriceDto) {

  //   await this.priceService.importHistoricalCurrency();
  // }
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Price> {
    return this.priceService.findOne(id);
  }

  @Get("trim")
  async trimData(): Promise<boolean> {
    return this.priceService.trim();
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.priceService.delete(id);
  }
}
