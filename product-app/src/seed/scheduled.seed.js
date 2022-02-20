const axios = require('axios');
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const dbclient = require("../dynamodb.client");
const imageUrl = 'https://assignment.dwbt.tech/images';
const productUrl = 'https://assignment.dwbt.tech/products';

const dataSeed = async () => {
  const response = { statusCode: 200 };

  try {
    const images = await axiosGet(imageUrl);
    const products = await axiosGet(productUrl);
    const productInformation = createFullProductInformation(products, images);

    productInformation.map(async (product, i) => {
        await addProduct({...product, id:i+""})
    })

    response.body = JSON.stringify({
      message: "Successfully created products."
    });
  } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
          message: "Failed to create products.",
          errorMsg: e.message,
          errorStack: e.stack,
      });
  }

  return response;
};

const addProduct = async (product) => {
  const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(product,{}),
  };
  return dbclient.send(new PutItemCommand(params));
};

function createFullProductInformation(products, images) {
  if (products.body) {
      const parsedProducts = JSON.parse(products.body);
      const parsedImages = JSON.parse(images.body)

     return parsedProducts.location.products.map(product => {
          for (const [key, value] of Object.entries(parsedImages.location.images)) {
              if (product.sku == key) {
                  const { _links, ...scaledProduct } = product;
                  scaledProduct["productImages"] = value;
                  return scaledProduct;
              }
          }
      });
  }
}

async function axiosGet(url) {
    try {
        const ret = await axios(url);
        return   {
            'statusCode': 200,
            'body': JSON.stringify({
                location: ret.data
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

module.exports = {
  dataSeed
}
