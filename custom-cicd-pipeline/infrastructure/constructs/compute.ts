import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_autoscaling as autoscaling,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ComputeConstructProps } from '../app-stack';

export class ComputeConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly autoScalingGroup: autoscaling.AutoScalingGroup;
  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id);

    // const { } = props;

    this.vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: `${id}publicSubnet`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const ec2sg = new ec2.SecurityGroup(this, 'ec2sg', {
      vpc: this.vpc,
      allowAllOutbound: true, // will let your instance send outboud traffic
    });
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080));
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    ec2sg.addIngressRule(
      ec2.Peer.anyIpv4(), // TODO use your ip adresss
      ec2.Port.tcp(22) // open the SSH port
    );

    this.autoScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      'autoScalingGroup',
      {
        vpc: this.vpc,
        minCapacity: 1,
        maxCapacity: 1,
        desiredCapacity: 1,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T4G,
          ec2.InstanceSize.NANO
        ),
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        securityGroup: ec2sg,
        machineImage: new ec2.AmazonLinuxImage({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
          cpuType: ec2.AmazonLinuxCpuType.ARM_64,
        }),
        keyName: new ec2.CfnKeyPair(this, 'MyKeyPair', {
          keyName: `${id}-key-pair`,
        }).keyName,

        userData: ec2.UserData.custom(`
        #!/bin/bash
        echo "Hello, World!" >> /var/log/mylog.txt        
        `),
      }
    );
    // TODO give least privilege to the instance
    this.autoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
    );
  }
}
