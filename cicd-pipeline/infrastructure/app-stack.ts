import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { APP_NAME } = this.node.tryGetContext(BRANCH);

    new NodejsFunction(this, 'exampleFunction', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../src/lambdas/example/index.ts`),
      bundling: {
        minify: true,
      },
    });

    // CFN OUTPUTS
    new cdk.CfnOutput(this, 'APP_NAME', {
      value: APP_NAME,
    });
  }
}
