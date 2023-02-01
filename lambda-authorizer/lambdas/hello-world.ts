import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async function (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log('INCOMING_EVENT\n', event);

  return {
    statusCode: 200,
    headers: {
      'access-control-allow-origin': '*',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ message: 'hello world!' }),
  };
};
