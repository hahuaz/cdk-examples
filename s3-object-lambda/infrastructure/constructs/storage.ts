import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 } from 'aws-cdk-lib';

import { StorageConstructProps } from '../app-stack';

export class StorageConstruct extends Construct {
  public readonly mybucket: aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    // const {  } = props;
    // const BRANCH = this.node.tryGetContext('BRANCH');
    // const { APP_REGION } =
    //   this.node.tryGetContext(BRANCH);

    // BUCKETS
    this.mybucket = new aws_s3.Bucket(this, 'mybucket', {
      publicReadAccess: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [
            aws_s3.HttpMethods.GET,
            aws_s3.HttpMethods.HEAD,
            aws_s3.HttpMethods.POST,
          ],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
