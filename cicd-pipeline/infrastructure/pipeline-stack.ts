import * as cdk from 'aws-cdk-lib';
import {
  pipelines,
  aws_codecommit,
  aws_sns,
  aws_sns_subscriptions,
  aws_events,
  aws_events_targets,
  aws_iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from './app-stack';

/**
 * Stages are used in case your application may consist multiple stacks.
 * But using one stack with multiple constructs, such as api, storage, lambda, is recommended.
 */
class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { APP_NAME } = this.node.tryGetContext(BRANCH);

    // A cloudformation template will be deployed for your app-stack
    new AppStack(this, APP_NAME);
  }
}

export interface PipelineStackProps extends cdk.StackProps {
  deployPreStage: boolean;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const BRANCH = this.node.tryGetContext('BRANCH');
    const { REPO_NAME, PAGER_EMAIL, APP_NAME } =
      this.node.tryGetContext(BRANCH);
    const PIPELINE_NAME = `${BRANCH}-${APP_NAME}-pipeline`;

    const codeCommitRepo = aws_codecommit.Repository.fromRepositoryName(
      this,
      'codeCommitRepo',
      REPO_NAME
    );

    const codePipeline = new pipelines.CodePipeline(this, 'pipeline', {
      pipelineName: PIPELINE_NAME,
      selfMutation: true,
      crossAccountKeys: false,
      synth: new pipelines.CodeBuildStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(codeCommitRepo, BRANCH),
        commands: ['npm ci', 'npm run build', 'npm run test', 'npx cdk synth'],
        role: new aws_iam.Role(this, 'codeBuildRole', {
          assumedBy: new aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
          managedPolicies: [
            aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              'AWSCodeCommitReadOnly'
            ),
          ],
        }),
      }),
    });

    // Naming pattern of the deployed resources will be: AppStage.id+AppStack.id+Resource.id
    props?.deployPreStage ||
      codePipeline.addStage(new AppStage(this, `pre${BRANCH}`));

    codePipeline.addStage(new AppStage(this, `${BRANCH}`));

    // Notify if pipeline fails
    const failTopic = new aws_sns.Topic(this, 'PipelineFailTopic');

    failTopic.addSubscription(
      new aws_sns_subscriptions.EmailSubscription(PAGER_EMAIL)
    );

    const failEvent = new aws_events.Rule(this, 'PipelineFailedEvent', {
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: ['CodePipeline Pipeline Execution State Change'],
        detail: {
          state: ['FAILED'],
          pipeline: [PIPELINE_NAME],
        },
      },
    });

    failEvent.addTarget(
      new aws_events_targets.SnsTopic(failTopic, {
        message: aws_events.RuleTargetInput.fromText(
          `The Pipeline '${aws_events.EventField.fromPath(
            '$.detail.pipeline'
          )}' has ${aws_events.EventField.fromPath('$.detail.state')}`
        ),
      })
    );
  }
}
