import { readFileSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import { cwd } from "process";

import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

function transformArrayToNestedArray(arr: string[], numCols: number) {
  const result = [];

  for (let i = 0; i < arr.length; i += numCols) {
    // Slice the array into chunks of numCols
    const chunk = arr.slice(i, i + numCols);

    // If the chunk is smaller than numCols, fill it with empty strings
    while (chunk.length < numCols) {
      chunk.push("");
    }

    result.push(chunk);
  }

  return result;
}

/**
 * 
 *  
 *  turns ['one', 'two', 'three', 'four', 'five'] into
    [
      ['one', 'two', 'three'],
      ['four', 'five', '']
    ];
 */
export const createMarkdownTable = (
  paths: string[],
  hash: string,
  numCols = 3
) => {
  const table = transformArrayToNestedArray(paths, numCols);

  const url = `https://raw.githubusercontent.com/toshimoto821/toshi-moto/${hash}/apps/web-ui-e2e/cypress/screenshots/app.cy.ts`;
  return table.reduce((acc, row) => {
    const updatedRow = row.map((path) => {
      if (!path) return "";
      const filename = basename(path);
      return `![${filename}](${url}/${encodeURI(path)})`;
    });
    return `${acc}|${updatedRow.join("|")}|\n`;
  }, "");
};

export async function getTag(hash: string) {
  const command = `git tag --points-at ${hash}`;
  const { stdout } = await execAsync(command);
  const tags = stdout
    .split("\n")
    .filter(Boolean)
    .map((tag) => tag.trim());
  return tags;
}

export async function getLastTag() {
  const command = `git log`;
  const { stdout } = await execAsync(command);
  const lines = stdout.split("\n");
  if (!lines?.[1]) {
    return {};
  }
  const commit = /commit\s(\w+)/.exec(lines[0]);
  if (!commit?.[1]) return {};
  const tags = await getTag(commit[1]);
  return {
    tags,
    commit: commit?.[1],
  };
}

export async function removeTag(tag: string | string[]) {
  const _tags = typeof tag === "string" ? [tag] : tag;
  for (const tag of _tags) {
    const command = `git tag -d ${tag}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }
  return true;
}

export async function addTag(hash: string, tag: string | string[]) {
  const _tags = typeof tag === "string" ? [tag] : tag;
  for (const tag of _tags) {
    const command = `git tag ${tag} ${hash}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  }

  return true;
}

// Function to update changelog with the specified version and append text
export async function injectImagesToChangelog(
  version: string,
  hash: string,
  filepaths: string[],
  dryRun = false
) {
  console.log("Getting last tag");
  const lastTag = await getLastTag();

  if (!lastTag.tags?.length) {
    console.error("No tags found");
    return;
  } else {
    console.log("Last tag", lastTag);
  }

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

  const numCols = 3;
  const appendText = createMarkdownTable(filepaths, hash, numCols);

  // Find the version entry and update it with the append text
  changelog = changelog.replace(versionRegex, `$1\n${appendText}`);

  // Write the updated changelog back to the file
  if (!dryRun) {
    writeFileSync(changelogPath, changelog, "utf8");
    // have to move the tags
    const command = `git add apps/web-ui/CHANGELOG.md && git commit --amend --no-edit`;
    const { stdout } = await execAsync(command);
    console.log(stdout);

    console.log(`moving tags ${lastTag.tags} on commit ${lastTag.commit}`);
    await removeTag(lastTag.tags);
    const newCommit = await getLastTag();
    if (newCommit.commit) {
      await addTag(newCommit.commit, lastTag.tags);
    } else {
      console.error("did not find a commit to tag");
    }
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
