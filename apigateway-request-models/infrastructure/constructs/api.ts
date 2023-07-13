import { aws_apigateway } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { ApiConstructProps } from '../app-stack';

export class ApiConstruct extends Construct {
  public readonly api: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { exampleLambda } = props;

    this.api = new aws_apigateway.RestApi(this, 'rest');

    const requestModel = this.api.addModel('RequestModel', {
      contentType: 'application/json',
      schema: {
        title: 'Request Model',
        schema: aws_apigateway.JsonSchemaVersion.DRAFT4,
        type: aws_apigateway.JsonSchemaType.OBJECT,
        properties: {
          // Define the properties and validation rules for the request payload
          role: {
            type: aws_apigateway.JsonSchemaType.STRING,
            enum: ['admin', 'developer'],
          },
          username: { type: aws_apigateway.JsonSchemaType.STRING },
          password: {
            anyOf: [
              {
                type: aws_apigateway.JsonSchemaType.STRING,
              },
              {
                type: aws_apigateway.JsonSchemaType.INTEGER,
              },
            ],
          },
        },
        required: ['role', 'username', 'password'],
      },
    });

    // Enable request validation for the API methods
    const testResource = this.api.root.addResource('test');
    const testPost = testResource.addMethod(
      'POST',
      new aws_apigateway.LambdaIntegration(exampleLambda),
      {
        requestModels: {
          'application/json': requestModel,
        },
        requestValidatorOptions: {
          validateRequestBody: true,
        },
      }
    );
  }
}
