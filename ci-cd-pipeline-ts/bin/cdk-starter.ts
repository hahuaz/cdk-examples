#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../infrastructure/pipeline-stack';

const app = new cdk.App();

const branch = app.node.tryGetContext('branch');
const { account, region, appName } = app.node.tryGetContext(branch);

new PipelineStack(app, `${branch}-${appName}-pipelineStack`, {
  env: {
    region,
    account,
  },
});

app.synth();
