import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as path from "path";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";

interface TrafficoProps {
  vpc: ec2.IVpc;
  url: string;
  tps: number; // user specifies 'transaction per second' to run to load test
}

export class Traffico extends Construct {
  constructor(scope: Construct, id: string, props: TrafficoProps) {
    super(scope, `${id}-construct`);

    const cluster = new ecs.Cluster(this, "Cluster", { vpc: props.vpc });
    const logGroup = new logs.LogGroup(this, "PingerLogs", {
      retention: logs.RetentionDays.ONE_DAY,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, "PingerTask");

    taskDef.addContainer("Pinger", {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, "../pinger"), {
        platform: ecrAssets.Platform.LINUX_AMD64,
      }),
      environment: {
        URL: props.url,
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: "pinger",
      }),
    });

    new ecs.FargateService(this, "PingerService", {
      cluster: cluster,
      taskDefinition: taskDef,
      desiredCount: props.tps, // duplicate pinger
    });
  }
}
