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
//     "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly9sdXJkaGFycnkudXMuYXV0aDAuY29tLyJ9..nSbep5abDrcqz9iq.1EnUBL7A9b_DSSHFySAU3_bU9qOORp6zoeR7DjymvnK-jZ4UItymxQckHkssmlY-j2NTZrP-HZTDqvnOyRfg4qz9B6nFuJOn72-dNf1-dd7ey6URJWYa7G22Bhiw6NJ4xisvAKFsh5HMR9EHB6nT4SiahsMFda48bknAfh7a5V3otA0u8_zxifC5JSlrAYGP1YPH_8p987qvutSBq7NpOc33940GipHAyONlSSIEwNtyVzuk4Yv6ky8aEgyot4PEcMGzv3YOk5WGDikF4qCrUktcAk5vzhR6jp7189jA1R6N1TqCYteGgGZ_YeNOwrIv8EvYGBz0oGSJEFx1c0FsUI_hw69KOECgyP9F.RjG14r1NKHiVqHZFWPxzxw",
//   id_token:
//     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1YMEhZZXAxSDdmb2E1YXV6VWxVVyJ9.eyJuaWNrbmFtZSI6Imx1cmRoYXJyeSIsIm5hbWUiOiJsdXJkaGFycnlAbHVyZGhhcnJ5LmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83N2FmN2JlZDYxOWY5NzFmY2YwMTRhYWNlZGRiMzYxNj9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmx1LnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTAzLTEzVDIyOjE2OjM3LjIxOVoiLCJlbWFpbCI6Imx1cmRoYXJyeUBsdXJkaGFycnkuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczovL2x1cmRoYXJyeS51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjIxZmZkMDMzNDk5MmIwMDY5NGViNDQxIiwiYXVkIjoiWHpOUlFDY3dlc2FQV2d5TkZpdVBXMlF0QVRzaVJUalYiLCJpYXQiOjE2NDcyMDk3OTcsImV4cCI6MTY0NzI0NTc5N30.e4ko97kkE7eXPL1iOK7euQI3qdWouUYlbKJtB_DRDtYO4ZXD7rEx_jLxmEGIYtEb6BWN6EQy_sE3f2VXQzV7q0yOwkO-eZ7QZLJYB6LPKPuggO_f3FEElr_z9dirCaOXIARUCbao9oP4RtdlsgJ-Ni9aAUN34lZrH0DCMVi8VL1GZkyCW9pUazzLTFg2uopaCzo5hXYOsuZH7VN6b2-kMmxdxdr6BhM88LTz-TxELkMnLMlMaS9hU8j-sphy8TNz_Cv6u1JdbADlgsheY6fO7EUwFXppBZNarI4EjFpH6f8kJJZE9B4Po6TQbEIGsTIgbi9qAmj8onLUXjUq5O5qWg",
//   scope: "openid profile email address phone",
//   expires_in: 86400,
//   token_type: "Bearer",
// };
