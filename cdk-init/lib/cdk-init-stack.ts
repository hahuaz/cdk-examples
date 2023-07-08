import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 } from 'aws-cdk-lib';

export class CdkInitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // BUCKETS
    const mybucket = new aws_s3.Bucket(this, 'mybucket2', {
      publicReadAccess: true,
      blockPublicAccess: new aws_s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
