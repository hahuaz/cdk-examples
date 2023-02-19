import * as cdk from 'aws-cdk-lib';
import { pipelines, aws_codecommit } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { AppStack } from './app-stack';

/**
 * Stage may consist of one or more stacks according to your app's need.
 * But using one stack which includes compute, storage, and api constructs to group the resources is recommended.
 */
class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const branch = this.node.tryGetContext('branch');
    const { appName } = this.node.tryGetContext(branch);

    new AppStack(this, appName);
  }
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const branch = this.node.tryGetContext('branch');
    const { repoName } = this.node.tryGetContext(branch);

    const repo = aws_codecommit.Repository.fromRepositoryName(
      this,
      'CodeCommitRepo',
      repoName
    );

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      crossAccountKeys: false,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repo, branch),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    if (branch !== 'prod') {
      /**
       * A CloudFormation stack will be deployed for your app-stack.
       * Stack name will be AppStage.id+AppStack.id and names of all
       * deployed resources will have this naming pattern: AppStage.id+AppStack.id+Resource.id.
       */
      pipeline.addStage(new AppStage(this, branch));
    } else {
      pipeline.addStage(new AppStage(this, 'preProd'));

      // TODO add testing after preProd

      pipeline.addStage(new AppStage(this, 'prod'));
    }
  }
}
