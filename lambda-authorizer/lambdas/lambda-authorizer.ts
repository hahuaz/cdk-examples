const defaultDenyAllPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: 'Deny',
      Resource: '*',
    },
  ],
};

const _defaultAllowAllPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: 'Allow',
      Resource: `arn:aws:execute-api:{APP_REGION}:{ACCOUNT_ID}:{API_ID}/stage/method/resource/*`,
    },
  ],
};

function generateAllowPolicy(arn: string) {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: arn,
      },
    ],
  };
}

export const handler = async function (event: any) {
  console.log('INCOMING_EVENT\n', event);

  let policyDocument;

  const token = event.authorizationToken.replace('Bearer ', '');
  if (token === 'myawesometoken') {
    policyDocument = generateAllowPolicy(event.methodArn);
  } else {
    policyDocument = defaultDenyAllPolicy;
  }

  return {
    policyDocument,
    // downstream will have access to context via event.requestContext.authorizer if authorization is successfull
    context: {
      callerIdentity: 'placeholder',
    },
  };
};
