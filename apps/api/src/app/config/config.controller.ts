import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ConfigDto } from "./dto/config.dto";

@Controller("config")
export class ConfigController {
  private pushNotificationPrivateKey?: string;
  constructor(private readonly configService: ConfigService) {
    this.configService.upsertPrivateKey().then((keys) => {
      this.pushNotificationPrivateKey = keys.privateKey;
    });
  }
  @Get("list")
  async findAll(): Promise<{ configs: ConfigDto[] }> {
    const configs = await this.configService.findAll();
    return {
      configs: configs.map((config) => ({
        key: config.key,
        value: config.value,
      })),
    };
  }
}
