import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_codebuild as codebuild,
  aws_codecommit as codecommit,
  aws_codepipeline as codepipeline,
  aws_codepipeline_actions as codepipeline_actions,
  aws_codedeploy as codedeploy,
  aws_iam as iam,
  aws_autoscaling as autoscaling,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

// import { ComputeConstruct } from './constructs/compute';

export type ComputeConstructProps = any;

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const { CODECOMMIT_REPO_NAME } = process.env;
    // if (!CODECOMMIT_REPO_NAME) {
    //   throw new Error('There is at least one environment variable undefined!');
    // }

    const CODECOMMIT_REPO_NAME = 'custom-cicd-pipeline';

    const nextBuildBucket = new cdk.aws_s3.Bucket(this, 'nextBuildBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    new cdk.CfnOutput(this, 's3SiteArtifactsArn', {
      value: nextBuildBucket.bucketName,
    });
    const sourceOutput = new codepipeline.Artifact('sourceOutput');
    const buildOutput = new codepipeline.Artifact('buildOutput');

    const vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 2, // min two is required to work with ELB and high availibility
      subnetConfiguration: [
        {
          // cidrMask: 16,
          name: `${id}publicSubnet`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
      // enable the DNS support and DNS hostnames as it’s required to use VPC endpoints.
      // enableDnsHostnames:true,
      // enableDnsSupport: true,
    });

    // new ComputeConstruct(this, `lambda`, {} as ComputeConstructProps);

    const ec2sg = new ec2.SecurityGroup(this, 'ec2sg', {
      vpc,
      allowAllOutbound: true, // will let your instance send outboud traffic
    });

    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080));
    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    ec2sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    // open the SSH port
    ec2sg.addIngressRule(
      ec2.Peer.anyIpv4(), // TODO your home ip adresss
      ec2.Port.tcp(22)
    );

    // Configure Auto Scaling
    const autoScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      'MyAutoScalingGroup',
      {
        vpc,
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
        role: new iam.Role(this, 'AutoScalingRole', {
          assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              'AmazonS3ReadOnlyAccess' // Provide read-only access to S3
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitReadOnly'),
          ],
        }),
        userData: ec2.UserData.custom(`
        #!/bin/bash
        echo "Hello, World!" >> /var/log/mylog.txt        
        `),
      }
    );

    const codeBuildProject = new codebuild.Project(this, 'MyProject', {
      role: new cdk.aws_iam.Role(this, 'codebuildRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AdministratorAccess' // TODO give least privilege to the codebuild role
          ),
        ],
      }),
      environment: {
        computeType: codebuild.ComputeType.LARGE,
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromAsset('buildspec.yml'),
    });

    const codeDeploymentGroup = new codedeploy.ServerDeploymentGroup(
      this,
      'DeployGroup',
      {
        application: new codedeploy.ServerApplication(
          this,
          'DeployApplication'
        ),
        role: new iam.Role(this, 'DeployServiceRole', {
          assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              'AdministratorAccess' // TODO give least privilege to the codebuild role
            ),
          ],
        }),
        deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
        ec2InstanceTags: new codedeploy.InstanceTagSet({
          app: ['next-app'],
        }),
        autoScalingGroups: [autoScalingGroup],
        installAgent: true,
      }
    );

    const codeCommitRepo = codecommit.Repository.fromRepositoryName(
      this,
      'codeCommitRepo',
      CODECOMMIT_REPO_NAME
    );
    const pipeline = new codepipeline.Pipeline(this, 'MyPipeline', {
      crossAccountKeys: false,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: 'CodeCommit',
              repository: codeCommitRepo,
              branch: 'dev',
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              input: sourceOutput,
              project: codeBuildProject,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CodeDeployServerDeployAction({
              actionName: 'Deploy',
              input: buildOutput,
              deploymentGroup: codeDeploymentGroup,
            }),
          ],
        },
      ],
    });
  }
}
