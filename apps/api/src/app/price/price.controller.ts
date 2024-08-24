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
import { RangeQueryDto, SimplePriceDto } from "./dto/create-price.dto";
import { Price } from "./schemas/price.schema";

type IRangeResponse = {
  meta: {
    groupBy: string;
    from: number;
    to: number;
    range: string;
  };
  prices: [number, number][];
};

export type IRangeDiffResponse = {
  data: {
    period: string;
    diff: number;
  }[];
};

type ISimplePriceResponse<T extends string> = {
  bitcoin: {
    // last_updated_at: number;
    [key in T]: number;
  } & {
    [key in `${T}_24_hour_vol`]: number;
  };
};

@Controller("prices")
export class PriceController {
  constructor(private readonly priceService: PriceService) {
    this.priceService.count().then((count) => {
      if (count === 0) {
        this.priceService.import("usd");
      }
    });
  }

  @Get()
  @Header("Cache-Control", "public, max-age=86400")
  async findAll(): Promise<Price[]> {
    return this.priceService.findAll();
  }

  @Get("range")
  @Header("Cache-Control", "public, max-age=300")
  async findRange(@Query() query: RangeQueryDto): Promise<IRangeResponse> {
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
      prices: range.map((r) => [r.timestamp.getTime(), r.price]),
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

  // @Get("import")
  // // @Header("Content-Type", "application/json")
  // async import(): Promise<{ ok: boolean }> {
  //   const response = await this.priceService.import("usd");
  //   return response;
  // }

  @Get("simple")
  @Header("Cache-Control", "public, max-age=300")
  // @todo make usd dynamic
  async simple(
    @Query() query: SimplePriceDto
  ): Promise<ISimplePriceResponse<"usd">> {
    const currency = query.vs_currencies;
    const response: ISimplePriceResponse<"usd"> =
      await this.priceService.simplePrice(currency);
    return response;
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
