import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Traffico } from "./traffico-construct";

interface TrafficoStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class TrafficoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TrafficoStackProps) {
    super(scope, id, props);

    new Traffico(this, "TestTraffic", {
      vpc: props.vpc,
      url: "https://gtuakziky7.execute-api.us-east-2.amazonaws.com/prod/25b74a75",
      tps: 10,
    });
  }
}
