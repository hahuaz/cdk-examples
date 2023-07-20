import * as cdk from 'aws-cdk-lib';
import { aws_ec2 } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { ComputeConstruct } from './constructs/compute';
import { StoreConstruct } from './constructs/store';

export type ComputeConstructProps = {
  rdsInstance: cdk.aws_rds.DatabaseInstance;
  rdsCredentials: cdk.aws_secretsmanager.Secret;
  vpc: aws_ec2.Vpc;
};

export type StoreConstructProps = {
  vpc: aws_ec2.Vpc;
};

export default class AppStack extends cdk.Stack {
  public readonly vpc: aws_ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const { } = props;

    this.vpc = new aws_ec2.Vpc(this, 'djangoVpc', {
      maxAzs: 2, // Min two is required to work with ELB
      subnetConfiguration: [
        {
          name: `${id}publicSubnet`,
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          name: 'djangoPrivate',
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const { rdsCredentials, rdsInstance } = new StoreConstruct(this, 'store', {
      vpc: this.vpc,
    } as StoreConstructProps);

    new ComputeConstruct(this, 'compute', {
      rdsInstance,
      rdsCredentials,
      vpc: this.vpc,
    } as ComputeConstructProps);
  }
}
