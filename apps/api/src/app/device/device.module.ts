import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { Device, DeviceSchema } from "./schemas/device.schema";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    ConfigModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
