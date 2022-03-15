import { responseHandler } from "../helper/responseHandler";
import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndedAuctions";

async function processAuctions() {
  try {
    const auctionsToClose = await getEndedAuctions(); // GET AUCTIONS THAT HAVE ENDED
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );

    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    return responseHandler({ message: "Unable to process auction" }, 500);
  }
}

export const handler = processAuctions;
