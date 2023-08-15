import { randomUUID } from "crypto";

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { S3 } from "aws-sdk";

const { APP_REGION, MY_BUCKET_NAME } = process.env;

const s3 = new S3({
  region: APP_REGION,
});

export const handler = async function (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("INCOMING_EVENT\n", event);

  const directory = "client01";
  const fileExtension = ".mp4";
  const unixTime = Date.now();
  const s3Key = `${directory}/${unixTime}-${randomUUID()}${fileExtension}`;
  const URL_EXPIRATION_SECONDS = 300;

  const presignedPostParams: S3.PresignedPost.Params = {
    Bucket: MY_BUCKET_NAME,
    Expires: URL_EXPIRATION_SECONDS,
    Conditions: [
      ["content-length-range", 0, 104857600],
      ["starts-with", "$key", directory],
    ],
    Fields: {
      key: s3Key,
    },
  };

  const presignedPost = s3.createPresignedPost(presignedPostParams);

  return {
    statusCode: 200,
    headers: {
      "access-control-allow-origin": "*",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ presignedPost }),
  };
};
