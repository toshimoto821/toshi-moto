/* eslint-disable playwright/expect-expect */
// import { expect } from '@playwright/test';
import { test, expect } from "./fixtures/test";

// const projectId = '671d3d1ab171c3d405b880d6';
test.beforeEach(async ({ api }) => {
  //   await api.mockDashboard(projectId);
  await api.mockHomepage();
});

test("onboarding tags-[fullpage]", async ({ page, api }, testInfo) => {
  await api.mockHomepage();
  await page.goto("/");

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
  const path = testInfo.outputPath("homepage.png");
  await page.screenshot({ path, fullPage: true });
});
