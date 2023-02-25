## Bootstrapping

Many AWS CDK stacks that you write will include assets: external files that are deployed with the stack, such as AWS Lambda functions or Docker images. The AWS CDK uploads these to an Amazon S3 bucket or other container so they are available to AWS CloudFormation during deployment. Deployment requires that these containers already exist in the account and region you are deploying into. Creating them is called bootstrapping. To bootstrap, issue:

```bash
cdk bootstrap aws://<account-number>/<region>
\ --profile <named-profile>
\ --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

## Deployment

- Do not forget to commit latest version of the repository to CodeCommit before the deployment.

- Below command will deploy the pipeline-stack, which creates a CodePipeline resource on the cloud. After creation, this service runs to deploy your app-stack.

```bash
cdk deploy --profile <named-profile> --context appName=<app-name> -c account=<account-number> -c region=us-west-2
```

- `<app-name>` variable should correspond the CodeCommit repository name.
- If branch is not provided pipeline will use "prod" branch by default. If you want to deploy feature branch provide additional `--context branch=<your-branch>` flag.

## NOTES

- Even if pipeline-stack is deleted/destroyed app-stack will live.
- Pipeline itself is self mutating but if you want to provide new context variable you have to make re-deploy.
- If you want to use `cdk watch`, first list all stacks to learn your app-stack name by `cdk ls`. Then, use the command

```bash
cdk watch <app-stack-name> --profile <named-profile> --context appName=<app-name> -c account=<account-number> -c region=us-west-2
```

- Do not forget to pass your context variables to the ShellStep command. Otherwise, the context variables will only be defined during the initial deployment in the shell, but they won't be defined in the CodePipeline environment. </br> Alternatively, you can define context variables in [cdk.json](cdk.json). It removes the need to pass context variables to ShellStep but also means commiting the variables to code base.
