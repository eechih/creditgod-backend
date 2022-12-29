import * as cdk from 'aws-cdk-lib'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs'
import { TableViewer } from 'cdk-dynamo-table-viewer'
import { join } from 'path'
import { HitCounter } from './hitcounter'

export class CreditgodBackendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
    }

    // deifines an AWS Lambda resource
    const hello = new NodejsFunction(this, 'HelloHandler', {
      entry: join(__dirname, '..', 'lambda', 'hello.ts'),
      ...nodeJsFunctionProps,
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
    })

    // defines an API Gateway API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler,
    })

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits',
    })
  }
}
