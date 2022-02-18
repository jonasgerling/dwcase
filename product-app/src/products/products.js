const dbclient = require("../dynamodb.client");
const {
    GetItemCommand,
    ScanCommand
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getProduct = async (event) => {
  const response = { statusCode: 200 };
  try {
      const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ id: event.pathParameters.id }),
      };
      const { Item } = await dbclient.send(new GetItemCommand(params));

      console.log({ Item });
      response.body = JSON.stringify({
          message: "Successfully retrieved product.",
          data: (Item) ? unmarshall(Item) : {},
      });
  } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
          message: "Failed to get product.",
          errorMsg: e.message,
          errorStack: e.stack,
      });
  }

  return response;
};

const getProducts = async () => {
  const response = { statusCode: 200 };
  try {
      const { Items } = await dbclient.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));
      response.body = JSON.stringify({
          message: "Successfully retrieved all products.",
          data: Items.map((item) => unmarshall(item))
      });
  } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
          message: "Failed to retrieve products.",
          errorMsg: e.message,
          errorStack: e.stack,
      });
  }

  return response;
};

module.exports = {
  createProduct,
  getProduct,
  getProducts
}