import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly ipCheckerLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // const { } = props;
    // const BRANCH = this.node.tryGetContext('BRANCH');
    // const { APP_REGION } = this.node.tryGetContext(BRANCH);

    this.ipCheckerLambda = new NodejsFunction(this, 'ipCheckerLambda', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/ip-checker.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
    });
  }
}
