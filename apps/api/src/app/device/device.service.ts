import { Injectable, Logger } from "@nestjs/common";
import webpush from "web-push";
import { InjectModel } from "@nestjs/mongoose";
import { type Model } from "mongoose";
import { SubscriptionDto } from "./dto/subscription.dto";
import { Device } from "./schemas/device.schema";

type LastNotification = {
  timestamp: number | null;
  price: number | null;
  lastThreshold: number | null;
};

const rules = [
  {
    threshold: -10,
  },
  {
    threshold: -5,
  },
  {
    threshold: -3,
  },

  {
    threshold: -1,
  },

  {
    threshold: 1,
  },
  {
    threshold: 3,
  },
  {
    threshold: 5,
  },
  {
    threshold: 10,
  },
];

interface Rule {
  threshold: number;
}

@Injectable()
export class DeviceService {
  lastNotification: LastNotification;
  rules: Rule[];

  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>
  ) {
    this.logger.log("ConfigService initialized");
    this.lastNotification = {
      timestamp: null,
      price: null,
      lastThreshold: 0,
    };
    this.rules = [...rules];
  }
  private readonly logger = new Logger(DeviceService.name);

  resetRules() {
    this.rules = [...rules];
  }

  static getSortedRules(rules: Rule[]) {
    const positive = rules.filter((r) => r.threshold > 0);
    positive.sort((a, b) => b.threshold - a.threshold);
    const negative = rules.filter((r) => r.threshold < 0);

    negative.sort((a, b) => a.threshold - b.threshold);

    return [...negative, ...positive];
  }

  spliceRulesForThreshold(lastThreshold: number) {
    this.rules.sort((a, b) => a.threshold - b.threshold);

    if (lastThreshold) {
      const index = this.rules.findIndex((r) => r.threshold === lastThreshold);
      if (index !== -1) {
        this.rules = this.rules.filter((r, rIndex) => {
          if (lastThreshold > 0) {
            // negative should stay
            if (r.threshold < 0) return true;
            // positive should remove from 0 to threshold
            return rIndex > index && r.threshold > 0;
          }
          if (r.threshold > 0) return true;
          if (rIndex < index) return true;
          return false;
        });
      }
    }

    return this.rules;
  }
  shouldNotify(lastPrice: number, diff: number, threshold: number) {
    // threshold  = -1
    const percentChange = (diff / lastPrice) * 100;
    const absChange = Math.abs(percentChange);
    const absThreshold = Math.abs(threshold);
    if (absChange >= absThreshold) {
      if (threshold > 0) {
        if (percentChange > threshold) {
          return true;
        }
      } else {
        if (percentChange < threshold) {
          return true;
        }
      }
    }
    return false;
  }

  async subscribe(subscription: SubscriptionDto) {
    const device = await this.deviceModel.updateOne(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );
    return device;
  }
  unsubscribe(subscription: SubscriptionDto) {
    return this.deviceModel.deleteOne({
      endpoint: subscription.endpoint,
    });
  }

  async pushToDevice(
    device: Device,
    message: { title: string; body: string },
    keys: { privateKey: string; publicKey: string }
  ) {
    webpush.setVapidDetails(
      "mailto:toshimoto821@proton.me",
      keys.publicKey,
      keys.privateKey
    );
    const subscription = {
      endpoint: device.endpoint,
      keys: {
        auth: device.keys.auth,
        p256dh: device.keys.p256dh,
      },
    };

    const payload = JSON.stringify({
      title: message.title,
      body: message.body,
      icon: "/toshi-256.svg",
      url: "https://t.toshimoto.dev",
    });

    const options = {
      TTL: 60, // Time to live in seconds
    };
    try {
      await webpush.sendNotification(subscription, payload, options);
    } catch (ex) {
      console.log(ex);
    }
  }

  async push(
    message: { title: string; body: string },
    keys: { privateKey: string; publicKey: string }
  ) {
    webpush.setVapidDetails(
      "mailto:toshimoto821@proton.me",
      keys.publicKey,
      keys.privateKey
    );
    const devices = await this.deviceModel.find();

    for (const device of devices) {
      const subscription = {
        endpoint: device.endpoint,
        keys: {
          auth: device.keys.auth,
          p256dh: device.keys.p256dh,
        },
      };

      const payload = JSON.stringify({
        title: message.title,
        body: message.body,
        icon: "/toshi-256.svg",
        url: "https://t.toshimoto.dev",
      });

      const options = {
        TTL: 60, // Time to live in seconds
      };
      try {
        await webpush.sendNotification(subscription, payload, options);
      } catch (ex) {
        if (ex.statusCode === 410) {
          await this.deviceModel.deleteOne({
            endpoint: device.endpoint,
          });
        }
        console.log(ex);
      }
    }
  }

  getRules() {
    return this.rules;
  }

  async findByEndpoint(endpoint: string) {
    return this.deviceModel.findOne({ endpoint });
  }
}
