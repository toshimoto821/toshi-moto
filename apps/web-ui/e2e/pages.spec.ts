/* eslint-disable playwright/expect-expect */
// import { expect } from '@playwright/test';
import { test } from "./fixtures/test";

// const projectId = '671d3d1ab171c3d405b880d6';
test.beforeEach(async ({}) => {
  //   await api.mockDashboard(projectId);
});

test("onboarding tags-[fullpage]", async ({ page, api }, testInfo) => {
  await api.mockHomepage();
  await page.goto("/");

  const path = testInfo.outputPath("onboarding.png");
  await page.screenshot({ path, fullPage: true });
});

test("homepage tags-[fullpage]", async ({ page, api, homepage }, testInfo) => {
  await api.mockHomepage();
  await page.goto("/");
  await homepage.importWallet();

  const path = testInfo.outputPath("homepage.png");
  await page.screenshot({ path, fullPage: true });
});
