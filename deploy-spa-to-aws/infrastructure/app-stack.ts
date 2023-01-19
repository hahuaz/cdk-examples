import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  aws_s3,
  aws_cloudfront,
  aws_lambda_nodejs,
  aws_lambda,
  aws_cloudfront_origins,
  aws_certificatemanager,
} from 'aws-cdk-lib';

export class DeploySpaToAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const siteBucket = new aws_s3.Bucket(this, 'siteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const cachePolicy = new aws_cloudfront.CachePolicy(this, 'cachePolicy', {
      defaultTtl: cdk.Duration.days(0),
      minTtl: cdk.Duration.minutes(0),
      maxTtl: cdk.Duration.days(0),
    });

    const responsePolicy = new aws_cloudfront.ResponseHeadersPolicy(
      this,
      'responsePolicy',
      {
        // TODO activate browser cache
        // customHeadersBehavior: {
        //   customHeaders: [
        //     {
        //       header: 'Cache-Control',
        //       value: 'max-age=2592000',
        //       override: true,
        //     },
        //   ],
        // },
        corsBehavior: {
          accessControlAllowOrigins: ['*'],
          accessControlAllowMethods: ['HEAD', 'GET', 'OPTIONS'],
          accessControlAllowHeaders: ['*'],
          originOverride: true,
          accessControlAllowCredentials: false,
        },
      }
    );

    const siteBucketOrigin = new aws_cloudfront_origins.S3Origin(siteBucket);

    const siteBucketDist = new aws_cloudfront.Distribution(
      this,
      'siteBucketDist',
      {
        defaultBehavior: {
          origin: siteBucketOrigin,
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cachePolicy,
          responseHeadersPolicy: responsePolicy,
        },
        additionalBehaviors: {},
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      }
    );

    // CFN OUTPUTS
    new cdk.CfnOutput(this, 'siteBucketUrl', {
      value: siteBucket.s3UrlForObject(),
      description: 'The siteBucket S3 URL',
    });
    new cdk.CfnOutput(this, 'siteBucketDistDomain', {
      value: siteBucketDist.distributionDomainName,
      description: 'The domain name of siteBucketDist',
    });
  }
}
