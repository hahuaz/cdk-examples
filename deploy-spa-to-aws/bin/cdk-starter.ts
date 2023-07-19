#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config();

import { DeploySpaToAwsStack } from '../infrastructure/app-stack';

const { AWS_ACCOUNT, AWS_REGION } = process.env;

const app = new cdk.App();
new DeploySpaToAwsStack(app, 'DeploySpaToAwsStack', {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
