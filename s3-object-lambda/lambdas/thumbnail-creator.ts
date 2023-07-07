import * as AWS from 'aws-sdk';
import axios from 'axios';
import sharp from 'sharp';

const s3 = new AWS.S3();

export const handler = async (event: any): Promise<any> => {
  console.log('Incoming Event:\n', JSON.stringify(event, null, 2));

  const { getObjectContext } = event;
  const { outputRoute, outputToken, inputS3Url } = getObjectContext;

  // inputS3Url is presigned URL
  const { data } = await axios.get(inputS3Url, { responseType: 'arraybuffer' });

  const resized = await sharp(data).resize({ width: 50 }).withMetadata();

  // Send the resized image back to S3 Object Lambda
  const params = {
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    Body: resized,
  };
  await s3.writeGetObjectResponse(params).promise();

  return { statusCode: 200 };
};
