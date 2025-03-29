import { changelogAndVersion } from "./util/changelogAndVersion";

const [
  ,
  ,
  sha = process.env["SHA"],
  files = process.env["FILES"],
  projectId = process.env["PROJECT_ID"],
  clientId = process.env["CLIENT_ID"],
  clientSecret = process.env["CLIENT_SECRET"],
] = process.argv;
// const sha = "a690bbdc65566e3a5e4bba8ae37acfab6608604a";
// const files = [
//   "apps/web-ui-e2e/cypress/screenshots/app.cy.ts/web-ui-e2e -- Hero.png",
// ];

console.log(process.env["FILES"], "env.FILES");
console.log(process.env["SHA"], "env.SHA");
console.log(process.env["PROJECT_ID"], "env.PROJECT_ID");

if (!sha || !files) {
  throw new Error("sha and files are required");
}
changelogAndVersion({
  // files is going to be new line delimited
  files: files
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f),
  sha,
  dryRun: false,
  projectId: projectId as string,
  clientId: clientId as string,
  clientSecret: clientSecret as string,
});
