#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config();

import AppStack from '../infrastructure/app-stack';
import OrderMicroserviceStack from '../infrastructure/order-microservice-stack';

const { AWS_ACCOUNT, AWS_REGION } = process.env;

const app = new cdk.App();
const BRANCH = app.node.tryGetContext('BRANCH');
const { APP_NAME } = app.node.tryGetContext(BRANCH);

const appStack = new AppStack(app, APP_NAME, {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

const microserviceStack = new OrderMicroserviceStack(app, 'order-micro', {
  env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

microserviceStack.addDependency(appStack);
