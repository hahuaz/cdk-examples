import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { aws_lambda, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { LambdaConstructProps } from "../app-stack";

export class LambdaConstruct extends Construct {
  public readonly signedUrlCreator: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const { MY_BUCKET } = props;

    this.signedUrlCreator = new NodejsFunction(this, "signed-url-creator", {
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, `/../../lambdas/signed-url-creator/index.ts`),
      environment: {
        MY_BUCKET_NAME: MY_BUCKET.bucketName,
      },
    });

    MY_BUCKET.grantWrite(this.signedUrlCreator);

    const signedUrlCreatorUrl = this.signedUrlCreator.addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE,
    });

    // CFN OUTPUTS
    new CfnOutput(this, "signedUrlCreatorUrl.url", {
      value: signedUrlCreatorUrl.url,
    });
  }
}
