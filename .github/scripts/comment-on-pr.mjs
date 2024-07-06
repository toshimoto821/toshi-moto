// .github/scripts/comment-on-pr.mjs
import { getOctokit, context } from "@actions/github";
// @todo either use or remove dep
//import * as core from "@actions/core";

const githubToken = process.env.GITHUB_TOKEN;
const octokit = getOctokit(githubToken);
const issue_number = process.env.PULL_REQUEST_NUMBER;

const issueComment = context.issue;
console.log(JSON.stringify(issueComment));
const commentBody =
  process.env.COMMENT_BODY || "Automated comment from GitHub Actions workflow.";

await octokit.rest.issues.createComment({
  ...issueComment,
  body: commentBody,
  issue_number,
});
