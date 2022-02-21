const {
    GetItemCommand,
    ScanCommand
} = require("@aws-sdk/client-dynamodb");
const {marshall, unmarshall} = require("@aws-sdk/util-dynamodb");
const dbClient = require("../dynamodb.client");

const getProduct = async (event) => {
    const response = {statusCode: 200};
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({id: event.pathParameters.id}),
        };
        const {Item} = await dbClient.send(new GetItemCommand(params));
        if (Item) {
            response.body = JSON.stringify({
                message: "Successfully retrieved product.",
                data: unmarshall(Item),
            });
        } else {
            response.statusCode = 404;
            response.body = JSON.stringify({
                message: `Product not found with id: ${event.pathParameters.id}.`,
            });
        }

    } catch (e) {
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
    const response = {statusCode: 200};
    try {
        const {Items} = await dbClient.send(new ScanCommand({TableName: process.env.DYNAMODB_TABLE_NAME}));
        response.body = JSON.stringify({
            message: "Successfully retrieved all products.",
            data: Items.map((item) => unmarshall(item))
        });
    } catch (e) {
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
    getProduct,
    getProducts
}
