import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 } from "aws-cdk-lib";

export class StorageConstruct extends Construct {
  public readonly myBucket: aws_s3.Bucket;

  constructor(scope: Construct, id: string, _props: any) {
    super(scope, id);

    // BUCKETS
    this.myBucket = new aws_s3.Bucket(this, "my-bucket", {
      publicReadAccess: true,
      blockPublicAccess: new aws_s3.BlockPublicAccess({
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        blockPublicAcls: true,
        ignorePublicAcls: true,
      }),
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [
            aws_s3.HttpMethods.GET,
            aws_s3.HttpMethods.HEAD,
            aws_s3.HttpMethods.POST,
          ],
          allowedHeaders: ["*"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}
