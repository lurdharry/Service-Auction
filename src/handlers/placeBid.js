import validator from "@middy/validator";
import AWS from "aws-sdk";
import { responseHandler } from "../helper/responseHandler";

import commonMiddleware from "../lib/commonMiddleware";
import { placeBidSchema } from "../lib/schemas/placeBidSchema";

import { getAuctionById } from "./getAuction";

const { AUCTIONS_TABLE_NAME } = process.env;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);
  const { amount: prevAmount, bidder } = auction.highestBid;

  // Bid identity validation
  if (email === auction.seller) {
    return responseHandler(
      { message: "You cannot bid on your own auction" },
      403
    );
  }

  // Avoid double bidding if user is the highest bidder
  if (email === bidder) {
    return responseHandler(
      { message: "You are already the highest bidder" },
      403
    );
  }

  // Auction status validation
  if (auction.status === "CLOSED") {
    return responseHandler(
      { message: "You cannot bid on closed auction" },
      403
    );
  }

  // Bid amount
  if (amount <= prevAmount) {
    return responseHandler(
      { message: `Your bid must be higher than ${prevAmount}` },
      400
    );
  }

  const params = {
    TableName: AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    return responseHandler({ message: "Unable to place bid" }, 500);
  }

  return responseHandler(
    { message: "Bid placed successfully", data: updatedAuction },
    201
  );
}

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
