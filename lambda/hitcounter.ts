import { DynamoDB, Lambda } from 'aws-sdk'

import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('request:', JSON.stringify(event, undefined, 2))

  // create AWS SDK clients
  const dynamo = new DynamoDB()
  const lambda = new Lambda()

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME || '',
      Key: { path: { S: event.path } },
      UpdateExpression: 'ADD hits :incr',
      ExpressionAttributeValues: { ':incr': { N: '1' } },
    })
    .promise()

  // call downstream function and capture response
  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME || '',
      Payload: JSON.stringify(event),
    })
    .promise()

  console.log('downstream response:', JSON.stringify(resp, undefined, 2))

  // return response back to upstream caller
  return JSON.parse(resp.Payload as string)
}
