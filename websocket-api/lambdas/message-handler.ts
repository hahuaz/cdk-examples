import * as AWS from 'aws-sdk';
import {
  APIGatewayProxyWebsocketEventV2WithRequestContext,
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

const { WS_CALLBACK_URL, CONNECTIONS_TABLE_NAME } = process.env;
if (!CONNECTIONS_TABLE_NAME || !WS_CALLBACK_URL) {
  throw new Error('There is at least one undefined environment variable!');
}

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  endpoint: WS_CALLBACK_URL,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2>
): Promise<APIGatewayProxyResult> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { body } = event;
  if (!body) return { statusCode: 404, body: 'No message body.' };

  try {
    await sendMessageToAllClients(body);
    return { statusCode: 200, body: 'Message sent successfully.' };
  } catch (error) {
    console.error('Error sending message:', error);
    return { statusCode: 500, body: 'Failed to send message.' };
  }
};

const sendMessageToAllClients = async (message: string): Promise<void> => {
  const connections = await getActiveConnections();

  const sendMessagePromises = connections.map(async (connection) => {
    await sendWebSocketMessage(connection.connectionId, message);
  });

  await Promise.all(sendMessagePromises);
};

const getActiveConnections = async (): Promise<any[]> => {
  const params = {
    TableName: CONNECTIONS_TABLE_NAME,
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items!;
  } catch (error) {
    console.error('Error retrieving connections from DynamoDB:', error);
    return [];
  }
};

const sendWebSocketMessage = async (
  connectionId: string,
  message: string
): Promise<void> => {
  const params = {
    ConnectionId: connectionId,
    Data: JSON.stringify({ message: `${connectionId} says: ${message}` }),
  };

  try {
    await apiGatewayManagementApi.postToConnection(params).promise();
    console.log(`Message sent to connection: ${connectionId}`);
  } catch (error) {
    console.error(
      `Error sending message to connection: ${connectionId}`,
      error
    );
  }
};
