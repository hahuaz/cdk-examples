import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_apigateway } from "aws-cdk-lib";

import { ApiConstructProps } from "../app-stack";

export class ApiConstruct extends Construct {
  public readonly restApi: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { exampleLambda, userPool } = props;

    this.restApi = new aws_apigateway.RestApi(this, "rest", {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "X-Amz-Security-Token",
          "Authorization",
          "X-Api-Key",
          "X-Requested-With",
          "Accept",
          "Access-Control-Allow-Methods",
          "Access-Control-Allow-Origin",
          "Access-Control-Allow-Headers",
        ],
      },
    });

    this.restApi.addGatewayResponse("403", {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      statusCode: "403",
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
    });

    const cognitoAuthorizer = new aws_apigateway.CognitoUserPoolsAuthorizer(
      this,
      "cognitoAuthorizer",
      {
        resultsCacheTtl: cdk.Duration.seconds(0),
        cognitoUserPools: [userPool],
      }
    );

    // catches /{+proxy}
    const _rootProxy = this.restApi.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(exampleLambda),
      defaultMethodOptions: {
        authorizationType: aws_apigateway.AuthorizationType.COGNITO,
        authorizer: cognitoAuthorizer,
      },
    });
  }
}
