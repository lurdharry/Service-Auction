import AWS from "aws-sdk";
import validator from "@middy/validator";

import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionsSchema } from "../lib/schemas/getAuctionsSchema";
import { responseHandler } from "../helper/responseHandler";

const { AUCTIONS_TABLE_NAME } = process.env;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event) {
  let auctions;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status", // status is a reserved word
    },
  };

  try {
    const results = await dynamoDb.query(params).promise();
    auctions = results.Items;
  } catch (error) {
    return responseHandler(
      { message: "Unable to get auctions", data: auctions },
      500
    );
  }

  return responseHandler({ message: "Success", data: auctions }, 200);
}

export const handler = commonMiddleware(getAuctions).use(
  validator({ inputSchema: getAuctionsSchema, useDefaults: true })
);
