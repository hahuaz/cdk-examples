import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_ecs as ecs,
  aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ComputeConstructProps } from '../app-stack';

export class ComputeConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id);

    const { HOME_IP } = process.env;
    if (!HOME_IP) {
      throw new Error('There is at least one undefined environment variable!');
    }
    const { vpc, rdsCredentials, rdsInstance } = props;

    // https://github.com/briancaffey/django-postgres-vue-gitlab-ecs/blob/206747c230ff8343197ddacc762f289f4083fccd/awscdk/awscdk/backend_tasks.py
    // TODO we add the VPC endpoints for all the managed services being used in our design, which otherwise would require internet outgoing traffic (and then NAT gateways):

    const cluster = new ecs.Cluster(this, 'djangoCluster', {
      vpc,
    });

    // create migration def
    const migrateDef = new ecs.FargateTaskDefinition(this, 'migrateDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      ephemeralStorageGiB: 21,
    });
    migrateDef.addContainer('migrateCont', {
      image: ecs.ContainerImage.fromAsset('./django'),
      memoryLimitMiB: 512,
      secrets: {
        DB_NAME: ecs.Secret.fromSecretsManager(rdsCredentials, 'dbname'),
        DB_USER: ecs.Secret.fromSecretsManager(rdsCredentials, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsCredentials, 'password'),
      },
      environment: {
        DB_HOST: rdsInstance.dbInstanceEndpointAddress,
      },
      command: ['python3', 'manage.py', 'migrate', '--no-input'],
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'django-migration',
      }),
    });

    // create webApp def
    const webAppDef = new ecs.FargateTaskDefinition(this, 'webAppDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      ephemeralStorageGiB: 21,
    });
    const webAppCont = webAppDef.addContainer('webAppCont', {
      image: ecs.ContainerImage.fromAsset('./django'),
      memoryLimitMiB: 512,
      secrets: {
        DB_NAME: ecs.Secret.fromSecretsManager(rdsCredentials, 'dbname'),
        DB_USER: ecs.Secret.fromSecretsManager(rdsCredentials, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsCredentials, 'password'),
      },
      environment: {
        DB_HOST: rdsInstance.dbInstanceEndpointAddress,
      },
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'django-webapp',
      }),
      portMappings: [
        {
          containerPort: 80,
        },
      ],
    });

    const fargateSG = new ec2.SecurityGroup(this, 'fargateSG', {
      vpc,
    });
    rdsInstance.connections.allowFrom(
      ec2.Peer.ipv4(`${HOME_IP}/32`),
      ec2.Port.tcp(5432),
      'Allow inbound from home'
    );
    rdsInstance.connections.allowFrom(
      fargateSG,
      ec2.Port.tcp(5432),
      'Allow inbound from Fargate'
    );
    const webService = new ecs.FargateService(this, 'webService', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [fargateSG],
      cluster,
      taskDefinition: webAppDef,
      desiredCount: 1,
      assignPublicIp: true, // if it's set to false, task creation of cluster will fail and report "unable to pull secrets or registry auth"
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true,
    });
    const listener = lb.addListener('HttpListener', {
      port: 80,
    });

    webService.registerLoadBalancerTargets({
      containerName: webAppCont.containerName,
      containerPort: 80,
      newTargetGroupId: 'ECS',
      listener: ecs.ListenerConfig.applicationListener(listener, {
        protocol: elbv2.ApplicationProtocol.HTTP,
      }),
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: lb.loadBalancerDnsName,
      description: 'lb.loadBalancerDnsName',
    });
  }
}
