import * as cdk from 'aws-cdk-lib';
import { aws_secretsmanager, aws_rds, aws_ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { StoreConstructProps } from '../app-stack';

export class StoreConstruct extends Construct {
  public readonly rdsCredentials: aws_secretsmanager.Secret;
  public readonly rdsInstance: aws_rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: StoreConstructProps) {
    super(scope, id);

    const { vpc } = props;

    this.rdsCredentials = new aws_secretsmanager.Secret(
      this,
      `rdsCredentials`,
      {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'postgres', // rds only accepts "username" prop
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password', // rds only accepts "password" prop
        },
      }
    );

    this.rdsInstance = new aws_rds.DatabaseInstance(this, `rds`, {
      databaseName: 'postgres',
      engine: aws_rds.DatabaseInstanceEngine.postgres({
        version: aws_rds.PostgresEngineVersion.VER_14_3,
      }),
      instanceType: aws_ec2.InstanceType.of(
        aws_ec2.InstanceClass.T4G,
        aws_ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        // RDS either should be in private subnet or SG shouldn't allow public access
        subnetType: aws_ec2.SubnetType.PUBLIC,
      },
      allocatedStorage: 20,
      maxAllocatedStorage: 50,
      securityGroups: [
        new aws_ec2.SecurityGroup(this, 'rdsSG', {
          vpc,
          allowAllOutbound: false,
        }),
      ],
      credentials: aws_rds.Credentials.fromSecret(this.rdsCredentials), // Get both username and password from existing secret
      multiAz: false,
    });

    // OUTPUTS
    new cdk.CfnOutput(this, 'dbInstanceEndpointAddress', {
      value: this.rdsInstance.dbInstanceEndpointAddress,
      description: 'dbInstanceEndpointAddress',
    });
  }
}
