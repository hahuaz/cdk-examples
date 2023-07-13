import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { ApiConstruct } from './constructs/api';
import { StorageConstruct } from './constructs/storage';

export type LambdaConstructProps = {
  connectionsTable: cdk.aws_dynamodb.Table;
};
export type StorageConstructProps = any;

export type ApiConstructProps = {
  messageHandler: NodejsFunction;
  connectionHandler: NodejsFunction;
};

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { connectionsTable } = new StorageConstruct(
      this,
      'storage',
      {} as StorageConstructProps
    );

    const { messageHandler, connectionHandler } = new LambdaConstruct(
      this,
      'lambda',
      {
        connectionsTable,
      } as LambdaConstructProps
    );
    const { webSocketApi } = new ApiConstruct(this, 'api', {
      messageHandler,
      connectionHandler,
    } as ApiConstructProps);
  }
}
