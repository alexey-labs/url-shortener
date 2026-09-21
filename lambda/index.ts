import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const tableName = process.env.TABLE_NAME;
const region = process.env.REGION || "us-east-2";
const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

interface Event {
  queryStringParameters?: {
    targetUrl?: string;
  };
  pathParameters?: {
    shortUrl?: string;
  };
  requestContext?: {
    domainName?: string;
    path?: string;
  };
}

export async function handler(event: Event) {
  console.log("received event:", JSON.stringify(event, null, 2));

  if (event.queryStringParameters?.targetUrl != undefined) {
    return readShortUrl(event);
  } else if (event.pathParameters?.shortUrl != undefined) {
    return createShortUrl(event);
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "usage: ?targetUrl=<URL>" }),
    };
  }
}

async function createShortUrl(event: Event) {
  const targetUrl = event.queryStringParameters?.targetUrl;

  const id = uuidv4().slice(0, 8); // Generate a unique ID for the short URL (take first 8 chars)

  const command = new PutCommand({
    TableName: tableName,
    Item: {
      id,
      targetUrl,
    },
  });

  await docClient.send(command);
  const { domainName, path } = event.requestContext || {};
  const shortUrl = `https://${domainName}/${path}/${id}`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shortUrl }),
  };
}

async function readShortUrl(event: Event) {
  const shortUrl = event.pathParameters?.shortUrl;

  const command = new GetCommand({
    TableName: tableName,
    Key: { id: shortUrl },
  });

  const response = await docClient.send(command);
  console.log(response);
  const item = response.Item;
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Short URL not found for id: ${shortUrl}`,
      }),
    };
  }

  return {
    statusCode: 301,
    headers: {
      Location: item.targetUrl,
    },
  };
}
