// .github/scripts/comment-on-pr.mjs
import { getOctokit, context } from "@actions/github";
import * as core from "@actions/core";

const githubToken = process.env.GITHUB_TOKEN;
const octokit = getOctokit(githubToken);

const issueComment = context.issue;
const commentBody =
  process.env.COMMENT_BODY || "Automated comment from GitHub Actions workflow.";

await octokit.rest.issues.createComment({
  ...issueComment,
  body: commentBody,
});
