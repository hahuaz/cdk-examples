import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_dynamodb } from 'aws-cdk-lib';

import { StorageConstructProps } from '../app-stack';

export class StorageConstruct extends Construct {
  public readonly connectionsTable: aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    // const {  } = props;

    this.connectionsTable = new aws_dynamodb.Table(this, 'connectionsTable', {
      partitionKey: {
        name: 'connectionId',
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // keep the table on removal from CDK
    });
  }
}
