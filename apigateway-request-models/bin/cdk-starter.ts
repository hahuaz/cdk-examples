#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config();

const { AWS_ACCOUNT, AWS_REGION } = process.env;

import AppStack from '../infrastructure/app-stack';

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME } = app.node.tryGetContext(BRANCH);

new AppStack(app, APP_NAME, {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
