import * as cdk from 'aws-cdk-lib';
import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Lambda } from './constructs/lambda';
import { Api } from './constructs/api';

export type ApiProps = {
  lambdaAuthorizer: aws_lambda_nodejs.NodejsFunction;
  helloWorldLambda: aws_lambda_nodejs.NodejsFunction;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { lambdaAuthorizer, helloWorldLambda } = new Lambda(
      this,
      `lambda`,
      {}
    );

    // api depends on lambda
    new Api(this, 'api', { lambdaAuthorizer, helloWorldLambda } as ApiProps);
  }
}
