import { exec } from "child_process";
import { promisify } from "util";

import { injectImagesToChangelog } from "./injectImagesToChangelog";
import { updateImagesForProject } from "./updateImagesForProject";

const execAsync = promisify(exec);

type IOpts = {
  sha: string;
  files: string[];
  projectId: string;
  clientId?: string;
  clientSecret?: string;
  dryRun?: boolean;
};

type IResponse = {
  command: string;
  stdout: string;
};

/**
 * @param {string} sha -  the sha of the commit to point the image links to
 * @param {string} files - the file paths to the images
 * @param {boolean} dryRun - run without editing
 */
export async function changelogAndVersion(opts: IOpts) {
  const dryRun = opts.dryRun ? "--dry-run" : "";
  const { files, sha } = opts;
  const resp: IResponse[] = [];



  try {
    // Run @jscutlery/semver:version with --dry-run
    const command = `nx run web-ui:semver ${dryRun} --verbose`;
    const { stdout } = await execAsync(command);

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

    // const task = `nx changelog scripts ${nextVersion} ${sha} "${files.join(
    //   ","
    // )}" ${dryRun}`;
    // const { stdout: logStdOut } = await execAsync(task);
    // console.log(logStdOut);
    const newSha = await injectImagesToChangelog(nextVersion, sha, files, opts.dryRun);
    console.log("newSha", newSha);
    if (newSha) {
      await updateImagesForProject(opts.projectId, {
        find: {
          commitSha: sha,
        },
        update: {
          commitSha: newSha,
          tags: [nextVersion, "release"],
        }
      },
        {
          clientId: opts.clientId as string,
          clientSecret: opts.clientSecret as string,
        }
      );
    }
    console.log(`Changelog updated for version ${nextVersion}`);
  } catch (error) {
    console.log(error);
  }

  return resp;
}
