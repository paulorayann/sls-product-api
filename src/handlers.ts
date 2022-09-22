import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient()

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const reqBody = JSON.parse(event.body as string)
  const productBody = {
    ...reqBody,
    productID: v4(),
  }
  await docClient.put({
    TableName: 'Products',
    Item:  productBody
  }).promise()
  return {
    statusCode: 201,
    body: JSON.stringify(productBody),
  };
};

export const getProductByID = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const id = event.pathParameters?.id

  const output = await docClient.get({
    TableName: 'Products',
    Key: {
      productID: id
    }
  }).promise()

  if (!output.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Product not found' }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(output.Item),
  }
}