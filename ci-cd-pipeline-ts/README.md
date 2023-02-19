# CI-CD Pipeline Template

## How to Use

1. Create repository on CodeCommit

```bash
aws codecommit create-repository --repository-name ci-cd-pipeline-ts --profile {your-named-profile}
```

2. Push the repo

```bash
git remote add origin ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/ci-cd-pipeline-ts
git push origin dev
```

3. Install the dependencies

```bash
npm install
```

4. Bootstrap the region

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION --profile {your-named-profile}--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

5. Create the CDK stack

```bash
cdk deploy --profile {your-named-profile}
```

6. Cleanup

```bash
cdk destroy
```
