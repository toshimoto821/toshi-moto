import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runVersionAndUpdateChangelog() {
  const dryRun = "--dry-run";
  try {
    // Run @jscutlery/semver:version with --dry-run
    const { stdout } = await execAsync(`nx run web-ui:version ${dryRun}`);
    console.log(stdout);

    // Extract the next version number from the output
    // Adjust the regex based on the actual output format
    const match = stdout.match(/new\sversion\s"(\d+\.\d+\.\d+)"/);
    if (!match) {
      console.error("Version number not found.");
      return;
    }
    const nextVersion = match[1];

    // Assuming you have a changelog task that can be run with the version number
    // Replace `your-changelog-task` with your actual changelog task command
    const files = [
      "apps/web-ui-e2e/cypress/screenshots/app.cy.ts/web-ui-e2e -- Hero.png",
    ];
    const sha = "a690bbdc65566e3a5e4bba8ae37acfab6608604a";
    const task = `nx changelog scripts ${nextVersion} ${sha} "${files.join(
      ","
    )}" ${dryRun}`;
    const { stdout: logStdOut } = await execAsync(task);
    console.log(logStdOut);
    console.log(`Changelog updated for version ${nextVersion}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Replace 'your-project' with the actual name of your project
runVersionAndUpdateChangelog();
