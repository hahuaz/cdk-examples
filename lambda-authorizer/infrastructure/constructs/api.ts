import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_apigateway } from 'aws-cdk-lib';

import { ApiConstructProps } from '../app-stack';

export class ApiConstruct extends Construct {
  public readonly restApi: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { lambdaAuthorizer, helloWorldLambda } = props;

    this.restApi = new aws_apigateway.RestApi(this, 'rest', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    this.restApi.addGatewayResponse('403', {
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
    this.restApi.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(
        helloWorldLambda
      ),
      defaultMethodOptions: {
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
        authorizer: tokenAuthorizer,
      },
    });
  }
}
