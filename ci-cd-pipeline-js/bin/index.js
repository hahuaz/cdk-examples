#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { PipelineStack } = require('../lib/pipeline-stack');
const { getContextValues } = require('../lib/helpers');

const app = new cdk.App();
const { appName, branch, account, region } = getContextValues(app.node);

if (!appName) throw new Error('appName is not provided!');

if (!account || !region)
  throw new Error('env variables ACCOUNT and REGION are not provided!');

new PipelineStack(app, `${appName}-${branch}-pipelineStack`, {
  env: {
    account,
    region,
  },
});

app.synth();
