import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getPrice } from "@lib/get-price";
import { PriceService } from "../price/price.service";
import { DeviceService } from "../device/device.service";
import { ConfigService } from "../config/config.service";

@Injectable()
export class TasksService {
  œ;
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

    this.runPushNotificationTask();
  }

  async runPushNotificationTask() {
    // run the push notification task

    console.log("running notification service");
    const result = await this.priceService.findRangeDiff();
    const [range] = result || [];
    console.log("found range", range.diff, range.period);

    const lastPrice = await this.priceService.getLastPrice();
    console.log("last price", lastPrice.price);
    const { diff = 0 } = range || {};
    console.log("diff", (diff / lastPrice.price) * 100);

    const currentPrice = lastPrice.price + range.diff;
    console.log("current price", currentPrice);
    const rules = this.deviceService.spliceRulesForThreshold(
      this.deviceService.lastNotification.lastThreshold
    );
    const sortedRules = DeviceService.getSortedRules(rules);

    const keys = await this.configService.getPushNotificationKeys();
    for (let i = 0; i < sortedRules.length; i++) {
      const rule = sortedRules[i];
      const { threshold } = rule;
      const notify = this.deviceService.shouldNotify(
        lastPrice.price,
        diff,
        threshold
      );
      if (notify) {
        const percentChange = ((diff / currentPrice) * 100).toFixed(2);
        const message = {
          title: "Price Alert",
          body: `Price has changed by ${percentChange}% to $${currentPrice.toFixed(
            2
          )}`,
        };

        await this.deviceService.push(message, keys);
        const index = this.deviceService.rules.findIndex(
          (r) => r.threshold === threshold
        );
        this.deviceService.rules.splice(index, 1);
        this.deviceService.lastNotification.timestamp = new Date().getTime();
        this.deviceService.lastNotification.price = currentPrice;
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
