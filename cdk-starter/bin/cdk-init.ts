#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import * as dotenv from "dotenv";
dotenv.config();

const { APP_NAME, STAGE, AWS_ACCOUNT, AWS_REGION } = process.env;
if (!APP_NAME || !STAGE || !AWS_ACCOUNT || !AWS_REGION) {
  throw new Error("Missing required environment variables");
}

const app = new cdk.App();
new AppStack(app, `${STAGE}-${APP_NAME}`, {
  env: {
    region: AWS_REGION,
    account: AWS_ACCOUNT,
  },
});
