import * as AWS from 'aws-sdk';
import {
  APIGatewayProxyWebsocketEventV2WithRequestContext,
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const { CONNECTIONS_TABLE_NAME } = process.env;
if (!CONNECTIONS_TABLE_NAME) {
  throw new Error('There is at least one undefined environment variable!');
}

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2>
): Promise<APIGatewayProxyResult> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { connectionId, routeKey } = event.requestContext;

  if (routeKey === '$connect') {
    await saveConnectionId(connectionId);
  } else if (routeKey === '$disconnect') {
    await deleteConnectionId(connectionId);
  }

  return { statusCode: 200, body: '' };
};

const saveConnectionId = async (connectionId: string): Promise<void> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME,
    Item: {
      connectionId,
    },
  };

  try {
    await dynamoDB.put(params).promise();
  } catch (error) {
    console.error(`Error saving connection ID: ${connectionId}`, error);
  }
};

const deleteConnectionId = async (connectionId: string): Promise<void> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME,
    Key: {
      connectionId,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
  } catch (error) {
    console.error(`Error deleting connection ID: ${connectionId}`, error);
  }
};
