import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

const generateAllowPolicy = (arn: string) => ({
  principalId: 'user',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: arn,
      },
    ],
  },
});

const generateDenyPolicy = () => ({
  principalId: 'user',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Deny',
        Resource: '*',
      },
    ],
  },
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('INCOMING_EVENT\n', event);

  const { authorizationToken, methodArn } = event;

  const token = authorizationToken.replace('Bearer ', '');

  // Your token verify logic goes here
  if (token === 'myawesometoken') {
    return {
      ...generateAllowPolicy(methodArn),
      // Context object will be available in downstream handler via event.requestContext.authorizer
      context: {
        callerIdentity: 'placeholder',
      },
    };
  } else {
    return generateDenyPolicy();
  }
};
