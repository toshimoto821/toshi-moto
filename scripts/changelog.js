// eslint-disable
const fs = require("fs");
const path = require("path");
const packageJson = require("../apps/web-ui/package.json");

// Function to update changelog with the specified version and append text
function updateChangelog(version, hash, filepaths) {
  const changelogPath = path.resolve(__dirname, "../apps/web-ui/CHANGELOG.md");

  // Read the changelog file
  let changelog = fs.readFileSync(changelogPath, "utf8");

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
      const filename = path.basename(filepath);
      return `\n![${filename}](${url}/${encodeURI(filepath)})\n`;
    })
    .join();

  // Find the version entry and update it with the append text
  changelog = changelog.replace(versionRegex, `$1\n${appendText}`);

  // Write the updated changelog back to the file
  fs.writeFileSync(changelogPath, changelog, "utf8");
  console.log(`Changelog updated for version ${version}.`);
}

// Get version input and text to append from the command line
const [, , hash, ...filepaths] = process.argv;

const version = packageJson.version;
if (!version || !hash || !filepaths) {
  console.error("Please provide a version number and text to append.");
  process.exit(1);
}

console.log(version, hash, filepaths);
// Update the changelog
updateChangelog(version, hash, filepaths);
