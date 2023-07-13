import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { LambdaConstructProps } from '../app-stack';

export class LambdaConstruct extends Construct {
  public readonly messageHandler: NodejsFunction;
  public readonly connectionHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const { connectionsTable } = props;

    this.connectionHandler = new NodejsFunction(this, 'connectionHandler', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/connection-handler.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(this.connectionHandler);

    this.messageHandler = new NodejsFunction(this, 'messageHandler', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../../lambdas/message-handler.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(this.messageHandler);
    this.messageHandler.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonAPIGatewayInvokeFullAccess'
      )
    );
  }
}
