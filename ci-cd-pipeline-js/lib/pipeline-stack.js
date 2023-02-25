const cdk = require('aws-cdk-lib');
const {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} = require('aws-cdk-lib/pipelines');
const codecommit = require('aws-cdk-lib/aws-codecommit');

const { AppStage } = require('./app-stage');
const { getContextValues } = require('./helpers');

class PipelineStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { appName, branch, account, region } = getContextValues(this.node);
    const repo = codecommit.Repository.fromRepositoryName(
      this,
      'CodeCommitRepo',
      appName
    );

    const pipeline = new CodePipeline(this, 'Pipeline', {
      crossAccountKeys: false,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(repo, branch),
        env: {
          /* The first time deployment(which is local shell) creates an environment variable with the name
           BRANCH in the CodeBuild project responsible for the synthesizing the CDK app. This is like 
           writing the branch name for the pipeline in stone.
           The second time the pipeline runs, say for example because the developer checked in some code 
           to the branch, the command that runs for synthesizing the app is the one defined in 
           the commands section of the pipeline: npx cdk synth -c branch=$BRANCH. 
           Since the environment variable was set during the first time deployment, 
           now the same branch name is being passed to the cdk context.*/
          BRANCH: branch,
          APP_NAME: appName,
          ACCOUNT: account,
          REGION: region,
        },
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth -c branch=$BRANCH -c appName=$APP_NAME -c account=$ACCOUNT -c region=$REGION',
        ],
      }),
    });

    if (branch !== 'prod') {
      const dev = new AppStage(this, branch);
      pipeline.addStage(dev);
      //TODO add testing on dev stage
    } else {
      // An application is added to the pipeline by calling addStage() with instances of Stage.
      const preProd = new AppStage(this, 'preProd');
      const prod = new AppStage(this, 'prod');

      pipeline.addStage(preProd);
      // TODO add testing after preProd

      /**
       * A CloudFormation stack will be deployed for your app.
       * Stack name will be AppStage.id+AppStack.id and also
       * all deployed resources will continue to have this pattern.
       * AppStage.id+AppStack.id+Resource.id
       */
      pipeline.addStage(prod);
    }
  }
}

module.exports = { PipelineStack };
