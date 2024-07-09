import { readFileSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import { cwd } from "process";

import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

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
  const tag = /tag:\s([^\\)]+)/.exec(lines[0]);
  const commit = /commit\s(\w+)\s/.exec(lines[0]);

  return {
    tag: tag?.[1],
    commit: commit?.[1],
  };
}

export async function removeTag(tag: string) {
  const command = `git tag -d ${tag}`;
  const { stdout } = await execAsync(command);

  return stdout;
}

export async function addTag(hash: string, tag: string) {
  const command = `git tag ${tag} ${hash}`;
  const { stdout } = await execAsync(command);

  return stdout;
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

  if (!lastTag.tag) {
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
    // have to move the tags
    const command = `git add apps/web-ui/CHANGELOG.md && git commit --amend --no-edit`;
    const { stdout } = await execAsync(command);
    console.log(stdout);

    console.log(`moving tag ${lastTag.tag} on commit ${lastTag.commit}`);
    await removeTag(lastTag.tag);
    const newCommit = await getLastTag();
    if (newCommit.commit) {
      await addTag(newCommit.commit, lastTag.tag);
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
