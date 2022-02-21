import {beforeEach, describe, it} from "@jest/globals";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {mockData} from "../mockdata";
import {dataSeed} from "./scheduled.seed";
import {mockClient} from "aws-sdk-client-mock";
import axios from "axios";

const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(axios);

describe("Scheduled seed", () => {
    const ddbMock = mockClient(DynamoDBClient);

    process.env["DYNAMODB_TABLE_NAME"] = "mock-table";

    beforeEach(() => {
        ddbMock.reset();
    });

    it("should return error when axios url is invalid", async () => {
        mock.onGet("").networkError();
        const response = await dataSeed();
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).message).toContain("Failed to create")
    });

    it("should populate database", async () => {
        mock.onGet("https://assignment.dwbt.tech/images").reply(200, {
            "images": {
                "DW00100001": [
                    {
                        "order": "0",
                        "src": "https://www.danielwellington.com/media/staticbucket/media/catalog/product/c/l/cl40-oxford-rg_1_1.png"
                    }]
            }
        })
        mock.onGet("https://assignment.dwbt.tech/products").reply(200, {
            "products": [
                {
                    "sku": "DW00100001",
                    "name": "Classic Oxford 40 Rose Gold",
                    "description": "This classic and aesthetically pleasing timepiece was designed with great attention to detail. The playful colors of the NATO strap blends naturally with the simple and minimalistic dial, effortlessly creating the perfect accessory.",
                    "type": "watch",
                    "size": "40mm",
                    "price": {
                        "symbol": " €",
                        "amount": "159",
                        "fractionDigits": 2
                    },
                    "currency": "EUR",
                    "color": {
                        "displayName": "N/A",
                        "id": "Rose Gold"
                    },
                    "_links": {
                        "productImages": {
                            "title": "Product Images",
                            "href": "https://assignment.dwbt.tech/images/DW00100001"
                        }
                    }
                }]
        })
        ddbMock.on(PutItemCommand).resolves({
            Item: mockData[0]
        });
        const response = await dataSeed();
        expect(response.statusCode).toBe(200);
    });
});
