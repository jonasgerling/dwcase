const axios = require("axios");
const {PutItemCommand} = require("@aws-sdk/client-dynamodb");
const {marshall} = require("@aws-sdk/util-dynamodb");

const dbClient = require("../dynamodb.client");
const imageUrl = "https://assignment.dwbt.tech/images";
const productUrl = "https://assignment.dwbt.tech/products";

const dataSeed = async () => {
    const response = {statusCode: 200};
    try {
        const images = await axiosGet(imageUrl);
        const products = await axiosGet(productUrl);
        const productInformation = createFullProductInformation(products, images);

        if (productInformation) {
            productInformation.map(async (product, i) => {
                await addProduct({...product, id: i + ""})
            })
        }

        response.body = JSON.stringify({
            message: "Successfully created products."
        });
    } catch (e) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create products.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

async function addProduct (product) {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: marshall(product, {}),
    };
    return dbClient.send(new PutItemCommand(params));
};

function createFullProductInformation(products, images) {
    if (products.body && images.body) {
        const parsedProducts = JSON.parse(products.body);
        const parsedImages = JSON.parse(images.body)

        return parsedProducts.location.products.map(product => {
            for (const [key, value] of Object.entries(parsedImages.location.images)) {
                if (product["sku"] === key) {
                    const {_links, ...scaledProduct} = product;
                    scaledProduct["productImages"] = value;
                    return scaledProduct;
                }
            }
        });
    }
}

async function axiosGet(url) {
    try {
        const ret = await axios.get(url);
        return {
            "statusCode": 200,
            "body": JSON.stringify({
                location: ret.data
            })
        }
    } catch (err) {
        throw new Error(`Failed to fetch data from url: ${url}`)
    }
}

module.exports = {
    dataSeed
}
