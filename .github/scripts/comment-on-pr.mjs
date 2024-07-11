// .github/scripts/comment-on-pr.mjs
import { getOctokit, context } from "@actions/github";
// @todo either use or remove dep
//import * as core from "@actions/core";

const githubToken = process.env.GITHUB_TOKEN;
const octokit = getOctokit(githubToken);
const issue_number = process.env.PULL_REQUEST_NUMBER;

const issueComment = context.issue;
const base = process.env.BASE;
const head = process.env.HEAD;
const GIT_STATUS_OUTPUT = process.env.GIT_STATUS_OUTPUT || "";

const images = GIT_STATUS_OUTPUT.trim().split("\n");
const data = images
  .map((part) => {
    const pieces = /(\w{1})\s"([^"]+)/.exec(part);
    if (!pieces) return null;
    return {
      type: pieces[1],
      path: pieces[2],
    };
  })
  .filter((v) => !!v);

let commentBody = "No screenshot changes detected";

if (process.env.IMAGE_CHANGES === "true") {
  commentBody = `
  Cypress Testing Results:
  [Image Commit](${process.env.COMMIT_URL})
  |BASE|HEAD|
  | --- | --- |
  ${data.map((img) => {
    const baseUrl = `https://raw.githubusercontent.com/toshimoto821/toshi-moto/${base}/${encodeURIComponent(
      img.path
    )}`;
    const headUrl = `https://raw.githubusercontent.com/toshimoto821/toshi-moto/${head}/${encodeURIComponent(
      img.path
    )}`;
    if (img.type === "M") {
      return `|![${img.type}](${baseUrl})|![${img.type}](${headUrl})|`;
    }
    if (img.type === "D") {
      return `|![${img.type}](${baseUrl})|Deleted|`;
    }

    return `|Added|![${img.type}](${headUrl})`;
  })}
  `;
}
console.log(commentBody);
await octokit.rest.issues.createComment({
  ...issueComment,
  body: commentBody,
  issue_number,
});
