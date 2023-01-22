#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import AppStack from '../infrastructure/app-stack';

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME, ACCOUNT, APP_REGION } = app.node.tryGetContext(BRANCH);

new AppStack(app, APP_NAME, {
  env: { account: ACCOUNT, region: APP_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
