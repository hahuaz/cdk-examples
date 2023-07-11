import fs from 'fs';
import { CodeCommit } from 'aws-sdk';

const codeCommitClient = new CodeCommit();

const cdkJson = fs.readFileSync('cdk.json', 'utf8');
const { context } = JSON.parse(cdkJson);
const { BRANCH } = context;
const { REPO_NAME } = context[BRANCH];

test('repo-exists', async () => {
  try {
    await codeCommitClient
      .getBranch({ repositoryName: REPO_NAME, branchName: BRANCH })
      .promise();
  } catch (error) {
    throw new Error(
      `Branch ${BRANCH} doesn't exist on CodeCommit repository '${REPO_NAME}'\n${error}`
    );
  }
});
