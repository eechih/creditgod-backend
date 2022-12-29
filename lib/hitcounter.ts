import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction
}

export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.IFunction

  /** the hit counter table */
  public readonly table: dynamodb.Table

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id)

    this.table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
    })

    this.handler = new NodejsFunction(this, 'HitCounterHandler', {
      entry: join(__dirname, '..', 'lambda', 'hitcounter.ts'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName,
      },
    })

    // grant the lambda role read/write permissions to our table
    this.table.grantReadWriteData(this.handler)

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler)
  }
}
