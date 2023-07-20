import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, aws_lambda_nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly lambdaAuthorizer: aws_lambda_nodejs.NodejsFunction;
  public readonly helloWorldLambda: aws_lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.lambdaAuthorizer = new aws_lambda_nodejs.NodejsFunction(
      this,
      'lambdaAuthorizer',
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: path.join(__dirname, `/../../lambdas/lambda-authorizer.ts`),
      }
    );
    this.helloWorldLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'helloWorldLambda',
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: path.join(__dirname, `/../../lambdas/hello-world.ts`),
      }
    );
  }
}
