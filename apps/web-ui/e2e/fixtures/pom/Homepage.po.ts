import { Page } from "@playwright/test";

export class HomepagePO {
  constructor(private readonly page: Page) {}

  // Navigation
  // async goto(projectId: string, queryParams = "") {
  //   // await this.page.goto(`/project/dashboard/${projectId}?${queryParams}`);
  // }

  async importWallet() {
    // getByTestId('import-toshi-moto-wallet')
    await this.page.getByTestId("import-toshi-moto-wallet").click();

    // getByTestId('import-wallet-modal')
    // this.page.getByTestId("import-wallet-modal").fill("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");

    // // getByTestId('import-wallet-modal-submit')
    // this.page.getByTestId("import-wallet-modal-submit").click();
  }

  async selectWalletByName(name: string) {
    await this.page.getByText(name).click();
  }

  getCompleteCount(count: number) {
    return this.page.getByText(`${count}completed`);
  }

  async fixFixed() {
    const p1 = this.page.getByTestId("navbar").evaluate((el) => {
      el.style.position = "static";
    });

    const p2 = this.page.getByTestId("chart-tooltip").evaluate((el) => {
      el.style.position = "static";
    });

    const p3 = this.page.getByTestId("network-log").evaluate((el) => {
      el.style.position = "static";
    });

    return Promise.all([p1, p2, p3]);
  }
}
