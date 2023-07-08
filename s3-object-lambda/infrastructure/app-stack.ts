import * as cdk from 'aws-cdk-lib';
import { aws_s3, aws_s3objectlambda, aws_iam } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { StorageConstruct } from './constructs/storage';

export type LambdaConstructProps = any;
export type StorageConstructProps = any;

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { mybucket } = new StorageConstruct(
      this,
      'storage',
      {} as StorageConstructProps
    );

    const { thumbnailCreator } = new LambdaConstruct(
      this,
      `lambda`,
      {} as LambdaConstructProps
    );

    // Restrict Lambda to be invoked from own account
    thumbnailCreator.addPermission('invocationRestriction', {
      action: 'lambda:InvokeFunction',
      principal: new aws_iam.AccountRootPrincipal(),
      sourceAccount: cdk.Aws.ACCOUNT_ID,
    });

    // Allow lambda to read and write to access point
    thumbnailCreator.addToRolePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3-object-lambda:WriteGetObjectResponse'],
        resources: ['*'],
      })
    );

    // Create S3 access point
    const s3AccessPoint = new aws_s3.CfnAccessPoint(this, 's3AccessPoint', {
      bucket: mybucket.bucketName,
    });

    // Associate s3 access point with lambda
    const objectLambdaAccessPoint = new aws_s3objectlambda.CfnAccessPoint(
      this,
      'objectLambdaAccessPoint',
      {
        objectLambdaConfiguration: {
          supportingAccessPoint: s3AccessPoint.attrArn,
          transformationConfigurations: [
            {
              actions: ['GetObject'],
              contentTransformation: {
                AwsLambda: {
                  FunctionArn: `${thumbnailCreator.functionArn}`,
                },
              },
            },
          ],
        },
      }
    );

    new cdk.CfnOutput(this, 'objectLambdaAccessPointArn', {
      value: objectLambdaAccessPoint.attrArn,
      description: 'This arn can be used to access the object lambda.',
    });
  }
}
