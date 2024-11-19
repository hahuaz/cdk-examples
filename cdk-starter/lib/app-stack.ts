import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 } from "aws-cdk-lib";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const siteBucket = new aws_s3.Bucket(this, "siteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Output the website URL
    new cdk.CfnOutput(this, "siteBucketWebsiteURL", {
      value: siteBucket.bucketWebsiteUrl,
      description:
        "The URL of the S3 static website hosting for the 'site' bucket",
      exportName: "siteBucketWebsiteURL",
    });
  }
}
