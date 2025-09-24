import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PriceService } from "../price/price.service";

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(private readonly priceService: PriceService) {}

  async onApplicationBootstrap() {
    this.logger.log("Application started - beginning Binance data import...");
    const start = new Date();

    // 1 month ago
    const monthAgo = new Date(start.getTime() - 1000 * 60 * 60 * 24 * 30);
    monthAgo.setSeconds(0);
    monthAgo.setMilliseconds(0);
    monthAgo.setHours(0);

    monthAgo.setMinutes(0);
    try {
      await this.priceService.importFromBinance();
      await this.priceService.importFromBinance(monthAgo.getTime(), "30m");
      this.logger.log("Binance data import completed successfully");
    } catch (error) {
      this.logger.error("Failed to import data from Binance:", error.message);
      // Don't throw the error to avoid preventing the app from starting
    }
  }
}
