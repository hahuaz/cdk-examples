import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { LambdaConstruct } from './constructs/lambda';
import { ApiConstruct } from './constructs/api';

export type ApiConstructProps = {
  exampleLambda: NodejsFunction;
};

export type LambdaConstructProps = any;

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { exampleLambda } = new LambdaConstruct(
      this,
      'lambda',
      {} as LambdaConstructProps
    );
    new ApiConstruct(this, 'api', {
      exampleLambda,
    } as ApiConstructProps);
  }
}
