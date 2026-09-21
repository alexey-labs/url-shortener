#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { NetworkStack } from "../lib/network-stack";
import { TrafficoStack } from "../lib/traffico-stack";
import { UrlShortenerStack } from "../lib/url-shortener-stack";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-2",
};

const networkStack = new NetworkStack(app, "NetworkStack", { env });

new UrlShortenerStack(app, "UrlShortenerStack", {
  env,
});

new TrafficoStack(app, "TrafficoStack", {
  env,
  vpc: networkStack.vpc,
});
