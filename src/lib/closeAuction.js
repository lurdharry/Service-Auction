import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const { AUCTIONS_TABLE_NAME, MAIL_QUEUE_URL } = process.env;

export const closeAuction = async (auction) => {
  const params = {
    TableName: AUCTIONS_TABLE_NAME,
    Key: {
      id: auction.id,
    },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  await dynamoDb.update(params).promise();
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    await sqs
      .sendMessage({
        QueueUrl: MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "No bid on your auction item",
          recipient: seller,
          body: `oh no, your item ${title} did not get any bid, better luck next time`,
        }),
      })
      .promise();
    return;
  }

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "Your Item has been sold",
        recipient: seller,
        body: `Congratulations your item ${title} has been sold for $${amount}.`,
      }),
    })
    .promise();

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl: MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "You won an Auction",
        recipient: bidder,
        body: `What a good deal! you are the winner of the auction ${title} at a price of $${amount}.`,
      }),
    })
    .promise();

  return Promise.all([notifyBidder, notifySeller]);
};
