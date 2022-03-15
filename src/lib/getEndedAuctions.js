import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { AUCTIONS_TABLE_NAME } = process.env;

/**
 * Get All Ended Auctions
 * @returns  Auctions as Array of Auction
 */

export const getEndedAuctions = async () => {
  const now = new Date();

  const params = {
    TableName: AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status', // status is a reserved word
    },
  };

  const result = await dynamoDb.query(params).promise();

  return result.Items;
};
