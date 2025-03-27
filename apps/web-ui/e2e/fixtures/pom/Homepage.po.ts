import { Page } from "@playwright/test";

export class HomepagePO {
  constructor(private readonly page: Page) {}

  // Navigation
  async goto(projectId: string, queryParams = "") {
    // await this.page.goto(`/project/dashboard/${projectId}?${queryParams}`);
  }

  async importWallet() {
    // getByTestId('import-toshi-moto-wallet')
    await this.page.getByTestId("import-toshi-moto-wallet").click();

    // getByTestId('import-wallet-modal')
    // this.page.getByTestId("import-wallet-modal").fill("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");

    // // getByTestId('import-wallet-modal-submit')
    // this.page.getByTestId("import-wallet-modal-submit").click();
  }
}
