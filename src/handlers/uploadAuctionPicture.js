/* eslint-disable no-unused-vars */
import { responseHandler } from "../helper/responseHandler";

export async function uploadAuctionPicture(_event) {
  return responseHandler({ message: "Picture Uploaded" }, 201);
}

export const handler = uploadAuctionPicture;
