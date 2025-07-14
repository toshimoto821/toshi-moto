/* eslint-disable playwright/expect-expect */
// import { expect } from '@playwright/test';
import { test, expect } from "./fixtures/test";

// const projectId = '671d3d1ab171c3d405b880d6';
test.beforeEach(async ({ api }) => {
  //   await api.mockDashboard(projectId);
  await api.mockHomepage();
});

test("onboarding tags-[fullpage]", async ({
  page,
  api,
  homepage,
}, testInfo) => {
  await api.mockHomepage();
  await page.goto("/");
  await homepage.fixFixed();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(5000);
  const path = testInfo.outputPath("onboarding.png");
  await page.screenshot({ path, fullPage: true });
});

test("homepage tags-[fullpage]", async ({ page, homepage }, testInfo) => {
  await page.goto("/");

  await homepage.importWallet();
  await expect(
    page.locator("div").filter({ hasText: /^Toshi Moto$/ })
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));

  await expect(homepage.getCompleteCount(26)).toBeVisible();

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(1000);
  await expect(page.getByText("Toshi Moto")).toBeVisible();

  await homepage.selectWalletByName("Toshi Moto");
  await homepage.fixFixed();

  const path = testInfo.outputPath("homepage.png");
  await page.screenshot({ path, fullPage: true });
});
