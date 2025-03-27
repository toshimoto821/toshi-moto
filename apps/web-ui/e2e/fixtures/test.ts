import { test as base } from "@playwright/test";
import { Api } from "./api";
import { HomepagePO } from "./pom/Homepage.po";
type Fixtures = {
  homepage: HomepagePO;
  api: Api;
};

export const test = base.extend<Fixtures>({
  homepage: async ({ page }, use) => {
    await use(new HomepagePO(page));
  },
  api: async ({ page }, use) => {
    await use(new Api(page));
  },
});

export { expect } from "@playwright/test";
