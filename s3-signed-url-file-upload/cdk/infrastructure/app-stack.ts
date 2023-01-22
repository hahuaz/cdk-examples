import * as cdk from 'aws-cdk-lib';
import { aws_s3 } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { StorageConstruct } from './constructs/storage';

export type LambdaConstructProps = {
  MY_BUCKET: aws_s3.Bucket;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { myBucket } = new StorageConstruct(this, 'storage', {});

    // lambda depends on storage
    const { signedUrlCreator } = new LambdaConstruct(this, `lambda`, {
      MY_BUCKET: myBucket,
    } as LambdaConstructProps);
  }
}
