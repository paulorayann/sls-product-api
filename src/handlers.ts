import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
}

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
    headers,
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
      headers,
      body: JSON.stringify({ error: 'Product not found' }),
    };
  }
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Item),
  }
}

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const output = await docClient.scan({
    TableName: 'Products',
  }).promise()

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  }
}