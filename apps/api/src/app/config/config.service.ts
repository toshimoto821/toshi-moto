import { Injectable, Logger } from "@nestjs/common";
import webpush from "web-push";
import { InjectModel } from "@nestjs/mongoose";
import { type Model } from "mongoose";

import { Config } from "./schemas/config.schema";
// import { CreatePriceDto } from "./dto/create-price.dto";
const PRIVATE_KEY = "push.private-key";
const PUBLIC_KEY = "push.public-key";
@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private readonly configModel: Model<Config>
  ) {
    this.logger.log("ConfigService initialized");
  }
  private readonly logger = new Logger(ConfigService.name);
  async upsertPrivateKey() {
    const key = "push.private-key";
    const config = await this.configModel.findOne({ key });
    if (!config) {
      const vapidKeys = webpush.generateVAPIDKeys();
      await this.configModel.create({
        key: PRIVATE_KEY,
        value: vapidKeys.privateKey,
        private: true,
      });
      await this.configModel.create({
        key: PUBLIC_KEY,
        value: vapidKeys.publicKey,
      });
    }

    return this.getPushNotificationKeys();
  }

  async getPushNotificationKeys() {
    const configPrivateKey = await this.configModel.findOne({
      key: PRIVATE_KEY,
    });
    const configPublicKey = await this.configModel.findOne({ key: PUBLIC_KEY });

    return {
      privateKey: configPrivateKey?.value,
      publicKey: configPublicKey?.value,
    };
  }

  findAll() {
    return this.configModel.find({ private: false }).exec();
  }
}
