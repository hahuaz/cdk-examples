const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');

class AppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const hello = new lambda.Function(this, 'helloLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'hello.handler',
    });
  }
}

module.exports = { AppStack };
