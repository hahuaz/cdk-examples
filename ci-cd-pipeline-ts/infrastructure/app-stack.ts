import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const branch = this.node.tryGetContext('branch');
    const { region } = this.node.tryGetContext(branch);

    const myFunction = new NodejsFunction(this, 'my-function', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'main',
      entry: path.join(__dirname, `/../src/lambdas/example/index.ts`),
      bundling: {
        minify: true,
      },
      environment: {
        APP_REGION: region,
      },
    });
  }
}
