import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { AUCTIONS_TABLE_NAME } = process.env;

export const closeAuction = async (auction) => {
  const params = {
    TableName: AUCTIONS_TABLE_NAME,
    Key: {
      id: auction.id,
    },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamoDb.update(params).promise();

  return result;
};
