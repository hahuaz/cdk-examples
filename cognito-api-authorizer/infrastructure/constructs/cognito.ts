import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_cognito } from "aws-cdk-lib";

import { CognitoConstructProps } from "../app-stack";

export class CognitoConstruct extends Construct {
  public readonly userPool: aws_cognito.UserPool;

  constructor(scope: Construct, id: string, _props: CognitoConstructProps) {
    super(scope, id);

    // const {  } = props;

    this.userPool = new aws_cognito.UserPool(this, "userPool", {
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailSubject: "Cdk examples sign up verification",
        emailBody:
          "Hello, Thanks for registering! Verification code is {####}.",
        emailStyle: aws_cognito.VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        fullname: {
          // while creating user, attribute name should be "name" instead of "fullname"
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        interest: new aws_cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      accountRecovery: aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = this.userPool.addClient("userPoolClient", {
      supportedIdentityProviders: [
        aws_cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      authFlows: {
        userPassword: true,
      },
      refreshTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(30),
      accessTokenValidity: cdk.Duration.minutes(30),
    });

    new cdk.CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
      description: "userPoolClient.userPoolClientId",
    });
  }
}
