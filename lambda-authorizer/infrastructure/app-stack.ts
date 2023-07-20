import * as cdk from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { ApiConstruct } from './constructs/api';

export type LambdaConstructProps = any;
export type ApiConstructProps = {
  lambdaAuthorizer: aws_lambda_nodejs.NodejsFunction;
  helloWorldLambda: aws_lambda_nodejs.NodejsFunction;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { lambdaAuthorizer, helloWorldLambda } = new LambdaConstruct(
      this,
      `lambda`,
      {}
    );

    // API construct depends on Lambda construct
    new ApiConstruct(this, 'api', {
      lambdaAuthorizer,
      helloWorldLambda,
    } as ApiConstructProps);
  }
}
