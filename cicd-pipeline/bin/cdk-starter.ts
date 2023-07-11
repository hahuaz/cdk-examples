#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { PipelineStack } from '../infrastructure/pipeline-stack';

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME, AWS_ACCOUNT, AWS_REGION } = app.node.tryGetContext(BRANCH);

// A cloudformation template will be deployed for your pipeline-stack
new PipelineStack(app, `${BRANCH}-${APP_NAME}-pipelineStack`, {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
  deployPreStage: false,
});
