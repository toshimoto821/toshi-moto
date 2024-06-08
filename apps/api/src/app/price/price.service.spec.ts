import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PriceService } from "./price.service";
// used for non-mocking scenario
// import { Price, PriceSchema } from "./schemas/price.schema";
// import { MongooseModule } from "@nestjs/mongoose";

describe("price.service", () => {
  let service: PriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [
      //   MongooseModule.forRoot("mongodb://127.0.0.1:27017/toshi-moto"),
      //   MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }]),
      // ],
      providers: [
        PriceService,
        // use for mocking
        {
          provide: getModelToken("Price"),
          useValue: {}, // Mock implementation of the PriceModel goes here
        },
      ],
    }).compile();

    service = module.get<PriceService>(PriceService);
  });

  describe("trim()", () => {
    it('should delete records older than 30 days"', async () => {
      const result = await service.trim();
      expect(result).toBe(true);
    });
  });
});
