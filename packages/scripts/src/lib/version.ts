import { changelogAndVersion } from "./util/changelogAndVersion";

const [, , sha = process.env["SHA"], files = process.env["FILES"]] =
  process.argv;
// const sha = "a690bbdc65566e3a5e4bba8ae37acfab6608604a";
// const files = [
//   "apps/web-ui-e2e/cypress/screenshots/app.cy.ts/web-ui-e2e -- Hero.png",
// ];
if (!sha || !files) {
  throw new Error("sha and files are required");
}
changelogAndVersion({
  files: files.split(",").map((f) => f.trim()),
  sha,
  dryRun: false,
});
