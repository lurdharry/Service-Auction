import AWS from "aws-sdk";
import { responseHandler } from "../helper/responseHandler";
import commonMiddleware from "../lib/commonMiddleware";

const { AUCTIONS_TABLE_NAME } = process.env;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const getAuctionById = async (id) => {
  let auction;

  try {
    const result = await dynamoDb
      .get({
        TableName: AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;
  } catch (error) {
    return responseHandler({ message: "Internal server error" }, 400);
  }

  if (!auction) {
    return responseHandler(
      { message: `Auction with ID "${id}" not found!` },
      404
    );
  }

  return auction;
};

async function getAuction(event) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return responseHandler({ message: "Success", data: auction }, 200);
}

export const handler = commonMiddleware(getAuction);
