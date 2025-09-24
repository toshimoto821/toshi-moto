import {
  Module,
  NestModule,
  MiddlewareConsumer,
  Provider,
} from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TasksService } from "./services/TasksService";
import { StartupService } from "./services/StartupService";
import { PriceModule } from "./price/price.module";
import { ApiKeyMiddleware } from "src/middleware/ApiKeyMiddleware";
import { LoggerMiddleware } from "src/middleware/LoggerMiddleware";
import { ConfigModule } from "./config/config.module";
import { DeviceModule } from "./device/device.module";

const uri = process.env.MONGODB_URI;

const providers = [AppService, StartupService] as Provider[];
if (!process.env.TASK_SERVICE_DISABLED) {
  providers.push(TasksService);
}
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(uri),
    PriceModule,
    ConfigModule,
    DeviceModule,
  ],
  controllers: [AppController],
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes("*");
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
