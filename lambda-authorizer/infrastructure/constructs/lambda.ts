import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda_nodejs } from 'aws-cdk-lib';

export class Lambda extends Construct {
  public readonly lambdaAuthorizer: aws_lambda_nodejs.NodejsFunction;
  public readonly helloWorldLambda: aws_lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    // const {  } = props;

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { APP_REGION } = this.node.tryGetContext(BRANCH);

    this.lambdaAuthorizer = new aws_lambda_nodejs.NodejsFunction(
      this,
      'lambdaAuthorizer',
      {
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,
        handler: 'handler',
        entry: path.join(__dirname, `/../../lambdas/lambda-authorizer.ts`),
        environment: {
          APP_REGION,
        },
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
        environment: {
          APP_REGION,
        },
      }
    );
  }
}
