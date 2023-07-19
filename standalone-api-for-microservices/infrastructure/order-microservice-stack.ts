import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda, aws_apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export default class OrderMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const exampleLambda = new NodejsFunction(this, 'exampleLambda', {
      memorySize: 128,
      timeout: cdk.Duration.seconds(15),
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../lambdas/example.ts`),
      bundling: {
        minify: false,
        forceDockerBundling: true,
      },
    });

    // create Order API
    const orderApi = new aws_apigateway.RestApi(this, 'orderApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });
    orderApi.root.addProxy({
      anyMethod: true,
      defaultIntegration: new aws_apigateway.LambdaIntegration(exampleLambda),
    });

    // Create base path mapping for the Order API
    new aws_apigateway.BasePathMapping(this, 'orderApiMapping', {
      domainName: aws_apigateway.DomainName.fromDomainNameAttributes(
        this,
        'CustomDomain',
        {
          domainName: cdk.Fn.importValue('domainName'),
          domainNameAliasHostedZoneId: cdk.Fn.importValue(
            'domainNameAliasHostedZoneId'
          ),
          domainNameAliasTarget: cdk.Fn.importValue(
            'domainNameAliasDomainName'
          ),
        }
      ),
      restApi: orderApi,
      basePath: 'order',
    });
  }
}
