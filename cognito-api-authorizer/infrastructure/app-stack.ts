import * as cdk from "aws-cdk-lib";
import { aws_cognito, aws_lambda_nodejs } from "aws-cdk-lib";
import { Construct } from "constructs";

import { LambdaConstruct } from "./constructs/lambda";
import { ApiConstruct } from "./constructs/api";
import { CognitoConstruct } from "./constructs/cognito";

export type LambdaConstructProps = any;
export type CognitoConstructProps = any;
export type ApiConstructProps = {
  exampleLambda: aws_lambda_nodejs.NodejsFunction;
  userPool: aws_cognito.UserPool;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { exampleLambda } = new LambdaConstruct(
      this,
      `lambda`,
      {} as LambdaConstructProps
    );

    const { userPool } = new CognitoConstruct(
      this,
      `cognito`,
      {} as CognitoConstructProps
    );

    new ApiConstruct(this, `api`, {
      exampleLambda,
      userPool,
    } as ApiConstructProps);
  }
}
