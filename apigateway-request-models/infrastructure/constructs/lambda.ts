import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly exampleLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // const {  } = props;

    this.exampleLambda = new NodejsFunction(this, 'exampleLambda', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/example.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
    });
  }
}
