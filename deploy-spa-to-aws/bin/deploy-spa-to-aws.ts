#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeploySpaToAwsStack } from '../lib/deploy-spa-to-aws-stack';

const app = new cdk.App();
new DeploySpaToAwsStack(app, 'DeploySpaToAwsStack', {
  env: { account: '725077116981', region: 'us-west-2' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
