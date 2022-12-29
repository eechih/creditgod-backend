import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('request:', JSON.stringify(event, undefined, 2))

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Hello, CDK! You've hit ${event.path}\n`,
  }
}
