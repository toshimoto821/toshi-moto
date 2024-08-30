import { Body, Controller, Post, Get } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { ConfigService } from "../config/config.service";
import { SubscriptionDto } from "./dto/subscription.dto";

@Controller("device")
export class DeviceController {
  private pushNotificationPrivateKey?: string;
  constructor(
    private readonly deviceService: DeviceService,
    private readonly configService: ConfigService
  ) {}

  @Post("subscribe")
  async subscribe(@Body() subscription: SubscriptionDto) {
    await this.deviceService.subscribe(subscription);
    return {
      message: "subscribed",
    };
  }

  @Post("unsubscribe")
  async unsubscribe(@Body() subscription: SubscriptionDto) {
    await this.deviceService.unsubscribe(subscription);
    return {
      message: "unsubscribed",
    };
  }

  @Get("push")
  async push() {
    const keys = await this.configService.getPushNotificationKeys();
    const message = {
      title: "foo",
      body: "bar",
    };
    await this.deviceService.push(message, keys);
    return {
      message: "pushed",
    };
  }

  @Get("rules")
  async rules() {
    return this.deviceService.getRules();
  }

  @Post("rules")
  async setRules() {
    this.deviceService.resetRules();
    return {
      message: "rules reset",
    };
  }
}
