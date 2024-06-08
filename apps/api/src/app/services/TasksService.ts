import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { getPrice } from "@lib/get-price";
import { PriceService } from "../price/price.service";

@Injectable()
export class TasksService {
  constructor(private readonly priceService: PriceService) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron("1/5 * * * *" /* every 5 minutes */)
  async handleCron() {
    this.logger.debug("Fetching new data!");
    try {
      const currency = "usd";
      const { price, timestamp, volume } = await getPrice(currency);
      // @todo save to db
      this.logger.debug(
        `Price: $${price} at ${new Date(timestamp).toLocaleString()}`
      );
      // const prices = await this.priceService.findAll();
      await this.priceService.upsert({
        price,
        currency,
        timestamp: new Date(timestamp),
        volume,
      });
    } catch (ex) {
      this.logger.error(ex.message);
    }
  }

  @Cron("30 8 * * *" /* every day */)
  async trimData() {
    this.logger.debug("trimming old data");
    try {
      await this.priceService.trim();
    } catch (ex) {
      this.logger.error(ex.message);
    }
  }
}
