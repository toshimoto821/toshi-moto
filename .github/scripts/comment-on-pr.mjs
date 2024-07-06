// .github/scripts/comment-on-pr.mjs
import { getOctokit, context } from "@actions/github";
import * as core from "@actions/core";

const githubToken = core.getInput("github-token");
const octokit = getOctokit(githubToken);

const issueComment = context.issue;
const commentBody =
  core.getInput("comment-body") ||
  "Automated comment from GitHub Actions workflow.";

await octokit.rest.issues.createComment({
  ...issueComment,
  body: commentBody,
});
