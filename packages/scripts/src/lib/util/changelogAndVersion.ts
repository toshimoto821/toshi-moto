import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type IOpts = {
  sha: string;
  files: string[];
  dryRun?: boolean;
};

type IResponse = {
  command: string;
  stdout: string;
};
export async function changelogAndVersion(opts: IOpts) {
  const dryRun = opts.dryRun ? "--dry-run" : "";
  const { files, sha } = opts;
  const resp: IResponse[] = [];
  try {
    // Run @jscutlery/semver:version with --dry-run
    const command = `nx run web-ui:version ${dryRun}`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
    resp.push({
      command,
      stdout,
    });

    // Extract the next version number from the output
    // Adjust the regex based on the actual output format
    const match = stdout.match(/new\sversion\s"(\d+\.\d+\.\d+)"/);
    if (!match) {
      console.error("Version number not found.");
      return resp;
    }
    const nextVersion = match[1];

    // Assuming you have a changelog task that can be run with the version number
    // Replace `your-changelog-task` with your actual changelog task command

    const task = `nx changelog scripts ${nextVersion} ${sha} "${files.join(
      ","
    )}" ${dryRun}`;
    const { stdout: logStdOut } = await execAsync(task);
    console.log(logStdOut);
    resp.push({
      command: task,
      stdout: logStdOut,
    });
    console.log(`Changelog updated for version ${nextVersion}`);
  } catch (error) {
    console.error("Error:", error);
  }

  return resp;
}
