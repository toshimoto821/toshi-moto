import { readFileSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import { cwd } from "process";

// Function to update changelog with the specified version and append text
export function injectImagesToChangelog(
  version: string,
  hash: string,
  filepaths: string[],
  dryRun = false
) {
  // get the root nx dir
  const root = cwd();
  const changelogPath = resolve(root, "./apps/web-ui/CHANGELOG.md");

  // Read the changelog file
  let changelog = readFileSync(changelogPath, "utf8");

  // Prepare the regex to find the version entry
  const versionRegex = new RegExp(
    `(## \\[${version}\\]\\(.*?\\) \\(\\d{4}-\\d{2}-\\d{2}\\))`
  );

  // Check if the version exists in the changelog
  if (!versionRegex.test(changelog)) {
    console.error(`Version ${version} not found in the changelog.`);
    return;
  }

  const url = `https://raw.githubusercontent.com/toshimoto821/toshi-moto/${hash}`;
  const appendText = filepaths
    .map((filepath) => {
      const filename = basename(filepath);
      return `\n![${filename}](${url}/${encodeURI(filepath)})\n`;
    })
    .join();

  // Find the version entry and update it with the append text
  changelog = changelog.replace(versionRegex, `$1\n${appendText}`);

  // Write the updated changelog back to the file
  if (!dryRun) {
    writeFileSync(changelogPath, changelog, "utf8");
  }

  console.log(`Changelog updated for version ${version}.`);
}

// Get version input and text to append from the command line
// const [, , version, hash, filepaths] = process.argv;

// if (!version || !hash || !filepaths) {
//   console.error("Please provide a version number and text to append.");
// }
// const filepathsArray = filepaths.split(",");

// // Update the changelog
