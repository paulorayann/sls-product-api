import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from "uuid";
import * as yup from 'yup'


const options = {
  region : process.env.REGION,
  endpoint : process.env.ENDPOINT,
  accessKeyId : process.env.ACCESS_KEY_ID,
  secretAccessKey : process.env.SECRET_ACCESS_KEY
}


const docClient = new AWS.DynamoDB.DocumentClient(options)
const headers = {
  'content-type': 'application/json',
}
const product = yup.object().shape({
  name: yup.string().trim().required(),
  description: yup.string().trim().required(),
  price: yup.number().min(0.5).max(1000).required(),
  inStock: yup.boolean().required(),
})

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
  const reqBody = JSON.parse(event.body as string)

  const {error} = await product.validate(reqBody, { abortEarly: false })
  if (error) throw error

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

  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}

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