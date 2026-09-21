import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class UrlShortenerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new ddb.TableV2(this, "MappingTable", {
      partitionKey: { name: "id", type: ddb.AttributeType.STRING },
    });

    new cdk.CfnOutput(this, "MappingTableName", {
      value: table.tableName,
      description: "The name of the DynamoDB table for URL mappings",
    });

    const func = new NodejsFunction(this, "Backend", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, "../lambda/index.ts"),
      handler: "handler",
    });

    table.grantReadWriteData(func);
    func.addEnvironment("TABLE_NAME", table.tableName);
    func.addEnvironment("REGION", "us-east-2");
  }
}
