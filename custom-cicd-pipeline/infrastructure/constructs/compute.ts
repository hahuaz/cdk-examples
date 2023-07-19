import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ComputeConstructProps } from '../app-stack';

export class ComputeConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id);

    // const { } = props;

    // Create a new EC2 instance
  }
}
