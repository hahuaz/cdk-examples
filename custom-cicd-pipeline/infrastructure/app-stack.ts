import * as cdk from 'aws-cdk-lib';
import {
  aws_codebuild as codebuild,
  aws_codecommit as codecommit,
  aws_codepipeline as codepipeline,
  aws_codepipeline_actions as codepipeline_actions,
  aws_codedeploy as codedeploy,
  aws_iam as iam,
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { ComputeConstruct } from './constructs/compute';

export type ComputeConstructProps = any;

export default class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const {  } = process.env;
    const CODECOMMIT_REPO_NAME = 'custom-cicd-pipeline';
    const CODECOMMIT_BRANCH_NAME = 'dev';

    const { autoScalingGroup } = new ComputeConstruct(
      this,
      `compute`,
      {} as ComputeConstructProps
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
      buildSpec: codebuild.BuildSpec.fromAsset('frontend/buildspec.yml'), // if content of the file is changed, stack needs to be redeployed. Otherwise pipeline will use the old version.
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

    const sourceArtifact = new codepipeline.Artifact('sourceArtifact');
    const buildArtifact = new codepipeline.Artifact('buildArtifact');
    new codepipeline.Pipeline(this, 'MyPipeline', {
      crossAccountKeys: false,
      stages: [
        {
          stageName: 'CodeCommit',
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: 'CodeCommit',
              repository: codecommit.Repository.fromRepositoryName(
                this,
                'codeCommitRepo',
                CODECOMMIT_REPO_NAME
              ),
              branch: CODECOMMIT_BRANCH_NAME,
              output: sourceArtifact,
            }),
          ],
        },
        {
          stageName: 'CodeBuild',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              input: sourceArtifact,
              project: codeBuildProject,
              outputs: [buildArtifact],
            }),
          ],
        },
        {
          stageName: 'CodeDeploy',
          actions: [
            new codepipeline_actions.CodeDeployServerDeployAction({
              actionName: 'CodeDeploy',
              input: buildArtifact,
              deploymentGroup: codeDeploymentGroup,
            }),
          ],
        },
      ],
    });
  }
}
