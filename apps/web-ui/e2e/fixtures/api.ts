import { Page } from "@playwright/test";
import { getPriceSimpleMock } from "../mocks/price.simple.mock";
import { getPriceRangeDiffMock } from "../mocks/range.diff.mock";
import { getPriceRangeMock } from "../mocks/range.mock";
import { getAddressResponse } from "../mocks/address.mock";
import { getTxsResponse } from "../mocks/txs.mock";

export class Api {
  constructor(private readonly page: Page) {}

  private async mockResponse(url: string, data: any, status = 200) {
    console.log("mocking", url);
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
  }

  async mockError(url: string, status = 500, error = "Internal Server Error") {
    await this.mockResponse(url, { error }, status);
  }

  async mockSimplePrice() {
    await this.mockResponse("**/api/prices/simple*", getPriceSimpleMock());
  }

  async mockTotalBtc() {
    return this.mockResponse(
      "https://blockchain.info/q/totalbc",
      "1971957500000000"
    );
  }

  async mockRangeDiff() {
    await this.mockResponse(
      "**/api/prices/range/diff*",
      getPriceRangeDiffMock()
    );
  }

  async mockRange() {
    await this.mockResponse("**/api/prices/kline*", getPriceRangeMock());
  }

  async mockHomepage() {
    await this.mockSimplePrice();
    await this.mockRangeDiff();
    await this.mockRange();
    await this.mockAddress("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");
  }

  async mockAddress(initAddress: string) {
    await this.page.route(`**/api/address/**/*`, async (route) => {
      const url = new URL(route.request().url());

      const [, , , address] = url.pathname.split("/");
      if (/txs$/.test(url.pathname)) {
        // @todo stub
        if (initAddress === address) {
          const resp = getTxsResponse({ address, sum: 100000 });
          console.log("initAddress", initAddress, resp);
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(resp),
          });
        } else {
          const resp = getTxsResponse({ address });
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(resp),
          });
        }
      } else {
        let numTxs = 0;
        let sum = 0;
        if (initAddress === address) {
          numTxs = 1;
          sum = 100000;
        }

        const resp = getAddressResponse({ address, numTxs, sum });
        // console.log("resp", resp);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(resp),
        });
      }
    });
  }

  // Can add more mock methods as needed
}
