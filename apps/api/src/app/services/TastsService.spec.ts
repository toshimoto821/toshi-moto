import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PriceService } from "../price/price.service";
import { TasksService } from "./TasksService";
import { ConfigService } from "../config/config.service";
import { DeviceService } from "../device/device.service";
describe("TasksService", () => {
  let service: TasksService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        TasksService,
        PriceService,
        {
          provide: getModelToken("Price"),
          useValue: {}, // Mock implementation of the PriceModel goes here
        },
        ConfigService,
        {
          provide: getModelToken("Config"),
          useValue: {}, // Mock implementation of the PriceModel goes here
        },
        DeviceService,
        {
          provide: getModelToken("Device"),
          useValue: {}, // Mock implementation of the PriceModel goes here
        },
      ],
    }).compile();

    service = app.get<TasksService>(TasksService);
  });

  describe("shouldNotify", () => {
    it('should not notify when 1.66 percent change for -1"', () => {
      const result = service.deviceService.shouldNotify(60000, 1000, -1);
      expect(result).toEqual(false);
    });

    it('should notify when 1.66 percent change for 1"', () => {
      const result = service.deviceService.shouldNotify(60000, 1000, 1);
      expect(result).toEqual(true);
    });

    it('should notify when 4.66 percent change for 1"', () => {
      const result = service.deviceService.shouldNotify(60000, 2600, 1);
      expect(result).toEqual(true);
    });
  });

  describe("getRules", () => {
    it('should return an array of rules"', () => {
      const result = service.deviceService.spliceRulesForThreshold(1);
      expect(result.length).toEqual(7);
    });

    it('should return an array of rules two calls"', () => {
      service.deviceService.spliceRulesForThreshold(1);
      const result = service.deviceService.spliceRulesForThreshold(-1);
      expect(result.length).toEqual(6);
      expect(service.deviceService.rules[3].threshold).toEqual(3);
    });
  });
  describe("getSortedRules", () => {
    it('should return an array of rules"', () => {
      const result = DeviceService.getSortedRules(service.deviceService.rules);
      expect(result.length).toEqual(8);
    });
  });

  describe("runPushNotificationTask", () => {
    it("should return false when shouldNotify is false", async () => {
      service.priceService.findRangeDiff = jest
        .fn()
        .mockResolvedValue(Promise.resolve([{ diff: 1000, period: "1D" }]));

      service.priceService.getLastPrice = jest.fn().mockResolvedValue(
        Promise.resolve({
          price: 61000,
        })
      );
      service.deviceService.push = jest.fn();
      service.configService.getPushNotificationKeys = jest
        .fn()
        .mockResolvedValue(
          Promise.resolve({
            privateKey: "foo",
            publicKey: "bar",
          })
        );
      await service.runPushNotificationTask();
      expect(service.deviceService.rules.length).toEqual(7);
      expect(service.deviceService.rules[4].threshold).toEqual(3);
      expect(service.deviceService.push).toHaveBeenCalled();
    });
  });
});
