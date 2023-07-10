import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import axios from 'axios';
import SSM from 'aws-sdk/clients/ssm';

const ssm = new SSM({
  region: 'us-east-1',
});

let IPGEOLOCATION_KEY: string | undefined;

export async function handler(
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequestResult> {
  if (!IPGEOLOCATION_KEY) {
    const { Parameter } = await ssm
      .getParameter({
        Name: 'ipgeolocationKey',
      })
      .promise();

    if (!Parameter?.Value) throw new Error('Parameter?.Value is not defined');
    IPGEOLOCATION_KEY = Parameter.Value;
  }

  const request = event.Records[0].cf.request;
  const clientIP = request.clientIp;

  let country;
  try {
    const { data } = await axios.get(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_KEY}&ip=${clientIP}`
    );
    country = data.country_name;
    console.log(`The IP address ${clientIP} belongs to ${country}.`);
  } catch (error) {
    console.error('An error occurred while fetching geolocation data:', error);
  }

  if (country !== 'United States') {
    // Return a static message
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      body: 'We only serve content to US. Sorry!',
    };
  }

  // Allow CloudFront to proceed with serving the index.html file
  return request;
}
