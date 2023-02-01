import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_apigateway } from 'aws-cdk-lib';

import { ApiProps } from '../app-stack';

export class Api extends Construct {
  public readonly api: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const { lambdaAuthorizer, helloWorldLambda } = props;

    // const BRANCH = this.node.tryGetContext('BRANCH');
    // const { APP_REGION } =
    //   this.node.tryGetContext(BRANCH);

    this.api = new aws_apigateway.RestApi(this, 'api', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With',
        ],
      },
    });

    this.api.addGatewayResponse('403', {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    const tokenAuthorizer = new aws_apigateway.TokenAuthorizer(
      this,
      'tokenAuthorizer',
      {
        handler: lambdaAuthorizer,
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // catches /{+proxy}
    this.api.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(
        helloWorldLambda
      ),
      defaultMethodOptions: {
        authorizer: tokenAuthorizer,
      },
    });
  }
}
