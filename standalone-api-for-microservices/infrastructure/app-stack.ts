import * as cdk from 'aws-cdk-lib';
import {
  aws_apigateway,
  aws_certificatemanager,
  aws_route53,
  aws_route53_targets,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export default class AppStack extends cdk.Stack {
  public apiCustomDomain: aws_apigateway.DomainName;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { DOMAIN, API_SUB_DOMAIN, API_CERTIFICATE_ARN } = process.env;
    if (!DOMAIN || !API_SUB_DOMAIN || !API_CERTIFICATE_ARN)
      throw new Error('There is at least one undefined environment variable!');

    // create API Gateway custom domain which will be used as reverse proxy for all microservice APIs
    this.apiCustomDomain = new aws_apigateway.DomainName(this, 'domain-name', {
      domainName: API_SUB_DOMAIN,
      // API Gateway certificate must be issued on same region as the stack
      certificate: aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        'cert',
        API_CERTIFICATE_ARN
      ),
      endpointType: aws_apigateway.EndpointType.REGIONAL,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
    });

    // add API Gateway custom domain as A record target
    new aws_route53.ARecord(this, 'apiRecord', {
      zone: aws_route53.HostedZone.fromLookup(this, 'hostedZone', {
        domainName: DOMAIN,
      }),
      recordName: API_SUB_DOMAIN,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.ApiGatewayDomain(this.apiCustomDomain)
      ),
    });

    // Export the `apiCustomDomain` props as a CloudFormation output so it can be referenced from microservices stack
    new cdk.CfnOutput(this, 'domainName', {
      value: this.apiCustomDomain.domainName,
      exportName: 'domainName',
    });
    new cdk.CfnOutput(this, 'domainNameAliasDomainName', {
      value: this.apiCustomDomain.domainNameAliasDomainName,
      exportName: 'domainNameAliasDomainName',
    });
    new cdk.CfnOutput(this, 'domainNameAliasHostedZoneId', {
      value: this.apiCustomDomain.domainNameAliasHostedZoneId,
      exportName: 'domainNameAliasHostedZoneId',
    });
  }
}
