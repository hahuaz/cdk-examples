import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ApiConstructProps } from '../app-stack';

import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class ApiConstruct extends Construct {
  public readonly webSocketApi: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { messageHandler, connectionHandler } = props;

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'mywsapi', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'connectionIntegration',
          connectionHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'disconnectIntegration',
          connectionHandler
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'defaultIntegration',
          messageHandler
        ),
      },
    });

    const webSocketProdStage = new apigwv2.WebSocketStage(this, 'mystage', {
      webSocketApi: this.webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    messageHandler.addEnvironment(
      'WS_CALLBACK_URL',
      webSocketProdStage.callbackUrl
    );

    new cdk.CfnOutput(this, 'wsUrl', {
      value: webSocketProdStage.url,
      description: 'wsUrl is used to send messages from client to server.',
    });
    new cdk.CfnOutput(this, 'wsCallbackUrl', {
      value: webSocketProdStage.callbackUrl,
      description:
        'wsCallbackUrl is used to send messages from server to client.',
    });
  }
}
