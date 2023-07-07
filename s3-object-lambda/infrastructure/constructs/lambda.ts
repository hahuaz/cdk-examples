import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly thumbnailCreator: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // const { } = props;
    // const BRANCH = this.node.tryGetContext('BRANCH');
    // const { APP_REGION } = this.node.tryGetContext(BRANCH);

    this.thumbnailCreator = new NodejsFunction(this, 'thumbnailCreator', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/thumbnail-creator.ts`),
      bundling: {
        minify: false,
        nodeModules: ['sharp'], // Sharp has distinct builds tailored for each operating system. When developing on a Windows machine, Sharp will generate a build that is specific to the Windows OS. However, since Lambda runs on a Linux OS, you must create a build that is compatible with it.
        forceDockerBundling: true, // force docker bundling for sharp
      },
    });
  }
}
