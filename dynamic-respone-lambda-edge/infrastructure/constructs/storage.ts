import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3, aws_ssm } from 'aws-cdk-lib';

import { StorageConstructProps } from '../app-stack';

export class StorageConstruct extends Construct {
  public readonly siteBucket: aws_s3.Bucket;
  public readonly ipgeolocationKeyParam: aws_ssm.StringParameter;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    // const {  } = props;
    // const BRANCH = this.node.tryGetContext('BRANCH');
    // const { APP_REGION } =
    //   this.node.tryGetContext(BRANCH);
    if (!process.env.IPGEOLOCATION_KEY)
      throw new Error('IPGEOLOCATION_KEY is not defined');

    // BUCKETS
    this.siteBucket = new aws_s3.Bucket(this, 'siteBucket', {
      publicReadAccess: true,
      blockPublicAccess: new aws_s3.BlockPublicAccess({
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        blockPublicAcls: true,
        ignorePublicAcls: true,
      }),
      websiteIndexDocument: 'index.html',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.ipgeolocationKeyParam = new aws_ssm.StringParameter(
      this,
      'ipgeolocationKeyParam',
      {
        parameterName: 'ipgeolocationKey',
        description: 'ipgeolocationKey will be used in lambda@edge',
        stringValue: process.env.IPGEOLOCATION_KEY,
        // allowedPattern: '.*',
      }
    );
  }
}
