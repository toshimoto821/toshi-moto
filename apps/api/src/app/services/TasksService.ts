import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getPrice } from "@lib/get-price";
import { PriceService } from "../price/price.service";
import { DeviceService } from "../device/device.service";
import { ConfigService } from "../config/config.service";

@Injectable()
export class TasksService {
  constructor(
    readonly priceService: PriceService,
    readonly configService: ConfigService,
    readonly deviceService: DeviceService
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  resetRules() {
    console.log("resetting rules");
    this.deviceService.resetRules();
  }

  @Cron("1/5 * * * *" /* every 5 minutes */)
  async handleCron() {
    this.logger.debug("Fetching new data!");
    let price: number | null = null;
    try {
      const currency = "usd";
      const { price: p, timestamp, volume } = await getPrice(currency);
      price = p;
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

    this.runPushNotificationTask(price);
  }

  async runPushNotificationTask(price?: number) {
    // run the push notification task

    this.logger.log("running notification service");
    const previousPrice = await this.priceService.priceOneDayAgo();
    this.logger.log("previous price", previousPrice?.price);
    if (!previousPrice) {
      return;
    }

    let lastPrice = price;

    if (!lastPrice) {
      const response = await this.priceService.getLastPrice();
      if (response) {
        lastPrice = response.price;
      }
    }

    this.logger.log("last price", lastPrice);
    if (!lastPrice) {
      return;
    }

    const diff = lastPrice - previousPrice.price;

    this.logger.log("diff", (diff / lastPrice) * 100);

    const rules = this.deviceService.spliceRulesForThreshold(
      this.deviceService.lastNotification.lastThreshold
    );
    const sortedRules = DeviceService.getSortedRules(rules);

    const keys = await this.configService.getPushNotificationKeys();
    for (let i = 0; i < sortedRules.length; i++) {
      const rule = sortedRules[i];
      const { threshold } = rule;
      const notify = this.deviceService.shouldNotify(
        lastPrice,
        diff,
        threshold
      );
      if (notify) {
        const percentChange = ((diff / lastPrice) * 100).toFixed(2);
        const message = {
          title: "BTC Alert",
          body: `Price has changed by ${percentChange}% to $${lastPrice.toFixed(
            2
          )}`,
        };

        this.logger.log(`Pushing notification for ${threshold}`);
        await this.deviceService.push(message, keys);
        const index = this.deviceService.rules.findIndex(
          (r) => r.threshold === threshold
        );
        this.deviceService.rules.splice(index, 1);
        this.deviceService.lastNotification.timestamp = new Date().getTime();
        this.deviceService.lastNotification.price = lastPrice;
        this.deviceService.lastNotification.lastThreshold = threshold;
        break;
      }
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
