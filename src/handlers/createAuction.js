import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import validator from "@middy/validator";

import { createAuctionsSchema } from "../lib/schemas/createAuctionsSchema";
import { responseHandler } from "../helper/responseHandler";

const { AUCTIONS_TABLE_NAME } = process.env;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event) {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer; // get email from token

  const now = new Date();
  const endDate = new Date();

  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
  };

  try {
    await dynamoDb
      .put({
        TableName: AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    return responseHandler({ message: "Internal server error" }, 400);
  }

  return responseHandler(
    { message: "Auction created successfully", data: auction },
    201
  );
}

export const handler = commonMiddleware(createAuction).use(
  validator({ inputSchema: createAuctionsSchema })
);

// const kkk = {
//   access_token:
//     "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly9sdXJkaGFycnkudXMuYXV0aDAuY29tLyJ9..cox2Vy7jh0RCj5rE.9Q2XF63C5VVLsz-02tw7FoT8b2-gyf7003SybJIkzljq0Yg4Nn7kcu8ObJsqvntNSWjmEVjlAo_8a6q9mlSbrJcwYrA2TOUa1gkNDHam6a0iIFk4svkPp4OIhI3VkDfxBGTv0HtDMp5xrvInoYh8uiJafnVz0teS8LXkw9QTbgDJ8F-lZzfs1ymyhEaOJsPXskYUMo9xCwInIa3wfzjv9DANUpslLVuO3N64s9lp36mK1_0hhzf-uS7remCceNoFKFbIGqXvzEDajFzV2Ad034xEEFqY_WCqYiqKuA5kLYH2x9liEjCrLQr1uKMmy2_G9rqHhB8GdmojwIMJnr9TYaBMV6BxYjYDFy6x.Y1Q0bQMU1htj4-8LWo4Acw",
//   id_token:
//     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1YMEhZZXAxSDdmb2E1YXV6VWxVVyJ9.eyJuaWNrbmFtZSI6Imx1cmRoYXJyeSIsIm5hbWUiOiJsdXJkaGFycnlAbHVyZGhhcnJ5LmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83N2FmN2JlZDYxOWY5NzFmY2YwMTRhYWNlZGRiMzYxNj9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmx1LnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTA0LTAzVDE3OjIxOjQ2LjE0NloiLCJlbWFpbCI6Imx1cmRoYXJyeUBsdXJkaGFycnkuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczovL2x1cmRoYXJyeS51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjIxZmZkMDMzNDk5MmIwMDY5NGViNDQxIiwiYXVkIjoiWHpOUlFDY3dlc2FQV2d5TkZpdVBXMlF0QVRzaVJUalYiLCJpYXQiOjE2NDkwMDY1MDYsImV4cCI6MTY0OTA0MjUwNn0.RL8PSWLL8Wp0VXJkJp1KTl36UF87vvFgs6CbhWDtLfEE8X1-UgerXQLibKP3LIwhFirx_rZljPAt20AA77c5xhIWWTsdL5okJarFpsjNgGM9Tec0nlLWgAJn6j42ZsNhx3dHALDfHgLSk85PiZcajyUYfAA8u2ir0sKu8NRPsA1iM0_fbQxnx_oA4sC9UQM8OlSJvGUNag3RoD4YGxeuCYWiIyijDaG2DJjXwDatrEwMN1jskmslITrvL2b06Tp1ydABpQuDBx1MZ1zSBfUACE67xuI3EoNI4i2iT4n_JYsYoa9radgqtqd0CefkZqLO_ijKhoiytHO5IHCXY3sjzg",
//   scope: "openid profile email address phone",
//   expires_in: 86400,
//   token_type: "Bearer",
// };
